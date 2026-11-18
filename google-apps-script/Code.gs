/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — PENERIMA RAKAMAN STUDIO DEKLAMASI SAJAK
 * ============================================================================
 * Cara Penggunaan:
 * 1. Buka https://script.google.com dan klik "New project".
 * 2. Padam semua kod sedia ada dan tampal keseluruhan skrip ini.
 * 3. Simpan projek (Ctrl+S).
 * 4. Klik "Deploy" > "New deployment".
 * 5. Pada ikon gear "Select type", pilih "Web app".
 * 6. Tetapkan:
 *    - Description: Studio Deklamasi Sajak Uploader
 *    - Execute as: Me (akaun Google pemilik folder Drive)
 *    - Who has access: Anyone
 * 7. Klik "Deploy", beri kebenaran akses Google Drive apabila diminta.
 * 8. Salin "Web app URL" (berakhir dengan /exec) dan tampal ke dalam
 *    pemalar GOOGLE_APPS_SCRIPT_URL di fail src/config/studioConfig.ts.
 */

var FOLDER_ID = '14-gkA3z-4Y-tttfXW9wxQRom-8AsWkRG';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'Tiada data rakaman diterima oleh pelayan.'
      });
    }

    var payload = JSON.parse(e.postData.contents);
    var videoBase64 = payload.video || payload.videoBase64;
    var mimeType = payload.mimeType || 'video/webm';
    var studentName = (payload.studentName || 'Murid').toString().trim();
    var studentClass = (payload.studentClass || 'Kelas').toString().trim();
    var poemTitle = (payload.poemTitle || 'Sajak').toString().trim();
    var fileName = (payload.fileName || '').toString().trim();

    if (!videoBase64) {
      return createJsonResponse({
        success: false,
        error: 'Kandungan video kosong.'
      });
    }

    // Bersihkan nama fail supaya kemas di Google Drive
    if (!fileName) {
      var timestamp = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyyMMdd_HHmmss');
      var ext = mimeType.indexOf('mp4') !== -1 ? 'mp4' : 'webm';
      fileName = sanitizeFilePart(studentName) + '_' +
                 sanitizeFilePart(studentClass) + '_' +
                 sanitizeFilePart(poemTitle) + '_' +
                 timestamp + '.' + ext;
    }

    var decodedBytes = Utilities.base64Decode(videoBase64);
    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);

    // Simpan maklumat murid dan tajuk sajak dalam penerangan (description) fail Drive
    file.setDescription(
      'Nama Murid: ' + studentName + '\n' +
      'Kelas: ' + studentClass + '\n' +
      'Tajuk Sajak: ' + poemTitle + '\n' +
      'Dihantar melalui: Studio Deklamasi Sajak'
    );

    return createJsonResponse({
      success: true,
      message: 'Rakaman berjaya disimpan ke Google Drive.',
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl()
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err && err.message ? err.message : 'Ralat tidak diketahui semasa menyimpan fail.'
    });
  }
}

function doGet() {
  return createJsonResponse({
    success: true,
    message: 'Titik akhir Web App Studio Deklamasi Sajak sedia menerima rakaman (POST).'
  });
}

function sanitizeFilePart(text) {
  return text
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40) || 'Rekod';
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
