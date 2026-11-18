/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { GuideSection } from './components/GuideSection';
import { StudentInfo, StudentInfoForm } from './components/StudentInfoForm';
import { PoemScriptCard } from './components/PoemScriptCard';
import { RecordingStudio } from './components/RecordingStudio';
import { TeacherSetupModal } from './components/TeacherSetupModal';
import { AwanLaratDivider } from './components/SongketMotif';
import {
  IS_DEFAULT_POEM_TEMPLATE,
  POEM_TITLE,
} from './config/studioConfig';

export default function App() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    namaMurid: '',
    kelas: '',
    tajukSajak: IS_DEFAULT_POEM_TEMPLATE ? '' : POEM_TITLE,
  });

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  const studioSectionRef = useRef<HTMLElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const handleStartDeclamation = () => {
    studioSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  const handleStudentInfoChange = (updated: StudentInfo) => {
    setStudentInfo(updated);
    if (
      showValidationErrors &&
      updated.namaMurid.trim() &&
      updated.kelas.trim() &&
      updated.tajukSajak.trim()
    ) {
      setShowValidationErrors(false);
    }
  };

  const handleRequireStudentInfo = () => {
    setShowValidationErrors(true);
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true });
    }, 250);
  };

  return (
    <div className="min-h-screen flex flex-col bg-songket-cream text-[#0E1D3B]">
      <Header
        onStartClick={handleStartDeclamation}
        onOpenTeacherGuide={() => setTeacherModalOpen(true)}
      />

      <main className="flex-1">
        {/* 1. Laman Utama (Hero) */}
        <HeroSection
          onStartClick={handleStartDeclamation}
          onOpenTeacherGuide={() => setTeacherModalOpen(true)}
        />

        {/* 2. Panduan Ringkas Penggunaan */}
        <GuideSection />

        {/* 3. Ruang Kerja Studio: Maklumat Murid + Skrip Sajak + Rakaman Video */}
        <section
          id="studio-rakaman"
          ref={studioSectionRef}
          aria-labelledby="studio-section-title"
          className="py-10 sm:py-14"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A57C24]">
                  Ruang Latihan &amp; Rakaman
                </p>
                <h2
                  id="studio-section-title"
                  className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#0E1D3B]"
                >
                  Pentas Deklamasi Murid
                </h2>
              </div>
              <p className="text-sm text-[#0E1D3B]/75 max-w-md">
                Lengkapkan maklumat diri, baca skrip sajak yang dipaparkan, aktifkan kamera dan
                rakam persembahan terbaik kamu.
              </p>
            </div>

            {/* Borang Maklumat Murid */}
            <StudentInfoForm
              studentInfo={studentInfo}
              onChange={handleStudentInfoChange}
              showValidationErrors={showValidationErrors}
              disabled={isRecording}
              nameInputRef={nameInputRef}
            />

            {/* Susunan Desktop: Bersebelahan | Mudah Alih: Sajak di Atas, Kamera di Bawah */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6">
                <PoemScriptCard onOpenTeacherGuide={() => setTeacherModalOpen(true)} />
              </div>

              <div className="lg:col-span-6 lg:sticky lg:top-20">
                <RecordingStudio
                  studentInfo={studentInfo}
                  onRequireStudentInfo={handleRequireStudentInfo}
                  onRecordingStateChange={setIsRecording}
                  onOpenTeacherGuide={() => setTeacherModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Kaki Laman Tradisional Melayu */}
      <footer className="border-t border-[#C89B3C]/35 bg-[#0E1D3B] text-[#F1E9D8] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AwanLaratDivider className="mb-6 max-w-xs mx-auto" light />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-display text-base font-semibold text-white">
                Studio Deklamasi Sajak
              </p>
              <p className="mt-1 text-xs text-[#F1E9D8]/75">
                Laman Pendidikan Bahasa Melayu Sekolah Rendah · Memartabatkan Seni Puisi
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs sm:text-sm">
              <a href="#laman-utama" className="hover:text-[#DFB95E] transition-colors">
                Laman Utama
              </a>
              <a href="#studio-rakaman" className="hover:text-[#DFB95E] transition-colors">
                Studio Rakaman
              </a>
              <button
                type="button"
                onClick={() => setTeacherModalOpen(true)}
                className="font-medium text-[#DFB95E] underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
              >
                Panduan Guru &amp; Tetapan
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Panduan Guru */}
      <TeacherSetupModal
        isOpen={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
      />
    </div>
  );
}
