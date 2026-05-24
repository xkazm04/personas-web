export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Membuat Agen Baru

Anda memiliki dua cara untuk membuat agen baru. **Dari awal** — klik \`Create Agent\`, beri nama, dan tulis instruksi sendiri. **Dari template** — jelajahi galeri template, pilih yang sesuai dengan apa yang ingin Anda lakukan (pemrosesan invoice, laporan harian, posting sosial…), jawab beberapa pertanyaan singkat tentang kasus penggunaan spesifik Anda, dan biarkan build engine merakit agen untuk Anda. Sebagian besar orang mulai dengan template dan menyesuaikannya dari sana.

Apapun caranya, Anda akan memilih nama dan ikon, memilih model AI yang menjalankan agen, dan memilih alat (email, pencarian web, akses file, dll.) yang dapat digunakannya. Tidak ada pilihan ini yang permanen — Anda dapat mengubah pengaturan apa pun nanti.

:::steps
1. **Klik Create Agent** — dari sidebar atau home screen
2. **Pilih jalur** — mulai kosong, atau pilih template dari galeri
3. **Jawab pertanyaan build** — jika Anda memilih rute template; build engine menyesuaikan agen dengan jawaban Anda
4. **Beri nama agen Anda** — dan pilih ikon
5. **Sesuaikan prompt dan tools** — sempurnakan instruksi yang dihasilkan template (atau tulis dari awal)
6. **Promote saat siap** — agen berpindah dari draft ke active setelah Anda konfirmasi
:::

### Cara Kerjanya

Jalur template menjalankan sesi build interaktif: engine mengajukan pertanyaan klarifikasi tentang kasus penggunaan Anda, mengusulkan parameter (bentuk input, saluran output, irama jadwal), dan menampilkan pratinjau langsung dari agen yang akan dirakit. Anda menyetujui di akhir, dan agen tiba siap untuk diuji. Jalur dari-awal melewati semua itu — berguna ketika Anda sudah tahu persis apa yang ingin dilakukan agen.

:::tip
Nama agen yang baik menggambarkan tugas, bukan teknologinya. "Morning Email Summary" lebih berguna daripada "GPT Agent 3."
:::
  `,

  "writing-effective-prompts": `
## Menulis Prompt yang Efektif

Prompt adalah serangkaian instruksi yang Anda berikan kepada agen Anda. Prompt yang baik bersifat spesifik, konkret, dan teratur: definisikan peran agen, nyatakan tugas, jelaskan bentuk input, tentukan format output, dan sebutkan kasus tepi. Prompt yang samar menghasilkan output yang samar — "rangkum email saya" bekerja jauh lebih buruk daripada "baca lima email saya yang paling baru belum dibaca dan tulis ringkasan dua kalimat dari masing-masing, urutkan berdasarkan kepentingan pengirim."

Build engine membantu Anda di sini. Saat Anda mengadopsi template, engine mengajukan pertanyaan klarifikasi secara berkelompok per kapabilitas (sumber input, saluran output, format, frekuensi) dan menjalin jawaban Anda menjadi prompt terstruktur. Jika Anda menulis dari awal, Anda melakukan penjalinan itu sendiri — tetapi lima input yang sama itulah yang menghasilkan agen yang andal.

### Daftar Periksa Kualitas Prompt

:::checklist
- Definisikan peran — "Anda adalah X yang melakukan Y." Mengukuhkan perilaku model.
- Nyatakan tugas secara konkret — kata kerja, jumlah, jendela waktu. Hindari "bantu saya dengan…"
- Jelaskan input — bentuk apa, field apa, apa yang harus diabaikan agen
- Tentukan output — bullet vs paragraf vs JSON, dengan nama field jika terstruktur
- Tangani kasus tepi — apa yang harus dilakukan ketika input kosong, salah bentuk, atau tak terduga
- Gunakan contoh — bahkan satu pasangan input/output secara dramatis meningkatkan konsistensi
:::

### Cara Kerjanya

Setiap run membangun prompt dari template yang disimpan, payload trigger, dan setiap memori agen yang diizinkan untuk dikonsultasikan model. Model melihat prompt yang sama yang Anda tulis (dalam urutan yang Anda tulis) plus input — apa yang kembali adalah upaya jujurnya untuk mengikuti instruksi Anda. Tab trace dalam detail eksekusi menunjukkan prompt persis yang dikirim, sehingga ketika output melenceng, Anda dapat melihat apakah prompt atau input yang salah.

:::tip
Tulis prompt seolah-olah menjelaskan kepada kontraktor cerdas tapi baru. Jangan berasumsi apa pun. Pertama kali agen menghasilkan output, lihat trace dan tanyakan: "akankah kontraktor manusia memahami apa yang saya inginkan dari prompt ini?"
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Mode Prompt Simple vs Structured

Editor prompt menawarkan dua mode. **Simple mode** adalah kotak teks bebas tunggal — Anda mengetik prompt sebagai satu blok prosa. Cepat untuk agen kecil atau eksperimental. **Structured mode** memecah prompt menjadi lima bagian bernama (Identity, Instructions, Tools, Examples, Error Handling) sehingga Anda dapat memikirkan setiap masalah secara terpisah dan mengedit satu tanpa memengaruhi yang lain.

Anda dapat beralih antar mode kapan saja tanpa kehilangan pekerjaan. Editor mem-parse prosa simple-mode menjadi bagian terstruktur saat Anda beralih ke atas, dan menggabungkan bagian terstruktur kembali menjadi satu blok saat Anda beralih ke bawah.

:::compare
**Simple Mode**
Kotak teks tunggal. Prosa bentuk bebas. Cepat untuk drafting, cepat untuk iterasi. Terbaik untuk eksperimentasi dan agen pribadi di mana Anda satu-satunya pembaca.
---
**Structured Mode** [recommended for shared/production agents]
Lima bagian bernama — Identity, Instructions, Tools, Examples, Error Handling. Lebih lambat untuk drafting tetapi lebih mudah dipelihara. Setiap bagian dapat ditinjau dan diubah secara independen, yang penting ketika Anda (atau orang lain) meninjau agen kembali berbulan-bulan kemudian.
:::

:::info
Kedua mode menghasilkan prompt yang sama di balik layar saat runtime. Structured mode adalah overlay UX yang membantu Anda mengatur pemikiran Anda; model melihat prompt yang dirender dengan cara yang sama.
:::

### Cara Kerjanya

Beralih mode tidak merusak: editor menyimpan representasi terstruktur secara internal, dan simple-mode adalah tampilan rata darinya. Riwayat versi mempertahankan mode mana pun yang Anda simpan, jadi memulihkan versi lama juga mengembalikan mode tempat ia dibuat.

:::tip
Mulailah di simple mode saat Anda mencari tahu apa yang harus dilakukan agen. Setelah Anda puas dengan perilakunya, beralihlah ke structured mode untuk jangka panjang — itu terbayar pertama kali Anda perlu mengubah hanya bagian Examples tanpa membaca ulang seluruh prompt.
:::
  `,

  "structured-prompt-sections-explained": `
## Bagian Structured Prompt Dijelaskan

Structured mode membagi prompt menjadi lima bagian. Masing-masing memiliki tugas spesifik, dan build engine menggunakan lima bucket yang sama saat menghasilkan prompt dari template — jadi bagian-bagian itu bukan keanehan UI, mereka adalah kontrak stabil antara authoring Anda dan bagaimana model melihat agen.

### Lima Bagian

:::diagram
[Identity] --> [Instructions] --> [Tools] --> [Examples] --> [Error Handling]
:::

- **Identity** — siapa agen itu. Peran, kepribadian, area keahlian, gaya komunikasi. Baris "you are a…".
- **Instructions** — apa yang dilakukan agen, langkah demi langkah. Tugas inti dan setiap sub-tugas, dalam urutan yang harus terjadi.
- **Tools** — kapabilitas mana yang digunakan agen dan cara menggunakannya. Kapan memanggil alat mana, argumen apa yang penting, apa yang harus dilakukan dengan hasil.
- **Examples** — pasangan input/output yang menunjukkan seperti apa "baik" itu. Bagian yang paling kurang dimanfaatkan dan salah satu yang paling berdampak — satu contoh solid mengalahkan tiga kalimat instruksi lebih lanjut.
- **Error Handling** — apa yang harus dilakukan ketika input hilang, salah bentuk, atau tak terduga. Di mana berhenti, apa yang harus dicoba ulang, apa yang harus dieskalasi ke tinjauan manual.

### Cara Kerjanya

Renderer menggabungkan bagian-bagian dalam urutan yang ditampilkan, dengan pembatas yang jelas. Beberapa model lebih memperhatikan bagian awal; urutan dirancang untuk menempatkan peran dan tugas inti pertama, dengan contoh dan penanganan error di bawah di mana mereka masih dalam konteks tetapi tidak melarutkan headline. Jika Anda menggunakan structured prompt untuk pertama kalinya, isi Identity dan Instructions segera dan biarkan yang lain kosong — model akan bekerja dengan baik, dan Anda dapat menambahkan Examples / Error Handling saat kasus tepi muncul.

:::tip
Ketika agen mulai menghasilkan kegagalan kasus tepi, lihat trace dan tanyakan: "bisakah saya mencegah ini dengan sebuah contoh?" Sebagian besar masalah "agen buruk dalam X" sebenarnya adalah "Saya tidak pernah menunjukkan padanya seperti apa X yang baik".
:::
  `,

  "agent-settings-and-limits": `
## Pengaturan dan Batasan Agen

Tab Settings di editor agen adalah tempat Anda meletakkan pengaman. Setiap agen memiliki batasan tentang berapa lama berjalan, berapa biaya per run, berapa banyak giliran model yang dapat diambilnya, dan berapa banyak salinan yang dapat berjalan secara paralel. Default bersifat konservatif — cukup untuk membiarkan pekerjaan nyata terjadi, cukup rendah agar agen yang berperilaku buruk tidak dapat menumpuk tagihan sebelum Anda menyadarinya.

Batasan terutama penting untuk agen tanpa pengawasan (terjadwal, terpicu webhook, terpicu rantai). Run manual Anda lihat terjadi; run terjadwal Anda tidak, jadi prompt yang lepas kendali dapat menyala setiap jam selama seminggu sebelum Anda memeriksanya.

### Pengaturan Kunci

- **Timeout** — total waktu wall-clock sebelum run dimatikan. Default 2 menit, naikkan untuk model yang lambat atau rantai tool-use yang panjang.
- **Budget cap** — biaya maksimum per run, dievaluasi terhadap meteran biaya langsung; run berhenti dengan anggun ketika melewati batas.
- **Max turns** — jumlah round-trip model ↔ alat yang diizinkan dalam satu run. Mencegah loop panggilan alat di mana model tidak pernah konvergen.
- **Concurrency** — berapa banyak eksekusi paralel dari agen ini yang diizinkan. Atur ke 1 untuk agen stateful (agar tidak tumpang tindih pada input yang sama); naikkan untuk pekerjaan batch paralel.
- **Memory access** — apakah agen membaca dari memory store-nya saat runtime (default aktif untuk agen yang memiliki memori diaktifkan).
- **Failover provider** — penyedia AI alternatif untuk digunakan ketika yang utama mengembalikan error di atas ambang batas. Atur pada agen yang Anda pedulikan uptime-nya.

### Cara Kerjanya

Batasan diterapkan oleh execution engine, bukan model. Ketika sebuah run mencapai batas, ia berhenti dengan bersih — trace parsial dipertahankan, run ditandai dengan alasannya (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`), dan tidak ada biaya atau perubahan status yang bertahan untuk bagian yang dipotong. Tab Health memunculkan penghentian batas sebagai peringatan sehingga Anda dapat memutuskan apakah akan menaikkan batas atau memperbaiki prompt yang mendasarinya.

