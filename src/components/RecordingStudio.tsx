import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Circle,
  Square,
  RotateCcw,
  Play,
  Send,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Download,
  Mic,
  FlipHorizontal2,
  Loader2,
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_URL } from '../config/studioConfig';
import { StudentInfo } from './StudentInfoForm';

interface RecordingStudioProps {
  studentInfo: StudentInfo;
  onRequireStudentInfo: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onOpenTeacherGuide: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Mengesan format rakaman video terbaik yang disokong oleh pelayar web murid.
 */
function getSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const candidates = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a',
    'video/mp4',
  ];

  for (const mime of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    } catch {
      // Abaikan jika isTypeSupported gagal untuk format tertentu
    }
  }
  return undefined;
}

/**
 * Menukar objek Blob video kepada rentetan Base64 untuk dihantar ke Google Apps Script.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Gagal membaca fail video.'));
        return;
      }
      // PENTING: MIME seperti "video/webm;codecs=vp8,opus" mempunyai koma di dalam codecs,
      // jadi kita mesti mencari penanda ";base64," dan bukannya koma pertama.
      const base64Marker = ';base64,';
      const markerIndex = result.indexOf(base64Marker);
      if (markerIndex >= 0) {
        resolve(result.slice(markerIndex + base64Marker.length).replace(/\s+/g, ''));
        return;
      }
      const lastCommaIndex = result.lastIndexOf(',');
      resolve(
        (lastCommaIndex >= 0 ? result.slice(lastCommaIndex + 1) : result).replace(/\s+/g, '')
      );
    };
    reader.onerror = () => reject(new Error('Ralat semasa memproses fail video.'));
    reader.readAsDataURL(blob);
  });
}

function sanitizeFilenamePart(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 35) || 'Rekod'
  );
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Ruang Kamera, Rakaman Video (MediaRecorder), Semakan dan Penghantaran ke Google Drive.
 */
