export const content: Record<string, string> = {
  "meet-athena": `
## Berkenalan dengan Athena

Athena adalah companion bawaan Personas — selalu tersedia, selalu dalam konteks. Ia bukan sekadar chatbot yang ditempel di sisi aplikasi. Ia mengenal agen Anda, tujuan Anda, memori Anda, dan ia benar-benar dapat mengoperasikan aplikasi atas nama Anda.

Ia hadir di dua tempat sekaligus. **Avatar footer** — wajah animasinya di sudut kanan bawah — adalah titik masuk: ketuk untuk membuka panel chat, atau tekan dan tahan untuk mendiktekan pesan suara tanpa panel pernah terbuka. **Orb mengambang** adalah bentuk keduanya: overlay yang dapat diseret dan mengambang di atas pekerjaan Anda agar Ia tetap dapat dijangkau di mana pun Anda berada di aplikasi. Saat orb diaktifkan (default), footer memanggil dan menutup orb; ketukan pada orb sendiri membuka panel chat penuh.

Kedua tampilan mencerminkan apa yang sedang dilakukan Athena secara sekilas. Saat sedang berpikir, avatar-nya berubah postur. Saat berbicara, orb bersinar sesuai tingkat suaranya. Ketika tugas latar belakang selesai, orb menampilkan reaksi singkat. Ini bukan sekadar estetika — mereka memberi tahu Anda kondisinya tanpa mengharuskan Anda membuka panel.

Kemampuan Athena jauh melampaui menjawab pertanyaan. Ia dapat menjawab pertanyaan dan menjelaskan fitur, tentu saja, tetapi ia juga dapat menavigasi aplikasi untuk Anda, menjalankan agen Anda, mengarsipkan memori, mengusulkan pembaruan identitas, dan menjadwalkan check-in di masa depan. Ketika mode otonom aktif, ia dapat merangkai beberapa langkah tanpa klik dari Anda.

### Poin Kunci

- **Avatar footer** — ketuk untuk membuka/menutup panel chat; tekan dan tahan untuk mendiktekan pesan suara dari mana saja
- **Orb mengambang** — overlay yang dapat diseret, dua gestur yang sama; meluncur ke setiap area selama panduan walkthrough
- **Mengoperasikan aplikasi** — Athena tidak hanya memberi saran; ia dapat menavigasi rute, menjalankan agen, dan menyusun dashboard
- **Selalu dalam konteks** — ia membaca memori, tujuan, dan status agen Anda sebelum setiap balasan, sehingga tidak pernah mulai dari nol
- **Titik awal** — topik-topik di bagian Companion ini masing-masing membahas lebih dalam: chat, suara, memori, check-in proaktif, panduan walkthrough, Decision Hub, dan menjalankan aplikasi melalui chat

:::tip
Jika Anda menutup panel chat, Athena tetap bekerja. Tugas latar belakang berjalan di orb, dorongan proaktif masih tiba, dan balasan suara masih diputar — panel yang tertutup tidak menghentikannya.
:::
  `,

  "chatting-with-athena": `
## Berchat dengan Athena

Buka panel dan Athena menyambut Anda dengan **layar selamat datang** — avatar-nya, salam singkat, dan sekumpulan **chip prompt awal** yang mencakup titik mulai paling umum. Klik chip mana pun dan pesan langsung terkirim; Anda tidak perlu mengetik.

Untuk prompt siap pakai di luar set awal, ketik \`/\` sebagai karakter pertama pesan kosong. Sebuah **palet slash** terbuka di atas composer dengan prompt preset yang dapat Anda saring dengan mengetik: **get to know me** (wawancara masuk yang mem-bootstrap memori Athena tentang Anda), **show goals**, **what's queued**, **recent decisions**, **live ops**, **memory recap**, dan **capabilities**. Tombol panah menavigasi daftar, Enter memilih item yang disorot, Escape membersihkan dan menutup.

Saat Athena membalas, ia sering menambahkan **chip balasan cepat** — dua hingga lima prompt lanjutan yang sesuai dengan arah percakapan. Klik salah satu untuk mengirimkannya sebagai pesan berikutnya. Di bawah balasan selesai terbaru Anda juga mendapat tiga **chip penyempurnaan**: **Shorter**, **More detail**, dan **Code only**. Masing-masing mengirim ulang pesan terakhir Anda dengan akhiran pengarah sehingga Anda dapat membentuk balasan tanpa mengetik ulang.

Composer tetap terbuka saat Athena menjawab. Anda dapat mengetik kapan saja — jika pesan Anda terdengar seperti pengalihan ("sebenarnya, berhenti" atau "tunggu, sebagai gantinya…") ia akan menginterupsi balasan yang sedang berjalan dan mengantri permintaan baru Anda. Jika terdengar tambahan ("dan juga…") ia mengantri di belakang balasan saat ini dan berjalan setelahnya. Anda akan melihat pesan yang diantri sebagai chip kecil di atas composer; Anda dapat membatalkan salah satunya.

**Mode otonom** (ikon ∞ di header panel) memungkinkan Athena merangkai pekerjaan multi-langkah sendiri. Ketika aktif dan ia masih punya pekerjaan, ia menjadwalkan giliran lanjutan sekitar lima belas detik kemudian, hingga dua puluh giliran berturut-turut. Pemisah tipis dalam transkrip menandai setiap kelanjutan otonom sehingga Anda dapat melihat sekilas di mana Anda berhenti dan di mana ia mengambil alih.

### Poin Kunci

- **Layar selamat datang** — chip awal mengirimkan pesan nyata melalui pipeline yang sama seperti yang diketik
- **Palet slash** — ketik \`/\` untuk menjelajahi prompt preset; saring dengan mengetik, pilih dengan Enter
- **Chip balasan cepat** — 2–5 opsi lanjutan yang Athena tawarkan di akhir balasannya
- **Chip penyempurnaan** — Shorter / More detail / Code only; hanya di bawah balasan selesai terbaru
- **Pengalihan di tengah jawaban** — ketik saat ia menjawab; diklasifikasikan sebagai interupsi atau antrian secara otomatis
- **Mode otonom** — Athena merangkai hingga 20 giliran pekerjaan mandiri; pesan apa pun dari Anda membatalkan rantai

:::tip
Prompt palet slash diterjemahkan ke semua 14 bahasa yang didukung — jika Anda menggunakan Personas dalam bahasa selain Inggris, pesan preset tiba dalam bahasa lokal Anda dan Athena membalasnya dalam bahasa yang sama.
:::
  `,

  "voice-and-hold-to-talk": `
## Suara dan Hold-to-Talk

Athena mendukung suara dua arah penuh: Anda mendiktekan, ia mentranskripsikan dan membalas, dan jawabannya diputar dalam suara sintetis. Setiap bagian pipeline memiliki opsi privasi.

### Mendiktekan ke Athena

**Tekan dan tahan** avatar footer atau orb mengambang selama sekitar seperempat detik. Badge mikrofon dan denyut muncul, dan transkrip sementara ditampilkan sebagai teks di samping orb. Lepas saat Anda selesai berbicara — transkrip diserahkan ke Athena dan pipeline balasan biasa berjalan. Balasan mengalir ke panel dan, jika mesin suara dikonfigurasi, diputar secara otomatis. Panel tidak perlu dibuka; giliran suara berfungsi dengan panel sepenuhnya tertutup.

**Pintasan keyboard global Cmd/Ctrl+Shift+A** memanggil Athena dari mana saja di aplikasi dan memulai giliran suara dalam satu tombol. Tekan pintasan lagi untuk mengirim, atau Esc untuk membatalkan tanpa mengirim. Ini menggunakan sesi yang sama dengan menahan orb — pintasan di tengah walkthrough sama dengan menahan orb.

### Mesin speech-to-text

Dua mesin tersedia, dipilih di **Companion → Voice** di bawah panel STT:

:::compare
**Browser (default)**
Menggunakan Web Speech API di renderer aplikasi. Tidak diperlukan setup. Di Windows, audio diteruskan ke layanan speech cloud vendor OS — praktis tetapi tidak di perangkat.
---
**Local Whisper**
Transkripsi di perangkat melalui sidecar \`whisper-cli\`. Audio tidak pernah meninggalkan mesin Anda. Memerlukan pengunduhan model Whisper dan menempatkan binary di jalur yang diharapkan (tab Voice menampilkan lokasi tepat dan status unduhan).
:::

### Mesin pemutaran suara

Saat Athena membalas, ringkasan yang diucapkan dapat berasal dari salah satu dari dua mesin suara:

:::compare
**ElevenLabs (cloud)**
Sintesis berkualitas tinggi menggunakan kredensial API ElevenLabs dan ID suara yang Anda pilih. Penyetelan per-suara: stabilitas, kemiripan, gaya, dan kecepatan. Kredensial disimpan di vault Anda; API key tidak pernah mencapai renderer aplikasi.
---
**Piper (ONNX lokal)**
Sintesis di perangkat tanpa panggilan jaringan saat sintesis dan tanpa kredensial yang diperlukan. Suara diunduh dari katalog terkurasi sekitar 17 suara dalam 14 bahasa. Tab Voice menampilkan mana yang terinstal.
:::

### Dorongan proaktif yang diucapkan

Check-in proaktif (tujuan yang mendekati batas, kegagalan agen, pengingat) juga dapat diucapkan — bahkan ketika panel chat tertutup. Arrival-TTS menyala saat dorongan tiba, menggunakan mesin yang telah Anda konfigurasikan. Tombol **Play it again** di footer memutar ulang pesan suara terakhir jika Anda melewatkannya.

:::tip
Jika Anda menginginkan suara tanpa panggilan cloud sama sekali, padukan Whisper lokal untuk diktat dengan Piper untuk pemutaran. Keduanya berjalan sepenuhnya di perangkat. Tab Voice menampilkan jalur instalasi dan browser model untuk setiap mesin.
:::
  `,

  "athenas-long-term-memory": `
## Memori Jangka Panjang Athena

Athena mengingat Anda lintas sesi. Ia tidak mulai dari batu tulis kosong setiap kali Anda membuka panel — ia membaca memorinya tentang Anda sebelum setiap balasan dan menggunakannya untuk memberikan jawaban yang sesuai dengan situasi nyata Anda.

### Apa yang diingatnya

Memori diorganisir ke dalam tingkatan, masing-masing mencakup jenis pengetahuan yang berbeda:

- **Fakta** — hal-hal yang telah dipelajarinya tentang Anda, proyek Anda, dan dunia. "Anda lebih suka ringkasan singkat." "Cabang utama repo ini adalah master."
- **Preferensi prosedural** — aturan perilaku yang telah dipelajarinya. "Saat meringkas dokumen panjang, mulailah dengan poin utama satu kalimat." "Untuk contoh kode, lebih suka TypeScript."
- **Tujuan** — tujuan aktif dan tanggal target yang dilacaknya atas nama Anda.
- **Profil identitas** — dokumen \`identity.md\` yang terus berkembang dan dibaca ke setiap prompt sistem. Ini adalah sumber tunggal "siapa Anda bagi Athena saat ini" dan berkembang melalui pengeditan terarah, bukan penulisan ulang menyeluruh.
- **Episode** — riwayat percakapan itu sendiri, disimpan sebagai file markdown di mesin Anda. Doctrine (dokumen referensi Personas sendiri) mengisi pengetahuan produk.

### Memulai dengan wawancara masuk

Pada instalasi baru Athena secara otomatis menjalankan wawancara singkat — beberapa pertanyaan terfokus yang memberinya cukup bahan untuk menulis profil identitas awal. Anda dapat menjalankan ulang wawancara kapan saja dengan memilih **get to know me** dari palet slash atau mengklik chip yang sesuai di layar selamat datang. Jika profil identitas sudah ada, ia memperbaruinya dengan diff terarah; ia tidak pernah menghapus konteks yang Anda berikan sebelumnya.

### Browser Memori

Buka **Companion → Memory** untuk melihat semua yang diketahui Athena. Brain Viewer mencantumkan episode, fakta, preferensi prosedural, tujuan, dan dokumen identitas — semuanya dapat dijelajahi. Klik entri mana pun untuk membaca konten lengkap, ikuti memori yang tertaut ke entri terkait, dan edit atau koreksi apa pun yang salah.

**Koreksi hanya dengan satu klik.** Setiap poin dalam tampilan identitas memiliki kemampuan "Itu salah". Klik dan Athena mencatat koreksi sebagai sinyal pembelajaran bernilai tinggi dan mengusulkan penghapusan poin yang salah dalam satu kartu persetujuan. Anda menyetujui dan klaim yang salah hilang.

### Privasi

Data otak — semua lima tingkatan memori — tinggal di mesin Anda di \`~/.personas/companion-brain/\`. Tidak ada yang disimpan di database cloud. Jika Anda menggunakan mesin STT Whisper lokal dan TTS Piper, tidak ada audio yang meninggalkan mesin Anda juga.

:::tip
Wawancara masuk singkat (beberapa menit) dan langsung memberikan manfaat — beberapa balasan pertama Athena setelah masuk yang baik terasa jauh lebih tepat sasaran. Jalankan sebelum sesi nyata pertama Anda.
:::
  `,

  "proactive-check-ins": `
## Check-In Proaktif

Athena tidak menunggu Anda bertanya. Ketika ada sesuatu yang layak perhatian Anda — tenggat waktu yang mendekat, agen yang menunggu, pengingat yang Anda tetapkan — ia menghubungi terlebih dahulu. Ini adalah check-in proaktif: kartu yang muncul di panel chat, opsional diucapkan dengan keras, tanpa Anda membuka apa pun.

### Apa yang memicu check-in

Athena mengevaluasi kondisi sekitar setiap lima menit. Pemicu yang dapat menghasilkan check-in meliputi:

- **Batas tujuan yang mendekat** — tujuan aktif memiliki tanggal target dalam 24 jam
- **Penuaan backlog** — komitmen self-promise belum ditangani melewati ambang tingkatan (meningkat dari 1 hari ke 3 hari ke 7 hari)
- **Cadence jatuh tempo** — ritual yang Anda tetapkan (check-in berulang, jendela fokus) cocok dengan "sekarang"
- **Hari ini** — catatan atau refleksi dari hari kalender yang sama satu bulan, tiga bulan, atau satu tahun yang lalu, dicocokkan dengan tujuan aktif Anda
- **Agen membutuhkan Anda** — sesi fleet gagal, telah menunggu input lebih dari dua menit, atau menjadi basi
- **Komitmen Athena sendiri** — check-in terjadwal yang diusulkan Athena dan Anda setujui dalam percakapan, dikirimkan tepat pada waktu yang ia janjikan

### Pengaman

Sistem dirancang untuk berguna tanpa mengganggu:

- **Jam tenang** — dorongan ditahan selama jendela tenang mana pun yang Anda konfigurasikan; tidak ada yang menyala saat Anda secara eksplisit meminta keheningan
- **Anggaran harian** — secara default Athena mengirim paling banyak tiga dorongan per hari dari jenis yang dipicu; jika Anda secara konsisten mengabaikan jenis dorongan tertentu, anggaran untuk jenis itu berkurang secara diam-diam seiring waktu
- **Deduplikasi** — pemicu yang sama untuk subjek yang sama hanya dapat menyala sekali sampai Anda menyelesaikannya; agen yang gagal tidak akan menghasilkan dorongan baru setiap lima menit

### Menindaklanjuti check-in

Setiap kartu menawarkan dua tindakan: **Engage** dan **Dismiss**. Engage membuka konteks yang relevan — detail tujuan, aktivitas agen, entri memori. Dismiss mencatat bahwa Anda melihatnya. Jika suara dikonfigurasi, isi dorongan diucapkan saat tiba, bahkan dengan panel chat tertutup.

:::info
Insiden dengan tingkat keparahan tinggi, mendesak, dan kritis melewati anggaran dorongan harian sepenuhnya — mereka tidak pernah dibungkam oleh batasan frekuensi atau jam tenang. Item safety-floor selalu menjangkau Anda.
:::

:::tip
Tetapkan ritual jam-tenang di palet slash (ketik \`/\` dan pilih "what's queued" untuk melihat ritual Anda) untuk mendefinisikan jendela di mana Athena menahan semua check-in hingga jendela berakhir. Ini berguna untuk blok kerja mendalam di mana Anda menginginkan nol gangguan.
:::
  `,

  "guided-walkthroughs": `
## Panduan Walkthrough

Ketika Anda bertanya kepada Athena tentang cara melakukan sesuatu, ia dapat menunjukkan alih-alih hanya memberitahu. Katakan "tunjukkan cara membuat persona" atau "bagaimana cara menyiapkan connector?" dan ia menawarkan pilihan: **Build it for me** (ia mengerjakan) atau **Show me how to build it** (ia memandu Anda melakukannya sendiri).

Pilih jalur walkthrough dan tur terpandu dimulai. Orb Athena meluncur melintasi layar ke area yang relevan — Anda dapat melihatnya bergerak. Elemen yang ingin Anda perhatikan mendapatkan cincin bercahaya lembut dengan kurung sudut yang mengunci padanya. Sisa UI tetap sepenuhnya terlihat dan dapat diklik; tidak ada yang digelapkan atau diblokir. **Panel teks** mengikuti orb dengan narasi langkah dan kontrol: Back, Pause, Skip, dan Stop.

### Cara setiap langkah bekerja

Setiap langkah dalam walkthrough menceritakan apa yang Anda lihat dan, ketika ada yang harus dilakukan, menunggu Anda bertindak. Mengklik elemen yang disorot sekaligus memajukan tur **dan** melakukan tindakan nyata — tur dan aplikasi tetap sinkron. Beberapa langkah adalah momen "giliran Anda" di mana auto-advance dijeda sepenuhnya hingga Anda mengklik. Langkah lain maju otomatis setelah dwell singkat setelah Anda membaca narasi.

Walkthrough dapat dioperasikan dengan keyboard: panah kiri/kanan melangkah maju dan mundur, Space menjeda dan melanjutkan, Escape menghentikan.

### Walkthrough apa yang tersedia

Athena telah menyusun tur untuk permukaan yang paling sering ditanyakan pengguna:

- **Membuat persona** — studio build, pemicu describe-your-persona sigil, dan toggle build otonom
- **Menyiapkan connector** — rute Vault, alur Add new credential, dan memilih jenis connector
- **Membuat trigger** — hub Events dan canvas Builder perutean
- **Mengadopsi template** — galeri template dan kemampuan Adopt pada kartu template
- **Melakukan triage insiden** — inbox Incidents Overview dan baris insiden
- **Menyiapkan goal dan KPI** — papan Goals dan dashboard KPI

Setiap walkthrough ditutup dengan ajakan bertindak: Start building, Open the catalog, Open the Builder, atau Set up a goal — sehingga jalur "tunjukkan cara" langsung mengarah ke jalur "lakukan itu".

### Tunjuk dan tur improvisasi

Di luar walkthrough terskrip, Athena dapat menunjuk elemen individual di tengah percakapan. Jika Anda bertanya "di mana activity feed?" ia dapat mengedipkan cincin bercahaya padanya dan menceritakan satu teks tanpa memulai tur penuh. Ia juga dapat menyusun tur dua hingga enam langkah secara spontan untuk permintaan "tunjukkan saya sekilas".

:::tip
Athena menawarkan jalur walkthrough atau build-for-me secara otomatis ketika Anda mendeskripsikan persona yang ingin Anda buat — Anda tidak perlu mengetahui frasa yang tepat. Cukup deskripsikan apa yang ingin Anda bangun dan ia akan memunculkan kedua opsi.
:::
  `,

  "the-decision-hub": `
## Decision Hub

Beberapa tindakan Athena memerlukan persetujuan eksplisit Anda sebelum dijalankan. Ketika ia ingin melakukan sesuatu yang mengubah status — menjalankan agen, memperbarui profil identitas Anda, menjadwalkan check-in di masa depan, memunculkan sesi fleet — ia mengusulkannya sebagai **kartu persetujuan**. Kartu tersebut berada di panel chat hingga Anda menindaklanjutinya. Tidak ada yang terjadi sampai Anda melakukannya.

### Apa yang muncul sebagai kartu persetujuan

Rentang tindakan yang muncul dengan cara ini cukup luas:

- **Menjalankan agen** — mengeksekusi persona dengan input yang diberikan, atau meluncurkan build one-shot otonom
- **Penulisan memori dan identitas** — memperbarui profil identitas Anda, menulis atau menghapus fakta atau preferensi prosedural, menulis atau memperbarui tujuan
- **Komitmen masa depan** — check-in terjadwal yang diusulkan Athena ("Saya akan menghubungi Anda tentang ini dalam tiga hari")
- **Pekerjaan proyek dan pengembangan** — mendaftarkan proyek baru, mengantri pemindaian codebase
- **Operasi fleet** — memunculkan sesi pekerja Claude Code baru, mengirim input ke sesi, membunuh sesi, mengirimkan operasi multi-sesi

### Operasi sensitif tidak pernah disetujui otomatis

Kategori tertentu **tidak pernah** disetujui otomatis, bahkan ketika mode otonom aktif. Pembaruan identitas dan penulisan tujuan memerlukan tinjauan Anda setiap saat — Athena dapat mengusulkannya, tetapi tidak dapat melakukannya tanpa klik Anda. Ini dirancang demikian: penulisan yang membentuk siapa Anda bagi Athena, dan status tujuan yang mendorong check-in proaktif, selalu melibatkan manusia.

### Setujui semua

Ketika beberapa kartu persetujuan menumpuk dari sesi fleet yang sama — misalnya, sesi menunggu tiga penulisan file berturut-turut — grup kartu menampilkan tombol **Approve all** yang menyelesaikan setiap kartu bertipe-persetujuan dalam sesi itu sekaligus. Permintaan panduan yang memerlukan jawaban yang diketik tidak pernah dibatch; mereka tetap individual.

### Di mana hub berada

Kartu persetujuan muncul secara inline di panel chat, di atas composer. Anda juga dapat melihat persetujuan yang tertunda dari sesi agen yang berjalan di sana — apa pun yang menunggu keputusan Anda muncul di satu tempat alih-alih tersebar di seluruh tampilan agen individual.

:::info
Jika Athena mengusulkan tindakan dan Anda menolaknya, ia menerima penolakan sebagai umpan balik dan dapat mengusulkan alternatif. Menolak selalu aman — tidak ada perubahan status hingga Anda menyetujui.
:::
  `,

  "operating-by-chat": `
## Mengoperasikan Aplikasi Melalui Chat

Athena dapat melakukan lebih dari sekadar memberi saran — ia dapat menjalankan aplikasi. Minta ia membawa Anda ke suatu tempat, membuka editor, membangun dashboard, atau memanggil layanan yang terhubung, dan ia melakukannya, mengedipkan tujuan sehingga mata Anda tertuju pada apa yang baru saja dibukanya.

### Menavigasi dengan suara atau teks

Minta Athena membuka bagian utama mana pun dari aplikasi — Overview, Agents, Events, Credentials, Settings, dan lainnya — dan ia mengalihkan rute sidebar. Container tujuan berdenyut sejenak agar Anda tahu di mana ia mendarat. Ini berfungsi dari giliran suara dengan panel tertutup: katakan "bawa saya ke activity feed" dan aplikasi menavigasi sementara Athena mengonfirmasi di chat.

Dari konteks tertentu, ia dapat masuk lebih dalam. Minta untuk "langsung ke Lab untuk agen ringkasan dalam mode perbandingan" dan ia membuka editor agen itu yang sudah dipilih ke tampilan perbandingan matrix. Pemilihan rute dan mode terjadi dalam satu tindakan.

### Menyusun cockpit kustom

Ketika Athena ingin menjelaskan sesuatu yang operasional — status fleet agen Anda, ringkasan layanan yang terhubung, persetujuan yang tertunda — ia dapat menyusun **cockpit**: grid widget di tab Home Anda yang menampilkan data secara langsung alih-alih membuangnya sebagai prosa chat. Ia merakit widget, mempersistenkan spesifikasi, menavigasi Anda ke sana, dan panel mengonfirmasi dengan kilatan container cockpit.

Anda juga dapat memintanya membangun cockpit secara eksplisit: "susunkan dashboard yang menampilkan tiga agen teratas saya dan tinjauan yang tertunda." Widget yang terbukti berguna dapat disematkan secara permanen dengan satu klik.

### Tombol Radar dan Sunrise

Dua tombol di toolbar companion memberikan Anda akses satu ketuk ke dua ringkasan operasional paling umum Athena:

- **Radar** — tinjauan fleet. Athena terlebih dahulu mengumpulkan ringkasan dari penyimpanan eksekusi Anda — kesehatan tim, kemajuan tujuan, kinerja agen, skor Director — dan mempertimbangkannya dalam satu giliran terfokus. Gunakan ini ketika Anda ingin pembacaan jujur tentang kinerja seluruh fleet Anda.
- **Sunrise** — briefing pagi. Athena merangkum 24 jam terakhir di seluruh Pesan, Human Review, dan Insiden: berapa banyak yang datang, apa yang mendesak, apa yang terlambat. Gunakan ini untuk mengorientasikan diri di awal sesi.

Kedua tombol melewati giliran chat untuk langkah pengumpulan data — klik Anda adalah pemicunya, dan ringkasan mengalir kembali ke panel seperti balasan lainnya.

### Pintasan "Ask Athena" di seluruh aplikasi

Bagian lain dari Personas memunculkan tombol **Ask Athena** yang merutekan konteks langsung kepadanya. Kartu Fleet Optimization di Mission Control, halaman tujuan, tampilan detail pesan, dan permukaan lainnya semuanya memiliki tombol ini. Mengkliknya mengirim konteks yang relevan sebagai giliran suara melalui panel yang selalu terpasang — orb muncul sejenak, mengakui penerimaan, dan giliran berjalan di latar belakang sehingga Anda tetap di layar yang sedang Anda buka.

:::tip
Athena dapat memanggil layanan terhubung Anda langsung dalam chat — masalah Sentry, pull request GitHub, saluran Slack, utas Gmail. Sematkan connector di toolbar dan ia dapat mengambilnya dalam pekerjaan latar belakang, lalu melaporkan hasilnya dalam balasan berikutnya tanpa Anda meninggalkan percakapan.
:::
  `,
};