:::tip
Mulai dengan batasan konservatif di setiap agen baru. Momen termurah untuk menemukan prompt yang lepas kendali adalah pada run manual ketiga, bukan pada run terjadwal semalam ketiga.
:::
  `,

  "assigning-tools-to-agents": `
## Menetapkan Alat ke Agen

Alat itu seperti aplikasi di telepon — agen Anda hanya dapat menggunakan yang Anda pasang. Dengan menetapkan alat tertentu, Anda mengendalikan persis apa yang dapat dilakukan agen Anda. Agen dengan akses email dapat membaca dan mengirim pesan; yang memiliki pencarian web dapat mencari hal-hal secara online.

:::warning
Ini juga merupakan fitur keamanan. Agen tidak dapat secara tidak sengaja memodifikasi file jika tidak memiliki akses file, dan tidak dapat mengirim email jika tidak memiliki alat email. Anda selalu memegang kendali atas apa yang dapat dan tidak dapat disentuh oleh agen Anda.
:::

### Jenis Alat yang Tersedia

- **Email** — baca, draf, dan kirim pesan email
- **Web search** — cari informasi di internet
- **File access** — baca dan tulis file di komputer atau penyimpanan cloud Anda
- **API calls** — berinteraksi dengan layanan dan database eksternal
- **Clipboard** — baca dari dan tulis ke clipboard Anda
- **Messaging channels** — kirim hasil ke Slack, Discord, Teams, atau endpoint webhook generik mana pun sebagai bagian dari output agen

