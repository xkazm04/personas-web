export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Bagaimana Personas Menjaga Data Anda Tetap Aman

Keamanan dibangun ke dalam Personas dari dasarnya. API key, token, dan password tinggal di vault terenkripsi lokal di mesin Anda sendiri — mereka tidak pernah meninggalkan perangkat kecuali agen secara eksplisit mengirimkannya ke penyedia AI atau layanan pihak ketiga selama run. File vault itu sendiri dienkripsi dengan **AES-256-GCM**, dan key yang membukanya dibungkus oleh keyring native OS (Windows DPAPI, macOS Keychain, Linux Secret Service) sehingga key plaintext tidak pernah berada di disk.

Ketika Anda menjalankan agen, engine mendekripsi hanya kredensial spesifik yang dibutuhkan agen itu, menyimpannya di memori selama panggilan, lalu menghapus plaintext-nya. Log, trace, dan ekspor tidak pernah berisi nilai kredensial mentah — di mana pun kredensial muncul, Anda melihat referensi token (\`cred:gmail-work\`) sebagai gantinya.

### Poin Kunci

- **AES-256-GCM** — enkripsi terotentikasi (ciphertext setiap kredensial diperiksa integritasnya, sehingga file vault yang dirusak terdeteksi, bukan didekripsi secara diam-diam)
- **Master key yang dibungkus OS keyring** — DPAPI di Windows, Keychain di macOS, Secret Service di Linux; tidak ada master password yang harus diketik setiap sesi
- **Hanya-lokal secara default** — tidak ada yang diunggah; cloud deploy bersifat opt-in dan mengenkripsi dalam transit melalui TLS ke orkestrator pilihan Anda
- **Referensi token dalam log** — trace agen dan ekspor menggunakan ID kredensial, bukan rahasia mentah
- **Bukti gangguan** — tag autentikasi GCM menangkap setiap modifikasi pada file vault

### Cara Kerjanya

Menyimpan kredensial mengenkripsinya dengan vault key (key AES-256-GCM per-vault, itu sendiri dibungkus oleh OS keyring) dan menulis ciphertext ke SQLite lokal. Menggunakan kredensial selama run agen mendekripsinya di memori, meneruskannya ke alat atau klien HTTP yang relevan, dan melepaskan buffer segera. Nilai mentah tidak pernah dicatat, tidak pernah ditampilkan setelah entri awal, dan tidak pernah diserialisasi di mana pun di luar vault terenkripsi.

### Lihat dalam Aksi

:::usecases
**Beberapa layanan, kredensial terisolasi**
Agen Anda berbicara ke Slack, GitHub, dan Jira
---
Setiap kredensial dienkripsi secara independen dengan nonce acaknya sendiri. Kompromi pada satu record tidak mengekspos yang lain.
===
**Rotasi kredensial**
Token kedaluwarsa atau dirotasi
---
Kredensial OAuth menyegarkan secara otomatis melalui refresh token penyedia. Key yang dirotasi manual Anda tukar pada record kredensial tanpa me-restart apa pun.
===
**Trace ramah-audit**
Anda perlu membuktikan kredensial mana yang digunakan di mana
---
Trace setiap run mencatat ID kredensial yang digunakannya. Nilai sebenarnya tidak pernah muncul; ID cukup untuk menunjukkan provenance.
:::

:::info
Vault terikat ke akun pengguna OS Anda melalui OS keyring. Menyalin file vault ke mesin yang berbeda, bahkan dengan OS yang sama, tidak akan membuatnya dapat didekripsi — wrapping key tinggal di OS keyring dan tidak portabel.
:::

:::warning
Jika Anda mengubah password akun OS di macOS atau Linux, keyring mungkin mengunci ulang wrapping key. Personas akan meminta kredensial baru pada run pertama setelah perubahan. Jika keyring dihapus (reset pabrik, penghapusan akun), vault menjadi tidak dapat dipulihkan — backup rahasia mentah secara eksternal jika Anda perlu pemulihan bencana di luar mesin lokal.
:::

:::tip
Model hanya-lokal adalah default yang tepat untuk otomatisasi pribadi. Untuk pekerjaan tim / produksi di mana beberapa mesin membutuhkan kredensial yang sama, cloud deploy (tier Team / Builder) mereplikasi status vault melalui orkestrator dengan enkripsi end-to-end.
:::
  `,

  "adding-a-new-credential": `
## Menambahkan Kredensial Baru

Buka Connections → Credentials dan klik \`Add Credential\`. Pilih kategori (email, cloud storage, pembayaran, komunikasi, alat developer, CRM, penyedia AI, generik) — pemilih menampilkan connector pra-konfigurasi yang cocok yang secara otomatis mengonfigurasi jenis auth, field yang diperlukan, dan petunjuk label. Jika layanan Anda tidak ada di katalog, pilih "Custom" dan definisikan kredensial sendiri (nama, jenis, field).

Untuk layanan yang mendukung OAuth, alur membuka jendela browser ke layar persetujuan penyedia. Untuk layanan API-key, tempel key ke input aman. Apa pun caranya, kredensial tiba dalam keadaan terenkripsi dan pemilih menawarkan untuk menerapkannya ke agen mana pun yang memiliki slot kapabilitas terbuka di kategori yang cocok.

### Langkah demi Langkah

:::steps
1. **Navigasi ke Connections → Credentials** — sidebar → Connections, lalu tab Credentials
2. **Klik Add Credential** — tombol kanan-atas pada daftar kredensial
3. **Pilih kategori** — email / storage / payments / dll.; katalog connector yang cocok menyaring secara otomatis
4. **Jalankan alur auth** — OAuth membuka jendela persetujuan; layanan API-key menggunakan field input aman
5. **Beri nama dan simpan** — beri kredensial label yang akan Anda kenali ("Stripe Live", "Gmail Personal"); kredensial dienkripsi dengan AES-256-GCM dan dipersistenkan
6. **Opsional: ikat ke agen sekarang** — pemilih menampilkan agen dengan kapabilitas terbuka yang cocok; ikat satu klik menghindari pencarian nanti
:::

### Cara Kerjanya

Ketika Anda mengklik Save, nilai mentah kredensial dienkripsi dengan vault key yang berasal dari OS keyring, kemudian di-commit ke credential store. Save hanya mengembalikan ID kredensial dan label — nilai mentah dihapus dari memori segera. Sejak saat ini, tab Connectors editor agen dapat mereferensikan kredensial dengan ID.

:::warning
Jangan pernah menempelkan kredensial ke prompt agen, komentar kode, atau jendela chat. Gunakan field input kredensial aman saja — yang lain berisiko menangkap nilai mentah dalam log, sinkronisasi, atau tangkapan layar.
:::

:::tip
Konvensi penamaan penting setelah Anda memiliki 20+ kredensial. \`<layanan>-<env>-<akun>\` ("stripe-live-main", "gmail-prod-support") membuat segera jelas kredensial mana yang harus dipilih saat Anda mengonfigurasi tab Connectors agen.
:::
  `,



  "credential-health-checks": `
## Pemeriksaan Kesehatan Kredensial

Kredensial melenceng seiring waktu — token kedaluwarsa, key dirotasi di hulu, scope OAuth berubah. Pemeriksaan kesehatan kredensial mem-ping setiap kredensial yang disimpan secara berkala dengan panggilan pengujian ringan (permintaan API no-op yang tidak berbiaya dan memberitahu Anda apakah kredensial masih valid). Hasilnya muncul sebagai indikator status pada kartu kredensial dan sebagai peringatan ketika kredensial menurun.

Jadwal pemeriksaan dapat dikonfigurasi. Secara default, kredensial OAuth memeriksa setiap hari (karena alur refresh-token perlu kredensial dilatih secara berkala), kredensial API-key memeriksa setiap minggu. Pemeriksaan manual dapat dijalankan kapan saja dari kartu kredensial.

### Poin Kunci

- **Status per-kredensial** — hijau (sehat), kuning (segera kedaluwarsa / scope berubah), merah (rusak / dicabut)
- **Irama yang dapat dikonfigurasi** — penimpaan per-kredensial jika layanan membatasi pemeriksaan agresif
- **Pemeriksaan manual** — uji satu klik dari kartu kredensial; berguna sebelum men-deploy agen baru
- **Proyeksi kedaluwarsa** — untuk kredensial dengan tanggal kedaluwarsa yang diketahui (JWT yang ditandatangani, token bercakupan), status berubah ke kuning N hari sebelum kedaluwarsa (dapat dikonfigurasi, default 7)
- **Routing peringatan** — kegagalan dirutekan melalui saluran notifikasi yang sama yang telah Anda konfigurasikan untuk agen

### Cara Kerjanya

Setiap connector mendefinisikan panggilan pemeriksaan kesehatannya sendiri (permintaan paling ringan yang melatih kredensial). Pemeriksaan berjalan di latar belakang pada irama yang dikonfigurasi; hasilnya dipersistenkan dan memperbarui status kredensial. Jika pemeriksaan gagal, status berubah, kartu kredensial disorot, dan agen yang bergantung mewarisi peringatan pada indikator kesehatan mereka sendiri — sehingga kredensial Gmail yang rusak membuat setiap agen yang menggunakan Gmail menampilkan kuning sampai Anda memperbaikinya.

:::tip
Jalankan pemeriksaan kesehatan manual sebelum deploy produksi atau run terjadwal semalam. Lima detik sekarang versus run gagal pada pukul 3 pagi karena token diam-diam dirotasi.
:::
  `,

  "auto-credential-browser": `
## Auto-Credential Browser

Auto-credential browser adalah onboarding yang digerakkan katalog untuk kredensial baru. Buka Connections → Catalog dan Anda melihat setiap connector yang dikirim Personas dengan pra-konfigurasi: 60+ layanan saat penulisan ini, diorganisasikan berdasarkan kategori (email, storage, pembayaran, komunikasi, alat developer, CRM, penyedia AI, dll.). Setiap connector mengetahui jenis auth yang tepat, field yang diperlukan, scope OAuth, endpoint API, dan keanehan khusus layanan.

Ketika Anda memilih connector, wizard memandu Anda melalui langkah-langkah persis untuk layanan tersebut — termasuk tautan ke halaman spesifik di UI layanan di mana Anda akan menemukan API key, atau scope OAuth mana yang harus disetujui, atau izin apa yang penting. Untuk layanan di mana Personas dapat mendeteksi koneksi yang berhasil (kebanyakan), wizard memverifikasi secara real-time sebelum menyimpan.

### Poin Kunci

- **60+ connector pra-konfigurasi** — jenis auth, field, scope, endpoint dimasak ke dalam
- **Panduan khusus layanan** — tautan langsung ke halaman API-key atau tab pengaturan yang tepat
- **Validasi langsung** — wizard menguji kredensial sebelum menyimpan untuk sebagian besar layanan
- **Alur disarankan-untuk-agen** — katalog juga dapat dimasukkan dari tab Connectors agen, di mana ia disaring ke connector yang cocok dengan slot kapabilitas terbuka
- **Minta connector baru** — layanan yang belum ada di katalog dapat diminta; untuk one-off, gunakan jenis connector Generic / Custom

### Cara Kerjanya

Definisi connector dikirim bersama aplikasi dan diperbarui melalui siklus rilis reguler. Setiap definisi mendeklarasikan alur auth-nya, field yang diperlukan, endpoint validasi, dan daftar scope. Ketika Anda memilih connector, wizard membaca definisi, merender form yang cocok, menjalankan alur OAuth atau API-key, dan memvalidasi sebelum menyimpan. Nilai kredensial aktual dienkripsi pada waktu penyimpanan menggunakan jalur yang sama dengan kredensial yang ditambahkan manual.

:::tip
Katalog juga merupakan cara tercepat untuk menemukan apa yang terintegrasi. Jika Anda mempertimbangkan apakah Personas dapat melakukan X dengan layanan Y, cari katalog terlebih dahulu — jika Y ada di sana dengan kapabilitas yang relevan, integrasi adalah satu klik.
:::
  `,

  "which-agents-use-which-credentials": `
## Agen Mana Menggunakan Kredensial Mana

Tab Dependencies pada Connections menunjukkan grafik kredensial → agen. Pilih kredensial di sebelah kiri dan Anda melihat setiap agen yang mereferensikannya di sebelah kanan, dengan slot kapabilitas spesifik yang dinamai ("akun Gmail untuk agen email-summary"). Pilih agen dan Anda melihat setiap kredensial yang bergantung padanya. Grafik bersifat dua arah — berguna untuk "apa yang rusak jika saya merotasi key ini?" dan "kredensial mana yang dibutuhkan agen ini sebelum saya dapat mempromote-nya?".

Peta dependensi yang sama menggerakkan pemeriksaan pre-flight build engine: ketika Anda mempromote agen, engine memeriksa silang setiap kapabilitas yang diperlukan terhadap vault dan menandai kredensial yang hilang atau kedaluwarsa sebelum mengizinkan promote. Inilah sebabnya Anda hampir tidak pernah mendapatkan error "credential not found" saat runtime pada agen yang baru dibuat — pemeriksaan dependensi berjalan pada waktu promote dan menangkapnya.

### Poin Kunci

- **Grafik dua arah** — kredensial → agen dan agen → kredensial
- **Slot kapabilitas dinamai** — dependensi memberi tahu Anda tidak hanya "kredensial ini digunakan" tetapi "digunakan sebagai kapabilitas email-send"
- **Pemeriksaan pre-flight** — validasi waktu-promote yang menggunakan grafik yang sama
- **Pratinjau dampak** — memilih kredensial menyorot setiap agen yang akan terpengaruh oleh penghapusannya
- **Deteksi kredensial-tidak-digunakan** — kredensial dengan nol dependensi agen muncul di ringkasan Connections sehingga Anda dapat membersihkannya

### Cara Kerjanya

Tab Connectors setiap agen menyimpan referensi kredensial per slot kapabilitas. Tampilan Dependencies meminta penyimpanan ini di kedua arah untuk merender grafik. Event rotasi kredensial, kedaluwarsa, atau penghapusan menyebar melalui grafik: agen mana pun yang bergantung pada kredensial yang menurun mewarisi keadaan peringatan pada indikator kesehatannya, jadi grafik bukan hanya referensi statis — ini jalur propagasi langsung.

:::warning
Sebelum merotasi atau menghapus kredensial apa pun yang digunakan oleh agen tanpa pengawasan (terjadwal / webhook / chain), periksa peta dependensi dan perbarui agen untuk menunjuk ke kredensial pengganti terlebih dahulu. Pemeriksaan pre-flight menangkap Anda pada waktu promote; untuk agen yang sudah dipromote, kegagalan runtime adalah satu-satunya sinyal.
:::

:::tip
Rutinitas "audit kredensial" bulanan: buka Connections → Dependencies, urutkan berdasarkan tertua, dan tanyakan "apakah saya masih menggunakan kredensial ini?" untuk selusin terbawah. Kredensial yang tidak digunakan adalah permukaan serangan untuk apa-apa, jadi menghapusnya adalah pembersihan murni.
:::
  `,

  "refreshing-expired-tokens": `
## Menyegarkan Token Kedaluwarsa

Beberapa kredensial terbatas waktu secara desain — token akses OAuth kedaluwarsa dalam hitungan menit hingga jam; token yang diterbitkan layanan (token bot Slack, GitHub PAT) sering memiliki kedaluwarsa N-hari atau N-tahun. Personas melacak kedaluwarsa di tempat penyedia mempublikasikannya dan memunculkan status kuning "akan kedaluwarsa" beberapa hari sebelum batas waktu (dapat dikonfigurasi, default 7 hari).

Untuk kredensial OAuth dengan refresh token, refresh bersifat otomatis dan diam-diam di latar belakang. Untuk API key dan token yang tidak menyegarkan, Anda akan melihat peringatan kuning dan kartu kredensial akan menawarkan tombol "Reconnect" atau "Replace" — mengkliknya membuka wizard yang sama yang membuat kredensial.

### Poin Kunci

- **Refresh otomatis untuk OAuth** — refresh token digunakan diam-diam; Anda tidak melihat ini terjadi
- **Peringatan awal untuk kredensial non-refresh** — status kuning N hari sebelum kedaluwarsa; jendela peringatan dapat dikonfigurasi
- **Reconnect satu klik** — kartu kredensial memiliki tombol Reconnect yang menjalankan ulang alur auth
- **Pertukaran zero-downtime** — untuk kredensial dengan agen dependen yang aktif, token baru menggantikan yang lama di tempat; agen mengambil nilai baru pada run berikutnya
- **Kegagalan muncul di kesehatan agen** — kredensial yang gagal menyegarkan membuat agen dependen menjadi kuning / merah di tab Health

### Cara Kerjanya

Refresh berjalan sebagai bagian dari tugas latar belakang yang sama yang melakukan pemeriksaan kesehatan. Untuk OAuth, tugas menggunakan refresh token untuk menghasilkan token akses baru dari penyedia dan memperbarui record kredensial. Untuk token yang tidak dapat di-refresh, tugas hanya memperbarui proyeksi kedaluwarsa (sehingga peringatan kuning muncul pada waktu yang tepat); penggantian aktual adalah tindakan manual yang Anda ambil ketika peringatan menyala.

:::tip
Ketika peringatan kuning kedaluwarsa menyala, segarkan segera daripada menunggu. Menyegarkan sekarang adalah tugas satu menit. Membiarkan agen terjadwal gagal pada pukul 3 pagi karena token kedaluwarsa semalam jauh lebih mahal dalam membatalkan run yang terlewat.
:::
  `,

  "deleting-credentials-safely": `
## Menghapus Kredensial dengan Aman

Menghapus kredensial bersifat permanen — record terenkripsi dihapus dari vault dan tidak ada pemulihan dari dalam Personas. Sebelum Anda menghapus, kartu kredensial menampilkan pemeriksaan dependensi: setiap agen yang mereferensikan kredensial, dalam slot kapabilitas apa, dengan apa dampaknya. Anda dapat menggunakan dialog penghapusan untuk menetapkan kembali setiap agen dependen ke kredensial yang berbeda sebelum mengonfirmasi, sehingga penghapusan aktual bersifat atomik dengan penetapan ulang.

Untuk kredensial OAuth, penghapusan hanya menghapus token yang disimpan lokal — tidak mencabut akses di sisi penyedia. Jika Anda juga ingin mencabut di penyedia, lakukan itu di halaman pengaturan keamanan penyedia (tautan ditawarkan dalam dialog penghapusan untuk penyedia utama).

### Poin Kunci

- **Permanen dan langsung** — tidak ada undo; record terenkripsi dihapus pada konfirmasi
- **Pemeriksaan dependensi di depan** — lihat setiap agen dependen sebelum Anda mengonfirmasi
- **Penetapan ulang inline** — arahkan agen dependen ke kredensial pengganti sebagai bagian dari dialog penghapusan
- **Penyedia OAuth: penghapusan-hanya-lokal secara default** — pencabutan sisi-penyedia adalah langkah terpisah (tautan disediakan)
- **No-op aman untuk kredensial yang sudah rusak** — menghapus kredensial yang kedaluwarsa / dicabut selalu aman; tidak ada yang bergantung pada status fungsional

### Cara Kerjanya

Dialog penghapusan membaca grafik dependensi yang sama dengan tampilan Dependencies. Ketika Anda mengonfirmasi, engine terlebih dahulu menulis setiap penetapan ulang yang Anda tentukan, lalu menghapus record kredensial dari vault dalam satu transaksi. Jika penetapan ulang gagal validasi (misalnya Anda mencoba menunjuk ke kredensial dari kategori yang salah), penghapusan di-rollback dan tidak ada yang berubah.

:::warning
Permanen berarti permanen. Record terenkripsi dihapus, dan jika Anda tidak menulis rahasia mentah di tempat lain, itu hilang. Jika Anda mungkin membutuhkan kredensial lagi, backup nilai mentah secara eksternal sebelum penghapusan.
:::

:::tip
Pola rotasi teraman adalah "tambah baru, tetapkan ulang semua agen, lalu hapus yang lama". Tambahkan kredensial pengganti terlebih dahulu, jelajahi peta dependensi untuk menetapkan ulang agen dependen satu per satu (atau semuanya sekaligus dalam dialog penetapan ulang), verifikasi semuanya sehat, kemudian hapus kredensial lama. Urutan ini menjamin nol downtime.
:::
  `,

  "connector-catalog": `
## Katalog Connector

Katalog di Connections → Catalog adalah daftar layanan yang dikurasi yang diintegrasikan Personas secara out-of-the-box. Saat penulisan ini, 60+ connector di 9 kategori, dengan connector baru ditambahkan setiap rilis berdasarkan permintaan pengguna. Setiap connector mendeklarasikan jenis auth-nya (OAuth, API key, basic auth, token bot), scope / kapabilitas yang diperlukan, dan permukaan alat sisi-agen yang dieksposnya.

Ketika tab Connectors agen membutuhkan kapabilitas ("email-send", "cloud-storage-write", "chat-message-send"), ia meminta katalog untuk connector yang memenuhi kapabilitas itu, lalu mencocokkan terhadap vault Anda. Jika Anda sudah memiliki kredensial untuk salah satu connector itu, itu adalah kecocokan langsung. Jika tidak, katalog menawarkan untuk menambahkan satu — membuka wizard yang sama yang dijelaskan dalam topik Auto-Credential Browser.

### Kategori Connector

| Kategori | Contoh layanan | Auth |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Cloud Storage | Google Drive, Dropbox, OneDrive, S3, Local Drive | OAuth / API |
| Payments | Stripe, PayPal, Square | API key |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Developer Tools | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Communication | Slack, Discord, Microsoft Teams, Telegram, webhook generik | OAuth / token bot |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| AI Providers | Anthropic, OpenAI, Google, Ollama lokal, kompatibel-OpenAI kustom | API |
| Data | Postgres, Snowflake, BigQuery, SQL/HTTP generik | URL + kredensial |

### Poin Kunci

- **Pencocokan berbasis kapabilitas** — connector mengekspos kapabilitas; agen membutuhkan kapabilitas; katalog mencocokkannya
- **Keanehan khusus layanan dimasak ke dalam** — workspace ID Slack, scope GitHub PAT, URL callback OAuth, dll., semua pra-konfigurasi
- **Indikator jenis-auth** — sekilas, lihat connector mana yang OAuth vs API-key vs lokal
- **Fallback Generic / Custom** — untuk layanan yang tidak ada di katalog, jenis connector Generic menerima konfigurasi HTTP/REST mentah
- **Connector pengiriman saluran** — Slack, Discord, Teams, webhook generik muncul di sini untuk output agen outbound juga (dikonfigurasi per-agen di tab Connectors)

### Cara Kerjanya

Definisi connector tinggal di aplikasi dan diversi bersama dengan binary. Tab Connectors di setiap agen meminta katalog secara dinamis — menambahkan connector ke katalog (dalam sebuah rilis) membuatnya tersedia untuk agen yang ada tanpa migrasi per-agen. Connector Custom / Generic yang Anda konfigurasikan secara lokal terikat-vault dan tidak melalui katalog.

:::tip
Katalog juga merupakan permukaan penemuan. Jelajahi sesekali bahkan ketika Anda tidak memiliki kebutuhan spesifik — Anda akan sering menemukan integrasi yang menyarankan otomatisasi baru. Kategori Communication terutama kaya untuk kasus penggunaan sisi-output (mengirimkan hasil agen ke Slack / Discord / Teams).
:::
  `,
};
