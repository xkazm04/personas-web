export const content: Record<string, string> = {
  "what-are-pipelines": `
## Apa Itu Pipeline?

Pipeline adalah kelompok agen terkoordinasi yang meneruskan pekerjaan antar satu sama lain untuk menangani tugas multi-langkah. Alih-alih satu agen besar yang melakukan-semuanya, Anda membangun agen-agen kecil yang fokus dan menyambungnya — masing-masing berspesialisasi, pipeline menangani orkestrasi. Bagian Pipeline di sidebar adalah tempat pipeline tinggal; Team Canvas di dalamnya adalah tempat Anda menyusunnya.

Pipeline di Personas adalah first-class — mereka memiliki riwayat eksekusi sendiri, permukaan observabilitas sendiri, team memory sendiri (konteks bersama yang dapat dibaca semua agen dalam pipeline), dan mereka dapat dipicu seperti agen tunggal (schedule, webhook, manual, chain). Perbedaannya adalah satu trigger menyalakan seluruh pipeline daripada satu agen.

:::compare
**Agen Tunggal**
Satu prompt, satu set alat, satu output. Sederhana untuk disiapkan; terbatas ketika tugas secara alami terurai menjadi tahapan.
---
**Pipeline** [recommended for multi-stage work]
Beberapa agen yang fokus, terhubung dalam suatu alur. Setiap agen kecil dan mudah di-debug; pipeline menyusunnya menjadi kapabilitas yang lebih besar. Team memory bersama memungkinkan agen meneruskan konteks terstruktur, bukan hanya teks. Terlihat di team canvas end-to-end.
:::

### Poin Kunci

- **Alur multi-agen** — agen meneruskan output ke input sepanjang koneksi yang ditentukan
- **Team memory** — penyimpanan konteks bersama yang dapat dibaca dan ditulis semua agen pipeline, terpisah dari memori per-agen
- **Editor visual** — Team Canvas; tempatkan agen, gambar koneksi, konfigurasi routing
- **Dapat digunakan kembali** — pipeline yang sama berjalan untuk payload trigger yang cocok; pipeline juga dapat dikloning
- **Dapat diamati** — riwayat eksekusi tingkat-pipeline lengkap dengan breakdown per-agen

### Cara Kerjanya

Anda menyusun pipeline di Team Canvas: jatuhkan agen, gambar koneksi, konfigurasikan cabang bersyarat jika diperlukan. Saat pipeline berjalan, data mengalir di sepanjang koneksi — output setiap agen menjadi input ke agen hilir mana pun yang dikabelkan canvas. Engine melacak run end-to-end sehingga Anda melihat satu eksekusi pipeline daripada N run agen yang terpisah.

### Lihat dalam Aksi

:::usecases
**Otomatisasi DevOps**
Sebuah pull request dibuka di GitHub
---
Agen PR Reviewer menganalisis diff, Test Runner memverifikasi build, Release Notes menyusun changelog, Slack Notifier mem-posting ringkasan ke saluran tim Anda — pipeline tunggal yang dipicu oleh webhook GitHub.
===
**Alur kerja konten**
Anda membutuhkan posting blog yang dipublikasikan dari sebuah topik
---
Agen Research mengumpulkan sumber, Writer menyusun karya, Editor memoles, Publisher memformat untuk CMS Anda — pipeline mengelola handoff dan team memory membawa panduan gaya bersama.
===
**Triase dukungan pelanggan**
Tiket baru tiba
---
Classifier menentukan urgensi dan kategori, agen Knowledge mengambil dokumen yang relevan, Drafter menulis respons kandidat, Router mengeskalasi ke manusia jika confidence rendah.
:::

:::info
Tidak ada batas atas keras pada ukuran pipeline. Mulai dengan dua agen untuk memvalidasi aliran data, tumbuh dengan menambahkan satu spesialis pada satu waktu. Pipeline dengan 10+ agen bekerja seandal yang kecil; engine menangani orkestrasi secara identik.
:::

:::tip
Perlakukan setiap agen dalam pipeline seperti fungsi tujuan-tunggal: satu bentuk input spesifik, satu bentuk output spesifik. Semakin kecil dan fokus setiap agen, semakin mudah seluruh pipeline di-debug dan semakin dapat digunakan kembali bagian-bagian individual di seluruh pipeline.
:::
  `,

  "the-team-canvas": `
## Team Canvas

Team Canvas adalah editor visual untuk pipeline. Buka Pipeline → Team Canvas dan Anda melihat pipeline Anda sebagai grafik: node agen yang dihubungkan oleh edge berarah. Jatuhkan agen dari panel library di sebelah kiri, gambar koneksi dengan menyeret dari port output agen ke port input agen lain, konfigurasikan cabang dengan node bersyarat. Canvas mendukung pan, zoom, multi-select, auto-layout, dan navigasi keyboard.

Canvas bukan hanya visualisasi — ini adalah editornya. Setiap perubahan yang Anda buat di canvas (menempatkan agen, menggambar koneksi, menambahkan node bersyarat) segera memperbarui definisi pipeline. Simpan untuk meng-commit; pipeline dikontrol versinya dengan cara yang sama seperti prompt agen.

### Poin Kunci

- **Drag-and-drop** agen dari library ke canvas
- **Menggambar koneksi** — klik-dan-seret dari port output ke port input; data mengalir di sepanjang koneksi saat runtime
- **Node bersyarat** — tambahkan node routing antara agen untuk bercabang berdasarkan data
- **Auto-layout** — satu klik merapikan canvas menjadi alur kiri-ke-kanan atau atas-ke-bawah
- **Diversi** — snapshot canvas disimpan dengan pipeline; pulihkan layout dan topologi sebelumnya

### Membangun Pipeline Pertama Anda

:::steps
1. **Buka Pipeline → Team Canvas** — sidebar → Pipeline → New Pipeline (atau buka yang sudah ada)
2. **Jelajahi library agen** — panel kiri; saring berdasarkan grup atau cari
3. **Seret agen ke canvas** — tempatkan mereka kira-kira dalam urutan eksekusi
4. **Gambar koneksi** — port output (tepi kanan) ke port input (tepi kiri)
5. **Tambahkan node bersyarat jika diperlukan** — toolbar → Conditional; konfigurasi cabang
6. **Simpan** — Ctrl+S; pipeline di-commit dan dapat dijalankan segera
:::

:::tip
Kiri-ke-kanan atas-ke-bawah adalah konvensi paling mudah dibaca. Gunakan auto-layout (tombol toolbar) setelah topologi diatur; menghasilkan alur visual yang bersih yang membantu siapa pun yang membaca canvas — termasuk Anda di masa depan — memahami pipeline secara sekilas.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Menambahkan Agen ke Pipeline

Agen ditambahkan ke pipeline dari panel library di sebelah kiri Team Canvas. Seret agen mana pun ke canvas untuk menempatkannya; pengaturan default agen ikut (prompt, alat, model, kredensial), tetapi Anda dapat menimpa per-pipeline jika Anda ingin agen ini berperilaku sedikit berbeda di sini daripada di tempat lain.

Agen yang sama dapat berpartisipasi dalam beberapa pipeline, masing-masing dengan pengaturan penimpaannya sendiri. Perubahan pada agen yang mendasarinya (misalnya revisi prompt di editor agen itu sendiri) menyebar ke semua pipeline yang menggunakannya; penimpaan per-pipeline tidak, mereka hanya tinggal di pipeline.

### Poin Kunci

- **Seret dari library** — agen apa pun yang telah Anda buat tersedia
- **Penimpaan per-pipeline** — pemetaan input, transformer output, preferensi model (jika Anda ingin pipeline ini menggunakan model lebih murah untuk tahap ini), failover provider
- **Penggunaan ulang multi-pipeline** — agen di pipeline A dan pipeline B memiliki set penimpaan independen per pipeline
- **Perubahan agen yang mendasari menyebar** — pengeditan prompt, perubahan alat, dll., mengalir ke setiap pipeline yang menggunakan agen (penimpaan per-pipeline tidak)
- **Ganti agen di tempat** — klik kanan → Replace; agen baru mewarisi koneksi yang lama jika bentuk input/output cocok

### Cara Kerjanya

Menempatkan agen pada canvas menciptakan *referensi cakupan-pipeline* ke agen itu. Referensi mencakup set penimpaan (kustomisasi per-pipeline apa pun) dan posisi di canvas. Saat runtime, engine memecahkan referensi, menerapkan penimpaan di atas konfigurasi dasar agen, dan mengirimkan run.

:::tip
Tahan godaan untuk memasukkan kustomisasi per-pipeline berat ke dalam set penimpaan. Jika Anda mendapati diri Anda menimpa banyak hal dalam satu pipeline, biasanya lebih bersih untuk mengkloning agen (memberi klon nama yang jelas seperti "Email Writer - Pipeline B") dan menggunakan klon — menjaga kustomisasi per-pipeline tetap eksplisit alih-alih tersembunyi di dalam panel penimpaan.
:::
  `,

  "connecting-agents-with-data-flow": `
## Menghubungkan Agen dengan Aliran Data

Koneksi pada canvas adalah edge berarah dari port output agen ke port input agen lain. Setiap koneksi membawa output agen hulu ke agen hilir sebagai input — verbatim secara default, atau ditransformasi oleh transformer inline (ekspresi kecil yang membentuk ulang output sebelum meneruskannya).

Koneksi dapat dikonfigurasi: Anda dapat menambahkan transformer, melabelinya (berguna dalam pipeline kompleks), dan mematikannya sementara untuk debugging tanpa menghapusnya. Beberapa koneksi dapat bercabang keluar dari satu output (broadcast: agen hilir semua menerima data yang sama) atau bercabang masuk ke satu input (engine menggabungkan input dari beberapa agen hulu menjadi satu objek input untuk hilir).

### Poin Kunci

- **Klik-seret** dari port output ke port input untuk membuat koneksi
- **Transformer opsional** — ekspresi inline yang membentuk ulang data dalam perjalanannya
- **Fan-out** — satu output ke banyak input hilir (percabangan paralel)
- **Fan-in** — banyak output hulu menjadi satu input hilir (objek gabungan)
- **Toggle on/off** — nonaktifkan koneksi tanpa menghapus (berguna untuk rollout bertahap)
- **Berlabel** — beri nama koneksi untuk kejelasan dalam pipeline kompleks
- **Hapus** — klik koneksi → tombol Delete

### Menghubungkan Dua Agen

:::steps
1. **Temukan port output** — lingkaran kecil di tepi kanan agen sumber
2. **Klik-dan-seret** ke port input — lingkaran kecil di tepi kiri target
3. **Jatuhkan pada port input** — garis ditarik; koneksi di-commit
4. **Tambahkan transformer secara opsional** — klik kanan koneksi → Add transformer; tulis ekspresi kecil untuk membentuk ulang data
5. **Uji dengan menjalankan pipeline** — klik koneksi mana pun selama run untuk memeriksa data yang melewatinya
:::

:::tip
Gunakan label dan transformer koneksi secara liberal di pipeline mana pun dengan lebih dari 3-4 agen. Label membuat topologi mendokumentasikan diri sendiri; transformer memungkinkan Anda menjaga agen dapat digunakan kembali di seluruh pipeline (satu agen tidak harus tahu format apa yang mungkin diproduksi pipeline hulu yang berbeda — transformer menyesuaikannya).
:::
  `,

  "pipeline-execution": `
## Eksekusi Pipeline

Menjalankan pipeline mengirim payload trigger ke agen pertama (atau agen-agen, jika ada beberapa start node), dan setiap agen hilir berjalan saat input-nya tersedia. Canvas menampilkan eksekusi secara langsung — agen bersinar saat berjalan, koneksi menganimasikan data yang mengalir, dan node bersyarat menunjukkan cabang mana yang diambil.

Engine menangani paralelisme secara otomatis: jika dua agen tidak memiliki dependensi di antara mereka, mereka berjalan paralel. Jika agen bergantung pada output dari beberapa agen hulu, ia menunggu semua selesai. Total waktu wall-clock ditentukan oleh jalur kritis melalui grafik, bukan jumlah dari semua durasi agen.

### Poin Kunci

- **Animasi canvas langsung** — lihat agen mana yang berjalan, koneksi mana yang mengalir, cabang bersyarat mana yang diambil
- **Paralelisme otomatis** — agen independen berjalan bersamaan; agen dependen menunggu prasyarat
- **Jalur kritis menentukan waktu wall** — durasi pipeline = rantai dependensi terpanjang, bukan jumlah agen
- **Stop-at-first-failure** — secara default; dapat dikonfigurasi per pipeline jika Anda ingin eksekusi yang toleran-kesalahan
- **Re-run dari langkah mana pun** — lanjutkan setelah perbaikan tanpa menjalankan ulang tahap hulu yang berhasil

### Cara Kerjanya

:::diagram
[Trigger] --> [Agen A] --> [Conditional] --> [Agen B atau Agen C] --> [Agen D] --> [Output]
:::

Klik \`Run\` (atau tunggu trigger menyala secara otomatis). Engine membangun rencana eksekusi dari topologi canvas, mengirimkan start node, dan memproses grafik berdasarkan urutan topologis. Saat setiap agen selesai, agen hilir menjadi memenuhi syarat dan dikirim secara otomatis. Kegagalan menjeda pipeline pada langkah yang gagal dengan error terlihat di inspector; perbaiki masalah yang mendasari dan klik \`Retry Step\` untuk melanjutkan.

:::tip
Agen paling lambat di jalur kritis menentukan durasi pipeline. Jika pipeline Anda terasa lambat, jalankan sekali, lihat durasi per-agen dalam trace, identifikasi jalur terpanjang, dan optimalkan agen mana pun di jalur itu yang memiliki durasi tertinggi. Cabang paralel tidak membantu jika jalur kritis Anda lambat.
:::
  `,

  "conditional-routing": `
## Conditional Routing

Node conditional routing memungkinkan pipeline bercabang berdasarkan data yang sedang diprosesnya. Jatuhkan node bersyarat di canvas, definisikan satu atau lebih aturan ("jika amount > 1000", "jika email berisi 'urgent'", "jika output classifier = 'support'"), dan kabelkan setiap cabang ke jalur hilir yang berbeda. Saat runtime, kondisional dievaluasi dan dirutekan ke cabang yang cocok — hanya cabang itu yang berjalan.

Aturan berbasis ekspresi: DSL kecil dari perbandingan dan operator logis yang dievaluasi terhadap output agen hulu. Tidak ada kode; editor ekspresi memiliki autocomplete untuk bentuk output hulu sehingga Anda menemukan field yang tersedia saat Anda mengetik.

:::feature
**Routing berbasis ekspresi**
Aturan bersyarat dievaluasi sebagai ekspresi terhadap output hulu. Bandingkan field, gabungkan dengan AND/OR, jatuh ke cabang default ketika tidak ada yang cocok. Tidak diperlukan kode, tetapi ekspresivitas penuh ketika Anda membutuhkannya.
:::

### Poin Kunci

- **Beberapa cabang** — satu node bersyarat, N cabang yang ditentukan aturan, plus fallback default
- **Cabang default wajib** — menjamin data tidak pernah macet pada kondisi yang tidak cocok
- **DSL ekspresi** — perbandingan (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), operator boolean (\`and\`, \`or\`, \`not\`)
- **Autocomplete pada bentuk hulu** — editor ekspresi mengetahui skema output agen hulu
- **Evaluasi langsung dalam trace** — lihat cabang mana yang diambil pada setiap run pipeline

### Cara Kerjanya

Jatuhkan node Conditional antara agen. Konfigurasikan aturan setiap cabang di editor aturan; cabang default tidak membutuhkan aturan (itu adalah fallback). Saat runtime, engine mengevaluasi aturan dalam urutan; kecocokan pertama menang; jika tidak ada aturan yang cocok, cabang default berjalan. Cabang yang berjalan melihat output hulu sebagai input; yang lain tetap diam untuk run ini.

:::warning
Selalu definisikan cabang default. Tanpa satu, input yang tidak cocok terjebak di tengah pipeline dan menghasilkan run yang macet — menjengkelkan untuk di-debug. Cabang default dapat dengan mudah dirutekan ke agen terminal "log and stop" jika Anda benar-benar ingin input yang tidak cocok gagal dengan keras, tetapi cabang itu perlu ada.
:::
  `,

  "team-members-and-roles": `
## Anggota Tim dan Peran

Setiap agen dalam pipeline dapat membawa label peran — "Researcher", "Writer", "Editor", "Classifier" — yang menggambarkan fungsinya dalam pipeline. Peran murni bersifat organisasional; engine tidak menegakkan atau menggunakannya. Nilainya adalah manusiawi: ketika Anda (atau orang lain) membuka canvas sebulan kemudian, label peran membuat pipeline mendokumentasikan diri sendiri.

Di luar label, peran juga berguna untuk substitusi agen. Jika Anda memiliki beberapa agen yang dapat mengisi peran "Editor" (dengan gaya prompt atau spesialisasi yang berbeda), label peran membuatnya jelas slot mana yang akan ditukar saat Anda berubah pikiran. Team Canvas mendukung drag-replace pada peran: jatuhkan agen yang berbeda pada peran yang ada dan canvas bertanya apakah akan mengganti, mempertahankan koneksi.

### Poin Kunci

- **Label peran teks-bebas** — apa pun yang dapat dibaca manusia; yang umum mendapat saran autocomplete
- **Terlihat di canvas** — label peran muncul di atas setiap node agen sehingga struktur tim terlihat sekilas
- **Drag-replace berdasarkan peran** — jatuhkan agen baru pada slot peran untuk substitusi, mempertahankan koneksi
- **Filter library berdasarkan peran** — ketika Anda memiliki banyak agen serupa, saring library berdasarkan peran untuk menemukan kandidat dengan cepat
- **Template pipeline menggunakan peran** — template mendefinisikan peran yang harus diisi, Anda membawa agen yang sesuai dengan setiap peran

### Cara Kerjanya

Klik kanan agen mana pun di canvas → Set role. Label muncul di atas node agen. Peran tinggal di definisi pipeline bersama dengan referensi agen; mereka tidak memodifikasi agen itu sendiri. Template pipeline dikirim dengan peran yang sudah didefinisikan; instansiasi template meminta Anda memilih agen untuk setiap peran.

:::tip
Beri nama peran berdasarkan tanggung jawab, bukan berdasarkan agen saat ini. "Editor" lebih baik daripada "Claude Sonnet Editor"; deskripsi peran melampaui agen spesifik mana yang saat ini mengisinya. Jika Anda beralih dari Claude ke GPT untuk peran itu, label peran masih akurat.
:::
  `,

  "pipeline-run-history": `
## Riwayat Run Pipeline

Run pipeline adalah eksekusi first-class di penyimpanan yang sama dengan run agen individual. Tab Pipeline → Run History menunjukkan setiap run dengan trigger-nya, input, status, total durasi, total biaya, dan breakdown per-agen. Klik run mana pun untuk memperluas trace lengkap: trace per-agen, keputusan bersyarat, output transformer, hasil akhir.

Riwayat run dipersistenkan tanpa batas waktu (tergantung pengaturan retensi di Settings → Data) dan mendukung penyaringan dan pencarian yang sama seperti tampilan aktivitas per-agen. Setiap run tidak dapat diubah — sekali ditangkap, trace dibekukan, berguna untuk audit setelah-fakta.

### Poin Kunci

- **Penangkapan lengkap** — input, trace per-agen (prompt, panggilan alat, respons), keputusan bersyarat, output transformer, hasil akhir
- **Status per-agen** dalam trace pipeline — success / failure / skipped / pending
- **Total + waktu per-agen** — lihat jalur kritis dan identifikasi bottleneck
- **Total + biaya per-agen** — biaya pipeline = jumlah biaya per-agen
- **Dapat dicari dan disaring** — berdasarkan tanggal, trigger, status, biaya, durasi, agen
- **Perbandingan dua-run** — pilih dua run untuk mem-diff output per-agen (berguna untuk "apa yang berubah?")

### Cara Kerjanya

Run pipeline menggunakan penyimpanan eksekusi yang sama dengan run agen-tunggal tetapi dengan pembungkus tingkat-pipeline tambahan yang menautkan ke semua eksekusi agen anak. Tampilan riwayat meminta penyimpanan ini, bergabung ke record eksekusi agen untuk breakdown per-agen, dan merender pohon trace.

:::tip
Setelah perubahan pipeline yang signifikan (aturan bersyarat baru, agen yang ditukar, revisi prompt pada agen anggota), pilih run "sebelumnya" dari riwayat dan run "sesudahnya" dari run baru, kemudian gunakan Compare untuk melihat persis apa yang berbeda. Diff pada tingkat pipeline sering mengungkapkan dampak yang akan Anda lewatkan dengan melihat agen tunggal mana pun secara terisolasi.
:::
  `,

  "pipeline-templates": `
## Template Pipeline

Template pipeline adalah bentuk pipeline pra-dibangun yang dapat Anda adopsi sebagai titik awal. Template mendefinisikan topologi — peran apa yang ada, cabang bersyarat apa, transformer apa — tetapi tidak mengikat agen spesifik ke setiap peran. Ketika Anda meng-instansiasi template, canvas terbuka dengan topologi di tempat dan meminta Anda untuk mengisi setiap peran dari library agen Anda sendiri.

Template mencakup bentuk umum: alur kerja konten (research → write → edit → publish), triase dukungan (classify → route → respond → escalate), pemrosesan data (ingest → validate → transform → store). Library template ada di Pipelines → New Pipeline → Browse Templates.

### Poin Kunci

- **Topologi-ditentukan, peran-fleksibel** — template mengetahui bentuk; Anda membawa agen
- **Aturan bersyarat dan transformer pra-konfigurasi** — logika routing kasus-umum dimasak ke dalam
- **Dapat dikustomisasi setelah instansiasi** — setelah di-instansiasi, canvas adalah milik Anda untuk dimodifikasi
- **Pola praktik-terbaik** — template dikirim dengan penanganan error dan cabang fallback sebagai standar
- **Library yang tumbuh** — template baru ditambahkan berdasarkan permintaan pengguna; Anda juga dapat menyimpan pipeline Anda sendiri sebagai template untuk penggunaan ulang

### Cara Kerjanya

Template adalah definisi canvas dengan slot peran alih-alih referensi agen. Instansiasi menciptakan pipeline baru, menyalin canvas template, dan meminta Anda mengisi setiap peran dari library agen. Setelah diisi, pipeline sepenuhnya dapat diedit — tidak terhubung kembali ke template, jadi pembaruan ke template tidak menyebar (dan pengeditan ke pipeline tidak memengaruhi template).

:::tip
Bahkan ketika tidak ada template yang cocok persis, memilih yang terdekat dan memodifikasinya biasanya lebih cepat daripada membangun dari awal. Template menyelesaikan terlebih dahulu bentuk orkestrasi (penempatan bersyarat, lokasi transformer, topologi fan-out/fan-in); pekerjaan yang tersisa adalah pemilihan agen dan penyetelan prompt, yang merupakan pekerjaan yang ingin Anda fokuskan.
:::
  `,

  "debugging-pipeline-issues": `
## Men-debug Masalah Pipeline

Ketika run pipeline gagal, canvas menandai agen yang gagal dengan indikator merah dan run berhenti pada langkah itu. Buka run yang gagal dari riwayat (atau klik indikator pada canvas langsung) dan panel debug menampilkan input agen, error, trace hingga kegagalan, dan output parsial yang dihasilkan agen sebelum gagal. Dari panel yang sama Anda dapat mencoba ulang hanya langkah yang gagal atau menjalankan ulang seluruh pipeline dari awal.

Kegagalan pipeline yang paling umum adalah ketidakcocokan bentuk data — agen hulu menghasilkan output dalam format yang sedikit berbeda dari yang diharapkan agen hilir. Inspector koneksi (klik koneksi mana pun) menunjukkan data yang melewatinya pada run terbaru, yang biasanya cukup untuk menemukan ketidakcocokan.

### Poin Kunci

- **Langkah yang gagal disorot** — indikator merah di canvas, error lengkap di panel debug
- **Inspector koneksi** — klik koneksi mana pun untuk melihat data live atau run-terakhir yang melewatinya
- **Retry dari langkah yang gagal** — perbaiki masalah dan lanjutkan; tahap hulu yang berhasil tidak dijalankan ulang
- **Replay langkah demi langkah** — jalankan ulang eksekusi pipeline masa lalu mana pun dengan input yang sama untuk mereproduksi kegagalan secara deterministik
- **Validasi koneksi** — canvas dapat memeriksa terlebih dahulu apakah agen hulu dan hilir memiliki bentuk input/output yang kompatibel (menangkap ketidakcocokan sebelum runtime)

### Cara Kerjanya

Engine pipeline memancarkan event kegagalan terstruktur ketika run agen mengalami error. Panel debug berlangganan event ini dan merender trace + inspector yang relevan. Retry-from-step didukung oleh engine: ia mengirimkan ulang agen yang gagal dengan konteks hulu yang sama, mempertahankan sisa run pipeline.

:::tip
Sebagian besar kegagalan pipeline adalah masalah koneksi, bukan masalah agen. Ketika sesuatu rusak, periksa terlebih dahulu koneksi yang memberi makan agen yang gagal — bentuk apa yang sebenarnya diterimanya? Jauh lebih sering "datanya salah" daripada "agennya salah"; inspector koneksi memberi tahu Anda kasus mana itu dalam waktu kurang dari satu menit.
:::
  `,
};