### Cara Menetapkan Alat

:::steps
1. **Buka tab Connectors** — di editor agen; menampilkan setiap kapabilitas yang dibutuhkan agen Anda terhadap vault Anda
2. **Pilih kategori, bukan layanan tertentu** — pilih "email" atau "cloud storage" dan pemilih menampilkan kredensial yang cocok yang sudah Anda miliki plus connector yang disarankan jika Anda tidak memilikinya
3. **Otorisasi apa pun yang baru** — untuk layanan OAuth, Anda akan mengklik melalui layar persetujuan satu kali; kredensial yang dihasilkan tiba di vault Anda dan dapat digunakan kembali di seluruh agen
4. **Pre-flight check** — sebelum Anda promote agen, build engine memeriksa silang setiap kapabilitas yang diperlukan terhadap vault dan menandai apa pun yang hilang
5. **Simpan konfigurasi** — agen menggunakan alat yang ditetapkan pada run berikutnya; jika kredensial kemudian kedaluwarsa, Anda akan melihatnya di indikator kesehatan agen
:::

:::tip
Hanya tetapkan alat yang benar-benar dibutuhkan agen Anda. Lebih sedikit alat berarti lebih sedikit hal yang dapat salah, dan agen Anda tetap fokus pada pekerjaannya.
:::
  `,

  "prompt-version-history": `
