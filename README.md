# Studio Deklamasi Sajak

Laman web pendidikan interaktif bertema tradisional Melayu untuk murid sekolah rendah berlatih dan merakam deklamasi sajak Bahasa Melayu.

---

## 1. Cara Memasukkan Sajak Sebenar

Buka fail `src/config/studioConfig.ts` dan sunting tiga pemalar berikut tanpa mengubah struktur kod lain:

- `POEM_TITLE` — Tajuk rasmi sajak
- `POEM_AUTHOR` — Nama penyajak / sumber
- `POEM_TEXT` — Teks penuh sajak (gunakan baris baharu untuk setiap baris dan satu baris kosong untuk memisahkan rangkap)

---

## 2. Tetapan Penghantaran ke Google Drive (Google Apps Script)

Folder Google Drive sasaran yang ditetapkan:
- **Pautan Folder**: `https://drive.google.com/drive/folders/14-gkA3z-4Y-tttfXW9wxQRom-8AsWkRG?usp=sharing`
- **ID Folder**: `14-gkA3z-4Y-tttfXW9wxQRom-8AsWkRG`

Oleh kerana laman web statik (seperti GitHub Pages) tidak boleh memuat naik fail terus ke Google Drive hanya menggunakan pautan folder, sediakan satu **Google Apps Script Web App** percuma:

1. Layari [script.google.com](https://script.google.com) menggunakan akaun Google yang memiliki/boleh menulis ke folder Drive di atas.
2. Klik **New project**, padam kod asal, dan tampal kod penuh daripada fail `google-apps-script/Code.gs`.
3. Simpan projek (`Ctrl + S`).
4. Klik **Deploy** > **New deployment**.
5. Pilih jenis **Web app**.
6. Tetapkan:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
7. Klik **Deploy** dan benarkan akses Google Drive apabila diminta.
8. Salin **Web app URL** (yang berakhir dengan `/exec`).
9. Tampal URL tersebut ke dalam pemalar `GOOGLE_APPS_SCRIPT_URL` di fail `src/config/studioConfig.ts`.

---

## 3. Penerbitan di GitHub Pages

Projek ini telah dikonfigurasikan dengan `base: './'` dalam `vite.config.ts` supaya berjalan lancar pada mana-mana repositori GitHub Pages:

1. Jalankan pemasangan dan bina fail produksi:
   ```bash
   npm install
   npm run build
   ```
2. Muat naik kandungan folder `dist/` ke cawangan `gh-pages` (atau gunakan GitHub Actions untuk membina Vite dan menerbitkan folder `dist/` secara automatik ke GitHub Pages).
3. Pastikan laman diakses melalui **HTTPS** (`https://<nama-pengguna>.github.io/<nama-repo>/`) kerana pelayar web moden hanya membenarkan akses kamera dan mikrofon melalui sambungan HTTPS.

---

## 4. Membenamkan (Embed) ke dalam Google Sites

1. Buka editor **Google Sites** anda.
2. Pilih **Insert** > **Embed** > **By URL**.
3. Tampal pautan GitHub Pages HTTPS anda dan pilih **Whole page**.
4. Laraskan saiz bingkai supaya selesa dilihat pada paparan komputer dan mudah alih.

**Nota Penting Kebenaran Kamera dalam Google Sites:**
Sesetengah pelayar web (seperti Safari atau Chrome versi terhad dalam persekitaran sekolah) atau dasar keselamatan iframe Google Sites mungkin menyekat akses kamera dan mikrofon apabila dibuka secara terbenam (*embedded*). Laman web ini mengesan situasi tersebut dan akan memaparkan butang **Buka di Tab Baharu** kepada murid supaya mereka dapat memberikan kebenaran kamera/mikrofon dengan lancar.
