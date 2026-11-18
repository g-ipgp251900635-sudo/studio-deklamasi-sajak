import React, { useMemo, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import {
  POEM_TITLE,
  POEM_AUTHOR,
  POEM_TEXT,
  IS_DEFAULT_POEM_TEMPLATE,
} from '../config/studioConfig';
import { AwanLaratDivider, SongketCornerOrnament } from './SongketMotif';

type TextSize = 'kecil' | 'sederhana' | 'besar';

interface PoemScriptCardProps {
  onOpenTeacherGuide: () => void;
}

/**
 * Bahagian Bacaan Sajak: Memaparkan POEM_TITLE, POEM_AUTHOR dan POEM_TEXT
 * sambil mengekalkan susunan baris serta rangkap asal tanpa mengubah teks sajak.
 */
export const PoemScriptCard: React.FC<PoemScriptCardProps> = ({ onOpenTeacherGuide }) => {
  const [textSize, setTextSize] = useState<TextSize>('sederhana');
  const [activeStanza, setActiveStanza] = useState<number | null>(null);

  // Memecahkan teks mengikut rangkap (dua baris baharu) tanpa mengubah baris di dalamnya
  const stanzas = useMemo(() => {
    return POEM_TEXT.split(/\n\s*\n/).filter((stanza) => stanza.length > 0);
  }, []);

  const sizeClassMap: Record<TextSize, string> = {
    kecil: 'text-sm sm:text-base leading-relaxed',
    sederhana: 'text-base sm:text-lg leading-relaxed',
    besar: 'text-lg sm:text-xl leading-loose',
  };

  return (
    <article
      aria-labelledby="poem-script-heading"
      className="relative rounded-2xl border border-[#C89B3C]/45 bg-[#FFFDF8] p-5 sm:p-7 shadow-sm"
    >
      {/* Hiasan sudut songket halus */}
      <SongketCornerOrnament position="top-left" className="absolute top-2.5 left-2.5" />
      <SongketCornerOrnament position="top-right" className="absolute top-2.5 right-2.5" />
      <SongketCornerOrnament position="bottom-left" className="absolute bottom-2.5 left-2.5" />
      <SongketCornerOrnament position="bottom-right" className="absolute bottom-2.5 right-2.5" />

      {/* Kepala Skrip & Kawalan Saiz Tulisan */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C89B3C]/25 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A57C24]">
          <BookOpenText className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Skrip Sajak Rasmi</span>
        </div>

        <div
          className="flex items-center gap-1 rounded-lg border border-[#C89B3C]/30 bg-[#FAF6EE] p-1"
          role="group"
          aria-label="Laraskan saiz teks sajak"
        >
          {(
            [
              { id: 'kecil', label: 'A-' },
              { id: 'sederhana', label: 'A' },
              { id: 'besar', label: 'A+' },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTextSize(option.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer min-h-[32px] whitespace-nowrap ${
                textSize === option.id
                  ? 'bg-[#0E1D3B] text-[#FFFDF8]'
                  : 'text-[#0E1D3B]/75 hover:text-[#0E1D3B]'
              }`}
              title={`Saiz teks ${option.id}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tajuk & Penyajak */}
      <header className="mt-5 text-center px-2">
        <h3
          id="poem-script-heading"
          className="font-display text-2xl sm:text-3xl font-bold text-[#0E1D3B] [text-wrap:balance]"
        >
          {POEM_TITLE}
        </h3>
        <p className="mt-1.5 text-sm font-medium text-[#7D5B14]">
          {POEM_AUTHOR}
        </p>
      </header>

      <AwanLaratDivider className="my-5 max-w-xs mx-auto" />

      {/* Paparan Rangkap Sajak dengan pemeliharaan baris asal */}
      <div className="space-y-4">
        {stanzas.map((stanza, index) => {
          const isFocused = activeStanza === index;
          return (
            <div
              key={index}
              onClick={() => setActiveStanza(isFocused ? null : index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStanza(isFocused ? null : index);
                }
              }}
              aria-pressed={isFocused}
              className={`rounded-xl px-4 sm:px-5 py-4 transition-colors cursor-pointer select-text border ${
                isFocused
                  ? 'bg-[#FAF6EE] border-[#C89B3C] shadow-xs'
                  : 'bg-[#FAF6EE]/55 border-[#C89B3C]/15 hover:border-[#C89B3C]/45'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between text-xs text-[#7D5B14]/80">
                <span className="font-mono tabular-nums font-medium">
                  Rangkap {index + 1}
                </span>
                {isFocused && (
                  <span className="font-medium text-[#A57C24]">Sedang difokuskan</span>
                )}
              </div>
              <p
                className={`whitespace-pre-line font-display text-[#0E1D3B] ${sizeClassMap[textSize]}`}
              >
                {stanza}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-[#0E1D3B]/65">
        Tip: Klik atau ketik pada mana-mana rangkap untuk menandakannya semasa membaca.
      </p>

      {/* Peringatan guru jika masih menggunakan teks templat lalai */}
      {IS_DEFAULT_POEM_TEMPLATE && (
        <div className="mt-5 rounded-xl border border-[#C89B3C]/45 bg-[#FAF6EE] p-4 text-xs sm:text-sm text-[#0E1D3B]/85">
          <p>
            <strong className="font-semibold text-[#0E1D3B]">Nota untuk Guru:</strong> Paparan di
            atas ialah templat contoh. Anda boleh memasukkan sajak sebenar pada pemalar{' '}
            <code className="font-mono text-xs bg-[#0E1D3B]/10 px-1.5 py-0.5 rounded">
              POEM_TITLE
            </code>
            ,{' '}
            <code className="font-mono text-xs bg-[#0E1D3B]/10 px-1.5 py-0.5 rounded">
              POEM_AUTHOR
            </code>{' '}
            dan{' '}
            <code className="font-mono text-xs bg-[#0E1D3B]/10 px-1.5 py-0.5 rounded">
              POEM_TEXT
            </code>{' '}
            dalam fail{' '}
            <code className="font-mono text-xs bg-[#0E1D3B]/10 px-1.5 py-0.5 rounded">
              src/config/studioConfig.ts
            </code>
            .{' '}
            <button
              type="button"
              onClick={onOpenTeacherGuide}
              className="font-semibold text-[#A57C24] underline hover:text-[#7D5B14] cursor-pointer"
            >
              Lihat Panduan Guru
            </button>
          </p>
        </div>
      )}
    </article>
  );
};
