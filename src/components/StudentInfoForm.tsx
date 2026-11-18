import React from 'react';
import { UserCheck, AlertCircle } from 'lucide-react';
import { POEM_TITLE, IS_DEFAULT_POEM_TEMPLATE } from '../config/studioConfig';

export interface StudentInfo {
  namaMurid: string;
  kelas: string;
  tajukSajak: string;
}

interface StudentInfoFormProps {
  studentInfo: StudentInfo;
  onChange: (updated: StudentInfo) => void;
  showValidationErrors: boolean;
  disabled?: boolean;
  nameInputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Borang Maklumat Murid: Diisi sebelum memulakan rakaman deklamasi sajak.
 */
export const StudentInfoForm: React.FC<StudentInfoFormProps> = ({
  studentInfo,
  onChange,
  showValidationErrors,
  disabled = false,
  nameInputRef,
}) => {
  const missingName = showValidationErrors && !studentInfo.namaMurid.trim();
  const missingClass = showValidationErrors && !studentInfo.kelas.trim();
  const missingTitle = showValidationErrors && !studentInfo.tajukSajak.trim();

  const handleFieldChange = (field: keyof StudentInfo, value: string) => {
    onChange({
      ...studentInfo,
      [field]: value,
    });
  };

  const handleUseOfficialTitle = () => {
    if (!IS_DEFAULT_POEM_TEMPLATE && POEM_TITLE.trim()) {
      handleFieldChange('tajukSajak', POEM_TITLE);
    }
  };

  return (
    <div className="rounded-2xl border border-[#C89B3C]/35 bg-[#FFFDF8] p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#C89B3C]/20">
        <div className="flex items-center gap-2.5">
          <UserCheck className="h-5 w-5 text-[#A57C24] shrink-0" aria-hidden="true" />
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#0E1D3B]">
            Maklumat Murid
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#0E1D3B]/70">
          Sila lengkapkan butiran berikut sebelum merakam video.
        </p>
      </div>

      {showValidationErrors && (missingName || missingClass || missingTitle) && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Sila isi <strong>Nama Murid</strong>, <strong>Kelas</strong> dan{' '}
            <strong>Tajuk Sajak</strong> terlebih dahulu sebelum menekan butang MULA RAKAMAN.
          </span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Nama Murid */}
        <div>
          <label
            htmlFor="input-nama-murid"
            className="block text-sm font-semibold text-[#0E1D3B] mb-1.5"
          >
            Nama Murid <span className="text-red-700">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="input-nama-murid"
            type="text"
            value={studentInfo.namaMurid}
            disabled={disabled}
            onChange={(e) => handleFieldChange('namaMurid', e.target.value)}
            placeholder="Contoh: Aisyah binti Ahmad"
            autoComplete="name"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0E1D3B] placeholder:text-[#0E1D3B]/40 transition-colors min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C89B3C] disabled:bg-[#F1E9D8]/60 disabled:cursor-not-allowed ${
              missingName ? 'border-red-500 ring-1 ring-red-400' : 'border-[#0E1D3B]/20'
            }`}
          />
          {missingName && (
            <p className="mt-1 text-xs font-medium text-red-700">Sila masukkan nama murid.</p>
          )}
        </div>

        {/* Kelas */}
        <div>
          <label
            htmlFor="input-kelas"
            className="block text-sm font-semibold text-[#0E1D3B] mb-1.5"
          >
            Kelas <span className="text-red-700">*</span>
          </label>
          <input
            id="input-kelas"
            type="text"
            value={studentInfo.kelas}
            disabled={disabled}
            onChange={(e) => handleFieldChange('kelas', e.target.value)}
            placeholder="Contoh: 5 Bestari"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0E1D3B] placeholder:text-[#0E1D3B]/40 transition-colors min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C89B3C] disabled:bg-[#F1E9D8]/60 disabled:cursor-not-allowed ${
              missingClass ? 'border-red-500 ring-1 ring-red-400' : 'border-[#0E1D3B]/20'
            }`}
          />
          {missingClass && (
            <p className="mt-1 text-xs font-medium text-red-700">Sila masukkan nama kelas.</p>
          )}
        </div>

        {/* Tajuk Sajak */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="input-tajuk-sajak"
              className="block text-sm font-semibold text-[#0E1D3B]"
            >
              Tajuk Sajak <span className="text-red-700">*</span>
            </label>
            {!IS_DEFAULT_POEM_TEMPLATE && studentInfo.tajukSajak !== POEM_TITLE && !disabled && (
              <button
                type="button"
                onClick={handleUseOfficialTitle}
                className="text-xs font-medium text-[#A57C24] hover:text-[#7D5B14] underline cursor-pointer whitespace-nowrap"
              >
                Guna tajuk skrip
              </button>
            )}
          </div>
          <input
            id="input-tajuk-sajak"
            type="text"
            value={studentInfo.tajukSajak}
            disabled={disabled}
            onChange={(e) => handleFieldChange('tajukSajak', e.target.value)}
            placeholder="Contoh: Gurindam Ilmu / Sajak Pilihan"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-[#0E1D3B] placeholder:text-[#0E1D3B]/40 transition-colors min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C89B3C] disabled:bg-[#F1E9D8]/60 disabled:cursor-not-allowed ${
              missingTitle ? 'border-red-500 ring-1 ring-red-400' : 'border-[#0E1D3B]/20'
            }`}
          />
          {missingTitle && (
            <p className="mt-1 text-xs font-medium text-red-700">Sila masukkan tajuk sajak.</p>
          )}
        </div>
      </div>
    </div>
  );
};