## Riwayat Versi Prompt

Setiap penyimpanan prompt agen menciptakan versi yang tidak dapat diubah. Riwayat tinggal di sebelah editor prompt di tab Prompt — buka dan Anda akan melihat setiap penyimpanan, dengan timestamp, dengan diff terhadap versi sebelumnya terlihat secara inline. Tidak ada batas; versi pertama dipertahankan tanpa batas waktu.

Sistem juga melakukan versi-otomatis ketika build engine memodifikasi prompt (misalnya selama adopsi template atau pembangunan ulang parameter), sehingga perubahan dari engine muncul di samping pengeditan manual Anda dengan label "auto-generated" yang jelas.

### Poin Kunci

- **Snapshot otomatis** pada setiap penyimpanan — pengeditan manual maupun pengeditan engine
- **Pemulihan satu klik** — memilih versi apa pun dan menjadikannya prompt saat ini; versi saat ini disimpan terlebih dahulu, jadi pemulihan tidak pernah hilang
- **Diff inline** — lihat apa yang berubah antara dua versi tanpa meninggalkan tab
- **Retensi tak terbatas** — versi tidak pernah kedaluwarsa atau di-garbage-collect

### Cara Kerjanya

Riwayat disimpan dalam database SQLite lokal (di samping agen itu sendiri), sehingga segera dapat dicari dan berfungsi secara offline. Ketika Anda memulihkan sebuah versi, editor beralih ke versi itu tetapi versi saat ini sebelumnya juga dipertahankan — Anda dapat membaliknya kembali tanpa mengulangi pekerjaan Anda.

