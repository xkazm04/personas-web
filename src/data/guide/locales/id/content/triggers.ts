export const content: Record<string, string> = {
  "how-triggers-work": `
## Cara Kerja Trigger

Trigger adalah "kapan" dari agen Anda. Prompt dan alat mendefinisikan *apa* yang dilakukan agen; trigger mendefinisikan *kapan* dan *dengan input apa*. Personas hadir dengan tujuh jenis trigger: **Manual** (klik tombol), **Schedule** (gaya cron), **Webhook** (HTTP masuk), **Clipboard** (kecocokan event salin), **File Watcher** (event filesystem), **Chain** (output dari agen lain), dan **Event-Based** (event internal yang dipancarkan oleh agen lain, plugin, atau engine itu sendiri).

Setiap agen dapat memiliki sejumlah trigger, dicampur di seluruh jenis. Satu agen tunggal dapat berjalan pada jadwal harian, bereaksi terhadap webhook dari Stripe, menyala ketika Anda menyalin alamat email, dan dapat dirantai dari agen hulu — semua sekaligus.

### Jenis Trigger

:::compare
**Manual**
Klik tombol di editor atau dari quick-run title-bar. Setiap agen mendapat ini secara default. Terbaik untuk pengujian dan pemanggilan ad-hoc.
---
**Schedule**
Berbasis cron. Per jam, harian, mingguan, atau ekspresi cron lengkap dengan timezone. Terbaik untuk pekerjaan rutin yang berjalan tanpa input — ringkasan harian, laporan mingguan.
---
**Webhook**
URL masuk unik yang didengarkan agen. Layanan eksternal POST ke sana untuk memulai agen. Terbaik untuk "bereaksi terhadap event dari layanan pihak ketiga".
---
**Clipboard**
Menyala ketika teks yang disalin cocok dengan pola yang dikonfigurasi (regex, jenis konten, atau kata kunci). Terbaik untuk pintasan power-user — salin email, agen mencarinya.
---
**File Watcher**
Event filesystem pada folder yang dipantau (create / modify / delete). Terbaik untuk alur kerja drop-zone di mana file tiba pada waktu yang tidak dapat diprediksi.
---
**Chain**
Output dari agen A menjadi input dari agen B. Terbaik untuk pipeline multi-langkah yang terdiri dari agen-agen yang fokus.
---
**Event-Based**
Berlangganan event Personas internal (kredensial kedaluwarsa, plugin memancarkan event, eksekusi selesai dengan manual_review). Terbaik untuk otomatisasi reaktif dalam pengaturan Anda sendiri.
:::

### Poin Kunci

- **Beberapa trigger per agen** — tidak ada batas atas; gabungkan jenis dengan bebas
- **Penyalaan independen** — setiap trigger dievaluasi sendiri; schedule trigger tidak tahu atau peduli tentang webhook trigger pada agen yang sama
- **Filter per-trigger** — setiap trigger dapat memiliki kondisi filter sendiri (misalnya webhook trigger hanya menyala pada \`event_type=charge.succeeded\`)
- **Lineage trigger** — kanvas Lineage (Events → Live Stream → Lineage) menunjukkan trigger mana, agen mana, dan event mana yang terhubung, end-to-end di seluruh pengaturan Anda
- **Jeda secara individual** — nonaktifkan satu trigger tanpa menyentuh sisa agen

### Cara Kerjanya

Trigger dikonfigurasi di tab Settings agen atau dengan menambahkannya dari daftar trigger di halaman Events. Execution engine mengevaluasi kondisi trigger secara independen dan mengirimkan run ke agen setiap kali ada trigger yang cocok. Run membawa payload trigger (body webhook, path file, teks yang disalin, output hulu, data event) ke agen sebagai input.

:::tip
Mulailah setiap agen dengan hanya Manual trigger. Setelah Anda mempercayai perilakunya, tambahkan trigger otomatis satu per satu sehingga Anda dapat mengisolasi mana yang memperkenalkan masalah jika terjadi kesalahan.
:::
  `,

  "manual-triggers": `
## Manual Trigger

Manual trigger adalah default untuk setiap agen. Klik \`Run\` di editor dan agen segera dimulai, atau gunakan pintasan quick-run title-bar (\`Ctrl+Enter\` pada agen yang difokuskan). Run manual adalah cara Anda mengembangkan dan menguji — mereka adalah setara dengan menjalankan skrip secara langsung untuk melihat apa yang dilakukannya sebelum menambahkan entri cron.

Anda dapat memberikan input kustom setiap saat. Editor agen menampilkan kotak input kecil di sebelah tombol Run ketika agen menyatakan menerima input; apa pun yang Anda ketik diteruskan sebagai payload trigger.

### Poin Kunci

- **Tanpa konfigurasi** — manual trigger selalu tersedia
- **Input opsional** — ketik input secara langsung, tempel JSON terstruktur, atau jalankan tanpa input untuk agen yang tidak membutuhkannya
- **Diagnostic runs** — run manual ditandai \`manual\` dalam trace sehingga Anda dapat menyaringnya dari laporan biaya / metrik jika Anda ingin melihat hanya aktivitas otomatis
- **Sadar konkurensi** — run manual menghormati batas konkurensi agen; jika batas tercapai, klik ditolak dengan pesan yang jelas

### Cara Kerjanya

Manual trigger ada secara implisit pada setiap agen — tidak ada toggle untuk mematikannya (gunakan \`Disable\` pada seluruh agen jika Anda ingin menguncinya). Engine memperlakukan run manual identik dengan yang otomatis: jalur eksekusi yang sama, penangkapan trace yang sama, akuntansi biaya yang sama. Satu-satunya perbedaan adalah tag trigger.

:::tip
Gunakan run manual selama iterasi prompt. Simpan prompt, jalankan, lihat trace, edit. Arena Lab adalah untuk perbandingan sistematis; manual adalah untuk umpan balik cepat di editor.
:::
  `,

  "schedule-triggers": `
## Schedule Trigger

Schedule trigger menjalankan agen pada irama berulang — setiap jam, setiap hari kerja pukul 8 pagi, Senin pertama setiap bulan, atau ekspresi cron apa pun yang dapat Anda tulis. UI jadwal memberi Anda pintasan preset (per jam, harian, mingguan) untuk kasus umum, dan field cron mentah untuk yang lainnya.

Jadwal menghormati timezone yang dapat dikonfigurasi. Secara default agen menggunakan timezone sistem Anda, tetapi Anda dapat menimpa per-trigger — berguna untuk agen yang harus berjalan "pukul 9 pagi Eastern" terlepas dari di mana Anda berada.

### Poin Kunci

- **Preset dan cron** — pilih dari irama umum atau tulis ekspresi cron lengkap
- **Timezone per trigger** — nama timezone IANA (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`); DST ditangani secara otomatis
- **Pratinjau run berikutnya** — trigger menunjukkan tiga waktu terjadwal berikutnya sehingga Anda dapat memverifikasi kewarasan ekspresi cron Anda
- **Jeda tanpa kehilangan** — menonaktifkan schedule trigger tidak menghapusnya; aktifkan ulang untuk melanjutkan

