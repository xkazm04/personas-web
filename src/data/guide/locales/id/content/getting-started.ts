export const content: Record<string, string> = {
  "installing-personas": `
## Memasang Personas

Memasang Personas di komputer Anda hanya memerlukan waktu sekitar satu menit. Ambil installer untuk sistem operasi Anda — Windows, macOS, atau Linux — dari halaman unduh dan jalankan. Installer adalah satu file tanpa wizard pengaturan; klik dua kali, setujui prompt keamanan, dan aplikasi akan terbuka. Pembaruan dikirim secara otomatis di latar belakang, jadi Anda akan selalu memiliki versi terbaru tanpa melakukan apa pun.

Saat aplikasi terbuka pertama kali, Anda akan tiba di layar selamat datang. Dari sana Anda dapat langsung masuk ke pembuatan agen (Personas akan menawarkan untuk menyiapkan penyedia AI ketika Anda membutuhkannya) atau membuka credential vault terlebih dahulu jika Anda sudah memiliki API key yang ingin disimpan. Kedua jalur sama-sama berfungsi.

:::steps
1. **Unduh installer** — pilih file yang tepat untuk OS Anda (NSIS \`.exe\` pada Windows, \`.dmg\` pada macOS, \`.AppImage\` atau \`.deb\` pada Linux)
2. **Jalankan installer** — klik dua kali pada Windows, seret ke Applications pada macOS, eksekusi pada Linux
3. **Setujui prompt keamanan** — OS Anda mungkin meminta konfirmasi; ini normal untuk perangkat lunak desktop baru
4. **Buka Personas** — layar selamat datang muncul dengan tur terpandu yang bisa Anda ikuti atau lewati
5. **Opsional: hubungkan penyedia** — tempel API key di halaman Connections jika Anda ingin siap membangun segera
:::

:::info
Berfungsi pada **Windows 10+**, **macOS 12+**, dan sebagian besar distribusi **Linux** modern. Installer Windows adalah NSIS \`.exe\` berukuran 53 MB; binary yang disertakan sekitar 90 MB setelah pemasangan. Pembaruan otomatis hanya bersifat delta, jadi biasanya jauh lebih kecil.
:::

:::tip
Jika Anda menemui peringatan Windows SmartScreen atau macOS Gatekeeper, itu hanyalah OS Anda yang berhati-hati dengan perangkat lunak baru. Setujui dan Anda siap — installer ini sudah ditandatangani kode.
:::
  `,

  "creating-your-first-agent": `
## Membuat Agen Pertama Anda

Agen pertama Anda memerlukan waktu sekitar lima menit dari kondisi kosong hingga menjadi asisten yang berfungsi. Anda memiliki dua jalur: **mulai dari template** (direkomendasikan untuk agen pertama Anda — build engine merangkai konfigurasi yang berfungsi dari jawaban Anda) atau **mulai dari awal** (kendali manual penuh). Keduanya berakhir di tempat yang sama: agen yang dapat Anda jalankan.

Jika Anda memilih jalur template, build engine memulai sesi interaktif. Ia mengajukan pertanyaan klarifikasi secara berkelompok ("input seperti apa yang Anda harapkan?", "ke mana output harus pergi?", "seberapa sering ini harus dijalankan?"), mengusulkan parameter berdasarkan jawaban Anda, dan menampilkan pratinjau langsung dari agen yang akan dibangun. Anda menyetujui di akhir, dan agen tiba siap untuk diuji.

Jika Anda memilih jalur dari awal, Anda menulis prompt sendiri, memilih model AI, melampirkan alat apa pun, dan menyimpan.

:::steps
1. **Buka halaman Agents** — sidebar → Agents, atau tekan \`Ctrl+1\` untuk langsung ke sana
2. **Klik Create Agent** — pilih jalur: pilih template, atau mulai kosong
3. **Jawab pertanyaan build (jalur template)** — build engine mengelompokkan pertanyaan klarifikasi per kapabilitas dan menampilkan pratinjau langsung saat jawaban Anda membentuk agen
4. **Sesuaikan prompt dan tools** — sempurnakan instruksi yang dihasilkan template (atau tulis dari awal)
5. **Promote saat siap** — memindahkan agen dari draft ke active; pemeriksaan setup-status berjalan otomatis untuk menandai kredensial yang belum terhubung atau trigger yang belum dikonfigurasi sebelum Anda dapat melakukan promote
:::

### Cara Kerjanya

Jalur template adalah cara tercepat untuk mendapatkan agen yang *baik* (template dirancang dan diuji oleh kami), tetapi Anda akan melampauinya. Setelah Anda mengirimkan beberapa agen berbasis template, Anda akan mulai menulis prompt secara langsung dan memperlakukan template sebagai titik awal alih-alih solusi lengkap.

:::tip
Jangan khawatir tentang menyempurnakan agen pertama Anda. Riwayat versi (dibahas nanti) berarti Anda dapat bereksperimen dengan bebas — setiap penyimpanan adalah pos pemeriksaan yang dapat Anda kembali ke sana.
:::
  `,

  "understanding-the-interface": `
## Memahami Antarmuka

Antarmuka Personas memiliki tiga area utama. **Sidebar** di sebelah kiri adalah navigasi tingkat atas Anda — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, dan Settings. Klik bagian tingkat atas dan navigasi tingkat dua muncul menampilkan sub-halamannya (misalnya mengklik Agents akan mengungkapkan All Agents, ditambah tab Editor untuk agen yang sedang dipilih: Prompt, Connectors, Lab, Activity, Health, Settings).

Area tengah adalah **workspace** tempat semuanya benar-benar terjadi — mengedit prompt, mengamati eksekusi, menjelajahi credential catalog. **Title bar** di bagian atas berisi lonceng notifikasi (klik untuk melihat detail eksekusi terbaru), akses cockpit ("Talk to Athena"), dan pencarian global. **Bottom strip** menampilkan eksekusi aktif dan setiap event sistem yang mendesak.

| Area | Apa fungsinya |
|------|-------------|
| Sidebar Level 1 | Bagian tingkat atas — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Sidebar Level 2 | Sub-nav yang sensitif konteks untuk bagian aktif |
| Workspace | Editor / browser / dashboard utama untuk bagian apa pun yang Anda buka |
| Title bar | Lonceng notifikasi, pintasan cockpit, pencarian global, kontrol aplikasi |
| Bottom strip | Eksekusi aktif, status sistem |

### Cara Kerjanya

Sebagian besar dari apa yang Anda lakukan terjadi dengan mengklik item sidebar dan mengedit di workspace. Lonceng notifikasi title-bar adalah satu-satunya pintasan universal yang layak diingat — ia selalu membuka detail eksekusi terbaru, tidak peduli di mana Anda berada. Pintasan cockpit ("Talk to Athena") membuka chat dalam aplikasi dengan companion yang dapat membantu Anda membangun, melakukan debug, atau sekadar menjawab pertanyaan tentang pengaturan Anda.

:::tip
Arahkan kursor pada ikon sidebar apa pun untuk tooltip dengan pintasan keyboard. \`Ctrl+1\` hingga \`Ctrl+9\` langsung melompat ke bagian tingkat atas, dan \`Ctrl+K\` membuka pencarian global sehingga Anda dapat menemukan apa pun berdasarkan nama.
:::
  `,

  "what-is-an-ai-agent": `
## Apa Itu Agen AI?

Agen AI adalah model AI yang dikonfigurasi dengan sebuah pekerjaan. Anda memberinya instruksi ("baca email saya yang belum dibaca dan rangkum yang penting"), memberi tahu alat apa yang bisa digunakannya, dan memicunya — secara manual dengan tombol, sesuai jadwal, pada event, atau sebagai langkah dalam pipeline. Agen membaca payload trigger, mengikuti instruksi Anda, memanggil alat apa pun yang diperlukan, dan menghasilkan output. Berbeda dengan chatbot, agen bertindak: mengirim email, menulis file, mem-posting ke Slack.

Setiap agen di Personas bersifat tahan lama — ia mengingat pengaturannya, riwayatnya, kredensialnya, dan (opsional) memori dari run sebelumnya. Anda dapat mengkloningnya, melakukan kontrol versi pada prompt-nya, menjalankannya di arena melawan prompt alternatif untuk melihat mana yang berkinerja lebih baik, dan merangkainya dengan agen lain untuk membangun alur kerja multi-langkah.

:::compare
**Chatbot**
Anda mengetik pertanyaan, ia membalas. Setiap giliran adalah sekali pakai. Berguna untuk pencarian cepat, brainstorming, drafting. Tidak ada tindakan, tidak ada memori antar-sesi, tidak ada otomatisasi.
---
**Agen AI** [recommended]
Konfigurasi persisten dengan sebuah pekerjaan. Dipicu secara manual atau otomatis; menggunakan alat untuk bertindak; memiliki prompt yang dikontrol versi, kredensial yang dilampirkan, riwayat eksekusi, dan indikator kesehatan. Model adalah mesinnya, tetapi agen adalah seluruh rakitan di sekitarnya.
:::

### Cara Kerjanya

:::diagram
[Trigger menyala] --> [Agen membaca input] --> [Model + alat dieksekusi] --> [Output dikirim]
:::

Trigger mengemas payload input (body webhook, string clipboard, path file, event dari agen lain…). Agen membaca prompt-nya, memasukkannya ke model AI bersama input, dan membiarkan model memanggil alat yang dilampirkan sesuai kebutuhan. Output akhir dikirim melalui saluran output mana pun yang Anda konfigurasikan — kembali ke UI, ditulis ke file, di-posting ke Slack, atau dirantai sebagai input ke agen berikutnya.

:::tip
Cara tercepat untuk memahami agen adalah dengan melihat tugas mingguan berulang Anda dan bertanya: "bisakah ini dipicu, diinstruksikan, dan diotomatisasi?" Jika ya, tugas itu adalah agen.
:::
  `,

  "running-your-first-automation": `
## Menjalankan Otomatisasi Pertama Anda

Setelah Anda membuat agen, ada beberapa cara untuk memulainya. Yang paling sederhana adalah tombol **Run** manual di bagian atas editor agen — klik dan Anda akan melihat aliran eksekusi langsung di panel activity. Dalam beberapa detik (atau beberapa menit untuk penyedia yang lebih lambat atau prompt yang lebih panjang), output akan muncul.

Untuk pekerjaan berulang, tambahkan schedule trigger, webhook trigger, file-watcher trigger, atau chain trigger agar agen berjalan dengan sendirinya. Anda mengatur trigger sekali, agen melakukan sisanya.

:::steps
1. **Buka agen** — temukan di halaman Agents; editor terbuka dengan tab Prompt yang difokuskan
2. **Klik Run** — workspace beralih ke tab Activity secara otomatis; Anda melihat prompt sedang dikonstruksi, panggilan model keluar, dan token mengalir kembali
3. **Amati feed langsung** — setiap agen memiliki streamnya sendiri sehingga Anda dapat menjalankan beberapa secara paralel tanpa kebingungan
4. **Tinjau output** — baris activity diperluas untuk menampilkan prompt lengkap, respons model, panggilan alat apa pun yang dilakukan, durasi, dan biaya
5. **Iterasi** — ubah prompt atau pengaturan, simpan, jalankan lagi; setiap run di-checkpoint
:::

### Cara Kerjanya

Sebuah run adalah satu eksekusi: trigger → konstruksi-prompt → panggilan-model → panggilan-alat → output. Setiap langkah ditangkap dalam jejak eksekusi, dan run tiba di tab Activity halaman Overview (tampilan global di seluruh agen) dan di tab Activity agen itu sendiri. Dari salah satu tempat Anda dapat mengklik run untuk modal detail lengkap.

Jika sebuah run gagal (error model, kredensial kedaluwarsa, gangguan jaringan), indikator kesehatan agen berubah kuning atau merah dan kegagalannya dipertahankan dalam jejak sehingga Anda dapat melakukan debug.

:::tip
Run pertama Anda sebagian adalah tentang mempelajari apa yang sebenarnya dilakukan prompt Anda dalam praktik. Jika output bukan yang Anda inginkan, jejak menunjukkan kepada Anda persis apa yang diterima model — biasanya perbaikannya adalah memperjelas atau membatasi prompt daripada mencoba lagi.
:::
  `,

  "choosing-your-ai-provider": `
## Memilih Penyedia AI Anda

Personas mendukung penyedia AI utama — **Anthropic** (keluarga Claude), **OpenAI** (keluarga GPT), **Google** (Gemini), dan **model lokal** melalui Ollama atau endpoint yang kompatibel dengan OpenAI. Anda juga dapat mengonfigurasi penyedia kustom di Settings → Custom Models. Setiap agen memilih provider/model-nya secara independen, jadi Anda dapat menjalankan model murah pada pekerjaan rutin dan menyimpan yang mahal untuk tugas yang membutuhkannya.

Hubungkan penyedia sekali di halaman Connections (Anda akan menempel API key — dienkripsi di vault lokal — atau menjalankan OAuth untuk penyedia yang mendukungnya). Setelah itu, pemilih model setiap agen menampilkan penyedia yang dikonfigurasi dan modelnya.

:::compare
**Anthropic Claude** [recommended]
Mengikuti instruksi dengan kuat, penalaran konteks panjang, output terstruktur. Sonnet 4.6 adalah default untuk agen baru. Model Opus untuk penalaran tersulit, Haiku untuk kecepatan/biaya. Sangat baik dalam loop tool-use.
---
**OpenAI GPT**
Ekosistem terluas dan paling banyak diuji untuk banyak kasus penggunaan. All-rounder yang solid; model kelas GPT-4o kuat untuk pekerjaan asisten umum.
---
**Google Gemini**
Multimodal, jendela konteks besar, latensi token pertama yang cepat. Kuat untuk agen riset / pemrosesan dokumen.
---
**Lokal (Ollama / kompatibel-OpenAI)**
Berjalan di mesin Anda — nol data meninggalkan perangkat. Model lebih kecil, tetapi untuk pekerjaan bertaruhan rendah atau privat, trade-off sering kali sepadan.
:::

### Cara Kerjanya

Setelah beberapa penyedia terhubung, Personas dapat melakukan failover otomatis di tingkat agen: jika penyedia utama Anda mengembalikan error di atas ambang batas, run agen berikutnya menggunakan penyedia fallback yang dikonfigurasi. Ketika yang utama pulih, rotasi normal dilanjutkan. Ini dikonfigurasi per-agen di tab Editor → Settings.

Untuk pelacakan biaya, setiap run ditandai dengan provider, model, dan jumlah token, sehingga tab Overview → Usage dapat memecah pengeluaran berdasarkan provider, model, atau agen.

### Lihat dalam Aksi

:::usecases
**Strategi model-per-agen**
Agen Anda memiliki kebutuhan berbeda
---
Agen code-review menggunakan Claude Opus (penalaran terbaik); peringkas email menggunakan Haiku (cepat dan murah); agen pribadi/privat berjalan di Ollama secara lokal.
===
**Failover gangguan penyedia**
Penyedia mengalami gangguan regional
---
Agen yang terpengaruh secara otomatis dirutekan ke fallback yang dikonfigurasi; tab Health menunjukkan agen mana yang berjalan di fallback dan memunculkan pemulihan setelah yang utama kembali.
===
**Pengurangan biaya**
Pengeluaran AI bulanan merangkak naik
---
Overview → Usage menunjukkan agen dan model mana yang mendominasi pengeluaran. Tukar agen dengan biaya teratas ke tier yang lebih murah (Sonnet → Haiku, GPT-4o → GPT-4o-mini); Lab dapat melakukan A-B terlebih dahulu untuk memastikan kualitas tetap terjaga.
:::

:::info
Penyedia default untuk agen baru diatur di Settings → Engine. Anda dapat menimpa di setiap agen.
:::

:::tip
Sebagian besar penyedia menawarkan kredit uji coba gratis. Hubungkan dua atau tiga dan jalankan prompt yang sama terhadap masing-masing di arena Lab — Anda akan merasakan perbedaan kepribadian dan memilih default yang sesuai dengan gaya Anda.
:::
  `,


  "system-requirements": `
## Persyaratan Sistem

Personas adalah aplikasi desktop Tauri — backend Rust, frontend React, database SQLite lokal — dan sengaja dibuat ringan. Sebagian besar komputasi berat terjadi di server penyedia AI, bukan di mesin Anda. Aplikasi idle hampir-nol CPU dan menggunakan beberapa ratus megabyte RAM; ia meningkat hanya ketika agen aktif berjalan secara lokal.

Binary yang disertakan sekitar 90 MB setelah pemasangan. Plugin (Artist untuk pembuatan gambar, Obsidian Brain untuk pencarian vektor) dapat menambah jejak itu jika Anda mengaktifkannya.

:::checklist
- Windows 10+, macOS 12+, atau Ubuntu 20.04+ (versi terbaru direkomendasikan)
- Minimal 4 GB RAM (8 GB+ direkomendasikan jika Anda menggunakan plugin embedding / pencarian vektor)
- 1 GB ruang disk kosong (lebih jika Anda mengaktifkan model lokal plugin Artist)
- Broadband stabil — eksekusi agen dibatasi oleh latensi API penyedia AI
- Setiap CPU dual-core modern; quad-core atau lebih baik direkomendasikan untuk run multi-agen paralel
:::

### Cara Kerjanya

Aplikasi menyimpan database-nya (\`personas.db\`), credential vault, riwayat eksekusi, dan konfigurasi secara lokal di direktori app-data khusus OS Anda. Tidak ada yang diunggah kecuali Anda secara eksplisit mengaktifkan deployment cloud atau menggunakan penyedia AI cloud. Plugin yang menyertakan model lokal (misalnya image-gen plugin Artist + Gemini vision) mengunduh file model pada penggunaan pertama.

Build Windows menggunakan ONNX Runtime untuk embedding ketika fitur vector-knowledge-base diaktifkan; ini adalah dependensi tunggal terbesar dalam kasus tersebut.

:::tip
Jika Anda melihat aplikasi terasa lambat selama run multi-agen, buka tab Health — ia menunjukkan agen mana dan dependensi mana (panggilan model, panggilan alat, inferensi ONNX) yang menyumbang ke beban.
:::
  `,

  "keyboard-shortcuts-and-tips": `
## Pintasan Keyboard dan Tips

Beberapa pintasan keyboard mencakup sebagian besar gesekan di aplikasi. \`Ctrl+K\` membuka pencarian global (temukan agen, halaman, atau pengaturan apa pun berdasarkan nama). \`Ctrl+1\`–\`Ctrl+9\` melompat ke bagian sidebar tingkat atas. \`Ctrl+Enter\` menjalankan agen yang difokuskan. \`Ctrl+N\` membuka alur Create Agent.

Anda dapat menyesuaikan binding apa pun di Settings → Appearance → Keyboard Shortcuts; default mengikuti konvensi OS jika memungkinkan.

### Pintasan Penting

:::keys
Ctrl+K — Pencarian global (temukan apa saja berdasarkan nama)
Ctrl+N — Buat agen baru
Ctrl+Enter — Jalankan agen yang difokuskan
Ctrl+S — Simpan perubahan di editor saat ini
Ctrl+/ — Toggle sidebar buka/tutup
Ctrl+, — Buka Settings
Ctrl+? — Tampilkan lembar contekan pintasan keyboard
:::

### Pintasan Navigasi

:::keys
Ctrl+1 — Home
Ctrl+2 — Overview
Ctrl+3 — Agents
Ctrl+4 — Events
Ctrl+5 — Connections
Ctrl+6 — Templates
Ctrl+7 — Plugins
Ctrl+Shift+P — Buka command palette (jalankan tindakan apa pun berdasarkan nama)
:::

### Cara Kerjanya

Command palette (\`Ctrl+Shift+P\`) adalah permukaan power-user. Ketik kata kerja (\`run\`, \`clone\`, \`disable\`, \`open\`) plus nama target, dan palette menampilkan tindakan yang cocok di seluruh workspace Anda. Ini lebih cepat daripada navigasi manual setelah Anda mengetahui nama dari hal-hal tersebut.

:::tip
Mulai dengan \`Ctrl+K\`. Ketik beberapa huruf dari nama agen dan tekan Enter — pintasan tunggal itu mencakup mungkin 60% navigasi sehari-hari.
:::
  `,

  "where-to-get-help": `
## Tempat Mendapatkan Bantuan

Anda tidak pernah terjebak sendiri. **Bantuan dalam aplikasi** adalah jalur tercepat: chat cockpit ("Talk to Athena" di title bar) adalah companion bertenaga LLM yang mengetahui pengaturan Anda, eksekusi terbaru Anda, dan produk. Tanyakan pertanyaan dalam bahasa Inggris sederhana dan ia juga dapat mengusulkan perubahan konfigurasi, menautkan Anda ke tab yang tepat, atau membuka sesi debug pada run yang gagal.

Untuk hal-hal yang tidak dapat dijawab companion dalam aplikasi, **guide** (situs ini) adalah referensi lengkap, **community Discord** adalah tempat Anda bertanya kepada pengguna lain dan tim, dan **dukungan email** adalah untuk masalah akun atau penagihan.

| Sumber Daya | Terbaik untuk | Waktu respons |
|----------|----------|---------------|
| Cockpit / Athena (dalam aplikasi) | Pertanyaan setup, debugging, "di mana X?" | Instan |
| Guide Ini | Referensi fitur dan how-to | Instan |
| Situs dokumentasi | Arsitektur, schema, integrasi tingkat lanjut | Instan |
| Komunitas Discord | Tips, recipe, "apakah ada orang lain yang melihat…?" | Menit |
| Email dukungan | Akun, penagihan, keamanan | Jam |
| Tutorial video | Walkthrough visual alur utama | Instan |

### Cara Kerjanya

Cockpit memiliki akses ke doctrine — kumpulan pengetahuan yang dikurasi tentang produk — dan ke status lokal Anda (anonim). Ia dapat mencari eksekusi Anda, merekomendasikan perubahan, dan bahkan menyusun kartu UI inline untuk memandu Anda melalui perbaikan langkah demi langkah. Jika tidak dapat menjawab, ia akan menyarankan sumber daya eksternal yang tepat.

:::tip
Untuk pertanyaan "Saya pikir ada yang rusak", buka Athena terlebih dahulu dan tanyakan "diagnose run gagal terakhir dari agen X". Alur debug cockpit dibangun untuk ini dan biasanya mengalahkan membaca log secara manual.
:::
  `,
};