:::tip
Sebelum perubahan prompt yang berisiko, lakukan penyimpanan no-op sehingga status saat ini di-checkpoint dalam riwayat. Kemudian bereksperimenlah dengan bebas — memulihkan adalah satu klik jika eksperimen gagal.
:::
  `,

  "comparing-prompt-versions": `
## Membandingkan Versi Prompt

Ketika perilaku agen berubah dan Anda ingin tahu mengapa, tampilan diff pada riwayat versi menunjukkan karakter mana dari prompt yang berbeda antara dua versi mana pun. Penambahan disorot hijau, penghapusan merah. Ini adalah cara tercepat untuk melokalkan regresi — Anda biasanya dapat melihat perubahan yang menyebabkan masalah dalam hitungan detik.

Diff juga menghormati bagian structured-prompt: jika Anda membandingkan dua versi structured-mode, diff dipisahkan per bagian sehingga Anda dapat mengabaikan bagian yang tidak relevan dan fokus pada yang berubah.

:::code-compare
### Original
Summarize the emails in my inbox.
Give me the key points.
---
### Improved
Read my 5 most recent unread emails.
For each email, write a 2-sentence summary
including the sender name and action needed.
Format as a numbered list.
:::

### Poin Kunci

- **Tampilan berdampingan** — kedua versi terlihat sekaligus dengan penyorotan tingkat karakter
- **Diff per-bagian** untuk structured prompt — lompat langsung ke bagian yang berubah
- **Bandingkan dua versi mana pun** — bukan hanya yang berurutan; berguna untuk "apa yang berubah sejak versi yang berfungsi tiga minggu lalu"
- **Pemulihan cepat** — pulihkan salah satu versi langsung dari tampilan diff

### Cara Kerjanya

Buka riwayat versi di tab Prompt, centang kotak di sebelah dua versi, dan klik Compare. Diff dirender di panel berdampingan. Klik Restore di kedua sisi untuk menjadikannya yang saat ini; diff tetap terbuka sehingga Anda dapat melihat persis apa yang Anda kembalikan.

:::tip
Ketika Anda menemukan perubahan yang menyebabkan masalah dalam diff, salin versi *baru* (yang rusak) ke dalam prompt dan terus edit — dengan begitu riwayat versi mencatat niat Anda ("mencoba X, kembali ke Y, kemudian disempurnakan ke Z"). Memulihkan tanpa meninggalkan jejak kehilangan pelajaran.
:::
  `,

  "cloning-and-duplicating-agents": `
## Mengkloning dan Menduplikasi Agen

Mengkloning menyalin konfigurasi lengkap agen ke agen baru: prompt (termasuk riwayat versi), alat, trigger, pengaturan, flag akses memori, failover provider, semuanya kecuali state runtime (eksekusi, biaya, dan trigger langsung tidak ikut). Klon sepenuhnya independen — pengeditan di kedua sisi tidak memengaruhi yang lain.

Penggunaan paling umum adalah forking agen yang berfungsi untuk bereksperimen dengan aman. Yang asli tetap berproduksi; klon adalah sandbox Anda. Jika eksperimen bagus, Anda dapat menggantikan yang asli atau mempertahankan klon sebagai spesialisasi.

### Poin Kunci

- **Konfigurasi lengkap ikut** — prompt, tools, triggers, settings, memory, failover
- **State runtime tidak** — eksekusi, biaya, trigger langsung milik satu agen pada satu waktu
- **Trigger dikloning tetapi dinonaktifkan** — agar klon tidak segera menyala pada schedule/webhook yang sama seperti yang asli
- **Agen yang dikloning mendapat sufiks "(Copy)"** secara default; ganti nama sebelum mempromote

