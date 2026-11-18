import React from 'react';

interface HeaderProps {
  onStartClick: () => void;
  onOpenTeacherGuide: () => void;
}

/**
 * Bar navigasi utama 3-zon yang kemas, responsif dan selamat dalam paparan Google Sites.
 */
export const Header: React.FC<HeaderProps> = ({ onStartClick, onOpenTeacherGuide }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#C89B3C]/30 bg-[#0E1D3B]/95 backdrop-blur-sm text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5">
        {/* Zon 1: Nama laman satu baris */}
        <a
          href="#laman-utama"
          className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#FFFDF8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFB95E] rounded"
        >
          Studio Deklamasi Sajak
        </a>

        {/* Zon 2: Pautan navigasi satu baris */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#F1E9D8]/85"
        >
          <a
            href="#laman-utama"
            className="hover:text-[#DFB95E] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFB95E] rounded"
          >
            Laman Utama
          </a>
          <a
            href="#panduan-penggunaan"
            className="hover:text-[#DFB95E] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFB95E] rounded"
          >
            Panduan
          </a>
          <a
            href="#studio-rakaman"
            className="hover:text-[#DFB95E] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFB95E] rounded"
          >
            Studio Rakaman
          </a>
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="hover:text-[#DFB95E] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFB95E] rounded"
          >
            Panduan Guru
          </button>
        </nav>

        {/* Zon 3: Satu butang tindakan utama */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onStartClick}
            className="inline-flex items-center justify-center rounded-lg bg-[#C89B3C] px-4 py-2 text-xs sm:text-sm font-semibold text-[#0E1D3B] shadow-sm transition-colors hover:bg-[#DFB95E] active:translate-y-px cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFB95E]"
          >
            Mula Deklamasi
          </button>
        </div>
      </div>
    </header>
  );
};