export const RecordingStudio: React.FC<RecordingStudioProps> = ({
  studentInfo,
  onRequireStudentInfo,
  onRecordingStateChange,
  onOpenTeacherGuide,
}) => {
  // Keadaan kamera & aliran media
  const [cameraActive, setCameraActive] = useState(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionBlocked, setIsPermissionBlocked] = useState(false);
  const [mirrorPreview, setMirrorPreview] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);

  // Keadaan rakaman video
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('video/webm');
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Keadaan penghantaran ke Google Drive
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Mengesan sama ada laman dibuka dalam iframe (contohnya Google Sites)
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Rujukan DOM & Media API
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      setIsEmbedded(true);
    }
    setCurrentUrl(window.location.href);
  }, []);

  // Membersihkan pemantau paras suara mikrofon
  const stopAudioMonitor = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Memulakan pemantau paras suara mikrofon supaya murid tahu mikrofon berfungsi
  const startAudioMonitor = useCallback(
    (stream: MediaStream) => {
      stopAudioMonitor();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx || stream.getAudioTracks().length === 0) return;

      try {
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = ctx;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 90) * 100));
          setAudioLevel(normalized);
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch {
        // Abaikan jika pelayar menyekat AudioContext sebelum interaksi lanjut
      }
    },
    [stopAudioMonitor]
  );

  // Memastikan aliran video sentiasa disambung pada elemen <video> pratonton langsung
  useEffect(() => {
    if (cameraActive && !recordedUrl && liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
      liveVideoRef.current.play().catch(() => {});
    }
  }, [cameraActive, recordedUrl]);

  // Mematikan kamera, mikrofon dan membersihkan sumber apabila komponen ditutup
  const stopCameraAndMic = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAudioMonitor();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsRecording(false);
    onRecordingStateChange?.(false);
  }, [onRecordingStateChange, stopAudioMonitor]);

  useEffect(() => {
    return () => {
      stopCameraAndMic();
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mengaktifkan kamera dan mikrofon hanya selepas murid menekan butang AKTIFKAN KAMERA.
   */
  const handleActivateCamera = async () => {
    setCameraError(null);
    setRecordingError(null);
    setIsPermissionBlocked(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Pelayar web ini tidak menyokong akses kamera atau laman ini tidak dibuka melalui sambungan HTTPS yang selamat.'
      );
      return;
    }

    setIsRequestingCamera(true);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch (constraintErr) {
        const constraintName = constraintErr instanceof DOMException ? constraintErr.name : '';
        if (constraintName === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } else {
          throw constraintErr;
        }
      }

      streamRef.current = stream;
      setCameraActive(true);
      startAudioMonitor(stream);
    } catch (err) {
      const errorName = err instanceof DOMException ? err.name : '';
      if (
        errorName === 'NotAllowedError' ||
        errorName === 'PermissionDeniedError' ||
        errorName === 'SecurityError'
      ) {
        setIsPermissionBlocked(true);
        setCameraError(
          isEmbedded
            ? 'Akses kamera dan mikrofon disekat di dalam paparan terbenam (Google Sites). Sila buka laman web ini di tab baharu dan berikan kebenaran kamera serta mikrofon.'
            : 'Kebenaran kamera dan mikrofon telah ditolak. Sila klik ikon kamera/kunci pada bar alamat pelayar untuk membenarkan akses, kemudian tekan AKTIFKAN KAMERA semula.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setCameraError(
          'Tiada kamera atau mikrofon dikesan pada peranti ini. Pastikan kamera dan mikrofon disambungkan dengan betul.'
        );
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setCameraError(
          'Kamera atau mikrofon sedang digunakan oleh aplikasi lain. Tutup aplikasi tersebut dan cuba lagi.'
        );
      } else {
        setCameraError(
          'Tidak dapat mengaktifkan kamera dan mikrofon. Sila semak tetapan peranti atau cuba buka semula pelayar.'
        );
      }
    } finally {
      setIsRequestingCamera(false);
    }
  };

  /**
   * Memulakan rakaman video menggunakan MediaRecorder API selepas menyemak maklumat murid.
   */
  const handleStartRecording = () => {
    setRecordingError(null);
    setSubmitState('idle');
    setSubmitMessage(null);

    const missingFields: string[] = [];
    if (!studentInfo.namaMurid.trim()) missingFields.push('Nama Murid');
    if (!studentInfo.kelas.trim()) missingFields.push('Kelas');
    if (!studentInfo.tajukSajak.trim()) missingFields.push('Tajuk Sajak');

    if (missingFields.length > 0) {
      setRecordingError(
        `Rakaman belum dimulakan kerana ruangan ${missingFields.join(', ')} masih kosong. Sila isi Maklumat Murid di bahagian atas terlebih dahulu.`
      );
      onRequireStudentInfo();
      return;
    }

    if (!streamRef.current || !cameraActive) {
      setRecordingError('Sila aktifkan kamera terlebih dahulu sebelum memulakan rakaman.');
      return;
    }

    const hasLiveTrack = streamRef.current
      .getTracks()
      .some((track) => track.readyState === 'live');
    if (!hasLiveTrack) {
      stopCameraAndMic();
      setRecordingError(
        'Sambungan kamera telah terhenti. Sila tekan AKTIFKAN KAMERA semula sebelum merakam.'
      );
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setRecordingError(
        'Pelayar web pada peranti ini tidak menyokong rakaman video secara langsung. Sila gunakan pelayar Chrome, Edge atau Safari versi terkini.'
      );
      return;
    }

    // Padam rakaman lama jika ada
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      setRecordedBlob(null);
    }

    try {
      const preferredMime = getSupportedMimeType();
      let recorder: MediaRecorder;
      try {
        recorder = preferredMime
          ? new MediaRecorder(streamRef.current, { mimeType: preferredMime })
          : new MediaRecorder(streamRef.current);
      } catch {
        // Jika format pilihan ditolak oleh perkakasan peranti, guna tetapan lalai pelayar
        recorder = new MediaRecorder(streamRef.current);
      }

      const actualMime = recorder.mimeType || preferredMime || 'video/webm';
      setRecordedMimeType(actualMime);
      chunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);
        onRecordingStateChange?.(false);

        const blob = new Blob(chunksRef.current, { type: actualMime });
        if (blob.size === 0) {
          setRecordingError(
            'Rakaman terlalu singkat atau gagal menyimpan data video. Sila pastikan anda merakam sekurang-kurangnya 2 saat dan cuba lagi.'
          );
          return;
        }
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
      };

      recorder.onerror = () => {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);
        onRecordingStateChange?.(false);
        setRecordingError('Berlaku ralat semasa merakam video. Sila cuba aktifkan semula kamera dan rakam lagi.');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setElapsedSeconds(0);
      setIsRecording(true);
      onRecordingStateChange?.(true);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setRecordingError(
        `Tidak dapat memulakan rakaman video pada pelayar ini.${
          msg ? ` (${msg})` : ''
        } Sila cuba gunakan pelayar Google Chrome atau Microsoft Edge versi terkini.`
      );
    }
  };

  /**
   * Menghentikan rakaman video yang sedang berjalan.
   */
  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        if (recorder.state === 'recording') {
          recorder.requestData();
        }
      } catch {
        // Abaikan jika requestData tidak disokong sebelum stop
      }
      recorder.stop();
    }
  };

  /**
   * Memainkan semula rakaman video untuk semakan murid.
   */
  const handleReplay = () => {
    if (!playbackVideoRef.current) return;
    playbackVideoRef.current.currentTime = 0;
    playbackVideoRef.current.play().catch(() => {});
  };

  /**
   * Membuang rakaman semasa supaya murid dapat merakam semula dengan kamera sedia ada.
   */
  const handleReRecord = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedUrl(null);
    setRecordedBlob(null);
    setElapsedSeconds(0);
    setRecordingError(null);
    setSubmitState('idle');
    setSubmitMessage(null);
  };

  /**
   * Menghantar rakaman video ke Google Apps Script Web App selepas murid menekan HANTAR RAKAMAN.
   */
  const handleSubmitRecording = async () => {
    if (!recordedBlob) return;

    if (
      !studentInfo.namaMurid.trim() ||
      !studentInfo.kelas.trim() ||
      !studentInfo.tajukSajak.trim()
    ) {
      onRequireStudentInfo();
      return;
    }

    const endpoint = GOOGLE_APPS_SCRIPT_URL.trim();
    if (!endpoint) {
      setSubmitState('error');
      setSubmitMessage(
        'Pautan penghantaran Google Drive (GOOGLE_APPS_SCRIPT_URL) belum ditetapkan oleh guru. Sila maklumkan guru anda atau muat turun salinan video terlebih dahulu.'
      );
      return;
    }

    // Semakan saiz fail yang munasabah untuk Apps Script Web App
    const maxBytes = 35 * 1024 * 1024;
    if (recordedBlob.size > maxBytes) {
      setSubmitState('error');
      setSubmitMessage(
        'Saiz video melebihi had muat naik terus (35 MB). Sila rakam video yang lebih ringkas atau muat turun video untuk dihantar terus kepada guru.'
      );
      return;
    }

    setSubmitState('submitting');
    setSubmitMessage(null);

    try {
      const videoBase64 = await blobToBase64(recordedBlob);
      const now = new Date();
      const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const extension = recordedMimeType.includes('mp4') ? 'mp4' : 'webm';
      const fileName = `${sanitizeFilenamePart(studentInfo.namaMurid)}_${sanitizeFilenamePart(
        studentInfo.kelas
      )}_${sanitizeFilenamePart(studentInfo.tajukSajak)}_${dateTag}.${extension}`;

      const cleanMimeType = recordedMimeType.split(';')[0].trim() || 'video/webm';

      // Gunakan text/plain supaya pelayar tidak menghantar CORS preflight OPTIONS yang tidak disokong Google Apps Script
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          video: videoBase64,
          fileName,
          mimeType: cleanMimeType,
          studentName: studentInfo.namaMurid.trim(),
          studentClass: studentInfo.kelas.trim(),
          poemTitle: studentInfo.tajukSajak.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Pelayan memulangkan kod status ${response.status}.`);
      }

      const rawText = await response.text();
      let result: { success?: boolean; error?: string; message?: string };
      try {
        result = JSON.parse(rawText) as { success?: boolean; error?: string; message?: string };
      } catch {
        throw new Error('Maklum balas pelayan bukan format JSON yang sah.');
      }

      if (result.success !== true) {
        throw new Error(
          result.error ||
            result.message ||
            'Pelayan Google Drive tidak mengesahkan kejayaan muat naik.'
        );
      }

      setSubmitState('success');
      setSubmitMessage('Tahniah! Rakaman anda telah berjaya dihantar kepada guru.');
    } catch (err) {
      setSubmitState('error');
      const details = err instanceof Error ? err.message : '';
      setSubmitMessage(
        `Maaf, penghantaran rakaman gagal diselesaikan. ${
          details ? `(${details}) ` : ''
        }Pastikan sambungan internet stabil dan cuba lagi.`
      );
    }
  };

  /**
   * Muat turun sandaran tempatan jika murid ingin menyimpan salinan sendiri.
   */
  const handleDownloadBackup = () => {
    if (!recordedUrl) return;
    const extension = recordedMimeType.includes('mp4') ? 'mp4' : 'webm';
    const fileName = `${sanitizeFilenamePart(
      studentInfo.namaMurid || 'Murid'
    )}_${sanitizeFilenamePart(studentInfo.tajukSajak || 'Sajak')}.${extension}`;
    const anchor = document.createElement('a');
    anchor.href = recordedUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // Label status rakaman untuk paparan dwi-kod (teks + ikon)
  const statusLabel = isRecording
    ? 'SEDANG MERAKAM'
    : recordedUrl
      ? 'RAKAMAN SELESAI — SEDIA DISEMAK'
      : cameraActive
        ? 'KAMERA AKTIF — SEDIA MERAKAM'
        : 'KAMERA BELUM DIAKTIFKAN';

  return (
    <section
      aria-labelledby="recording-studio-heading"
      className="rounded-2xl border border-[#C89B3C]/45 bg-[#FFFDF8] p-5 sm:p-6 shadow-sm"
    >
      {/* Kepala Studio & Penunjuk Status + Pemasa */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C89B3C]/25 pb-4">
        <div>
          <h3
            id="recording-studio-heading"
            className="font-display text-lg sm:text-xl font-bold text-[#0E1D3B]"
          >
            Studio Kamera &amp; Rakaman
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
            {isRecording && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse"
                aria-hidden="true"
              />
            )}
            <span
              className={
                isRecording
                  ? 'text-red-700'
                  : recordedUrl
                    ? 'text-[#059669]'
                    : cameraActive
                      ? 'text-[#0E1D3B]'
                      : 'text-[#0E1D3B]/65'
              }
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Pemasa Rakaman */}
        <div
          aria-label="Pemasa rakaman"
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-base sm:text-lg font-semibold tabular-nums ${
            isRecording
              ? 'border-red-300 bg-red-50 text-red-800'
              : 'border-[#C89B3C]/35 bg-[#FAF6EE] text-[#0E1D3B]'
          }`}
        >
          <span className="text-xs font-sans font-medium uppercase tracking-wide opacity-75">
            Masa
          </span>
          <span>{formatDuration(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Notis khas jika dibuka secara terbenam dalam Google Sites / iframe */}
      {isEmbedded && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#C89B3C]/45 bg-[#FAF6EE] p-3.5 text-xs sm:text-sm text-[#0E1D3B]">
          <p>
            Laman ini sedang dibuka dalam mod terbenam (seperti Google Sites). Jika kamera atau
            mikrofon tidak dapat diaktifkan, sila buka di tab baharu.
          </p>
          <a
            href={currentUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0E1D3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#162B54] whitespace-nowrap shrink-0 min-h-[38px]"
          >
            <span>Buka di Tab Baharu</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Paparan Video: Pratonton Langsung atau Semakan Video Rakaman */}
      <div className="mt-4 relative overflow-hidden rounded-xl border border-[#0E1D3B]/20 bg-[#091328] aspect-video w-full">
        {recordedUrl ? (
          <video
            key={recordedUrl}
            ref={playbackVideoRef}
            src={recordedUrl}
            controls
            playsInline
            preload="auto"
            className="h-full w-full object-contain bg-black"
          />
        ) : cameraActive ? (
          <>
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${mirrorPreview ? '-scale-x-100' : ''}`}
            />
            {/* Kawalan cermin paparan */}
            <button
              type="button"
              onClick={() => setMirrorPreview((prev) => !prev)}
              title="Tukar arah cermin pratonton kamera"
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0E1D3B]/80 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-xs hover:bg-[#0E1D3B] cursor-pointer"
            >
              <FlipHorizontal2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{mirrorPreview ? 'Cermin: Hidup' : 'Cermin: Mati'}</span>
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-songket-navy p-6 text-center text-[#FFFDF8]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#DFB95E]/40 bg-[#162B54]">
              <Video className="h-7 w-7 text-[#DFB95E]" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-white">
              Pratonton Kamera Belum Aktif
            </p>
            <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-[#F1E9D8]/80">
              Tekan butang <strong>AKTIFKAN KAMERA</strong> di bawah untuk melihat wajah kamu
              dan menguji mikrofon sebelum merakam.
            </p>
          </div>
        )}
      </div>

      {/* Penunjuk Paras Audio Mikrofon semasa kamera aktif */}
      {cameraActive && !recordedUrl && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#C89B3C]/25 bg-[#FAF6EE] px-4 py-2.5">
          <Mic className="h-4 w-4 text-[#A57C24] shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-[#0E1D3B] whitespace-nowrap">
            Ujian Mikrofon
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0E1D3B]/10">
            <div
              className="h-full rounded-full bg-[#C89B3C] transition-[width] duration-75"
              style={{ width: `${audioLevel}%` }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-[#0E1D3B]/70 w-9 text-right">
            {audioLevel}%
          </span>
        </div>
      )}

      {/* Mesej Ralat Kebenaran Kamera / Mikrofon */}
      {cameraError && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2.5">
              <p>{cameraError}</p>
              {isPermissionBlocked && (
                <a
                  href={currentUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0E1D3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#162B54] min-h-[40px]"
                >
                  <span>Buka Laman di Tab Baharu</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mesej Ralat Rakaman */}
      {recordingError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
        >
          <AlertTriangle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{recordingError}</span>
        </div>
      )}

      {/* Kawalan Butang Tindakan */}
      <div className="mt-5 space-y-3">
        {/* Peringkat 1: Sebelum kamera aktif */}
        {!cameraActive && !recordedUrl && (
          <button
            type="button"
            onClick={handleActivateCamera}
            disabled={isRequestingCamera}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0E1D3B] px-6 py-3.5 text-base font-bold text-[#FFFDF8] shadow-sm transition-colors hover:bg-[#162B54] disabled:opacity-60 cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B3C]"
          >
            {isRequestingCamera ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-[#DFB95E]" aria-hidden="true" />
                <span>MEMOHON KEBENARAN KAMERA...</span>
              </>
            ) : (
              <>
                <Video className="h-5 w-5 text-[#DFB95E]" aria-hidden="true" />
                <span>AKTIFKAN KAMERA</span>
              </>
            )}
          </button>
        )}

        {/* Peringkat 2: Kamera aktif, belum mula rakam atau sedang merakam */}
        {cameraActive && !recordedUrl && (
          <div className="space-y-3">
            {!isRecording &&
              (!studentInfo.namaMurid.trim() ||
                !studentInfo.kelas.trim() ||
                !studentInfo.tajukSajak.trim()) && (
                <p className="text-xs font-medium text-[#7D5B14] bg-[#FAF6EE] border border-[#C89B3C]/35 rounded-xl px-3.5 py-2.5">
                  Peringatan: Sila isi <strong>Nama Murid</strong> dan <strong>Kelas</strong> di
                  bahagian Maklumat Murid sebelum menekan MULA RAKAMAN.
                </p>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#C89B3C] px-5 py-3.5 text-base font-bold text-[#0E1D3B] shadow-sm transition-colors hover:bg-[#DFB95E] cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E1D3B]"
                >
                  <Circle className="h-5 w-5 fill-red-700 text-red-700" aria-hidden="true" />
                  <span>MULA RAKAMAN</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-red-700 px-5 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-red-800 cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  <Square className="h-4 w-4 fill-white" aria-hidden="true" />
                  <span>HENTIKAN RAKAMAN</span>
                </button>
              )}

              <button
                type="button"
                onClick={stopCameraAndMic}
                disabled={isRecording}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0E1D3B]/25 bg-white px-5 py-3.5 text-sm sm:text-base font-semibold text-[#0E1D3B] transition-colors hover:bg-[#FAF6EE] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer min-h-[48px]"
              >
                <VideoOff className="h-4 w-4" aria-hidden="true" />
                <span>MATIKAN KAMERA</span>
              </button>
            </div>
          </div>
        )}

        {/* Peringkat 3: Semakan rakaman sebelum penghantaran */}
        {recordedUrl && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0E1D3B]/25 bg-white px-4 py-3 text-sm sm:text-base font-semibold text-[#0E1D3B] transition-colors hover:bg-[#FAF6EE] cursor-pointer min-h-[48px]"
              >
                <Play className="h-4 w-4 text-[#A57C24]" aria-hidden="true" />
                <span>TONTON SEMULA</span>
              </button>

              <button
                type="button"
                onClick={handleReRecord}
                disabled={submitState === 'submitting'}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0E1D3B]/25 bg-white px-4 py-3 text-sm sm:text-base font-semibold text-[#0E1D3B] transition-colors hover:bg-[#FAF6EE] disabled:opacity-50 cursor-pointer min-h-[48px]"
              >
                <RotateCcw className="h-4 w-4 text-[#0E1D3B]" aria-hidden="true" />
                <span>RAKAM SEMULA</span>
              </button>
            </div>

            {submitState !== 'success' && (
              <button
                type="button"
                onClick={handleSubmitRecording}
                disabled={submitState === 'submitting'}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0E1D3B] px-6 py-3.5 text-base font-bold text-[#FFFDF8] shadow-sm transition-colors hover:bg-[#162B54] disabled:opacity-65 cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B3C]"
              >
                {submitState === 'submitting' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-[#DFB95E]" aria-hidden="true" />
                    <span>SEDANG MENGHANTAR RAKAMAN...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 text-[#DFB95E]" aria-hidden="true" />
                    <span>HANTAR RAKAMAN</span>
                  </>
                )}
              </button>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#0E1D3B]/70">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-1.5 font-medium text-[#0E1D3B]/80 hover:text-[#0E1D3B] underline underline-offset-2 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Simpan salinan video ke peranti</span>
              </button>

              {cameraActive && (
                <button
                  type="button"
                  onClick={stopCameraAndMic}
                  className="inline-flex items-center gap-1.5 font-medium text-[#0E1D3B]/75 hover:text-[#0E1D3B] cursor-pointer"
                >
                  <VideoOff className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Matikan Kamera</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pengesahan Kejayaan Penghantaran daripada Pelayan */}
      {submitState === 'success' && submitMessage && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-400 bg-emerald-50 p-4 text-emerald-950"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display text-base sm:text-lg font-bold text-emerald-900">
                {submitMessage}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-emerald-800">
                Rekod atas nama <strong>{studentInfo.namaMurid}</strong> ({studentInfo.kelas}) bagi
                sajak <strong>{studentInfo.tajukSajak}</strong> telah diterima ke Google Drive guru.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mesej Ralat Penghantaran */}
      {submitState === 'error' && submitMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 space-y-2.5"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{submitMessage}</p>
          </div>
          {!GOOGLE_APPS_SCRIPT_URL.trim() && (
            <button
              type="button"
              onClick={onOpenTeacherGuide}
              className="text-xs font-semibold text-[#0E1D3B] underline hover:text-[#A57C24] cursor-pointer"
            >
              Buka Panduan Guru untuk menetapkan Google Apps Script URL
            </button>
          )}
        </div>
      )}
    </section>
  );
};
