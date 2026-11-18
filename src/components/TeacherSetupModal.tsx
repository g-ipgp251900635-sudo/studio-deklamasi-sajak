import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import {
  GOOGLE_DRIVE_FOLDER_ID,
  GOOGLE_DRIVE_FOLDER_URL,
  GOOGLE_APPS_SCRIPT_URL,
} from '../config/studioConfig';

interface TeacherSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APPS_SCRIPT_CODE = `var FOLDER_ID = '${GOOGLE_DRIVE_FOLDER_ID}';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: 'Tiada data diterima.' });
    }
    var payload = JSON.parse(e.postData.contents);
    var videoBase64 = payload.video || payload.videoBase64;
    var mimeType = payload.mimeType || 'video/webm';
    var studentName = (payload.studentName || 'Murid').toString().trim();
    var studentClass = (payload.studentClass || 'Kelas').toString().trim();
    var poemTitle = (payload.poemTitle || 'Sajak').toString().trim();
    var fileName = (payload.fileName || '').toString().trim();

    if (!videoBase64) {
      return createJsonResponse({ success: false, error: 'Video kosong.' });
    }

    if (!fileName) {
      var ts = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyyMMdd_HHmmss');
      var ext = mimeType.indexOf('mp4') !== -1 ? 'mp4' : 'webm';
      fileName = studentName + '_' + studentClass + '_' + poemTitle + '_' + ts + '.' + ext;
    }

    var blob = Utilities.newBlob(Utilities.base64Decode(videoBase64), mimeType, fileName);
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);
    file.setDescription(
      'Nama Murid: ' + studentName + '\\n' +
      'Kelas: ' + studentClass + '\\n' +
      'Tajuk Sajak: ' + poemTitle
    );

    return createJsonResponse({
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl()
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err && err.message ? err.message : 'Ralat pelayan.'
    });
  }
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

/**
 * Modal Panduan Guru: Menyediakan langkah lengkap tetapan sajak, Google Drive Web App,
 * GitHub Pages dan Google Sites.
 */
export const TeacherSetupModal: React.FC<TeacherSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Abaikan jika clipboard disekat
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091328]/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-guide-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#C89B3C]/50 bg-[#FFFDF8] p-6 sm:p-8 shadow-2xl text-[#0E1D3B]">
        <div className="flex items-start justify-between gap-4 border-b border-[#C89B3C]/25 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A57C24]">
              Dokumentasi &amp; Konfigurasi Guru
            </p>
            <h2
              id="teacher-guide-title"
              className="mt-1 font-display text-2xl font-bold text-[#0E1D3B]"
            >
              Panduan Tetapan Studio Deklamasi Sajak
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan guru"
            className="rounded-lg border border-[#0E1D3B]/15 p-2 text-[#0E1D3B] hover:bg-[#FAF6EE] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-relaxed">
          {/* 1. Memasukkan Sajak */}
          <section className="space-y-2">
            <h3 className="font-display text-lg font-bold text-[#0E1D3B]">
              1. Memasukkan Sajak Sebenar
            </h3>
            <p>
              Buka fail{' '}
              <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                src/config/studioConfig.ts
              </code>{' '}
              dan gantikan nilai pada pemalar{' '}
              <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                POEM_TITLE
              </code>
              ,{' '}
              <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                POEM_AUTHOR
              </code>{' '}
              serta{' '}
              <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                POEM_TEXT
              </code>
              . Kekalkan baris baharu dan jarak satu baris kosong di antara setiap rangkap.
            </p>
          </section>

          {/* 2. Tetapan Google Drive melalui Google Apps Script */}
          <section className="space-y-2.5 border-t border-[#C89B3C]/20 pt-5">
            <h3 className="font-display text-lg font-bold text-[#0E1D3B]">
              2. Menghantar Video Murid ke Folder Google Drive Anda
            </h3>
            <p>
              Status semasa{' '}
              <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                GOOGLE_APPS_SCRIPT_URL
              </code>
              :{' '}
              <strong className={GOOGLE_APPS_SCRIPT_URL.trim() ? 'text-emerald-700' : 'text-amber-700'}>
                {GOOGLE_APPS_SCRIPT_URL.trim() ? 'Sudah ditetapkan' : 'Belum ditetapkan (kosong)'}
              </strong>
            </p>
            <p>
              Pautan folder Drive sahaja tidak membenarkan pelayar memuat naik fail secara terus.
              Ikuti langkah percuma ini untuk menyambungkan laman ke folder Drive{' '}
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#A57C24] underline"
              >
                <span>({GOOGLE_DRIVE_FOLDER_ID})</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              :
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[#0E1D3B]/90">
              <li>
                Buka{' '}
                <a
                  href="https://script.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#A57C24] underline"
                >
                  script.google.com
                </a>{' '}
                menggunakan akaun Google yang mempunyai akses suntingan ke folder Drive tersebut.
              </li>
              <li>Cipta projek baharu dan tampal kod Google Apps Script di bawah.</li>
              <li>
                Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>.
              </li>
              <li>
                Tetapkan <strong>Execute as: Me</strong> dan{' '}
                <strong>Who has access: Anyone</strong>, kemudian klik <strong>Deploy</strong>.
              </li>
              <li>
                Salin <strong>Web app URL</strong> (berakhir dengan{' '}
                <code className="font-mono text-xs">/exec</code>) dan tampal ke dalam pemalar{' '}
                <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                  GOOGLE_APPS_SCRIPT_URL
                </code>{' '}
                di fail{' '}
                <code className="font-mono text-xs bg-[#FAF6EE] border border-[#C89B3C]/30 px-1.5 py-0.5 rounded">
                  src/config/studioConfig.ts
                </code>
                .
              </li>
            </ol>

            <div className="rounded-xl border border-[#0E1D3B]/20 bg-[#0E1D3B] p-4 text-[#F1E9D8]">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <span className="font-mono text-xs text-[#DFB95E]">
                  google-apps-script/Code.gs
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#C89B3C] px-3 py-1.5 text-xs font-semibold text-[#0E1D3B] hover:bg-[#DFB95E] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Salin Kod</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="mt-3 max-h-52 overflow-auto font-mono text-xs leading-relaxed text-[#FFFDF8]">
                {APPS_SCRIPT_CODE}
              </pre>
            </div>
          </section>

          {/* 3. GitHub Pages & Google Sites */}
          <section className="space-y-2 border-t border-[#C89B3C]/20 pt-5">
            <h3 className="font-display text-lg font-bold text-[#0E1D3B]">
              3. Penerbitan GitHub Pages &amp; Google Sites
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-[#0E1D3B]/90">
              <li>
                <strong>GitHub Pages:</strong> Jalankan{' '}
                <code className="font-mono text-xs bg-[#FAF6EE] px-1.5 py-0.5 rounded">
                  npm run build
                </code>{' '}
                dan terbitkan kandungan folder{' '}
                <code className="font-mono text-xs bg-[#FAF6EE] px-1.5 py-0.5 rounded">dist/</code>.
                Fail <code className="font-mono text-xs">vite.config.ts</code> telah ditetapkan dengan{' '}
                <code className="font-mono text-xs">base: &apos;./&apos;</code>.
              </li>
              <li>
                <strong>Google Sites:</strong> Gunakan menu <em>Insert &gt; Embed &gt; By URL</em>{' '}
                dan tampal pautan HTTPS GitHub Pages anda. Jika pelayar menyekat kamera di dalam
                bingkai terbenam, laman ini menyediakan pautan terus untuk murid membuka laman di
                tab baharu.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex justify-end border-t border-[#C89B3C]/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0E1D3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#162B54] cursor-pointer min-h-[42px]"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
