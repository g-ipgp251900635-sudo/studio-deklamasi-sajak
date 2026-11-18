import React from 'react';
import { AwanLaratDivider } from './SongketMotif';

const STEPS = [
  {
    number: '01',
    title: 'Isi Maklumat Murid',
    description:
      'Masukkan Nama Murid, Kelas dan Tajuk Sajak pada ruangan yang disediakan sebelum memulakan rakaman.',
  },
  {
    number: '02',
    title: 'Baca & Hayati Sajak',
    description:
      'Teliti rangkap dan baris sajak di skrin. Kamu boleh melaraskan saiz tulisan agar mudah dibaca.',
  },
  {
    number: '03',
    title: 'Aktifkan Kamera & Rakam',
    description:
      'Tekan butang AKTIFKAN KAMERA, berikan kebenaran pelayar, kemudian tekan MULA RAKAMAN untuk mendeklamasikan sajak.',
  },
  {
    number: '04',
    title: 'Tonton Semula & Hantar',
    description:
      'Setelah selesai, tonton semula video kamu. Jika berpuas hati, tekan HANTAR RAKAMAN kepada guru.',
  },
];

/**
 * Bahagian Panduan Ringkas: Menerangkan langkah penggunaan laman web kepada murid sekolah rendah.
 */
export const GuideSection: React.FC = () => {
  return (
    <section
      id="panduan-penggunaan"
      className="border-b border-[#C89B3C]/25 bg-[#FFFDF8] py-10 sm:py-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A57C24]">
              Panduan Ringkas Murid
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#0E1D3B]">
              Cara Menggunakan Studio Deklamasi Sajak
            </h2>
          </div>
          <p className="text-sm text-[#0E1D3B]/75 max-w-md">
            Ikuti empat langkah mudah ini untuk berlatih nada, intonasi dan ekspresi wajah yang
            berkesan.
          </p>
        </div>

        <AwanLaratDivider className="my-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-[#C89B3C]/30 bg-[#FAF6EE] p-5 transition-colors hover:border-[#C89B3C]/70"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-sm font-semibold tabular-nums text-[#A57C24]">
                  {step.number}.
                </span>
                <h3 className="font-display text-lg font-semibold text-[#0E1D3B]">
                  {step.title}
                </h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-[#0E1D3B]/80">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tip ringkas penyampaian tanpa kotak bertindan */}
        <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#C89B3C]/20 pt-5 text-sm text-[#0E1D3B]/80">
          <p>
            <strong className="font-semibold text-[#0E1D3B]">Tip Penghayatan:</strong> Sebut
            perkataan dengan jelas, kawal kelajuan suara, dan gunakan mimik muka yang sesuai
            dengan maksud setiap rangkap.
          </p>
          <span className="text-xs font-medium text-[#7D5B14] whitespace-nowrap shrink-0">
            Nada · Intonasi · Gaya · Penghayatan
          </span>
        </div>
      </div>
    </section>
  );
};