### Cara Kerjanya

Klik kanan agen di sidebar atau gunakan menu tiga-titik di toolbar editor, dan pilih \`Clone\`. Agen baru muncul di grup yang sama dengan trigger yang dinonaktifkan. Aktifkan ulang dengan sengaja (dan perbarui konfigurasinya jika Anda tidak ingin klon mendengarkan URL webhook yang sama dengan yang asli, misalnya).

:::tip
Mengkloning adalah cara teraman untuk melakukan A-B perubahan prompt tanpa mengganggu agen yang sudah dalam produksi. Buat perubahan di klon, jalankan keduanya di arena Lab pada input yang sama, dan hanya tukar agen produksi setelah klon menang.
:::
  `,

  "agent-groups-and-organization": `
## Grup dan Organisasi Agen

Agen di sidebar diorganisasikan menurut grup — folder Anda sendiri untuk menyusun berdasarkan tim, proyek, fungsi, atau apa pun yang Anda anggap berguna. Kosong secara default; Anda menambahkan grup saat koleksi Anda tumbuh dan daftar datar berhenti diskalakan.

Sidebar juga mendukung grup bersarang (satu tingkat sarang), penyusunan ulang drag-and-drop, status collapse/expand yang bertahan di seluruh sesi, dan ikon per-grup untuk pengenalan visual cepat.

### Poin Kunci

- **Buat grup** sesuai kebutuhan — tidak ada batas jumlah
- **Seret untuk reorganisasi** — jatuhkan agen pada grup untuk memindahkannya, atau atur ulang daftar dengan menjatuhkan antara saudara
- **Ikon dan warna per-grup** — pilih ikon yang mengisyaratkan tema grup sehingga Anda menemukan grup yang tepat dengan sekilas
- **Collapse untuk membersihkan** — grup yang dilipat tetap dilipat di seluruh sesi sehingga daftar panjang tidak melawan Anda saat startup
- **Sarang satu tingkat** — berguna untuk "Personal > Email", "Work > Research", dll.

### Cara Kerjanya

Klik kanan di sidebar agen untuk menambahkan grup, atau seret grup yang ada ke yang lain untuk menyarangkannya. Grup dipersistenkan di database lokal dan tidak memengaruhi eksekusi agen — mereka murni adalah lapisan organisasi. Agen dapat berada dalam satu grup pada satu waktu tetapi bergerak bebas di antara mereka.

:::tip
Grup "Drafts" atau "Experimental" di bagian atas sidebar Anda adalah pola yang berguna. Apa pun yang masih Anda iterasi tinggal di sana, dan agen produksi Anda tetap berada di grup yang diberi nama jelas di bawahnya. Pemisahan visual mengurangi kemungkinan mengedit agen yang salah.
:::
  `,

  "disabling-and-archiving-agents": `
## Menonaktifkan dan Mengarsipkan Agen

Dua cara untuk menjeda agen tanpa menghapusnya. **Disable** menghentikan semua trigger agar tidak menyala dan memblokir run manual; agen tetap terlihat di sidebar dengan ikon yang diredupkan sehingga Anda ingat agen itu ada. **Archive** memindahkan agen ke bagian arsip tersembunyi jauh dari penggunaan sehari-hari; ia berhenti memicu, tidak diperhitungkan terhadap batas tier, dan dapat dipulihkan kapan saja.

Tidak ada operasi yang menyentuh eksekusi, pengaturan, atau riwayat versi. Archive lebih berat — gunakan untuk agen yang Anda selesaikan untuk saat ini tetapi mungkin Anda inginkan kembali. Disable lebih ringan — gunakan ketika Anda perlu menghentikan agen untuk sementara tanpa kehilangannya dari tampilan.

### Poin Kunci

- **Disable** — jeda eksekusi; agen masih terlihat di sidebar; re-enable satu klik
- **Archive** — sembunyikan agen dan bebaskan slotnya terhadap batas tier Anda; dapat dipulihkan selamanya
- **Tidak ada yang dihapus** — pengaturan, riwayat prompt, dan eksekusi masa lalu dipertahankan
- **Trigger menghormati disable** — agen yang dinonaktifkan mengabaikan event schedule/webhook/file-watcher; mereka tidak antri untuk replay saat di-enable kembali

### Cara Kerjanya

Buka menu tiga titik di toolbar editor agen atau klik kanan agen di sidebar. Disable / Archive / Restore semua tinggal di sana. Agen yang diarsipkan dapat diakses dari bagian Archive di bagian bawah sidebar agen; memulihkan menempatkan agen kembali di grup aslinya (atau di bucket "Ungrouped" jika grup telah dihapus sementara itu).

:::tip
Arsipkan agen musiman (laporan triwulanan, alur kerja liburan, rekonsiliasi akhir bulan) alih-alih menghapus. Pulihkan ketika musim datang kembali dan mereka siap untuk dijalankan segera.
:::
  `,

  "agent-health-indicators": `
## Indikator Kesehatan Agen

Setiap agen memiliki titik berwarna kecil di sebelah namanya yang memberi tahu Anda statusnya dengan sekilas. **Hijau** berarti semuanya berjalan lancar. **Kuning** berarti ada yang membutuhkan perhatian Anda — mungkin kredensial akan kedaluwarsa atau run baru-baru ini memiliki peringatan. **Merah** berarti ada masalah yang perlu diperbaiki.

Indikator ini menyelamatkan Anda dari keharusan memeriksa setiap agen secara individual. Pandangan cepat ke sidebar Anda memberi tahu Anda kesehatan dari seluruh pengaturan Anda.

:::feature
**Pemantauan Kesehatan Sekilas**
Personas terus melacak hasil eksekusi, kedaluwarsa kredensial, dan kelengkapan konfigurasi untuk setiap agen. Indikator kesehatan diperbarui secara otomatis — tidak diperlukan pemeriksaan manual.
:::

### Apa Arti Setiap Warna

| Warna | Status | Arti |
|---|---|---|
| **Hijau** | Sehat | Semua run terbaru berhasil, tidak ada masalah terdeteksi, setup lengkap |
| **Kuning** | Peringatan | Ada yang mungkin perlu perhatian segera (kredensial kedaluwarsa, kinerja lambat, setup sebagian selesai) |
| **Merah** | Error | Agen gagal baru-baru ini atau memiliki masalah konfigurasi |
| **Abu-abu** | Tidak Aktif | Dinonaktifkan atau tidak pernah dijalankan |

### Status Setup

Bersama dengan kesehatan, setiap agen memiliki **setup status** yang menunjukkan seberapa siap ia untuk berjalan secara otonom. Agen yang baru di-promote sering kali memiliki celah setup — kredensial yang hilang, trigger yang tidak dikonfigurasi, saluran output yang masih dirangkai. Badge setup status memunculkan persis apa yang tersisa untuk dilakukan, dalam urutan prioritas, sehingga Anda tidak perlu memburu melalui tab untuk mencari tahu apa yang menghalangi. Agen dengan masalah setup yang persisten secara otomatis ditarik keluar dari rotasi terjadwal atau terpicu oleh circuit-breaker, jadi Anda tidak akan pernah memiliki agen yang setengah dikonfigurasi berjalan diam-diam terhadap data buruk.

### Cara Kerjanya

Kesehatan dihitung secara otomatis berdasarkan hasil eksekusi terbaru, status kredensial, dan kelengkapan konfigurasi. Klik pada indikator untuk melihat ringkasan apa yang menyebabkan status saat ini — termasuk setiap celah setup. Dari sana, Anda dapat melompat langsung ke pengaturan, log, atau tab spesifik yang membutuhkan perhatian.

:::tip
Jadikan kebiasaan untuk memindai warna sidebar Anda sekali sehari. Menangkap indikator kuning sejak dini mencegahnya menjadi merah — dan menyelesaikan celah setup tepat setelah promote adalah momen termurah untuk melakukannya.
:::
  `,
};