### Menyiapkan Jadwal

:::steps
1. **Buka pengaturan trigger** — di tab Settings agen, atau dari halaman Events; klik \`Add trigger\` dan pilih Schedule
2. **Pilih preset atau tulis cron** — \`0 8 * * 1-5\` untuk "8 pagi hari kerja", atau gunakan preset untuk kasus umum
3. **Atur timezone** — default ke sistem; ubah untuk agen yang terikat ke kalender bisnis tertentu
4. **Konfirmasi pratinjau run-berikutnya** — tiga waktu run mendatang ditampilkan; verifikasi mereka cocok dengan yang Anda harapkan
5. **Simpan** — trigger diaktifkan segera dan muncul di daftar trigger agen dengan hitungan mundur "next run"
:::

:::tip
Schedule trigger tidak mengisi kembali run yang terlewat. Jika aplikasi ditutup atau mesin sedang tidur ketika waktu terjadwal lewat, run itu dilewati. Untuk pekerjaan terjadwal yang sangat penting, jalankan cloud deploy (tier Builder) sehingga orkestrator menangani penjadwalan di sisi server.
:::
  `,

  "webhook-triggers": `
## Webhook Trigger

Webhook trigger mengekspos URL masuk unik yang didengarkan agen. Ketika layanan eksternal POST ke URL tersebut, body menjadi payload trigger dan agen berjalan. Sebagian besar layanan pihak ketiga yang mendukung webhook (Stripe, GitHub, Shopify, Linear, Twilio, API internal kustom) berfungsi tanpa modifikasi.

Trigger mendukung filter pada body permintaan, header, dan metode sehingga satu endpoint dapat selektif tentang event mana yang sebenarnya memulai agen. Pola umum: satu URL webhook per agen, difilter ke jenis event tertentu dari layanan hulu.

### Poin Kunci

- **URL unik per trigger** — dihasilkan secara otomatis; tidak pernah dibagikan antar agen atau trigger
- **Ekspresi filter** — kecocokan JSONPath / header memungkinkan Anda menerima hanya event yang Anda pedulikan
- **Endpoint replay** — setiap webhook yang diterima dipertahankan dan dapat diputar ulang secara manual dari halaman detail trigger
- **Send Test** — tombol bawaan yang melakukan POST sample payload ke endpoint lokal Anda sehingga Anda dapat memvalidasi filter dan respons agen tanpa layanan eksternal
- **Inbound dan outbound terpisah** — lihat di bawah

### Menghubungkan Webhook

:::steps
1. **Tambahkan webhook trigger** — halaman Events → Add trigger → Webhook; ikat ke agen
2. **Salin URL yang dihasilkan** — unik untuk trigger ini; tidak pernah kedaluwarsa kecuali Anda menghapus trigger
3. **Konfigurasi layanan eksternal** — tempel URL ke konfigurasi webhook layanan (Stripe Dashboard, pengaturan repo GitHub, dll.)
4. **Atur ekspresi filter** — batasi ke jenis event tertentu atau bentuk payload sehingga Anda tidak menjalankan agen pada setiap event yang dipancarkan layanan
5. **Uji** — gunakan Send Test dengan sample payload (atau pemicu event nyata di layanan hulu); periksa trace dan sesuaikan filter jika perlu
:::

### Inbound vs Outbound Webhook

Webhook hadir dalam dua rasa dan penting untuk membedakannya:

- **Inbound webhook (topik ini)** — layanan eksternal memanggil *Anda* untuk memulai agen. Stripe ping Anda ketika charge berhasil; GitHub ping Anda ketika PR dibuka.
- **Outbound webhook (fitur terpisah)** — agen *Anda* mengirimkan hasilnya keluar ke saluran setelah selesai. Personas hadir dengan pengiriman outbound kelas-satu ke Slack, Discord, Microsoft Teams, dan URL webhook generik, dikonfigurasi per-agen di tab Connectors. Output agen diformat secara tepat untuk setiap saluran (Slack rich block, Discord embed, Teams card) dan dikirim setelah run selesai.

Sebagian besar otomatisasi akhirnya menggunakan keduanya: webhook inbound memulai agen, agen melakukan pekerjaannya, dan saluran outbound mengirimkan hasil ke mana pun tim Anda mengamati.

:::tip
Untuk dev lokal atau webhook pra-produksi, gunakan tombol \`Send Test\` dengan sample payload daripada mengonfigurasi hulu nyata. Anda akan beriterasi pada filter dan prompt jauh lebih cepat tanpa melakukan round-trip layanan pihak ketiga.
:::
  `,

  "clipboard-monitor": `
## Clipboard Monitor

Clipboard monitor mengawasi clipboard sistem Anda dan menyalakan agen ketika konten yang disalin cocok dengan aturan Anda. Salin nomor pesanan — agen mencarinya. Salin kalimat bahasa asing — agen menerjemahkannya. Salin email pelanggan — agen menarik akun mereka.

Pencocokan dapat pada kata kunci sederhana, pola regex, atau heuristik jenis konten (alamat email, URL, nomor telepon, berbentuk JSON, angka, ID terstruktur). Trigger mengevaluasi aturan pada setiap perubahan clipboard dan hanya menyala ketika ada aturan yang cocok, sehingga ia duduk dengan tenang di latar belakang sampai Anda benar-benar menyalin sesuatu yang menarik.

### Poin Kunci

- **Berbasis aturan** — definisikan satu atau lebih aturan per trigger; kecocokan pertama menang
- **Mode pencocokan** — keyword, regex, atau heuristik jenis-konten bawaan (email/URL/telepon/JSON/dll.)
- **Diam secara default** — salinan yang tidak cocok bahkan tidak memicu log evaluasi; hanya kecocokan yang menciptakan aktivitas
- **Mode output** — tampilkan sebagai notifikasi desktop, dorong ke inbox Cockpit, atau tetap diam dan hanya tulis ke feed activity agen
- **Privasi** — konten clipboard tetap lokal; tidak ada yang diunggah kecuali ke penyedia AI mana pun yang dipanggil agen itu sendiri

### Cara Kerjanya

Trigger mendaftar dengan sistem clipboard OS saat aplikasi dimulai. Ketika clipboard berubah, konten baru dievaluasi terhadap setiap aturan pada trigger ini; kecocokan pertama menyalakan agen dengan konten yang disalin sebagai input. Salinan yang tidak cocok dijatuhkan tanpa meninggalkan jejak, sehingga monitor tidak membengkakkan log aktivitas.

:::tip
Bersikaplah spesifik dengan aturan. Clipboard monitor yang mencocokkan setiap simbol \`@\` akan menyala pada salinan yang tidak Anda maksudkan untuk digunakan. Gunakan regex email lengkap, atau cakup ke "salinan yang terlihat seperti ID pelanggan" (mencocokkan bentuk ID Anda sendiri).
:::
  `,

  "file-watcher-triggers": `
## File Watcher Trigger

File Watcher trigger menyala ketika file muncul, berubah, atau hilang dalam folder yang Anda tentukan. Letakkan CSV ke folder dan agen memprosesnya. Simpan gambar ke direktori "Process" dan agen OCR / klasifikasi bertindak atasnya. Modifikasi file konfigurasi dan agen melakukan diff terhadap versi sebelumnya.

Folder yang dipantau dapat berada di filesystem lokal atau lokasi tersinkronisasi apa pun (OneDrive, Dropbox, iCloud). Filter mempersempit event berdasarkan jenis file / pola glob sehingga Anda tidak menjalankan agen pada perubahan yang tidak relevan (seperti file \`.DS_Store\` macOS atau file swap editor sementara).

### Poin Kunci

- **Pantau folder apa pun** — penyimpanan lokal atau cloud yang disinkronkan; rekursi subfolder opsional
- **Jenis event** — create / modify / delete; berlangganan ke satu, dua, atau ketiganya
- **Filter glob** — \`*.csv\`, \`**/invoices/*.pdf\`; mendukung pola negasi
- **Debounce** — modifikasi cepat berturut-turut bergabung menjadi satu event trigger (tidak ada penyalaan ganda untuk alur save-and-immediately-save)
- **Payload** — agen menerima path file dan (ketika file cukup kecil) konten secara inline; jika tidak, path yang dapat dibaca agen dengan alat akses-filenya

### Cara Kerjanya

Trigger menggunakan API file-watch native OS (FSEvents di macOS, ReadDirectoryChangesW di Windows, inotify di Linux). Watcher berjalan di proses engine ketika aplikasi terbuka. Ketika event cocok dengan filter trigger, engine mengirimkan run agen dengan metadata file sebagai input. Engine juga merutekan event file-watcher ke **ambient producer**: agen apa pun yang berlangganan event ambient yang relevan dapat bereaksi tanpa memerlukan watcher-nya sendiri.

:::tip
Buat folder drop-zone khusus untuk setiap agen yang menggunakan file watcher. Mencampur watcher pada folder bersama ("Downloads", "Desktop") menyebabkan penyalaan kejutan saat Anda menyimpan file yang tidak terkait di sana.
:::
  `,

  "chain-triggers": `
## Chain Trigger

Chain trigger menghubungkan agen end-to-end: ketika agen A selesai dengan sukses, agen B dimulai dengan output A sebagai inputnya. Inilah cara otomatisasi multi-langkah dibangun — setiap agen kecil dan fokus, rantai menjahitnya menjadi pipeline.

Rantai dapat bercabang (output satu agen memberi makan beberapa agen hilir) dan menyatu (beberapa agen hulu memberi makan ke satu hilir). Mereka juga dapat bersyarat — trigger dapat memiliki filter yang hanya meneruskan output yang cocok dengan kondisi, sehingga Anda hanya menjalankan agen hilir dalam kasus yang penting.

:::diagram
[Research Agent] --> [Writing Agent] --> [Formatting Agent] --> [Final Output]
:::

### Poin Kunci

- **Wiring output → input** — otomatis; prompt agen hilir melihat output hulu secara verbatim (atau ditransformasi jika Anda mengonfigurasi transformer)
- **Bercabang dan menyatu** — rantai many-to-one dan one-to-many didukung
- **Penerusan bersyarat** — ekspresi filter pada chain trigger memungkinkan Anda meneruskan hanya pada kondisi tertentu (output berisi "error", atau field melebihi ambang batas)
- **Kegagalan menghentikan rantai** — jika agen hulu gagal, agen hilir yang dirantai tidak berjalan; kegagalan muncul di tampilan lineage sehingga Anda dapat melihat persis di mana rantai patah
- **Terlihat end-to-end** — kanvas Events → Live Stream → Lineage menunjukkan grafik lengkap agen yang dirantai dan aliran eksekusi langsung

### Cara Kerjanya

Di tab Settings agen hilir, tambahkan Chain trigger dan pilih agen hulu. Engine berlangganan agen hilir ke event penyelesaian hulu; ketika hulu memancarkan "execution complete with success", engine meneruskan output sebagai input ke hilir. Filter bersyarat dievaluasi di sisi server sebelum run hilir dikirim.

:::tip
Setiap agen dalam rantai harus melakukan satu hal dengan baik. Rantai tiga agen kecil yang fokus jauh lebih mudah di-debug daripada satu agen besar yang melakukan segalanya — Anda dapat melihat di tampilan lineage tahap mana yang gagal, dan Anda dapat menukar agen dengan versi yang lebih baik tanpa menyentuh sisa rantai.
:::
  `,

  "event-based-triggers": `
## Event-Based Trigger

Event-Based trigger berlangganan agen ke event Personas internal. Apa pun di aplikasi yang memancarkan event — agen lain selesai, kredensial kedaluwarsa, plugin menyala (seperti plugin Drive yang memancarkan event \`drive.document.*\` ketika file berubah di Local Drive), atau engine itu sendiri menandai kasus manual-review — dapat menggerakkan agen yang berlangganan.

Ini adalah jenis trigger paling fleksibel. Tidak seperti webhook (yang berasal dari sistem eksternal) atau jadwal (yang menyala sesuai jam), event datang dari dalam pengaturan Personas Anda sendiri. Bangun pengaturan yang digerakkan oleh event di mana satu sinyal dapat menyebar ke beberapa agen tanpa wiring eksplisit.

### Poin Kunci

- **Berlangganan ke event apa pun** — event-penyelesaian agen, event plugin, event engine, event kustom yang dipancarkan oleh agen lain
- **Sadar payload** — setiap event membawa data (output agen, path file, ID kredensial); agen yang berlangganan menerimanya sebagai input
- **One-to-many** — beberapa agen dapat berlangganan ke event yang sama dan semua berjalan secara paralel ketika menyala
- **Ekspresi filter** — batasi berdasarkan field payload (hanya menyala pada event di mana \`severity = critical\`)
- **Dapat ditemukan** — registry event dapat dijelajahi di halaman Events; Anda dapat melihat persis event apa yang tersedia dan field apa yang dibawanya

### Cara Kerjanya

Tambahkan Event trigger ke agen hilir dan pilih event dari registry. Engine berlangganan agen saat boot dan mengirimkan run dengan payload event setiap kali event yang cocok menyala. Event yang dipancarkan plugin terlihat identik dengan yang dipancarkan engine dari perspektif agen — semua mengalir melalui bus yang sama.

:::tip
Event-Based trigger adalah cara Anda membangun hubungan "jika X maka juga Y" tanpa mengubah X. Tambahkan Event trigger pada agen baru, arahkan ke event yang dipancarkan agen lain, dan perilaku baru terjadi secara reaktif — agen yang ada tidak tahu atau peduli.
:::
  `,

  "combining-multiple-triggers": `
## Menggabungkan Beberapa Trigger

Agen dapat memiliki sejumlah trigger dari jenis apa pun. Sebagian besar agen produksi memiliki setidaknya dua: Manual trigger (untuk pengujian dan pemanggilan ad-hoc) plus satu atau lebih trigger otomatis (Schedule, Webhook, Chain, Event). Umum untuk melihat agen dengan kombinasi Schedule + Webhook + Chain — agen yang sama dapat berjalan sebagai bagian dari batch harian, sebagai tanggapan terhadap webhook waktu nyata, dan sebagai langkah dalam pipeline yang dirantai.

Beberapa trigger tidak saling mengganggu. Masing-masing menyala pada jadwal atau event-nya sendiri; jika dua trigger menyala pada saat yang sama, agen berjalan dua kali (jika batas konkurensi memungkinkan). Trace setiap run menangkap trigger mana yang memulainya.

### Poin Kunci

- **Tidak ada batas atas** — agen dapat memiliki puluhan trigger
- **Evaluasi independen** — setiap trigger mengevaluasi dan mengirim secara independen
- **Filter dan konfigurasi per-trigger** — schedule memiliki cron sendiri, webhook URL sendiri, dll.
- **Tag trigger dalam trace** — setiap run ditandai dengan trigger yang memulainya, sehingga Anda dapat menyaring aktivitas berdasarkan sumber trigger
- **Penonaktifan selektif** — nonaktifkan satu trigger tanpa menyentuh sisanya

### Cara Kerjanya

Tab Settings → Triggers pada agen menunjukkan setiap trigger yang terlampir, statusnya (enabled/disabled), dan waktu penyalaan terakhirnya. Tambahkan yang baru dengan \`Add trigger\`; pemilih yang sama memungkinkan Anda membuat salah satu dari tujuh jenis trigger. Trigger yang dinonaktifkan tetap dalam daftar sehingga Anda dapat mengaktifkannya kembali nanti tanpa mengonfigurasi ulang.

:::tip
Pola yang berguna: simpan Manual trigger aktif selamanya (untuk debugging), dan pasangkan setiap trigger otomatis "nyata" dengan saudara Manual trigger yang mengambil bentuk input yang sama. Dengan begitu Anda dapat memutar ulang payload otomatis apa pun secara manual kapan pun Anda ingin menyelidiki.
:::
  `,

  "testing-and-debugging-triggers": `
## Menguji dan Men-debug Trigger

Tab Events → Test adalah penguji trigger. Untuk trigger apa pun, Anda dapat mengirim sample payload (body webhook, event file, string clipboard, data event) dan melihat persis apa yang akan diterima agen dan bagaimana ia akan merespons — tanpa layanan eksternal atau menunggu waktu trigger aktual.

Untuk trigger yang memang menyala dan agen tidak berjalan seperti yang Anda harapkan, log trigger menunjukkan setiap evaluasi: filter yang cocok, yang ditolak, bentuk payload, waktu pengiriman. Kanvas lineage (Events → Live Stream → Lineage) adalah ekuivalen visual — menunjukkan evaluasi trigger langsung dan pengiriman di seluruh pengaturan Anda.

### Poin Kunci

- **Simulasikan trigger apa pun** — tempel payload dan lihat respons agen
- **Log trigger** — setiap upaya penyalaan dicatat, termasuk penolakan filter sehingga Anda dapat melihat apa yang tidak cocok
- **Kanvas lineage** — grafik visual trigger, agen, dan event dengan indikator aliran langsung ketika hal-hal sedang menyala
- **Send Test untuk webhook** — tombol bawaan yang melakukan POST sample body ke endpoint lokal
- **Replay** — penyalaan trigger masa lalu dapat diputar ulang dengan payload asli yang tepat, berguna untuk "apa yang terjadi jika webhook Stripe ini menghantam agen lagi"

### Men-debug Trigger Langkah demi Langkah

:::steps
1. **Konfirmasi trigger diaktifkan** — tab Settings → Triggers pada agen; ikon redup berarti trigger dinonaktifkan
2. **Periksa log trigger** — Events → Test → Logs disaring berdasarkan trigger Anda; cari evaluasi yang tidak dikirim
3. **Periksa filter terhadap payload** — jika trigger dievaluasi tetapi tidak dikirim, ekspresi filter menolaknya; salin payload dan uji filter secara eksplisit
4. **Verifikasi pengiriman mencapai agen** — trace eksekusi harus menunjukkan tag trigger; jika tidak ada eksekusi yang muncul, trigger tidak pernah dikirim (masalah filter, batas konkurensi, atau agen dinonaktifkan)
5. **Gunakan kanvas lineage** — untuk Chain atau Event trigger, buka Lineage dan telusuri jalur; Anda akan melihat di mana aliran terganggu
:::

:::tip
"Trigger saya tidak menyala" hampir selalu berarti salah satu dari: trigger dinonaktifkan, filter terlalu ketat, agen dinonaktifkan, atau layanan eksternal tidak benar-benar mengirim apa yang Anda pikir mereka kirim. Log trigger membedakan keempatnya dalam satu menit.
:::
  `,
};
