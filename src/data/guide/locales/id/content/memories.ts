export const content: Record<string, string> = {
  "how-agent-memory-works": `
## Bagaimana Memori Agen Bekerja

Agen Anda dapat mengingat tugas masa lalu dan belajar dari pengalaman. Setiap kali agen berjalan, ia dapat menyimpan informasi yang berguna — fakta, keputusan, pola, dan pelajaran yang dipelajari. Pikirkan seperti buku catatan yang dibawa agen Anda dari tugas ke tugas, membangun pengetahuan dari waktu ke waktu.

Ini berarti agen Anda menjadi lebih pintar semakin sering Anda menggunakannya. Agen yang telah menangani ratusan pertanyaan pelanggan akan memiliki konteks tentang masalah umum, solusi yang disukai, dan keputusan masa lalu yang tidak akan diketahui agen yang baru.

### Poin Kunci

- Agen **belajar secara otomatis** dari setiap tugas yang mereka selesaikan
- Memori bertahan **antar run** — agen Anda mengingat pekerjaan sebelumnya
- Setiap memori **dikategorikan dan diperingkat** berdasarkan kepentingan
- Anda dapat **meninjau, mengedit, atau menghapus** memori apa pun kapan saja

### Cara Kerjanya

Selama run, jika agen menemukan sesuatu yang layak diingat — fakta yang berguna, keputusan penting, atau pelajaran yang dipelajari — ia membuat entri memori. Lain kali agen berjalan, ia dapat mengingat memori yang relevan untuk membuat keputusan yang lebih baik. Anda memiliki kendali penuh untuk meninjau dan mengelola apa yang diingat agen Anda.

:::tip
Memori bekerja paling baik ketika agen memiliki tugas yang konsisten dan fokus. Agen yang selalu menangani laporan biaya akan membangun memori yang lebih berguna daripada yang melakukan tugas berbeda setiap saat.
:::
  `,

  "memory-categories": `
## Kategori Memori

Memori diorganisasikan ke dalam lima kategori, masing-masing memiliki tujuan berbeda. Struktur ini membantu agen Anda mengingat jenis pengetahuan yang tepat pada waktu yang tepat — seperti bab dalam buku referensi.

Memahami kategori ini membantu Anda meninjau dan mengelola pengetahuan agen Anda secara lebih efektif. Setiap kategori memberi tahu Anda tidak hanya *apa* yang diketahui agen, tetapi *jenis apa* pengetahuan itu.

### Lima Kategori

:::compare
**Fact**
Informasi konkret yang dipelajari dari tugas. Contoh: "Klien lebih menyukai bahasa formal." Bagian pengetahuan yang langsung yang diambil agen Anda.
---
**Decision**
Pilihan yang dibuat dan alasan di baliknya. Contoh: "Memilih pengiriman Express karena pesanan mendesak." Mencatat alasannya, bukan hanya apanya.
---
**Insight**
Pola yang ditemukan selama beberapa run. Contoh: "Tiket dukungan melonjak setiap Senin pagi." Menjadi lebih pintar dari waktu ke waktu.
---
**Learning**
Pelajaran dari kesalahan atau keberhasilan. Contoh: "Baris subjek yang lebih pendek mendapatkan tingkat pembukaan yang lebih tinggi." Peningkatan berkelanjutan dalam tindakan.
---
**Warning**
Jebakan yang harus diwaspadai. Contoh: "Jangan pernah mengirim faktur sebelum kontrak ditandatangani." Mencegah agen Anda mengulangi kesalahan masa lalu.
:::

### Cara Kerjanya

Ketika agen membuat memori, ia secara otomatis mengkategorikannya berdasarkan konten. Fakta adalah potongan informasi yang langsung. Keputusan mencatat pilihan dengan alasan. Insight menangkap pola. Learning berasal dari merefleksikan hasil. Warning menandai hal-hal yang harus dihindari.

:::tip
Berikan perhatian khusus pada kategori Warning selama tinjauan Anda. Memori ini membantu agen Anda menghindari pengulangan kesalahan masa lalu — mereka sering yang paling berharga.
:::
  `,

  "importance-levels": `
## Tingkat Kepentingan

Setiap memori memiliki skor kepentingan dari 1 hingga 5. Skor 1 berarti itu informasi rutin, sedangkan 5 berarti itu kritis. Memori penting diingat lebih sering, bertahan lebih lama, dan diberi bobot lebih banyak ketika agen membuat keputusan — seperti bagaimana Anda mengingat peristiwa hidup yang besar lebih baik daripada apa yang Anda makan untuk makan siang Selasa lalu.

Sistem peringkat ini menjaga agen Anda tetap fokus pada apa yang paling penting, daripada tenggelam dalam detail sepele.

### Skala

| Tingkat | Label | Prioritas Recall | Deskripsi |
|-------|-------|-----------------|-------------|
| 1 | Rutin | Rendah | Detail kecil yang mungkin berguna sesekali |
| 2 | Berguna | Sedang | Konteks yang bermanfaat yang memperkaya pemahaman |
| 3 | Penting | Standar | Pengetahuan yang secara teratur memengaruhi keputusan |
| 4 | Sangat Penting | Tinggi | Informasi kunci yang hampir selalu harus dipertimbangkan agen |
| 5 | Kritis | Selalu | Pengetahuan esensial yang tidak boleh dilupakan atau diabaikan |

### Cara Kerjanya

Kepentingan ditetapkan secara otomatis ketika memori dibuat, berdasarkan faktor-faktor seperti seberapa sering informasi direferensikan dan seberapa banyak itu memengaruhi hasil. Anda juga dapat menyesuaikan tingkat kepentingan secara manual jika Anda tidak setuju dengan penetapan otomatis.

:::tip
Jika agen terus melakukan kesalahan yang sama, periksa apakah memori yang relevan ada dan apakah tingkat kepentingannya cukup tinggi. Menaikkannya ke 4 atau 5 memastikan agen memberikan perhatian padanya.
:::
  `,

  "searching-agent-memories": `
## Mencari Memori Agen

Saat agen Anda mengakumulasi pengetahuan, kemampuan untuk mencari memori mereka menjadi penting. Ketik kata kunci atau frasa dan langsung lihat setiap memori terkait di seluruh agen Anda. Ini seperti mencari email Anda — cepat, sederhana, dan Anda dapat menyaring berdasarkan kategori, kepentingan, atau tanggal.

Pencarian membantu Anda memahami apa yang diketahui agen Anda, memverifikasi mereka telah belajar dengan benar, dan menemukan informasi spesifik dengan cepat.

### Poin Kunci

- **Pencarian teks lengkap** — temukan memori berdasarkan kata kunci atau frasa apa pun yang dikandungnya
- **Saring berdasarkan kategori** — persempit hasil ke fact, decision, insight, learning, atau warning
- **Saring berdasarkan kepentingan** — tampilkan hanya memori prioritas tinggi atau prioritas rendah
- **Pencarian lintas-agen** — cari di semua agen Anda sekaligus atau fokus pada satu

### Cara Kerjanya

Buka bagian \`Memories\` dan ketik kueri pencarian Anda di bilah pencarian. Hasil muncul secara instan dengan teks yang cocok disorot. Gunakan tombol filter untuk mempersempit berdasarkan kategori, tingkat kepentingan, rentang tanggal, atau agen tertentu. Klik hasil apa pun untuk melihat memori lengkap dengan semua konteksnya.

:::tip
Cari topik sebelum membuat memori manual. Agen Anda mungkin sudah tahu apa yang akan Anda ajarkan padanya — dalam hal ini, Anda cukup memperbarui memori yang ada.
:::
  `,

  "creating-memories-manually": `
## Membuat Memori Secara Manual

Kadang-kadang Anda ingin agen Anda mengetahui sesuatu sebelum ia mempelajarinya sendiri — seperti menjelaskan karyawan baru pada hari pertama. Memori manual memungkinkan Anda mengajarkan agen Anda fakta, preferensi, atau aturan spesifik secara langsung, memberi mereka awal pada pengetahuan yang sebaliknya harus mereka temukan melalui pengalaman.

Ini sangat berguna untuk informasi spesifik perusahaan, preferensi pribadi, atau aturan kritis yang tidak boleh dipelajari melalui trial and error.

:::steps
1. **Buka bagian Memories** — klik \`Memories\` di sidebar dan kemudian \`Add Memory\`
2. **Pilih kategori** — pilih fact, decision, insight, learning, atau warning
3. **Tulis konten memori** — jelaskan pengetahuan dalam bahasa biasa
4. **Atur tingkat kepentingan** — tetapkan skor dari 1 (rutin) hingga 5 (kritis)
5. **Tetapkan ke agen** — pilih agen tertentu atau buat memori tersedia untuk semua agen
:::

### Cara Kerjanya

Memori yang Anda buat ditambahkan ke basis pengetahuan agen seperti memori yang dipelajari secara otomatis. Lain kali agen berjalan, ia dapat mengakses informasi ini bersama dengan semua yang telah dipelajarinya sendiri. Memori manual ditandai dengan ikon kecil sehingga Anda dapat membedakannya dari yang otomatis.

:::tip
Buat beberapa memori "Warning" untuk aturan paling kritis Anda sebelum agen berjalan. Misalnya: "Jangan pernah membagikan informasi harga tanpa persetujuan manajer."
:::
  `,

  "memory-tiers-explained": `
## Tingkatan Memori Dijelaskan

Tidak semua memori diciptakan sama, dan tidak semua perlu dapat diakses segera. Personas mengorganisasikan memori ke dalam empat tingkatan berdasarkan seberapa sering digunakan dan seberapa pentingnya. Pikirkan seperti sistem pengarsipan: item yang paling sering digunakan tetap di meja Anda, yang kurang digunakan masuk ke laci, dan yang jarang dibutuhkan diarsipkan di lemari.

Sistem berjenjang ini menjaga agen Anda tetap cepat dan efisien. Ia mengingat memori paling relevan secara instan sambil tetap memiliki akses ke pengetahuan lama saat dibutuhkan.

### Empat Tingkatan

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
Selalu dimuat. Aturan dan fakta kritis permanen. Disematkan secara manual dan tidak pernah diturunkan. Pengetahuan paling penting agen Anda.
---
**Active**
Dimuat saat recall. Memori terbaru yang sering diakses. Dipromosikan otomatis berdasarkan frekuensi penggunaan. "Laci meja" dari konteks yang berguna.
---
**Working**
Cakupan-sesi. Memori dari tugas saat ini atau sesi terbaru. Dibuat selama eksekusi dan menua menjadi Active dari waktu ke waktu.
---
**Archive**
Hanya on-demand. Memori lebih lama yang tidak diakses baru-baru ini. Otomatis diturunkan setelah tidak aktif tetapi dipertahankan tanpa batas. Tidak ada yang pernah hilang.
:::

### Cara Kerjanya

Memori berpindah antar tingkatan secara otomatis berdasarkan pola penggunaan. Memori yang sering diingat dipromosikan ke tingkatan yang lebih tinggi; yang belum diakses sebentar lagi bergerak secara bertahap menuju archive. Anda juga dapat secara manual menyematkan memori ke tingkatan Core untuk memastikan mereka selalu menjadi top-of-mind untuk agen Anda.

:::tip
Sematkan aturan dan fakta paling penting Anda ke tingkatan Core. Ini menjamin agen Anda selalu mempertimbangkannya, terlepas dari seberapa lama mereka berusia.
:::
  `,

  "memory-and-execution": `
## Memori dan Eksekusi

Ketika agen Anda memulai tugas baru, ia tidak memulai dengan papan tulis kosong. Ia secara otomatis mengingat memori yang relevan dari run sebelumnya, membawa konteks, preferensi, dan pelajaran yang dipelajari ke dalam eksekusi saat ini. Ini membuat setiap run lebih terinformasi daripada yang terakhir.

Proses recall bersifat pintar — ia tidak membuang setiap memori sekaligus. Sebaliknya, ia memilih yang paling relevan dengan tugas saat ini, seperti bagaimana Anda secara alami mengingat pengalaman terkait saat menghadapi situasi yang akrab.

### Poin Kunci

- **Recall otomatis** — memori yang relevan dimuat sebelum setiap eksekusi
- **Sadar konteks** — hanya memori yang terkait dengan tugas saat ini yang diingat
- **Dibobotkan berdasarkan kepentingan** — memori berkepentingan tinggi lebih mungkin diingat
- **Pembuatan memori** — memori baru dapat dibuat selama eksekusi berdasarkan hasil

### Cara Kerjanya

Sebelum agen Anda memproses tugasnya, sistem memori memindai entri yang relevan berdasarkan konten dan konteks tugas. Memori ini diberikan ke model AI bersama dengan instruksi Anda. Setelah tugas selesai, agen mengevaluasi apakah ada yang baru dipelajari dan membuat memori sesuai dengan itu.

:::tip
Jika agen tidak menggunakan memorinya secara efektif, periksa bahwa memori dikategorikan dan dinilai dengan benar. Memori yang terorganisir dengan baik diingat lebih andal.
:::
  `,

  "reviewing-and-cleaning-memories": `
## Meninjau dan Membersihkan Memori

Seiring waktu, beberapa memori menjadi kedaluwarsa, salah, atau berlebihan. Tinjauan rutin menjaga basis pengetahuan agen Anda tetap akurat dan terkini. Pikirkan itu sebagai pembersihan musim semi untuk otak agen Anda — membersihkan informasi lama sehingga agen Anda membuat keputusan berdasarkan pengetahuan saat ini yang benar.

Basis memori yang bersih mengarah pada kinerja agen yang lebih baik. Agen yang bergantung pada informasi kedaluwarsa dapat membuat keputusan yang buruk tanpa menyadari alasannya.

### Poin Kunci

- **Jelajahi semua memori** dengan opsi penyortiran dan penyaringan
- **Edit** memori apa pun untuk memperbaiki ketidakakuratan atau memperbarui informasi yang kedaluwarsa
- **Hapus** memori yang tidak lagi relevan
- **Gabungkan** memori duplikat atau serupa menjadi satu entri yang jelas

### Cara Kerjanya

Buka bagian \`Memories\` dan telusuri daftar memori agen Anda. Urutkan berdasarkan tanggal, kepentingan, atau kategori untuk memfokuskan tinjauan Anda. Klik memori apa pun untuk mengedit kontennya, mengubah tingkat kepentingannya, atau menghapusnya. Sistem juga menyarankan potensi duplikat yang dapat digabungkan.

:::tip
Jadwalkan tinjauan bulanan memori agen Anda yang paling aktif. Bahkan 15 menit pembersihan dapat secara nyata meningkatkan kualitas pengambilan keputusan agen.
:::
  `,

  "exporting-and-importing-memories": `
## Mengekspor dan Mengimpor Memori

Anda dapat mengekspor seluruh basis memori agen Anda ke file — sempurna untuk backup, berbagi pengetahuan antar agen, atau pindah ke komputer baru. Mengimpor memuat file yang sebelumnya diekspor dan menambahkan memori tersebut ke basis pengetahuan agen target.

Fitur ini juga bagus untuk memberi agen baru manfaat pengalaman agen lain. Ekspor dari agen berpengalaman Anda, impor ke yang baru, dan ia mulai dengan kekayaan pengetahuan alih-alih papan tulis kosong.

### Poin Kunci

- **Ekspor ke file** — simpan semua memori sebagai file portabel yang dapat Anda simpan atau bagikan
- **Impor dari file** — muat memori ke agen mana pun di perangkat mana pun
- **Ekspor selektif** — pilih kategori atau tingkat kepentingan tertentu untuk diekspor
- **Penanganan konflik** — duplikat terdeteksi dan digabungkan selama impor

### Cara Kerjanya

Buka pengaturan memori agen dan klik \`Export\`. Pilih memori mana yang akan disertakan (semua, atau disaring berdasarkan kategori/kepentingan) dan simpan file. Untuk mengimpor, buka pengaturan memori agen target, klik \`Import\`, dan pilih file Anda. Personas mendeteksi duplikat dan memungkinkan Anda memutuskan bagaimana menanganinya.

:::tip
Sebelum perubahan besar pada prompt agen, ekspor memorinya sebagai backup. Jika prompt baru menciptakan kebingungan, Anda dapat memulihkan memori asli.
:::
  `,

  "memory-best-practices": `
## Praktik Terbaik Memori

Mendapatkan hasil maksimal dari memori agen turun ke beberapa kebiasaan kunci. Seperti kebiasaan belajar yang baik untuk siswa, cara Anda menyusun dan memelihara memori membuat perbedaan besar dalam seberapa efektif agen Anda belajar dan mengingat informasi.

Ikuti panduan ini untuk membangun agen yang benar-benar meningkat dari waktu ke waktu daripada mengakumulasi kekacauan.

### Praktik Terbaik

- **Jaga agen tetap fokus** — agen dengan tugas yang konsisten membangun memori yang lebih berguna daripada generalis
- **Tinjau secara teratur** — periksa memori setiap bulan dan hapus entri yang kedaluwarsa atau salah
- **Gunakan memori manual untuk aturan kritis** — jangan menunggu agen mempelajari sesuatu dengan cara yang sulit
- **Atur tingkat kepentingan yang sesuai** — tidak semua hal kritis, dan itu tidak apa-apa
- **Sematkan pengetahuan esensial** ke tingkatan Core sehingga selalu tersedia

### Cara Kerjanya

Manajemen memori yang baik adalah praktik berkelanjutan, bukan pengaturan satu kali. Mulai dengan membuat beberapa memori manual untuk aturan paling penting Anda. Biarkan agen belajar secara alami dari run-nya. Tinjau secara berkala untuk memperbaiki kesalahan dan menghapus informasi yang kedaluwarsa. Sesuaikan tingkat kepentingan saat pemahaman Anda tentang apa yang penting berkembang.

:::tip
Pikirkan manajemen memori seperti merawat taman. Upaya kecil secara teratur — memangkas, menyiram, menanam kembali — menghasilkan hasil yang jauh lebih baik daripada perbaikan besar sesekali.
:::
  `,
};
