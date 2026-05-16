export const content: Record<string, string> = {
  "why-test-your-agents": `
## Mengapa Menguji Agen Anda?

Pengujian adalah cara Anda menjaga agen tetap dapat dipercaya saat Anda beriterasi. Setiap pengeditan prompt, setiap pertukaran model, setiap alat baru yang Anda tambahkan mengubah perilaku agen dalam cara yang tidak dapat Anda prediksi sepenuhnya dari membaca diff. Pengujian mengubah ketidakpastian itu menjadi bukti: jalankan versi baru terhadap input representatif, bandingkan dengan versi sebelumnya, lihat apakah Anda meningkatkan hal-hal yang Anda maksudkan dan tidak melakukan regresi pada hal-hal yang tidak Anda maksudkan.

Tab Lab pada editor setiap agen adalah tempat ini terjadi. Ia memiliki empat mode — Arena, A-B, Matrix, Eval — masing-masing menjawab pertanyaan yang berbeda. Arena membandingkan model pada prompt yang sama. A-B membandingkan dua prompt pada model yang sama. Matrix menguji kombinasi komponen prompt. Eval adalah grid lengkap: setiap prompt × setiap model.

### Poin Kunci

- **Tangkap regresi sejak dini** — pengujian setelah setiap perubahan adalah cara Anda menghindari "agen dulu berfungsi, apa yang saya rusak?"
- **Bandingkan alternatif secara sistematis** — Arena dan A-B memungkinkan Anda memilih antar opsi dengan bukti daripada perasaan
- **Hasilkan data fitness** — run Lab mengakumulasi skor per-prompt yang memberi makan genome evolution (tier Builder)
- **Set input dapat digunakan kembali** — input uji disimpan per agen; prompt yang sama, data yang sama, perbandingan yang dapat diulang

### Cara Kerjanya

Setiap mode Lab mengirimkan payload trigger yang sama ke beberapa varian agen (prompt berbeda, model berbeda, atau keduanya) secara paralel. Output ditampilkan berdampingan dengan metadata kuantitatif (durasi, biaya, jumlah token) dan tombol rating subjektif Anda. Hasilnya tiba di riwayat uji agen dan diteruskan ke skor fitness.

:::tip
Momen termurah untuk menangkap regresi prompt adalah tepat setelah Anda menulisnya. Jadikan Lab → A-B terhadap versi prompt sebelumnya kebiasaan Anda pada setiap pengeditan prompt; gesekan jauh lebih rendah daripada menemukan regresi dalam run produksi tiga hari kemudian.
:::
  `,

  "the-testing-lab-overview": `
## Ikhtisar Testing Lab

Tab Lab pada editor setiap agen adalah satu workspace dengan empat mode. Pilih mode berdasarkan apa yang ingin Anda pelajari:

### Empat Mode

:::compare
**Arena**
Prompt yang sama, beberapa model. Mengirim satu input melalui Claude / GPT / Gemini / lokal secara paralel. Terbaik untuk "model mana yang tepat untuk agen ini?"
---
**A-B**
Dua prompt, model yang sama. Bandingkan perubahan prompt terhadap pendahulunya di bawah kondisi yang identik. Terbaik untuk "apakah pengeditan ini meningkatkan hal-hal?"
---
**Matrix**
Kombinatorial. Definisikan komponen prompt dan matrix menguji setiap kombinasi (3 × 4 = 12 varian). Terbaik untuk "Saya memiliki beberapa ide yang bersaing — kombo mana yang menang?"
---
**Eval**
Grid lengkap: N prompt × M model. Gambaran lengkap ketika Anda ingin mengoptimalkan prompt *dan* model bersama. Terbaik ketika perubahan besar ada di meja.
:::

### Cara Kerjanya

Setiap mode berbagi pemilih input yang sama (entri manual, paste JSON terstruktur, atau replay eksekusi nyata masa lalu dari riwayat agen ini) dan UI rating yang sama. Kolom output diperluas untuk trace lengkap (panggilan model, panggilan alat, cabang keputusan) seperti eksekusi biasa. Hasil disimpan ke riwayat uji dengan mode uji ditandai, sehingga Anda dapat menjelajahi uji masa lalu berdasarkan mode.

Untuk agen yang dirantai, Lab menguji hanya agen ini — yang hulu di-mock menggunakan input yang Anda tentukan, sehingga Anda dapat beriterasi pada satu tahap pipeline tanpa menjalankan ulang seluruh rantai.

:::tip
Sebagian besar minggu, Arena dan A-B cukup. Matrix adalah untuk "Saya memiliki tiga refactor yang masuk akal dan ingin membandingkan", Eval adalah untuk "Saya sedang merenungkan penulisan ulang besar atau perubahan tier". Jangan langsung memilih mode berat secara default — yang lebih murah biasanya cukup.
:::
  `,

  "arena-testing": `
## Pengujian Arena

Arena mengirim prompt yang sama dan input yang sama ke beberapa model secara paralel, kemudian menampilkan hasilnya berdampingan. Biaya dan durasi ditampilkan di samping output sehingga Anda membandingkan pada tiga sumbu — kualitas (penilaian Anda), kecepatan (diukur engine), dan biaya (token demi token).

Penggunaan paling umum adalah keputusan pemilihan model: "agen ini telah berjalan di Sonnet 4.6, apakah Haiku 4.5 akan bertahan untuk 1/30 biayanya?" Arena menjawab itu dalam satu pengujian daripada minggu-minggu pengamatan produksi.

### Poin Kunci

- **Pengiriman paralel** — semua model berjalan sekaligus; total waktu wall-clock = yang paling lambat, bukan jumlahnya
- **Output berdampingan** — output lengkap setiap model terlihat tanpa beralih tab
- **Biaya + durasi ditampilkan** — di bawah setiap output, dalam tampilan yang sama dengan teks
- **UI rating per kolom** — thumbs-up / thumbs-down / star per model; rating bertahan ke data fitness agen
- **Replay dari riwayat** — uji Arena dapat menarik input dari eksekusi masa lalu mana pun dari agen ini, sehingga Anda menguji pada bentuk nyata

### Cara Kerjanya

Arena mengirimkan satu eksekusi per model yang dipilih menggunakan prompt saat ini agen dan konfigurasi alat. Setiap eksekusi independen (trace terpisah, akuntansi biaya terpisah) dan ditandai \`arena\` sehingga tidak diperhitungkan terhadap metrik produksi normal agen. Hasil muncul sebagai kolom; Anda menilai setiap kolom; rating memberi makan data fitness per-model untuk agen ini.

:::tip
Pilih maksimal 3 model per run Arena. Lebih dari itu dan membaca berdampingan menjadi sulit. Jika Anda mempertimbangkan 5+ model, jalankan beberapa Arena berpasangan dan simpan catatan mental tentang model mana yang memenangkan setiap putaran.
:::
  `,

  "ab-testing-prompts": `
## Pengujian A-B Prompt

A-B menjalankan input yang sama melalui dua varian prompt pada model yang sama, sehingga satu-satunya variabel adalah prompt. Ini adalah alat yang tepat untuk mengevaluasi pengeditan prompt: muat versi sebelumnya sebagai A, versi baru sebagai B, jalankan pada input representatif, dan lihat mana yang menghasilkan hasil yang Anda inginkan.

Pemilih versi Lab terintegrasi dengan riwayat versi prompt — Anda tidak perlu menyalin-tempel versi lama, cukup pilih dari dropdown. Ini membuat "bandingkan draft saya saat ini dengan versi minggu lalu yang berfungsi" menjadi setup satu klik.

### Poin Kunci

- **Dua prompt, satu model, satu input** — perbandingan variabel-tunggal
- **Pilih dari riwayat versi** — A atau B dapat berupa versi masa lalu mana pun dari prompt agen ini
- **Kesetiaan trace yang sama** — kedua varian mendapat trace eksekusi lengkap, sehingga Anda dapat membandingkan pola panggilan alat, bukan hanya output akhir
- **Beberapa putaran input** — jalankan A-B terhadap beberapa input berbeda secara berurutan untuk menguji generalisasi, bukan hanya satu kasus yang beruntung
- **Skor bertahan ke fitness** — rating A-B memberi makan data fitness yang sama yang digunakan Arena dan genome

### Cara Kerjanya

Engine A-B mengirimkan kedua prompt sebagai eksekusi independen dan memberi label A dan B di panel hasil. Selain itu, mereka adalah eksekusi reguler — trace yang sama, akuntansi biaya yang sama, tetapi ditandai \`ab_test\` sehingga mereka dapat disaring dalam riwayat uji dan tidak mencemari metrik produksi.

:::code-compare
### Version A
Summarize the document.
Keep it short.
---
### Version B
Summarize the document in exactly
3 bullet points. Each bullet should
be one sentence. Start with the
most important finding.
:::

:::warning
Ubah satu hal per putaran A-B. Jika B berbeda dari A dalam *baik* format *maupun* nada *maupun* panjang, Anda tidak dapat memberi tahu dimensi mana yang menyebabkan perubahan skor. Buat satu perubahan, jalankan A-B, terima atau tolak, lalu buat perubahan berikutnya.
:::
  `,

  "matrix-testing": `
## Matrix Testing

Matrix adalah A-B-C-D-… kombinatorial sekaligus. Anda mendefinisikan prompt Anda sebagai komponen (intro × instructions × output-format, misalnya) dan matrix menghasilkan setiap kombinasi, mengirim semuanya, dan mengurutkan hasilnya berdasarkan skor fitness.

Dengan 3 komponen masing-masing 3 opsi itu 27 kombinasi — jauh lebih banyak daripada yang akan Anda uji secara manual tetapi mudah bagi engine untuk fan-out secara paralel. Matrix paling berguna ketika Anda memiliki beberapa ide bersaing tentang bagaimana menyusun prompt dan ingin menemukan kombinasi yang benar-benar berkinerja terbaik daripada yang Anda tebak.

### Poin Kunci

- **Definisikan komponen, dapatkan kombinasi** — matrix memperluas komponen menjadi semua kombinasi valid
- **Pengiriman paralel** — setiap kombo berjalan bersamaan (tergantung batas rate provider)
- **Hasil yang diurutkan** — grid yang dinilai fitness, diurutkan dari terbaik ke terburuk
- **Atribusi tingkat-komponen** — lihat komponen mana yang berkorelasi dengan skor tinggi; berguna bahkan ketika Anda tidak mengadopsi pemenang teratas secara verbatim
- **Simpan kombo pemenang** — satu klik untuk mengatur kombinasi pemenang sebagai prompt aktif agen

### Cara Kerjanya

Anda mendefinisikan setiap komponen sebagai set varian yang diberi label di tab matrix. Engine membangun setiap kombinasi sebagai prompt yang dapat dirender dan mengirimkan masing-masing sebagai eksekusi independen. Hasil dikumpulkan ke dalam grid yang diurutkan berdasarkan sinyal fitness pilihan Anda (rating, biaya-per-kualitas, kecepatan, kustom). Atribusi per-komponen dihitung dengan merata-ratakan fitness di seluruh kombinasi yang berbagi komponen itu — sehingga bahkan jika tidak ada pemenang tunggal yang menonjol, Anda belajar intro / gaya instruksi / format output mana yang berkinerja terbaik secara rata-rata.

:::info
Dengan 3 komponen × 3 opsi = 27 varian. Dengan 4 × 4 = 256. Matrix dapat menangani grid besar tetapi Anda akan membakar token secara proporsional. Mulai dengan 3 × 3 dan hanya berkembang jika hasilnya benar-benar ambigu.
:::

:::tip
Matrix paling berguna tepat setelah desain ulang besar dari prompt. Ketika Anda tidak yakin apakah struktur baru lebih baik daripada yang lama, uji-matrix 3-4 struktur kandidat terhadap beberapa input representatif — pemenangnya biasanya lebih jelas daripada yang Anda harapkan.
:::
  `,

  "eval-testing": `
## Eval Testing

Eval adalah grid lengkap: setiap varian prompt × setiap model. Anda memilih prompt (biasanya 2-3 kandidat), memilih model (biasanya 2-4), dan eval grid menjalankan semua kombinasi dan menyajikan heatmap skor. Pasangan prompt-model terbaik disorot.

Ini adalah mode kelas berat — paling mahal dalam token, paling menyeluruh dalam cakupan. Gunakan ketika Anda membuat keputusan besar yang memengaruhi kedua sumbu: "kami sedang mempertimbangkan untuk menulis ulang prompt dan pindah ke model yang lebih murah, dapatkah kami melakukan keduanya sekaligus dan tetap mencapai bar kualitas kami?"

### Poin Kunci

- **N prompt × M model** — heatmap skor di kedua dimensi
- **Kombinasi terbaik disorot** — diurutkan-fitness, dengan sel optimal disorot secara visual
- **Breakdown per-sumbu** — lihat apakah perubahan prompt atau perubahan model yang mendorong perubahan skor
- **Ditandai-riwayat-uji** — run eval tiba di riwayat di bawah tag \`eval\` untuk tinjauan nanti
- **Adopsi satu klik** — terapkan kombinasi terbaik (versi prompt + pemilihan model) ke agen langsung

### Cara Kerjanya

Eval mengirimkan eksekusi \`prompts × models\` secara paralel (tergantung batas rate provider). Setiap sel adalah satu eksekusi independen dengan trace-nya sendiri. Tampilan grid mengagregasi berdasarkan pasangan prompt-model; Anda menilai sel menggunakan UI yang sama seperti Arena dan A-B; skor fitness bergulir ke peringkat per-sel. Sel teratas adalah kombinasi yang direkomendasikan — adopsi langsung dari tampilan grid.

:::warning
Eval adalah mode paling mahal. 3 prompt × 4 model × 5 input = 60 eksekusi, masing-masing dengan panggilan model sendiri. Jalankan secara hemat, pada set input representatif, dan hanya ketika keputusan benar-benar melintasi kedua sumbu. Untuk keputusan hanya-prompt, A-B; untuk keputusan hanya-model, Arena.
:::
  `,

  "rating-and-scoring-results": `
## Rating dan Penilaian Hasil

Setelah pengujian Lab apa pun, setiap baris output memiliki kontrol rating: thumbs-up / thumbs-down untuk penilaian biner, atau skala 1-5 bintang untuk kasus bernuansa. Rating Anda memberi makan dua hal: skor fitness per-varian agen (digunakan untuk peringkat dalam matrix dan eval, dan sebagai tekanan seleksi genome-evolution pada tier Builder), dan sinyal preferensi pribadi di seluruh pengujian Anda dari waktu ke waktu.

Rating bersifat pribadi — mereka mengkodekan penilaian Anda tentang kualitas, bukan metrik objektif. Itu disengaja; Anda adalah orang yang tahu apakah output agen sesuai dengan apa yang Anda butuhkan, dan itu adalah sinyal yang dioptimalkan sistem.

### Poin Kunci

- **Biner atau 1-5 bintang** — pilih skala apa pun yang Anda nyaman untuk konsisten
- **Rating per-output** — setiap output uji mendapat baris kontrol rating sendiri; tidak ada yang diagregasi secara otomatis sampai Anda menilai
- **Mendorong skor fitness** — rating memberi makan sinyal fitness per-varian yang digunakan Matrix / Eval / genome
- **Riwayat umpan balik bertahan** — setiap rating yang pernah Anda berikan disimpan; berguna untuk "apakah saya menilai X lebih tinggi dari Y dalam uji masa lalu?"
- **Konsistensi lebih penting daripada presisi** — 4-bintang yang akan Anda berikan secara konsisten lebih berguna daripada 5-bintang yang Anda berikan sekali dan tidak pernah lagi

### Cara Kerjanya

Rating disimpan terhadap eksekusi spesifik (trace, versi prompt, model, input). Agregator fitness membaca rating + metrik objektif (biaya, durasi, sukses) dan menghitung skor fitness per-varian yang digunakan dalam peringkat. Genome evolution (tier Builder) menggunakan rating sebagai tekanan seleksi utama untuk memilih prompt induk untuk dibiakkan.

:::tip
Nilai berdasarkan apa yang sebenarnya Anda inginkan, bukan apa yang secara teknis mengesankan. Jawaban pendek yang benar sering mengalahkan yang panjang dan rumit. Sistem mengoptimalkan terhadap preferensi Anda, jadi rating yang jujur dan konsisten menghasilkan agen yang disetel dengan penilaian *Anda*.
:::
  `,

  "genome-evolution-basics": `
## Dasar-dasar Genome Evolution

Genome evolution (tier Builder) secara otomatis membiakkan varian prompt baru dari uji masa lalu Anda yang dinilai terbaik. Setiap "generasi" memutasi dan menggabungkan ulang prompt yang berkinerja terbaik dari generasi sebelumnya; selama beberapa generasi, prompt menyatu pada konfigurasi yang secara konsisten mencetak lebih baik daripada titik awal Anda. Ini adalah pencarian evolusioner dengan rating Anda sebagai fungsi fitness.

Prosesnya tanpa pengawasan setelah Anda memulainya. Anda menyediakan prompt awal dan sinyal fitness (biasanya riwayat rating Anda plus metrik objektif opsional seperti biaya atau durasi), mengatur ukuran populasi dan jumlah generasi, dan membiarkannya berjalan. Trigger normal agen tetap dijeda selama evolusi untuk menjaga perbandingan tetap bersih.

:::info
Genome evolution tanpa pengawasan setelah dimulai. Anda mengatur parameter, engine membuat variasi, mengujinya terhadap set input Anda, menilainya berdasarkan rating Anda, dan menggabungkan ulang pemenang ke generasi berikutnya. Anda meninjau populasi akhir dan mengadopsi pemenang secara manual — sistem tidak pernah diam-diam mengubah prompt langsung Anda.
:::

### Poin Kunci

- **Variasi + seleksi otomatis** — engine menghasilkan mutasi dari induk berkinerja teratas dan memilih melalui fitness
- **Generasi + populasi** — konfigurasi tipikal adalah 5-10 generasi dari 8-12 varian masing-masing
- **Fungsi fitness = rating Anda** — sinyal utama; sinyal sekunder (biaya, durasi) adalah bobot yang dapat dikonfigurasi
- **Semua generasi diversi** — setiap prompt yang dihasilkan dipertahankan dalam riwayat versi agen; tidak ada yang hilang
- **Adopsi manual** — engine tidak pernah diam-diam menukar prompt langsung Anda; Anda meninjau dan mengadopsi pemenang

### Cara Kerjanya

Setiap generasi dimulai dengan populasi induk. Engine menghasilkan varian anak melalui mutasi terstruktur kecil (penggantian kata, penyusunan ulang bagian, menyesuaikan contoh, dll.) dan crossover (menggabungkan segmen dari dua induk). Setiap anak berjalan terhadap set input Anda; rating menghasilkan skor fitness; anak-anak berskor teratas menjadi populasi induk untuk generasi berikutnya. Setelah jumlah generasi yang dikonfigurasi, Anda melihat populasi akhir yang diperingkat dan dapat mengadopsi varian mana pun.

### Lihat dalam Aksi

:::usecases
**Penyetelan triase email**
Prompt saat ini salah mengklasifikasikan 15% email
---
Jalankan 5 generasi populasi 10. Berakhir dengan varian yang salah mengklasifikasikan 3% — adopsi dengan satu klik.
===
**Konsistensi format**
Format output agen tidak konsisten di seluruh bentuk input
---
Genome berevolusi pada set input yang beragam dengan kesesuaian format sebagai sinyal fitness; output stabil.
===
**Pengurangan biaya tanpa kehilangan kualitas**
Anda ingin menemukan prompt yang lebih ramping yang masih menghasilkan output yang baik
---
Tambahkan biaya-per-token ke fungsi fitness dengan bobot negatif; evolusi menemukan prompt yang lebih pendek yang mempertahankan rating.
:::

:::info
Setiap varian yang dibuat selama evolusi diversi dalam riwayat prompt agen. Jika varian N+1 yang diadopsi ternyata berperilaku buruk dalam produksi, memulihkan varian N adalah satu klik — tidak ada pekerjaan yang hilang.
:::

:::tip
Kesabaran membayar. Generasi 1 biasanya tidak secara dramatis lebih baik daripada prompt awal Anda — mutasi kecil dan banyak yang gagal. Pada generasi 3-4 populasi yang bertahan terkonsentrasi pada peningkatan yang sebenarnya; itulah saat Anda biasanya akan melihat pemenang yang jelas.
:::
  `,

  "running-a-breeding-cycle": `
## Menjalankan Siklus Pembiakan

"Siklus pembiakan" adalah satu run evolusi penuh: pilih agen, atur parameter, mulai, tunggu, tinjau populasi, adopsi. Setiap siklus adalah N generasi dari M varian yang diuji terhadap set input pilihan Anda. Total biaya kira-kira \`generations × population × input-count × per-run-cost\` — dapat diprediksi dari parameter.

Tab Genome di Lab adalah titik masuk. Ini terbuka dengan parameter default yang disetel untuk titik awal representatif (5 generasi × 10 varian × 5 input), yang cukup untuk melihat perubahan yang berarti tanpa membakar token berlebihan. Sesuaikan parameter sebelum memulai jika Anda ingin siklus yang lebih berat atau lebih ringan.

:::steps
1. **Buka Lab → Genome** pada agen yang ingin Anda evolusikan
2. **Pilih set input** — entri manual, set yang disimpan, atau replay-dari-riwayat
3. **Konfigurasi bobot fitness** — bobot rating (utama), bobot biaya (negatif jika Anda ingin lebih pendek), bobot durasi (negatif jika Anda ingin lebih cepat)
4. **Atur generasi dan populasi** — 5 × 10 adalah default; naikkan keduanya untuk masalah yang lebih sulit, turunkan keduanya untuk eksperimen cepat
5. **Klik Start Cycle** — engine berjalan tanpa pengawasan; Anda dapat membiarkan aplikasi terbuka atau kembali nanti
6. **Tinjau populasi akhir** — diperingkat berdasarkan fitness, dengan trace setiap varian tersedia
7. **Adopsi pemenang** — atau varian lain yang Anda sukai; prompt aktif agen diperbarui dan populasi penuh siklus dipertahankan dalam riwayat versi
:::

### Cara Kerjanya

Setiap generasi berjalan paralel: engine mengirimkan semua M varian secara bersamaan (tergantung batas rate provider) di seluruh set input, mengumpulkan hasil, menilainya melalui fungsi fitness, memilih performer teratas sebagai induk, menghasilkan anak untuk generasi berikutnya, dan berlanjut. UI progres menampilkan langsung fitness terbaik dan rata-rata per-generasi sehingga Anda dapat melihat apakah populasi meningkat.

:::tip
Mulai dengan set input kecil (3-5 kasus representatif) dan siklus default 5 × 10. Jika hasilnya jelas meningkat, Anda selesai. Jika ambigu, perluas set input dan jalankan siklus lain mulai dari pemenang sebelumnya. Beriterasi siklus sering mengalahkan satu siklus raksasa.
:::
  `,

  "adopting-evolved-prompts": `
## Mengadopsi Prompt yang Berevolusi

Ketika siklus pembiakan selesai, Anda melihat populasi akhir yang diperingkat berdasarkan fitness dengan varian teratas disorot. Mengadopsi adalah satu klik — varian menjadi prompt aktif agen, prompt aktif sebelumnya dipertahankan dalam riwayat versi (sehingga rollback juga satu klik), dan populasi penuh siklus juga dipertahankan jika Anda ingin mengadopsi varian yang berbeda nanti.

Aksi adopsi menjalankan pemeriksaan pre-flight yang sama seperti perubahan prompt lainnya: setup-status memverifikasi bahwa kredensial dan alat agen masih valid, versi di-checkpoint dalam riwayat, dan jika agen memiliki trigger terjadwal, run terjadwal berikutnya menggunakan varian yang diadopsi secara otomatis.

### Poin Kunci

- **Adopsi satu klik** dari tampilan populasi yang diperingkat
- **Versi sebelumnya dipertahankan** dalam riwayat; pemulihan juga satu klik
- **Populasi penuh dipertahankan** — varian apa pun dari siklus tetap dapat diadopsi nanti
- **Pemeriksaan pre-flight berjalan** — verifikasi setup-status, validasi kredensial, kompatibilitas trigger
- **Trigger langsung secara otomatis menggunakan varian baru** — tidak ada langkah "deploy" terpisah

### Cara Mengadopsi

:::steps
1. **Tunggu siklus pembiakan selesai** — biasanya 10-30 menit tergantung parameter
2. **Buka tampilan populasi akhir** — varian diperingkat berdasarkan fitness dengan trace dapat diakses per varian
3. **Baca prompt varian teratas** — pemeriksaan kewarasan cepat untuk frasa tak terduga atau mutasi aneh
4. **Secara opsional periksa varian peringkat ke-2 / ke-3** — kadang-kadang fitness yang sedikit lebih rendah datang dengan prompt yang jauh lebih pendek / bersih
5. **Klik Adopt** pada pilihan Anda; pemeriksaan pre-flight berjalan; prompt aktif agen diperbarui secara atomik
6. **Verifikasi run langsung berikutnya** — biasanya Manual Run dengan input representatif adalah konfirmasi termurah bahwa varian yang diadopsi berperilaku seperti yang dijanjikan skor uji
:::

:::tip
Baca varian yang diadopsi sebelum mengklik Adopt. Evolusi menemukan prompt fitness-tinggi, tetapi kadang-kadang varian mencetak baik dengan mengeksploitasi beberapa keanehan set input Anda; membaca prompt adalah pemeriksaan keamanan yang menangkap "ini juga akan lulus tes saya tetapi aneh".
:::
  `,

  "fitness-scoring-explained": `
## Penilaian Fitness Dijelaskan

Fitness adalah satu angka yang menggerakkan seleksi Matrix / Eval / Genome. Ia menggabungkan rating manual Anda (sinyal utama) dengan metrik objektif (biaya, durasi, tingkat sukses, kesesuaian target panjang-output, sinyal kustom) menjadi skor berbobot. Anda mengonfigurasi bobot per agen atau per uji — secara default, rating mendominasi dan metrik objektif adalah tiebreaker.

Skor dihitung per varian per input, kemudian diagregasi di semua input dalam set uji untuk menghasilkan satu fitness per varian. Varian diperingkat berdasarkan fitness agregat; peringkat itulah yang dikonsumsi algoritma seleksi genome dan apa yang digunakan UI Lab untuk menyoroti pemenang.

### Poin Kunci

- **Satu skor agregat per varian** — biasanya 0,0–1,0 atau 0–100 tergantung preferensi tampilan
- **Beberapa sumber input** — rating (utama), biaya, durasi, sukses, kesesuaian format output, fungsi fitness kustom
- **Bobot per-agen** — tekankan apa yang penting; untuk agen sensitif-biaya, bobot biaya lebih; untuk yang sensitif-kualitas, bobot rating lebih
- **Agregasi di seluruh input** — varian dinilai pada setiap input lalu dirata-ratakan, sehingga varian yang brilian pada satu input dan rusak pada yang lain mencetak lebih buruk daripada yang stabil tetapi biasa-biasa saja
- **Breakdown transparan** — klik angka fitness mana pun untuk melihat kontribusi per-sinyal

### Cara Kerjanya

Agregator fitness membaca hasil eksekusi (biaya, durasi, sukses), riwayat rating (per eksekusi), dan sinyal fitness kustom apa pun yang terdaftar untuk agen. Masing-masing dinormalisasi ke rentang 0-1, dikalikan dengan bobot yang dikonfigurasi, dan dijumlahkan. Hasilnya adalah fitness varian; agregat di seluruh input dalam set uji adalah skor yang ditampilkan.

:::tip
Bobot default (90% rating, 10% biaya) disetel untuk sebagian besar agen. Jika Anda mendapati diri Anda tidak setuju dengan "pemenang" sistem dalam uji eval / matrix, penyesuaian paling berguna biasanya adalah menaikkan bobot rating lebih lanjut (95%) sehingga sistem lebih mempercayai penilaian Anda. Sesuaikan bobot biaya ke atas untuk agen volume-sangat-tinggi di mana biaya token adalah perhatian nyata.
:::
  `,

  "test-history-and-trends": `
## Riwayat dan Tren Uji

Setiap pengujian Lab yang Anda jalankan dipertahankan dalam riwayat uji agen. Tampilan riwayat (Lab → History) menampilkan uji masa lalu yang diurutkan berdasarkan tanggal dengan tag mode, set input, skor fitness, dan hasil akhir (diadopsi / ditolak / digantikan). Klik uji masa lalu mana pun untuk membukanya kembali dalam mode aslinya untuk peninjauan ulang atau untuk mengkloning parameter ke dalam uji baru.

Sub-tab Trends memplot metrik tingkat-agen dari waktu ke waktu — fitness dari prompt yang saat ini aktif, biaya-per-run, durasi-per-run, tingkat hasil-bisnis. Plot diberi anotasi dengan event signifikan (perubahan prompt, pertukaran model, penambahan trigger) sehingga Anda dapat melihat dampak setiap perubahan pada metrik agen langsung.

### Poin Kunci

- **Setiap uji dipertahankan** — input lengkap, output, rating, fitness; tidak ada yang di-GC
- **Ditandai mode** — saring berdasarkan Arena / A-B / Matrix / Eval / Genome untuk menemukan uji masa lalu tertentu
- **Bagan tren** dengan anotasi otomatis pada setiap titik perubahan yang berarti
- **Bandingkan uji masa lalu dengan status saat ini** — berguna untuk "apakah prompt saat ini masih lebih baik daripada yang saya tolak tiga minggu lalu?"
- **Dapat diekspor** — riwayat uji diekspor ke CSV untuk analisis eksternal

### Cara Kerjanya

Hasil uji disimpan di penyimpanan eksekusi yang sama dengan run produksi, dengan tag mode-uji untuk penyaringan. Tampilan Trends mengagregasi dari penyimpanan ini; anotasi otomatis diekstrak dari riwayat-versi dan riwayat-konfigurasi (yang juga persisten). Tidak ada dalam riwayat yang dapat diubah — uji masa lalu adalah record tidak dapat diubah dari apa yang diuji kapan.

:::tip
Tampilan Trends adalah tempat terbaik untuk menjawab "apakah agen saya benar-benar menjadi lebih baik dari waktu ke waktu?" Buka sebulan sekali; jika tren fitness datar atau menurun, perubahan terbaru tidak membantu dan saatnya untuk berpikir daripada mengirim lebih banyak perubahan.
:::
  `,
};
