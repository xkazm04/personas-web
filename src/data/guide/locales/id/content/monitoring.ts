export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## Dashboard Pemantauan

Halaman Overview adalah pusat komando Anda untuk semua yang terjadi di seluruh agen Anda. Tab Dashboard terbuka secara default dan menampilkan grid KpiTile — satu tile per metrik (tingkat sukses, total run, total biaya, durasi rata-rata, agen aktif, kegagalan-hari-ini, dll.). Setiap tile memiliki tiga mode kepadatan (compact / standard / detail) yang Anda alihkan dengan mengklik tile; berguna ketika Anda ingin angka cepat vs ketika Anda ingin bagan tren dan breakdown.

Di bawah KpiTile, Overview memunculkan aktivitas langsung, kegagalan terbaru, dan notifikasi yang Anda berlangganan. Semua di halaman ini dapat disaring berdasarkan agen, berdasarkan grup, dan berdasarkan rentang waktu — set filter yang sama berlaku di setiap panel sehingga Anda dapat mencakup seluruh dashboard ke "minggu ini, hanya agen Marketing saya" dalam satu klik.

| Panel | Apa yang ditampilkan |
|---------|--------------|
| **KpiTile** | Tingkat sukses, run, biaya, durasi, jumlah kegagalan, agen aktif — masing-masing di tiga tingkat kepadatan |
| **Activity feed** | Aliran langsung eksekusi di seluruh agen, dapat di-scroll, dapat dicari, klik untuk detail |
| **Notifications** | Peringatan yang berlangganan (kegagalan, batas anggaran, manual review, anomali) dengan klik-melalui ke run yang bermasalah |
| **Health snapshot** | Roll-up kesehatan per-agen — pemindaian cepat untuk apa pun yang kuning atau merah |

### Cara Kerjanya

Halaman Overview membaca dari penyimpanan eksekusi dan event yang sama yang digunakan oleh sisa aplikasi, sehingga apa yang Anda lihat selalu merupakan status langsung. Preferensi filter dan kepadatan bertahan di seluruh sesi; Anda mengaturnya sekali dan dashboard mengingatnya. Klik KpiTile mana pun untuk mendalami breakdown per-agen, klik baris activity mana pun untuk membuka modal detail eksekusi.

:::tip
Lonceng notifikasi title-bar adalah pintasan satu klik dari mana pun di aplikasi ke detail eksekusi terbaru. Anda tidak perlu menavigasi ke Overview secara manual untuk pemeriksaan rutin "apa yang baru saja terjadi?".
:::
  `,

  "execution-logs": `
## Log Eksekusi

Setiap run agen menghasilkan log eksekusi: payload trigger, prompt yang dirender yang dikirim ke model, respons model, setiap panggilan alat (dengan argumen dan hasil), output akhir, durasi, biaya, dan setiap error. Log tidak dapat diubah — mereka ditulis sekali dan dipertahankan tanpa batas. Tab Activity (per-agen pada editor, atau global pada Overview) adalah titik masuk.

Setiap entri log adalah ringkasan satu baris dalam daftar; mengklik membuka modal detail lengkap dengan semua field di atas. Dari sana Anda dapat menyalin field mana pun, mengulang run dengan input yang sama, atau melompat ke tampilan trace terkait untuk debugging langkah demi langkah.

### Poin Kunci

