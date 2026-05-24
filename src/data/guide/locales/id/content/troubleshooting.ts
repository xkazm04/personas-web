export const content: Record<string, string> = {
  "common-error-messages": `
## Pesan Error Umum

Pesan error bisa terlihat menakutkan, tetapi sebagian besar memiliki solusi sederhana. Panduan ini menerjemahkan error yang paling sering menjadi bahasa Indonesia yang sederhana dan memberi tahu Anda apa yang harus dilakukan. Anda tidak perlu memahami detail teknis — cukup cocokkan error dengan perbaikannya.

Sebagian besar error termasuk dalam beberapa kategori: masalah kredensial, masalah timeout, dan ketidakcocokan format input. Setelah Anda mengetahui polanya, troubleshooting menjadi sifat kedua.

### Daftar Periksa Diagnostik Cepat

:::checklist
- Periksa apakah API penyedia AI online dan akun Anda aktif
- Verifikasi kesehatan kredensial di panel Credentials (cari indikator merah/kuning)
- Tinjau batas rate — tunggu sebentar jika Anda telah mengirim terlalu banyak permintaan
- Coba run manual dengan input uji sederhana untuk mengisolasi masalah
- Periksa format input jika data berasal dari trigger atau pipeline
:::

### Error yang Paling Umum

- **"Authentication failed"** — kredensial Anda telah kedaluwarsa atau dimasukkan dengan salah. Buka \`Credentials\` dan segarkan atau masukkan ulang.
- **"Request timed out"** — penyedia AI terlalu lama merespons. Coba jalankan lagi, atau tingkatkan timeout di pengaturan agen.
- **"Rate limit exceeded"** — Anda telah membuat terlalu banyak permintaan terlalu cepat. Tunggu sebentar dan coba lagi, atau tingkatkan paket penyedia Anda.
- **"Invalid input format"** — data yang dikirim ke agen Anda tidak dalam format yang diharapkan. Periksa trigger atau pipeline yang memberi makan data ke agen ini.

### Cara Kerjanya

Ketika error terjadi, ia muncul di log eksekusi dengan kode dan deskripsi. Klik error untuk melihat penjelasan terperinci dan perbaikan yang disarankan. Banyak error termasuk tombol \`Fix Now\` yang membawa Anda langsung ke pengaturan yang membutuhkan perhatian.

:::tip
Jangan panik ketika Anda melihat error. Baca pesan dengan hati-hati — itu hampir selalu memberi tahu Anda apa yang salah dan menunjuk Anda ke solusinya.
:::
  `,

  "agent-not-responding": `
## Agen Tidak Merespons

Jika agen Anda tampak beku, macet, atau tidak menghasilkan hasil, jangan khawatir — itu biasanya perbaikan sederhana. Penyebab paling umum adalah koneksi penyedia AI yang timeout, masalah kredensial, atau agen mencapai batas giliran maksimumnya. Ikuti daftar periksa ini untuk kembali ke jalur.

Sebagian besar masalah agen yang tidak merespons menyelesaikan sendiri ketika Anda mengidentifikasi dan memperbaiki penyebab yang mendasarinya, yang hampir tidak pernah merupakan masalah permanen.

### Daftar Periksa Diagnostik

:::steps
1. **Periksa log eksekusi** — cari pesan error atau peringatan yang menjelaskan stall
2. **Verifikasi penyedia AI Anda** — pastikan API penyedia Anda online dan akun Anda aktif
3. **Periksa kredensial** — pastikan kredensial agen tidak kedaluwarsa
4. **Tinjau batas** — agen mungkin telah mencapai pengaturan timeout atau max turns-nya
5. **Coba run manual** — jalankan agen dengan input uji sederhana untuk mengisolasi masalah
:::

### Cara Kerjanya

Buka agen dan periksa log eksekusi terbarunya. Jika menunjukkan error, ikuti perbaikan untuk error spesifik tersebut. Jika log menunjukkan agen masih berjalan, ia mungkin memproses tugas yang sangat kompleks. Periksa pengaturan timeout — jika terlalu pendek, agen mungkin berhenti sebelum selesai.

:::tip
Jika agen benar-benar macet (tidak ada kemajuan selama beberapa menit), klik \`Stop\` dan kemudian coba run manual dengan input yang lebih sederhana. Ini membantu Anda menentukan apakah masalahnya ada pada input atau agen itu sendiri.
:::
  `,

  "credential-errors": `
## Error Kredensial

Ketika agen tidak dapat terhubung ke layanan, biasanya karena kredensial telah kedaluwarsa, password diubah, atau izin dicabut. Ini adalah masalah paling umum di sistem otomatisasi mana pun, dan hampir selalu cepat diperbaiki.

Kuncinya adalah mengidentifikasi kredensial mana yang menyebabkan masalah, kemudian menyegarkan atau menggantinya.

### Penyebab Umum

- **Token kedaluwarsa** — token OAuth kedaluwarsa secara berkala dan perlu disegarkan
- **Password berubah** — jika Anda mengubah password di tempat lain, perbarui di Personas juga
- **Izin dicabut** — layanan mungkin telah mencabut akses yang awalnya Anda berikan
- **Kredensial salah ditetapkan** — agen mungkin menggunakan kredensial yang salah untuk layanan

### Cara Kerjanya

Periksa pesan error dalam log eksekusi — itu akan menyebutkan layanan mana yang gagal. Buka \`Credentials\` dan temukan kredensial untuk layanan tersebut. Periksa status kesehatannya. Jika merah atau kuning, klik untuk melihat apa yang salah dan ikuti perbaikan yang disarankan — biasanya menyegarkan token atau memasukkan ulang password.

:::tip
Atur pemeriksaan kesehatan kredensial untuk berjalan secara otomatis. Mereka akan menangkap kredensial yang akan kedaluwarsa sebelum menyebabkan kegagalan agen, mengubah krisis potensial menjadi tugas pemeliharaan rutin.
:::
  `,

  "trigger-not-firing": `
## Trigger Tidak Menyala

Trigger yang tidak menyala memang menjengkelkan, tetapi penyebabnya biasanya sesuatu yang kecil — typo konfigurasi, masalah waktu, atau izin yang hilang. Panduan ini memandu Anda melalui pelaku paling umum sehingga Anda dapat menjalankan otomatisasi Anda lagi.

Log trigger adalah teman terbaik Anda di sini. Ia mencatat setiap upaya aktivasi, termasuk yang difilter atau gagal secara diam-diam.

### Langkah Diagnostik

:::steps
1. **Periksa log trigger** — buka pengaturan trigger agen dan klik tab \`Log\` untuk melihat setiap upaya, termasuk kegagalan
2. **Verifikasi trigger diaktifkan** — cari tombol toggle; trigger yang dinonaktifkan tidak menyala
3. **Periksa filter** — tinjau kondisi filter Anda, yang mungkin terlalu ketat dan memblokir semua event
4. **Uji secara manual** — gunakan penguji trigger untuk mensimulasikan event dan memverifikasi konfigurasi
5. **Periksa izin** — konfirmasikan bahwa file watcher memiliki akses folder dan webhook memiliki akses jaringan
:::

### Cara Kerjanya

Buka pengaturan trigger agen dan klik tab \`Log\`. Setiap upaya trigger terdaftar dengan status: fired, filtered, atau failed. Klik entri apa pun untuk melihat mengapa tidak menyala. Temuan paling umum adalah filter yang sedikit terlalu ketat — menyesuaikannya biasanya menyelesaikan masalah segera.

:::tip
Saat menyiapkan trigger baru, mulai tanpa filter apa pun. Setelah Anda mengonfirmasi itu menyala dengan benar, tambahkan filter satu per satu. Dengan cara ini Anda tahu setiap filter berfungsi seperti yang diharapkan.
:::
  `,

  "self-healing-explained": `
## Self-Healing Dijelaskan

Ketika sesuatu terjadi salah selama run agen, sistem self-healing mencoba memperbaiki masalah dan mencoba ulang secara otomatis. Ini seperti memiliki jaring pengaman yang menangkap sebagian besar error sebelum Anda menyadarinya. Masalah umum seperti gangguan jaringan sementara, gangguan API singkat, atau batas rate ditangani tanpa intervensi Anda.

Self-healing tidak berarti agen Anda tidak pernah gagal — itu berarti ia pulih dari jenis masalah kecil dan sementara yang sebaliknya akan memerlukan Anda untuk me-restart secara manual.

### Poin Kunci

- **Retry otomatis** — error transien dicoba ulang dengan waktu backoff yang cerdas
- **Klasifikasi error** — sistem membedakan antara error yang dapat diperbaiki dan tidak dapat diperbaiki
- **Refresh kredensial** — token yang kedaluwarsa disegarkan secara otomatis jika memungkinkan
- **Transparan** — setiap tindakan self-healing dicatat sehingga Anda dapat melihat apa yang terjadi

### Cara Kerjanya

Ketika error terjadi, sistem self-healing mengevaluasinya. Error transien (timeout jaringan, batas rate, gangguan sementara) memicu retry otomatis setelah menunggu singkat. Kedaluwarsa kredensial memicu upaya refresh otomatis. Error permanen (konfigurasi tidak valid, izin yang hilang) dilaporkan kepada Anda segera karena memerlukan perhatian Anda.

:::success
Ketika self-healing berhasil, agen melanjutkan seolah-olah tidak ada yang terjadi. Log eksekusi menandai error yang dipulihkan dengan badge "healed" hijau sehingga Anda dapat melihat apa yang tertangkap dan diselesaikan secara otomatis.
:::

:::tip
Periksa log self-healing sesekali untuk melihat apa yang sedang ditangkap. Jika error yang sama terus disembuhkan, itu mungkin menunjukkan masalah mendasar yang layak diperbaiki secara permanen.
:::
  `,

  "checking-system-health": `
## Memeriksa Kesehatan Sistem

Pemeriksaan kesehatan bawaan memindai seluruh instalasi Personas Anda dan melaporkan setiap masalah — komponen yang kedaluwarsa, file yang hilang, masalah konfigurasi, atau masalah konektivitas. Jalankan kapan saja sesuatu terasa salah untuk penilaian cepat status sistem Anda secara keseluruhan.

Pikirkan itu sebagai kunjungan ke dokter untuk setup Personas Anda. Pemeriksaan cepat dapat menangkap masalah kecil sebelum menjadi masalah besar.

### Apa yang Diperiksa

- **Versi aplikasi** — apakah Anda menjalankan versi terbaru
- **Integritas database** — file data lokal Anda utuh dan sehat
- **Status kredensial** — semua kredensial yang disimpan valid dan berfungsi
- **Konektivitas penyedia** — penyedia AI Anda dapat dijangkau dan merespons
- **Koneksi cloud** — koneksi orkestrator Anda aktif (jika dikonfigurasi)

### Cara Kerjanya

Buka \`Settings > System Health\` dan klik \`Run Health Check\`. Pemindaian membutuhkan beberapa detik dan menghasilkan laporan. Item hijau sehat, item kuning perlu perhatian segera, dan item merah perlu perbaikan segera. Setiap item mencakup deskripsi masalah dan perbaikan yang disarankan.

:::tip
Jalankan pemeriksaan kesehatan setelah memasang pembaruan, setelah masalah konektivitas, atau sebelum men-deploy agen kritis. Hanya membutuhkan beberapa detik dan memberi Anda ketenangan pikiran.
:::
  `,

  "log-files-and-debugging": `
## File Log dan Debugging

File log seperti perekam penerbangan untuk instalasi Personas Anda. Mereka menangkap semua yang terjadi — run agen, event sistem, error, dan lainnya — dalam urutan kronologis yang terperinci. Ketika sesuatu salah dan log eksekusi tidak cukup, file-file ini berisi cerita lengkap.

Anda tidak perlu membaca log secara teratur, tetapi mengetahui di mana mereka berada dan cara menggunakannya sangat berharga ketika memecahkan masalah yang rumit.

### Poin Kunci

- **Logging otomatis** — semuanya dicatat tanpa Anda menyalakan apa pun
- **Diorganisasi berdasarkan tanggal** — event setiap hari ada di file terpisah untuk penjelajahan mudah
- **Dapat dicari** — temukan event tertentu berdasarkan kata kunci, tanggal, atau tingkat severity
- **Dapat dibagikan** — jika Anda menghubungi dukungan, Anda dapat membagikan kutipan log yang relevan

### Cara Kerjanya

File log disimpan secara lokal di komputer Anda. Akses mereka dari \`Settings > Logs\` atau navigasi langsung ke folder log. Setiap file mencakup satu hari dan berisi entri ber-timestamp. Gunakan log viewer bawaan untuk mencari, menyaring, dan menjelajahi. Untuk permintaan dukungan, tombol \`Export Log\` membuat kutipan yang dapat dibagikan.

:::tip
Saat menghubungi dukungan tentang masalah, sertakan kutipan log yang relevan. Itu secara dramatis mempercepat proses troubleshooting karena tim dukungan dapat melihat persis apa yang terjadi.
:::
  `,

  "resetting-to-defaults": `
## Reset ke Default

Jika Anda telah mengubah pengaturan dan tidak dapat menemukan apa yang menyebabkan masalah, mereset ke default memberi Anda titik awal yang bersih. Ini hanya mereset preferensi dan pengaturan konfigurasi Anda — agen, kredensial, memori, dan data Anda semua dipertahankan. Tidak ada yang penting yang hilang.

Pikirkan itu sebagai mengembalikan ruangan ke tata letak aslinya. Semua barang Anda (agen dan data) tetap, tetapi furnitur (pengaturan) kembali ke tempat asalnya.

:::warning
Mereset menghapus semua preferensi yang dikustomisasi dalam satu tindakan. Ini termasuk tema Anda, model default, pengaturan notifikasi, dan pintasan keyboard. Agen, kredensial, memori, dan data Anda tidak terpengaruh — tetapi preferensi yang disetel dengan hati-hati perlu dikonfigurasi ulang secara manual setelahnya.
:::

### Apa yang Direset

- **Preferensi tampilan** — tema, layout, lebar sidebar, dan pengaturan visual
- **Model default** — kembali ke default yang direkomendasikan
- **Pengaturan notifikasi** — direset ke perilaku notifikasi standar
- **Pintasan keyboard** — dipulihkan ke kombinasi tombol asli

### Apa yang Tetap Aman

- Semua **agen** Anda dan prompt, riwayat, dan konfigurasi mereka
- Semua **kredensial** Anda di vault
- Semua **memori**, hasil uji, dan log eksekusi Anda
- Semua **pipeline** dan konfigurasi tim Anda

### Cara Kerjanya

Buka \`Settings > Advanced > Reset to Defaults\`. Tinjau apa yang akan direset, kemudian klik \`Confirm\`. Pengaturan Anda kembali ke nilai pabrik sementara semua pekerjaan Anda dipertahankan. Anda kemudian dapat mengonfigurasi ulang pengaturan satu per satu untuk mengidentifikasi perubahan mana yang menyebabkan masalah.

:::tip
Sebelum mereset, buat catatan tentang pengaturan yang telah Anda kustomisasi secara sengaja. Dengan cara ini Anda dapat dengan cepat memulihkan yang Anda inginkan setelah reset memperbaiki masalah Anda.
:::
  `,
};
