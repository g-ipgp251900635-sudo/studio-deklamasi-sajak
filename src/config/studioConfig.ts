/**
 * ============================================================================
 * KONFIGURASI UTAMA — STUDIO DEKLAMASI SAJAK
 * ============================================================================
 * Guru boleh mengubah maklumat sajak dan pautan Google Apps Script di bawah.
 * Jangan ubah nama pemalar (POEM_TITLE, POEM_TEXT, POEM_AUTHOR, GOOGLE_APPS_SCRIPT_URL).
 */

/**
 * 1. TETAPAN SAJAK RASMI
 * Gantikan nilai di bawah dengan teks sajak sebenar pilihan guru.
 * Jangan ubah susunan baris atau rangkap — gunakan baris baharu (\n)
 * untuk memisahkan baris dan dua baris baharu (\n\n) untuk memisahkan rangkap.
 */
export const POEM_TITLE = 'Di Sini Lahirnya Sebuah Cinta';

export const POEM_AUTHOR = 'Nukilan Hjh. Zuliza Ogos, 2014.';

export const POEM_TEXT = `Di sini kami dilahirkan
Di sini kami dibesarkan
Di sini taat setia dicurahkan
Dan di sini lahirnya sebuah cinta.

Di sini terciptanya sejarah
Warisan nenek moyang bangsa
Kaya dengan budaya
Kaya dengan adat dan suku

Air setitik menjadi tasik
Tanah segempal menjadi gunung
Rakyat didik hidup muafakat
Dan di sini globalisasi sempadan dunia
Mengharum wangi di antarabangsa

Di sini lahirnya cinta
Dijaga rapi merdeka ini
Di sini merdeka sudah dianugerahi
Semat dijiwa disimpan dihati
Merdeka ini anugerah ilahi
Dan Malaysia tanah air kami.`;

/**
 * Penanda untuk mengenal pasti sama ada teks templat lalai masih digunakan.
 */
export const IS_DEFAULT_POEM_TEMPLATE = POEM_TITLE.startsWith('[Masukkan Tajuk Sajak');

/**
 * 2. TETAPAN PENGHANTARAN GOOGLE DRIVE (GOOGLE APPS SCRIPT WEB APP)
 *
 * PENTING: Pautan folder Google Drive semata-mata TIDAK boleh menerima muat naik
 * terus daripada pelayar web tanpa pelayan/perantara. Oleh itu, laman ini menghantar
 * rakaman video murid ke Google Apps Script Web App milik guru yang menyimpan fail
 * terus ke folder Google Drive berikut:
 *
 * Folder Sasaran:
 * https://drive.google.com/drive/folders/14-gkA3z-4Y-tttfXW9wxQRom-8AsWkRG?usp=sharing
 */
export const GOOGLE_DRIVE_FOLDER_ID = '14-gkA3z-4Y-tttfXW9wxQRom-8AsWkRG';

export const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/14-gkA3z-4Y-tttfXW9wxQRom-8AsWkRG?usp=sharing';

/**
 * TAMPAL PAUTAN WEB APP GOOGLE APPS SCRIPT ANDA DI BAWAH:
 * Contoh format: "https://script.google.com/macros/s/AKfycbx.../exec"
 *
 * Langkah ringkas:
 * 1. Buka https://script.google.com dan cipta projek baharu.
 * 2. Salin kod daripada fail google-apps-script/Code.gs (atau bahagian Panduan Guru di laman ini).
 * 3. Klik Deploy > New deployment > Web app.
 * 4. Pilih Execute as: "Me" dan Who has access: "Anyone".
 * 5. Salin Web App URL (/exec) dan tampal di dalam tanda petik di bawah.
 */
export const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxYv-DY3pjx1J-Px-6NyVEnccWJxn2Ovw4kOtUxT3hCD8x9OeNCbmJeKntuddvWsdXr/exec';