- **Penangkapan lengkap** — input, prompt, respons, panggilan alat (dengan parameter dan hasil), output, durasi, biaya, error
- **Riwayat tidak dapat diubah** — log tidak pernah berubah setelah run selesai; jika prompt agen diedit nanti, run lama masih menampilkan apa yang dikirim pada saat itu
- **Replay dari run mana pun** — menjalankan ulang agen dengan input asli; berguna untuk memverifikasi perbaikan pada payload yang sebelumnya gagal
- **Ditandai oleh trigger** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, dll., sehingga Anda dapat menyaring aktivitas berdasarkan sumber
- **Penanda manual-review** — run yang ditandai agen sendiri untuk peninjauan (melalui direktif \`manual_review\`) mendapat badge sehingga Anda dapat menemukannya dengan cepat

### Cara Kerjanya

Penyimpanan eksekusi adalah SQLite lokal, ditulis secara transaksional saat run berlangsung. Tab trace di dalam modal detail memperluas setiap langkah menjadi sub-event-nya (stream token model, panggilan alat dikirim, hasil alat diterima, cabang keputusan diambil). Saring berdasarkan rentang tanggal, agen, jenis trigger, status, business_outcome, atau pencarian teks lengkap pada input/output.

:::tip
Ketika agen menghasilkan output tak terduga, tab trace — bukan output — adalah tempat jawabannya tinggal. Cari panggilan alat yang mengembalikan data salah, atau keputusan model yang bercabang ke arah yang salah. Output adalah gejala; trace adalah penyebabnya.
:::
  `,

  "real-time-activity-feed": `
## Feed Aktivitas Real-Time

Feed aktivitas menampilkan kepada Anda apa yang terjadi sekarang di seluruh agen Anda. Saat setiap agen memproses tugasnya, pembaruan muncul secara real-time — seperti menonton papan skor langsung. Anda melihat hasil saat terjadi tanpa me-refresh atau memeriksa agen individual.

Ini sangat berguna ketika Anda memiliki banyak agen yang berjalan secara bersamaan atau ketika Anda ingin menonton otomatisasi penting saat dieksekusi.

### Poin Kunci

- **Pembaruan langsung** — lihat aktivitas agen saat terjadi, tidak perlu refresh
- **Semua agen** — satu feed mencakup setiap agen yang berjalan di pengaturan Anda
- **Entri ber-timestamp** — setiap pembaruan menunjukkan persis kapan itu terjadi
- **Perubahan status** — lihat kapan agen mulai, selesai, berhasil, atau gagal secara real-time

### Cara Kerjanya

Buka feed aktivitas dari dashboard pemantauan atau sidebar. Pembaruan mengalir secara otomatis saat agen Anda bekerja. Setiap entri menunjukkan nama agen, aksi, timestamp, dan hasil. Klik entri mana pun — atau lonceng notifikasi di title bar — untuk membuka modal detail eksekusi lengkap langsung di tab Overview › Activity, di mana Anda dapat melihat trace, prompt yang dirender, input, output, dan setiap error. Feed itu sendiri dapat di-scroll dan dicari.

:::tip
Biarkan feed aktivitas terbuka di panel samping saat menguji agen baru. Menonton output langsung membantu Anda menemukan masalah segera dan beriterasi lebih cepat. Untuk penggunaan sehari-hari, lonceng notifikasi title-bar adalah jalur tercepat — ia selalu membuka detail eksekusi terbaru tanpa Anda harus menavigasi.
:::
  `,

  "cost-tracking-per-agent": `
## Pelacakan Biaya per Agen

Setiap penyedia AI mengenakan biaya per token, dan Personas menandai setiap run dengan jumlah token, model, dan provider yang tepat sehingga biaya per-agen selalu diketahui. Overview → Usage menampilkan daftar yang dapat diurutkan dari setiap agen dengan biayanya selama jendela waktu yang dipilih — hari, minggu, bulan, atau rentang kustom — plus panah tren sehingga Anda dapat melihat sekilas agen mana yang biayanya naik.

Dalami baris mana pun untuk breakdown: distribusi biaya-per-run (median vs p95), biaya berdasarkan model ketika agen memiliki failover yang dikonfigurasi, total token (input vs output), dan bagan tren dari waktu ke waktu. Jika biaya agen merangkak naik, ini adalah tempat pertama yang memunculkannya.

### Poin Kunci

- **Breakdown per-agen** — setiap run diatribusikan ke agennya
- **Jendela waktu yang dapat disaring** — hari ini, minggu ini, bulan ini, sepanjang waktu, atau rentang kustom
- **Distribusi biaya-per-run** — median, p95, maks; mengungkapkan jika satu outlier mahal mendominasi total
- **Breakdown token** — token input vs output sehingga Anda dapat memberi tahu jika agen banyak membaca atau banyak memproduksi
- **Panah tren** — perubahan minggu-ke-minggu ditampilkan di samping setiap agen, sehingga regresi biaya muncul segera

### Cara Kerjanya

Meteran biaya berdetak langsung selama run saat token mengalir masuk. Ketika run selesai, biaya akhir difinalisasi dan dipersistenkan bersama log eksekusi. Tampilan Usage mengagregasi dari penyimpanan ini, sehingga mengubah filter rentang-waktu hanya meminta kembali data yang sama — tidak ada pekerjaan "akuntansi biaya" terpisah yang berjalan.

:::tip
Jika satu agen mendominasi biaya Anda, distribusi per-run lebih berguna daripada total. Median tinggi berarti prompt secara konsisten mahal (lihat ukuran prompt dan jumlah panggilan alat). P95 tinggi dengan median normal berarti outlier langka (lihat input yang tidak biasa dalam riwayat trace).
:::
  `,

  "cost-tracking-per-model": `
## Pelacakan Biaya per Model

Model yang berbeda memiliki titik harga yang sangat berbeda — Claude Haiku ~30× lebih murah daripada Opus per token, GPT-4o-mini ~20× lebih murah daripada GPT-4o, dan model lokal pada dasarnya tidak berbiaya per token (hanya komputasi). Tampilan per-model di Overview → Usage memecah pengeluaran berdasarkan provider dan model sehingga Anda dapat melihat ke mana uang pergi dan apakah pengeluaran sesuai dengan nilainya.

:::feature
**Petunjuk Optimasi Cerdas** color=#34d399
Sistem menandai run yang terlihat seperti mereka bisa berjalan pada model yang lebih murah dengan kualitas serupa. Ketika model berbiaya tinggi digunakan untuk pola tugas yang dapat ditangani dengan baik oleh model yang lebih murah di tempat lain, petunjuk muncul di samping baris biaya — menunjuk Anda pada agen kandidat untuk A-B di Lab.
:::

### Poin Kunci

- **Berdasarkan provider dan model** — biaya dipecah berdasarkan identifier model yang tepat (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Panggilan, token, biaya** — tiga tampilan data yang sama; biaya adalah yang Anda bayar, token adalah yang Anda habiskan, panggilan adalah seberapa sering Anda memanggil
- **Perbandingan biaya-per-panggilan** — metrik yang sama di seluruh model sehingga Anda dapat membandingkan setara dengan setara
- **Petunjuk optimasi** — memunculkan agen kandidat yang dapat diturunkan; klik ke Lab untuk uji A-B
- **Atribusi per-agen** — dalami baris model untuk melihat agen mana yang paling banyak menggunakannya

### Cara Kerjanya

Tampilan Usage mengelompokkan record eksekusi yang sama dengan tampilan per-agen tetapi pada dimensi model sebagai gantinya. Harga dikonfigurasi per-model di Settings → Engine, dengan default yang cocok dengan harga publik setiap provider; Anda dapat menimpa jika Anda memiliki tarif yang dinegosiasikan atau menggunakan BYOI pada endpoint yang lebih murah.

:::tip
Sekali sebulan, pindai tampilan per-model yang diurutkan berdasarkan total biaya. Entri teratas adalah peluang penghematan terbesar Anda — masukkan ke arena Lab terhadap model berikutnya yang lebih murah dan lihat apakah kualitas bertahan. Sebagian besar agen mentoleransi penurunan model dengan baik; yang tidak adalah yang benar-benar layak pengeluarannya.
:::
  `,

  "success-rate-metrics": `
## Metrik Tingkat Sukses

Setiap run berakhir dengan status: success, failure, atau manual-review. Tingkat sukses adalah persentase run yang berhasil diselesaikan terhadap latar belakang perilaku yang diharapkan. Tab Overview → Health dan tab Activity per-agen sama-sama memunculkan tingkat sukses dengan indikator tren — perubahan minggu-ke-minggu — sehingga Anda dapat melihat sekilas apakah keandalan tetap terjaga.

Metrik melampaui keberhasilan/kegagalan murni sekarang. Dengan pelacakan **business_outcome**, agen sendiri dapat menyatakan apakah run yang berhasil menghasilkan hasil yang sebenarnya Anda inginkan (penjualan, dokumen yang disetujui, ringkasan yang berguna) — sinyal terpisah dari "apakah run selesai tanpa error". Tingkat sukses terbagi menjadi "diselesaikan dengan bersih" dan "menghasilkan hasil bisnis yang diinginkan" — yang kedua adalah angka yang lebih berguna untuk sebagian besar agen.

### Poin Kunci

- **Tingkat sukses per-agen** dengan panah tren
- **Tingkat hasil-bisnis** — terpisah dari tingkat penyelesaian bersih; melacak apakah pekerjaan agen sebenarnya berguna
- **Pemisahan per-trigger** — agen yang sama mungkin berhasil 99% pada run manual tetapi 70% pada run terjadwal; breakdown menunjukkan sumber trigger mana yang memiliki masalah
- **Peringatan ambang batas** — atur ambang batas per agen; Anda diberi tahu ketika tingkat turun di bawahnya
- **Klasifikasi alasan kegagalan** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, dll., sehingga Anda dapat melihat *mengapa* run gagal

### Cara Kerjanya

Tab Health mengagregasi status run selama jendela bergulir per agen. Pelacakan hasil-bisnis memerlukan agen memancarkan direktif \`business_outcome\` dalam outputnya (sebagian besar template yang membutuhkannya melakukannya secara default; agen kustom dapat menambahkannya secara eksplisit). Peringatan ambang batas dikonfigurasi per agen dan menyala melalui saluran notifikasi yang sama dengan yang dikonfigurasi agen.

:::tip
Atur ambang batas 90% pada setiap agen produksi. Peringatan tidak akan memberi tahu Anda mengapa agen gagal, tetapi akan memberi tahu Anda bahwa ada sesuatu. Klasifikasi alasan-kegagalan pada tab Health adalah tempat Anda pergi selanjutnya untuk mendiagnosis.
:::
  `,

  "execution-tracing": `
## Penjejakan Eksekusi

Tracing adalah catatan langkah-demi-langkah per-run dari apa yang dilakukan agen. Buka eksekusi mana pun dari feed Activity dan klik tab Trace: Anda akan melihat setiap event dalam urutan kronologis — awal dan akhir streaming token model, setiap pemanggilan alat dengan argumen, setiap hasil alat, setiap cabang keputusan dalam agen yang dirantai, prompt yang dirender, output. Setiap langkah dapat diperluas untuk detail lengkap.

Untuk pipeline yang dirantai, trace mencakup beberapa agen — kanvas lineage (Events → Lineage) menunjukkan tampilan lintas-agen sementara trace per-run menunjukkan detail dalam-agen. Bersama-sama mereka memungkinkan Anda men-debug baik "di mana pipeline ini rusak?" dan "apa yang diputuskan agen langkah demi langkah?".

### Poin Kunci

- **Kronologis** — setiap event dengan timestamp dan durasi
- **Dapat diperluas per langkah** — klik langkah mana pun untuk input/output lengkap dari langkah itu
- **Durasi per-langkah** — lihat langkah mana yang lambat; biasanya panggilan alat atau respons model yang panjang
- **Trace yang dirantai** — ketika agen dipicu oleh rantai, trace menautkan kembali ke agen hulu sehingga Anda dapat menavigasi pipeline
- **Token-demi-token** untuk model — berguna untuk provider yang lambat-streaming di mana pengguna menunggu

### Cara Kerjanya

Setiap eksekusi menulis event ke penyimpanan trace saat berjalan; tab trace meminta penyimpanan itu dan merender timeline. Event tingkat-token disampel pada tingkat yang menjaga trace tetap dapat digunakan bahkan untuk respons panjang (respons 10k token mungkin menangkap 500 event yang disampel daripada 10k). Untuk loop tool-use, setiap iterasi round-trip model/alat ditangkap.

:::tip
Gunakan trace untuk mengonfirmasi apa yang *sebenarnya* diterima model. Sumber terbesar bug "agen melakukan sesuatu yang aneh" adalah model mendapatkan input yang berbeda dari yang Anda harapkan — biasanya karena hasil alat yang tidak terlihat seperti yang diasumsikan prompt agen.
:::
  `,

  "performance-trends": `
## Tren Kinerja

Tren adalah pandangan jangka panjang perilaku agen — tingkat sukses, biaya, durasi, kualitas output (di mana diukur) yang diplot dari waktu ke waktu sehingga Anda dapat melihat dampak perubahan yang Anda buat. Overview → Trends memberi Anda tampilan bagan; Anda memilih agen dan metrik dan rentang tanggal, dan bagan dirender.

Pola paling berguna adalah "sebelum vs sesudah": Anda mengubah prompt agen pada 5 Maret, apakah segalanya menjadi lebih baik atau lebih buruk? Tampilan tren menjawab itu dalam hitungan detik — garis yang Anda pedulikan naik atau turun pada tanggal Anda membuat perubahan.

### Poin Kunci

- **Beberapa metrik pada satu bagan** — overlay tingkat sukses, biaya, durasi, tingkat hasil-bisnis
- **Overlay multi-agen** — bandingkan metrik yang sama di beberapa agen pada satu bagan
- **Rentang tanggal kustom** — zoom dari "jam ini" hingga "sepanjang waktu"
- **Anotasi** — event signifikan (penyimpanan versi prompt, perubahan pengaturan, rotasi kredensial) disematkan ke timeline sehingga Anda dapat berkorelasi
- **Ekspor** — data bagan diekspor ke CSV jika Anda ingin melakukan analisis sendiri

### Cara Kerjanya

Tren mengagregasi dari penyimpanan eksekusi dan trace yang sama dengan tampilan pemantauan lainnya — data yang sama, visualisasi yang berbeda. Anotasi dihasilkan secara otomatis dari riwayat versi dan riwayat konfigurasi sehingga Anda tidak perlu menandai secara manual "Saya membuat perubahan di sini"; sistem sudah tahu.

:::tip
Setelah perubahan yang berarti pada agen (revisi prompt, pertukaran model, alat baru), periksa tren seminggu kemudian. Sebagian besar perubahan prompt yang "terasa lebih baik dalam pengujian" menghasilkan metrik yang terukur berbeda; bagan mengonfirmasinya (atau membatalkan firasat Anda).
:::
  `,

  "setting-budget-limits": `
## Mengatur Batasan Anggaran

Batasan anggaran membatasi pengeluaran AI di tingkat agen dan tingkat global. Atur anggaran per-run (eksekusi tunggal ini tidak boleh berbiaya lebih dari $X), anggaran per-hari (agen ini tidak boleh menghabiskan lebih dari $Y per hari di seluruh run), atau batas global di seluruh agen. Ketika batas tercapai, agen yang terpengaruh dijeda dengan bersih — run parsial ditangkap dalam trace, tidak ada biaya yang bertahan melewati batas, dan notifikasi menyala.

Ini adalah salah satu fitur yang paling underrated untuk agen tanpa pengawasan. Agen yang dipicu jadwal atau webhook tanpa batas anggaran dapat menumpuk biaya tak terduga semalaman jika prompt atau input melakukan sesuatu yang patologis. Batas anggaran berarti kasus terburuk dibatasi oleh apa yang Anda putuskan sebelumnya, bukan oleh apa yang dapat dilakukan run model yang menyimpang.

### Poin Kunci

- **Batas per-run** — batas keras pada eksekusi tunggal
- **Batas per-hari / per-minggu / per-bulan** — batas pengeluaran berjendela per agen
- **Batas global** — batas lintas-semua-agen; berguna sebagai safety net bahkan ketika setiap agen memiliki batasnya sendiri
- **Penghentian anggun** — agen berhenti dengan bersih pada batas; trace parsial dipertahankan
- **Notifikasi** — setiap hit-batas memberitahu Anda sehingga Anda dapat memutuskan apakah akan menaikkan batas atau memperbaiki prompt yang mendasari
- **Peringatan lunak** — ambang batas pra-batas opsional (misalnya "peringatkan pada 80%") sehingga Anda tahu agen sedang menuju batas

### Cara Kerjanya

Batas dikonfigurasi di tab Settings agen (per-run, per-jendela) atau di Settings → Engine → Budget (global). Execution engine melacak biaya langsung selama run; ketika biaya melewati batas, engine menghentikan run melalui jalur yang sama dengan timeout. Status yang dibatalkan dipertahankan dalam trace dengan alasan \`budget_exceeded\`.

:::warning
Selalu atur setidaknya batas per-hari untuk agen yang dipicu secara otomatis (jadwal, webhook, file watcher, chain). Tanpa satu, input patologis atau loop model dapat menghabiskan jumlah yang tidak dibatasi sebelum Anda menyadarinya. Batas adalah safety net Anda.
:::

:::tip
Mulai dengan batas sekitar 3x dari yang Anda harapkan biaya hari tipikal. Cukup ketat untuk menangkap run yang melarikan diri, cukup longgar agar varians normal tidak memicu batas. Sesuaikan setelah seminggu data nyata.
:::
  `,

  "the-director": `
## Director — Pelatihan Agen Otomatis

**Director** adalah meta-agen bawaan yang mengawasi agen-agen lain Anda dan melatih mereka agar benar-benar berguna. Alih-alih Anda membaca setiap run, Director meninjau run tersebut untuk Anda dan memberikan sebuah verdict.

Anda memilih apa yang dipantaunya dengan cara **memberi bintang** pada agen (ikon ⭐ di setiap baris pada All Agents). Agen berbintang berarti "berada dalam cakupan Director" — Director meninjaunya; agen yang tidak berbintang dibiarkan saja. Director sendiri adalah agen sistem dan tidak dapat dihapus.

### Pusat komando

Director berada di **Overview › Director** — satu layar yang terfokus:

- Sebuah **scorecard portofolio**: seberapa besar pekerjaan fleet Anda yang benar-benar menghasilkan nilai, rata-rata skor verdict, biaya per run yang memberikan nilai, dan distribusi 0–5 yang menunjukkan posisi agen berbintang Anda.
- Sebuah **tabel pelatihan** setiap agen dalam cakupan — skor, sparkline tren (apakah pelatihan memberikan dampak?), value rate, tinjauan terakhir, dan **attention tag** yang menandai tepatnya apa yang perlu ditindaklanjuti (menunggu tinjauan pertama, skor rendah, menurun, tidak diperbarui). Filter hanya agen yang membutuhkan perhatian. Klik agen mana pun untuk membuka **detailnya** — riwayat verdict lengkap dengan alasan dan saran konkret di balik setiap skor.
- Header tipis dengan **Review all in scope**, pemilih **Add to scope**, dan toggle **memory** jangka panjang.

Halaman All Agents memiliki strip Director ramping yang menautkan langsung ke sini.

### Tampilan sebuah verdict

Setiap tinjauan menghasilkan **skor 0–5** secara keseluruhan ditambah catatan pelatihan opsional:

- Kolom **Verdict** di daftar Activity menampilkan skor sebagai bintang, tepat di samping agen — satu pandangan memberi tahu Anda run mana yang layak biayanya.
- Tab **Director** pada run mana pun membuka penilaian lengkap dalam markdown yang mudah dibaca: skor, ringkasan satu baris, dan saran spesifik (penyesuaian prompt, guardrail, perubahan tier model, alat yang hilang).
- Catatan yang dapat ditindaklanjuti juga masuk ke antrean tinjauan Anda, di mana menyetujui atau menolaknya mengajarkan Director selera Anda dari waktu ke waktu.

Agen yang sehat mendapat skor tinggi dengan sedikit atau tanpa pelatihan — Director tetap diam ketika tidak ada yang perlu ditingkatkan.

### Memori jangka panjang (opsional)

Jika Anda menggunakan **Obsidian Brain**, Anda dapat mengaktifkan memori jangka panjang Director. Director kemudian membaca catatan lamanya tentang sebuah agen sebelum setiap tinjauan (sehingga saran terakumulasi alih-alih berulang) dan menulis setiap verdict baru ke folder \`Director/\` di vault Anda — riwayat pelatihan yang tahan lama dan mudah dibaca manusia.

### Mengapa Ini Penting

Angka mentah (run, biaya, tingkat sukses) memberi tahu Anda *apa* yang terjadi, bukan *apakah itu sebanding*. Director menambahkan lapisan penilaian yang hilang — pembacaan jujur berbasis bukti tentang nilai dan efisiensi setiap agen — sehingga fleet agen tetap berguna tanpa Anda mengaudit setiap run secara manual.
  `,

  "anomaly-detection": `
## Deteksi Anomali

Deteksi anomali membandingkan setiap run baru terhadap baseline terbaru agen dan menandai run yang terlihat tidak biasa. Baseline dibangun per-agen: durasi tipikal, biaya tipikal, panjang output tipikal, jumlah panggilan-alat tipikal. Run baru yang menyimpang secara signifikan pada salah satu ini ditandai dengan alasan — "durasi 5× normal", "lonjakan biaya", "jumlah panggilan-alat anomali", "output yang luar biasa pendek".

Ini menangkap kelas masalah yang dilewatkan metrik keberhasilan/kegagalan murni: run selesai, tetapi ada sesuatu yang salah. Agen mengambil lima menit ketika biasanya mengambil tiga puluh detik. Outputnya tiga kalimat ketika biasanya tiga paragraf. Biaya berlipat ganda tanpa perubahan input. Ini adalah sinyal yang layak dilihat sebelum mereka menjadi tren.

### Poin Kunci

- **Baseline multi-sinyal** — durasi, biaya, ukuran output, jumlah panggilan-alat, tingkat kegagalan
- **Baseline per-agen** — setiap agen memiliki normalnya sendiri; apa yang anomali untuk satu adalah normal untuk yang lain
- **Peringatan beralasan-tag** — peringatan menamai sinyal mana yang menyimpang dan seberapa banyak
- **Kebisingan rendah** — dikalibrasi untuk memunculkan outlier asli, bukan varians normal
- **Terintegrasi dengan notifikasi** — anomali menyala melalui saluran notifikasi mana pun yang dikonfigurasi agen

### Cara Kerjanya

Baseline adalah jendela bergulir run terbaru (dapat dikonfigurasi; default 50). Setiap run baru dinilai pada setiap sinyal; jika ada sinyal yang melintasi ambang batas yang dikonfigurasi (default 3 standar deviasi dari rata-rata bergulir), run ditandai dan event anomali dipancarkan. Event anomali muncul di Overview → Notifications dan di tab Health untuk agen itu.

:::tip
Anomali yang Anda selidiki dan selesaikan harus dibersihkan (tandai mereka "investigated"). Baseline mengecualikan anomali yang diselidiki dari jendela bergulirnya, sehingga sistem tidak melayang ke arah menganggap run anomali "normal".
:::
  `,
};
