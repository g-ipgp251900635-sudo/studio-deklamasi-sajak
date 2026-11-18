import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, BookOpen } from 'lucide-react';
import songketHeroImg from '../assets/images/malay_songket_heritage_motif_1794987341632.jpg';
import { AwanLaratDivider } from './SongketMotif';

interface HeroSectionProps {
  onStartClick: () => void;
  onOpenTeacherGuide: () => void;
}

/**
 * Laman Utama: Memperkenalkan Studio Deklamasi Sajak dengan estetika warisan Melayu.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartClick,
  onOpenTeacherGuide,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="laman-utama"
      className="relative overflow-hidden bg-songket-navy text-[#FFFDF8] border-b-2 border-[#C89B3C]/45"
    >
      {/* Jalur emas halus di bahagian atas */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0E1D3B] via-[#C89B3C] to-[#0E1D3B]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Lajur Kiri: Tajuk, Pengenalan & Butang Mula Deklamasi */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <p className="text-xs sm:text-sm font-medium tracking-wider text-[#DFB95E] uppercase mb-3">
              Bahasa Melayu Sekolah Rendah · Latihan &amp; Rakaman Video
            </p>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white [text-wrap:balance]">
              Studio Deklamasi Sajak
            </h1>

            <p className="mt-3 font-display text-lg sm:text-xl italic text-[#DFB95E] leading-relaxed [text-wrap:balance]">
              &ldquo;Hayati, Fahami dan Deklamasikan Sajak dengan Penuh Penghayatan&rdquo;
            </p>

            <AwanLaratDivider className="my-6 max-w-md" light />

            <p className="text-base sm:text-lg text-[#F1E9D8]/90 leading-relaxed max-w-2xl">
              Selamat datang ke ruang latihan deklamasi sajak khas untuk murid sekolah rendah.
              Di sini, kamu boleh membaca skrip sajak dengan jelas sambil berlatih menggunakan
              pelbagai <strong className="text-white font-semibold">nada</strong>,{' '}
              <strong className="text-white font-semibold">intonasi</strong> dan{' '}
              <strong className="text-white font-semibold">ekspresi penghayatan</strong> sebelum
              merakam dan menghantar video persembahan kepada guru.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartClick}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#C89B3C] px-7 py-3.5 text-base font-bold text-[#0E1D3B] shadow-md transition-all hover:bg-[#DFB95E] active:translate-y-px cursor-pointer whitespace-nowrap min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFB95E]"
              >
                <span>MULA DEKLAMASI</span>
                <ArrowDown className="h-5 w-5" aria-hidden="true" />
              </button>

              <a
                href="#panduan-penggunaan"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFB95E]/50 bg-[#162B54]/70 px-5 py-3.5 text-sm sm:text-base font-medium text-[#FFFDF8] transition-colors hover:bg-[#162B54] hover:border-[#DFB95E] whitespace-nowrap min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFB95E]"
              >
                <BookOpen className="h-4 w-4 text-[#DFB95E]" aria-hidden="true" />
                <span>Cara Penggunaan</span>
              </a>
            </div>

            <div className="mt-6 text-xs sm:text-sm text-[#F1E9D8]/75">
              <button
                type="button"
                onClick={onOpenTeacherGuide}
                className="underline decoration-[#DFB95E]/50 underline-offset-4 hover:text-[#DFB95E] transition-colors cursor-pointer"
              >
                Untuk Guru: Panduan Tetapan Sajak, Google Drive &amp; Google Sites
              </button>
            </div>
          </motion.div>

          {/* Lajur Kanan: Bingkai Visual Warisan Songket & Awan Larat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="lg:col-span-5 flex"
          >
            <div className="relative w-full rounded-2xl border border-[#DFB95E]/40 bg-[#162B54] p-3 shadow-lg flex flex-col">
              <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-[#091328] min-h-[240px] sm:min-h-[290px]">
                {!imgError ? (
                  <img
                    src={songketHeroImg}
                    alt="Motif songket biru kelasi dan ukiran awan larat keemasan warisan Melayu"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-songket-navy p-6 text-center">
                    <span className="font-display text-2xl font-semibold text-[#DFB95E]">
                      Warisan Puisi Melayu
                    </span>
                    <span className="mt-2 text-sm text-[#F1E9D8]/80">
                      Seni Deklamasi &amp; Penghayatan Bahasa
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#091328]/85 via-[#091328]/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <p className="font-display text-base sm:text-lg font-semibold text-[#FFFDF8]">
                    Pentas Suara &amp; Gaya Murid
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm text-[#F1E9D8]/85">
                    Baca teks sajak di skrin, rakam video dengan yakin, dan semak sebelum dihantar.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
