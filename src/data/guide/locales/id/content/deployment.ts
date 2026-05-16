export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Eksekusi Lokal vs Cloud

Agen Personas berjalan di dua tempat: di mesin lokal Anda (engine aplikasi desktop) atau di orkestrator jarak jauh (terkelola cloud oleh kami, atau BYOI di infrastruktur Anda sendiri). Lokal adalah default dan berfungsi out-of-the-box; cloud adalah opt-in (tier Team / Builder) dan memungkinkan ketersediaan 24/7 tanpa mesin Anda menyala. Prompt, alat, dan kredensial agen yang sama bekerja di kedua lingkungan — beralih adalah keputusan deployment, bukan desain ulang.

Faktor penentu biasanya adalah persyaratan uptime dan observabilitas. Lokal berfungsi dengan baik untuk pengembangan, pengujian, agen eksplorasi, dan apa pun di mana Anda ada untuk menonton pekerjaan. Cloud adalah pilihan yang tepat untuk run terjadwal semalam, agen webhook yang perlu dapat dijangkau saat Anda tidur, dan otomatisasi tingkat-produksi mana pun di mana "laptop saya ditutup" tidak boleh menjadi mode kegagalan.

:::compare
**Eksekusi Lokal** [default]
Berjalan di engine aplikasi desktop. Tersedia saat aplikasi terbuka. Nol setup. Data dan kredensial tidak pernah meninggalkan mesin Anda. Observabilitas langsung lengkap di UI yang sama dengan yang Anda bangun. Terbaik untuk pengembangan, pengujian, pekerjaan yang diawasi, dan apa pun yang sensitif privasi.
---
**Eksekusi Cloud**
Berjalan di orkestrator (cloud terkelola atau BYOI). Tersedia 24/7 terlepas dari mesin lokal Anda. Setup adalah satu kali. Data dan kredensial dienkripsi dalam transit ke orkestrator dan saat istirahat di sana. Hasil disinkronkan ke desktop Anda. Terbaik untuk jadwal, webhook, dan pekerjaan tanpa pengawasan tingkat-produksi.
:::

### Cara Kerjanya

Agen lokal dikirim oleh execution engine dalam aplikasi — jalur yang sama dengan yang digunakan semua hal lain di aplikasi. Agen cloud di-deploy: konfigurasi lengkap agen (prompt, alat, kredensial dengan referensi, trigger) dikirim ke orkestrator, yang menjalankan proses agen yang berumur panjang yang menangani trigger di sisi server. Hasil mengalir kembali ke aplikasi desktop dan muncul di tampilan pemantauan yang sama dengan run lokal.

:::tip
Kembangkan dan uji secara lokal, kemudian deploy apa yang berfungsi ke cloud. Engine lokal memiliki loop edit-test tercepat; cloud adalah tempat Anda meletakkan agen yang jadwal atau ketersediaannya penting. Anda tidak harus memilih salah satu secara global — pengaturan tipikal memiliki sebagian besar agen lokal dan beberapa produksi di cloud.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Menghubungkan ke Cloud Orchestrator

Buka Deployment → Cloud Deploy untuk terhubung ke orkestrator. Dua jalur: **orkestrator terkelola** (kami menjadi hostnya; Anda mengotentikasi dengan akun Anda dan selesai dalam 30 detik) atau **BYOI** (Anda menjadi host orkestrator di infrastruktur Anda sendiri; Anda mengarahkan aplikasi desktop ke endpoint Anda dan memberikan auth key). Apa pun caranya, koneksi adalah satu kali per mesin dan bertahan di seluruh restart aplikasi.

Setelah terhubung, setiap tab Settings agen mendapatkan opsi "Deploy to cloud". Memicu deployment mengunggah konfigurasi agen ke orkestrator dan memulai proses server-side yang berumur panjang untuknya. Agen cloud muncul di tampilan pemantauan yang sama dengan yang lokal, ditandai dengan ikon cloud kecil.

:::steps
1. **Buka Deployment → Cloud Deploy** — sidebar → Deployment → Cloud Deploy
2. **Pilih environment** — Managed Cloud (sign-in satu klik) atau BYOI (masukkan URL orkestrator + auth key Anda)
3. **Untuk BYOI**: tempel URL orkestrator dan token auth; wizard menjalankan uji koneksi dan memverifikasi kompatibilitas versi orkestrator
4. **Untuk Managed**: klik "Sign in"; alur OAuth terbuka untuk mengotentikasi terhadap akun Personas Anda
5. **Simpan** — koneksi bertahan; agen sekarang menunjukkan opsi "Deploy to cloud" di tab Settings mereka
:::

:::warning
Perlakukan token auth BYOI seperti kredensial lainnya: simpan di vault (Connections → Credentials → Custom), jangan tempel ke chat atau commit ke version control. Siapa pun yang memegang token dapat men-deploy dan men-undeploy agen apa pun di orkestrator.
:::

### Cara Kerjanya

Orkestrator adalah proses server yang berumur panjang (satu per environment) yang memegang konfigurasi agen yang di-deploy dan menjalankannya sesuai jadwal, pada event webhook, atau sesuai permintaan. Komunikasi antara aplikasi desktop dan orkestrator melalui TLS dengan mutual auth. Kredensial agen yang di-deploy dienkripsi pada waktu deploy menggunakan key per-tenant orkestrator dan didekripsi hanya di dalam proses orkestrator pada waktu run.

:::tip
Uji koneksi sebelum men-deploy apa pun. Uji koneksi wizard memverifikasi kompatibilitas versi dan jangkauan — jika gagal, kegagalan jauh lebih mudah didiagnosis sekarang daripada setelah Anda mencoba men-deploy tiga agen.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Men-deploy Agen ke Cloud

Dengan orkestrator terhubung, men-deploy agen mana pun adalah satu tombol di tab Settings-nya. Aksi deploy mengemas konfigurasi lengkap agen (prompt, alat, referensi kredensial, definisi trigger, pengaturan) dan mengirimkannya ke orkestrator melalui TLS. Orkestrator memvalidasi, menyiapkan agen, dan mulai menangani trigger-nya di sisi server. Run pertama biasanya terjadi dalam hitungan detik.

Salinan lokal dan cloud dari agen yang sama tetap sinkron melalui sistem auto-sync yang sama yang menangani semua koordinasi desktop ↔ cloud. Anda dapat terus beriterasi pada agen secara lokal dan men-deploy ulang ketika siap; Anda tidak harus memilih di antara dua lingkungan.

:::steps
1. **Verifikasi koneksi orkestrator** — Deployment → Cloud Deploy harus menampilkan "Connected"
2. **Buka agen** — halaman Agents → yang ingin Anda deploy
3. **Tab Settings → Deploy to Cloud** — tombol di bagian deployment
4. **Tinjau ringkasan deployment** — kredensial yang dikirim, trigger yang diaktifkan, pemilihan model, pengaturan failover; semuanya harus cocok dengan apa yang Anda uji secara lokal
5. **Konfirmasi Deploy** — orkestrator menerima konfigurasi, memvalidasi, menyiapkan agen; status berubah ke "Deployed" dalam hitungan detik
6. **Verifikasi di dashboard** — Overview → Activity menampilkan agen dengan ikon cloud; event terjadwal / webhook berikutnya akan dirutekan ke instance cloud
:::

:::warning
Agen cloud menggunakan kredensial dari vault sisi-cloud, bukan vault lokal Anda secara langsung. Aksi deploy mengirim *referensi* kredensial (terenkripsi) dan orkestrator menyelesaikannya di sisi server. Jika kredensial adalah hanya-lokal atau belum direplikasi, deploy akan memunculkan peringatan "credential not available in cloud" dan meminta Anda untuk mereplikasi atau memilih substitusi sebelum menyelesaikan.
:::

### Cara Kerjanya

Deployment bersifat atomik: baik orkestrator menerima seluruh konfigurasi dan agen menjadi aktif, atau menolak (dengan alasan spesifik) dan tidak ada yang berubah di sisi server. Setelah di-deploy, orkestrator memiliki evaluasi trigger — aplikasi lokal Anda tidak lagi menyalakan jadwal / webhook untuk agen itu (Anda akan mendapatkan duplikat sebaliknya). Run manual dari aplikasi desktop dirutekan ke instance cloud melalui koneksi yang sama.

:::tip
Deploy agen yang terjadwal terlebih dahulu saat memulai dengan cloud. Mereka mendapat manfaat paling banyak dari uptime 24/7, dan mereka paling mudah diverifikasi (Anda akan melihat run mendarat pada jadwal yang diharapkan apakah laptop Anda terbuka atau tidak).
:::
  `,

  "cloud-execution-monitoring": `
## Pemantauan Eksekusi Cloud

Agen cloud terlihat dari halaman Overview yang sama dengan agen lokal — feed Activity yang sama, tab Health yang sama, breakdown Usage yang sama. Ikon cloud kecil membedakan agen cloud dari yang lokal. Klik ke eksekusi cloud mana pun dan Anda mendapatkan trace lengkap seperti run lokal: prompt yang dirender, panggilan model, panggilan alat, output, biaya.

Aplikasi desktop melakukan polling ke orkestrator terus-menerus saat terbuka dan berlangganan ke stream event langsung saat terhubung, sehingga apa yang Anda lihat adalah status langsung dengan delay yang diukur dalam detik, bukan menit. Ketika aplikasi ditutup, orkestrator menjaga semuanya berjalan sendiri; membuka aplikasi nanti mengejar ketinggalan status lokal dari penyimpanan otoritatif orkestrator.

### Poin Kunci

- **Permukaan pemantauan terpadu** — agen lokal dan cloud berbagi tampilan Activity / Health / Usage yang sama
- **Streaming event langsung** saat desktop terhubung; persistensi sisi-orkestrator menjamin tidak ada yang hilang ketika Anda offline
- **Ikon cloud** membedakan agen yang berada di cloud
- **Atribusi biaya ke cloud** — bagan usage mencakup pengeluaran lokal dan cloud, dipecah berdasarkan environment
- **Catch-up saat reconnect** — membuka aplikasi setelah waktu offline yang lama menyinkronkan semua event yang terlewat dari orkestrator

### Cara Kerjanya

Agen cloud memancarkan record eksekusi dan event yang sama dengan yang lokal; orkestrator menyimpannya di sisi server dan mereplikasi ke aplikasi desktop saat terhubung. Feed Activity menggabungkan stream event lokal dan cloud dalam urutan kronologis, sehingga pengaturan campuran lokal + cloud terlihat seperti satu tampilan terpadu daripada dua paralel.

:::tip
Atur batas anggaran per-hari pada agen cloud sejak hari pertama. Agen cloud tidak memiliki pemeriksaan implisit "Saya sedang menonton ini terjadi" yang dimiliki run manual lokal; batas per-hari adalah safety net Anda terhadap prompt yang melarikan diri semalam.
:::
  `,

  "github-actions-integration": `
## Integrasi GitHub Actions

Agen dapat memicu workflow GitHub Actions melalui alat GitHub di tab Connectors mereka, dan GitHub Actions dapat memicu agen melalui webhook trigger standar. Dua pola digabungkan dengan baik: event GitHub (PR dibuka, push ke main, rilis di-tag) memicu webhook yang memulai agen Personas, agen melakukan tugasnya, dan (jika diperlukan) agen memicu workflow sebagai bagian dari outputnya.

Connector GitHub dikirim di Catalog (Connections → Catalog → Developer Tools → GitHub). Auth adalah OAuth atau fine-grained PAT — OAuth lebih disukai ketika agen hanya membutuhkan akses baca; PAT bekerja dengan baik untuk operasi tulis seperti mengirim workflow.

### Poin Kunci

- **GitHub → Personas melalui webhook masuk** — webhook trigger standar; konfigurasikan GitHub untuk POST ke URL agen
- **Personas → GitHub melalui alat GitHub** — agen dapat mengirim workflow, mengomentari PR, membuka issue, apa pun yang diekspos API GitHub
- **Auth bercakupan** — OAuth untuk agen baca-mostly, fine-grained PAT untuk operasi tulis; scope minimum per agen
- **Sinkronisasi status langsung** — trace agen menampilkan permintaan workflow_dispatch dan respons GitHub; agen dapat menunggu workflow selesai jika diperlukan

### Cara Kerjanya

:::diagram
[Event GitHub] --> [Webhook masuk] --> [Agen memutuskan] --> [Alat GitHub mengirim workflow] --> [Hasil workflow kembali ke trace]
:::

Alat GitHub membungkus API REST/GraphQL GitHub dan mengekspos aksi tingkat-tinggi ke agen: "dispatch workflow", "comment on PR", "open issue", "merge PR", dll. Prompt agen menamai aksi yang harus diambil berdasarkan trigger; alat menangani auth, konstruksi payload, dan penanganan respons.

:::warning
Gunakan fine-grained PAT daripada PAT klasik kapan pun paket GitHub Anda mendukungnya. PAT klasik memberikan izin luas seluruh-org; fine-grained PAT membatasi ke repository spesifik dan scope izin spesifik, yang secara dramatis memperketat radius ledakan jika token pernah bocor.
:::

:::tip
Mulai dengan workflow bertaruhan rendah sebagai target — seperti workflow "notify Slack" yang hanya mem-posting pesan. Setelah handoff agen → GitHub Actions terbukti, naik kelas ke target bertaruhan lebih tinggi (deploy, pemotongan rilis, dll.).
:::
  `,

  "gitlab-ci-cd-integration": `
## Integrasi GitLab CI/CD

Personas terintegrasi dengan GitLab dengan dua cara: plugin GitLab langsung yang memberi agen akses tingkat-API (status pipeline, komentar MR, manajemen issue), dan ekspor GitLab CI YAML yang menjalankan agen Personas sebagai langkah di dalam pipeline yang ada. Keduanya dikirim; pilih yang sesuai dengan bentuk alur kerja tim Anda.

Plugin (Plugins → GitLab) menangani integrasi sisi-API: pasang, otentikasi, dan agen Anda mendapatkan permukaan alat \`gitlab\` dengan aksi tingkat-tinggi (mulai pipeline, komentar pada MR, kelola issue). Ekspor CI YAML berjalan ke arah yang berlawanan — agen Anda menjadi langkah dalam pipeline GitLab CI Anda, dieksekusi oleh runner GitLab, dengan hasil diteruskan ke langkah-langkah berikutnya.

### Poin Kunci

- **Plugin GitLab** — integrasi tingkat-API; agen menggunakan GitLab sebagai alat dari tab Connectors
- **Ekspor CI YAML** — agen menjadi langkah dalam pipeline GitLab Anda; berjalan di runner GitLab Anda
- **Dua arah** — event GitLab dapat memicu agen (webhook), dan agen dapat memicu pipeline GitLab (plugin)
- **Scope token** — gunakan project access token atau group access token yang dibatasi ke izin minimum yang diperlukan
- **Event pipeline sebagai trigger** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` semua dapat dikonsumsi melalui webhook trigger

### Cara Kerjanya

Plugin menggunakan token API GitLab yang disimpan di credential vault. Ketika agen memanggil aksi alat GitLab, engine mengirimkan panggilan API, menangkap respons, dan mengumpannya kembali sebagai hasil alat untuk giliran berikutnya model.

Untuk ekspor CI: buka tab Settings agen → Export → GitLab CI YAML. Wizard menghasilkan definisi job yang membungkus agen dalam bentuk yang dapat dijalankan CI (biasanya image Docker dengan Personas CLI plus referensi agen). Commit YAML yang dihasilkan ke \`.gitlab-ci.yml\` repository Anda; agen berjalan sebagai bagian dari pipeline Anda bersama job CI lainnya.

:::warning
YAML CI yang diekspor mereferensikan variabel kredensial untuk hal-hal seperti key penyedia AI. Definisikan ini sebagai variabel GitLab CI/CD **masked, protected** di pengaturan proyek Anda — jangan pernah hardcode rahasia di file YAML itu sendiri, karena YAML pipeline tinggal di repo Anda dan terlihat oleh siapa saja yang memiliki akses baca.
:::

:::tip
Plugin adalah opsi yang lebih ringan untuk sebagian besar tim. Ekspor CI YAML paling berguna ketika agen harus berjalan di dalam runner GitLab (isolasi jaringan, sumber daya jaringan internal, infrastruktur yang diamanatkan kepatuhan) — jika tidak, plugin memungkinkan Anda menjaga agen di Personas di mana observabilitas dan debugging-nya paling kaya.
:::
  `,

  "n8n-workflow-integration": `
## Integrasi n8n Workflow

n8n adalah alat otomatisasi workflow open-source yang populer, dan Personas terintegrasi dengannya secara dua arah. Anda dapat mengimpor workflow n8n yang ada ke Personas sebagai template (Templates → n8n Import) — wizard impor mem-parse JSON workflow dan memetakan node n8n ke agen, connector, dan trigger Personas yang setara. Anda juga dapat memanggil agen Personas *dari* n8n dengan menggunakan node HTTP/webhook untuk memanggil URL webhook masuk agen.

Impor n8n adalah satu arah dan satu kali: ia membawa *bentuk* workflow ke Personas, tetapi tidak menjaga n8n asli tersinkronisasi. Setelah impor, pipeline yang diimpor adalah milik Anda untuk diedit secara independen.

### Poin Kunci

- **Impor n8n → Personas** — Templates → n8n Import; mem-parse JSON workflow, memetakan node ke ekuivalen Personas
- **Trigger Personas → n8n** — node HTTP/webhook n8n dapat POST ke URL webhook trigger agen
- **Trigger n8n → Personas** — n8n dapat memanggil webhook agen Personas sebagai bagian dari workflow n8n; respons agen (dapat dikonfigurasi) mengalir kembali ke n8n
- **Tidak disinkronkan** — pipeline yang diimpor menyimpang dari sumber n8n-nya; perlakukan impor sebagai titik awal satu kali
- **Cakupan node yang dipetakan** — importer menangani node umum (HTTP, function, IF, switch); node eksotis / komunitas dapat diimpor sebagai placeholder untuk penyelesaian manual

### Cara Kerjanya

Wizard impor membaca JSON workflow n8n (ekspor dari n8n → "Download" pada workflow), memetakan setiap node ke ekuivalen Personas terdekatnya (node HTTP → alat, node function → agen, IF/switch → conditional routing, dll.), dan menyiapkan hasil sebagai pipeline yang Anda pratinjau sebelum menerima. Pemetaan adalah upaya terbaik: apa pun yang tidak dapat dipetakan importer dengan percaya diri menjadi placeholder dengan catatan untuk Anda isi.

Untuk arah sebaliknya, URL webhook agen Personas hanyalah URL — node HTTP n8n apa pun dapat memanggilnya. Lewatkan input sebagai body permintaan; agen memproses dan (secara opsional) membalas secara sinkron dengan outputnya.

:::tip
n8n unggul dalam pemipaan "memindahkan data antar layanan"; Personas unggul dalam "berpikir" — menganalisis, memutuskan, menulis. Workflow gabungan terkuat menggunakan n8n untuk orkestrasi plus agen Personas untuk titik keputusan bertenaga AI, daripada mencoba melakukan semua dari satu di yang lain.
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

BYOI (tier Builder) berarti Anda menjalankan orkestrator sendiri alih-alih menggunakan cloud terkelola kami. Anda memasang perangkat lunak orkestrator (disediakan sebagai image Docker dan Helm chart Kubernetes) di infrastruktur Anda sendiri, mengonfigurasikannya sesuai preferensi Anda (auth, penyimpanan, jaringan), dan mengarahkan aplikasi desktop ke URL orkestrator Anda. Dari titik itu, men-deploy agen bekerja secara identik dengan cloud terkelola — mereka hanya berjalan di hardware Anda.

BYOI adalah pilihan yang tepat ketika kedaulatan data penting (lingkungan regulasi, isolasi data pelanggan, jaringan air-gapped), ketika Anda memiliki infrastruktur yang ada yang ingin Anda manfaatkan (daripada membayar hosting terkelola sebagai tambahan), atau ketika Anda ingin kontrol penuh atas lingkungan runtime (jaringan kustom, jaminan ketersediaan spesifik, integrasi dengan stack observabilitas yang ada).

### Poin Kunci

- **Orkestrator self-hosted** — image Docker + Helm chart dipublikasikan per rilis
- **Kedaulatan data** — data eksekusi, kredensial, dan trace tidak pernah meninggalkan infrastruktur Anda
- **Semantik agen yang sama** — agen yang di-deploy ke orkestrator BYOI berperilaku identik dengan cloud terkelola
- **Auth Anda, penyimpanan Anda, jaringan Anda** — orkestrator terintegrasi dengan penyedia identitas, database, dan kebijakan jaringan yang ada
- **Fitur tier-Builder** — memerlukan langganan Builder untuk lisensi perangkat lunak orkestrator

### Cara Kerjanya

Orkestrator berjalan sebagai proses server berumur panjang. Image Docker bersifat mandiri untuk deployment single-node; Helm chart mendukung setup HA multi-node dengan penyimpanan bersama. Auth terintegrasi dengan penyedia OIDC sehingga Anda dapat menggunakan SSO yang ada; penyimpanan menggunakan Postgres (terkelola atau self-hosted); key enkripsi credential vault tinggal di KMS pilihan Anda (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Men-deploy agen ke orkestrator BYOI identik dengan cloud terkelola dari perspektif aplikasi desktop — UI yang sama, alur yang sama, observabilitas yang sama. Endpoint orkestrator hanya dikonfigurasi untuk menunjuk ke instalasi Anda alih-alih milik kami.

:::info
BYOI benar-benar pekerjaan infrastruktur. Perangkat lunak orkestrator didokumentasikan dengan baik dan Helm chart menangani sebagian besar setup, tetapi Anda masih perlu seseorang yang nyaman menjalankan perangkat lunak server produksi. Untuk tim tanpa kapasitas itu, cloud terkelola adalah titik awal yang lebih baik — beralih ke BYOI nanti jika persyaratan berubah.
:::

:::tip
Jalankan BYOI di lingkungan staging terlebih dahulu jika Anda baru menggunakannya. Panduan setup mencakup Docker Compose "minimal local stack" yang menjalankan orkestrator + Postgres + Vault di satu mesin — sempurna untuk membuat bagian yang bergerak berfungsi sebelum men-deploy hardware produksi.
:::
  `,

  "syncing-desktop-and-cloud": `
## Menyinkronkan Desktop dan Cloud

Ketika Anda memiliki agen yang di-deploy ke orkestrator cloud, aplikasi desktop menjaga status tersinkronisasi antara keduanya secara otomatis. Pengeditan lokal pada agen yang di-deploy (perubahan prompt, penyesuaian pengaturan, rotasi kredensial) di-push ke orkestrator saat disimpan. Event sisi-cloud (hasil eksekusi, penyalaan trigger, perubahan kesehatan) disinkronkan kembali ke desktop dan muncul di tampilan pemantauan.

Sinkronisasi berjalan di latar belakang terus-menerus saat desktop terhubung. Ketika aplikasi offline, perubahan lokal antri dan di-push saat terhubung kembali; event cloud terakumulasi di sisi server dan mengalir turun saat terhubung kembali. Status bar menampilkan status sinkronisasi dengan indikator kecil (hijau = sepenuhnya tersinkronisasi, kuning = sinkronisasi sedang berlangsung / perubahan antri, merah = error sinkronisasi membutuhkan perhatian).

### Poin Kunci

- **Dua arah, otomatis** — perubahan lokal di-push saat disimpan; event cloud mengalir turun terus-menerus
- **Toleran-offline** — perubahan lokal antri saat offline dan di-push saat terhubung kembali; cloud mempertahankan event untuk catch-up
- **Deteksi konflik** — jika agen yang sama diedit secara lokal dan jarak jauh (misalnya oleh rekan tim menggunakan orkestrator yang sama), desktop meminta untuk menyelesaikan sebelum melakukan commit
- **Indikator status** — elemen bottom-bar menampilkan status sinkronisasi langsung
- **Sinkronisasi manual** — klik indikator untuk pemicu sinkronisasi eksplisit; berguna tepat sebelum terputus

### Cara Kerjanya

Sinkronisasi menggunakan vektor versi per-sumber daya. Setiap agen, kredensial, trigger, dan record eksekusi membawa versi yang bertambah saat berubah. Sinkronisasi adalah "kirim versi saya, terima yang lebih baru" — efisien, sadar konflik. Konflik (jarang, tetapi mungkin di setup orkestrator-bersama) muncul sebagai prompt resolusi; Anda memilih versi mana yang menang atau menggabungkan secara manual.

:::tip
Lirik indikator sinkronisasi setelah perubahan yang berarti. Hijau berarti aman untuk menutup aplikasi dan mempercayai cloud memiliki yang terbaru. Kuning berarti perubahan sedang dalam perjalanan — tunggu beberapa detik sebelum terputus jika Anda ingin yakin.
:::
  `,

  "cloud-troubleshooting": `
## Pemecahan Masalah Cloud

Sebagian besar masalah cloud termasuk dalam set kecil: orkestrator tidak dapat dijangkau (jaringan / firewall / orkestrator mati), ketidakcocokan kredensial (kredensial yang digunakan agen tidak direplikasi ke sisi orkestrator), ketidakcocokan versi (orkestrator pada rilis lebih lama daripada desktop, fitur yang hilang), atau konfigurasi tidak sinkron (lokal memiliki perubahan yang belum disimpan yang belum di-push). Halaman status Deployment → Cloud Deploy adalah satu permukaan diagnostik terbaik — ia menampilkan kesehatan orkestrator, status sinkronisasi, dan status deployment per-agen dengan alasan kegagalan spesifik.

Untuk masalah tingkat-agen (agen di-deploy tetapi tidak berjalan, run gagal di cloud tetapi berhasil secara lokal), tab Health agen menampilkan diagnostik yang sama untuk cloud seperti untuk lokal — status kredensial, alasan kegagalan terbaru, kelengkapan konfigurasi. Trace eksekusi juga menampilkan apakah run dieksekusi di cloud atau lokal, sehingga Anda dapat mengisolasi masalah "hanya-cloud" dengan cepat.

### Masalah dan Perbaikan Umum

| Gejala | Kemungkinan penyebab | Perbaikan |
|---|---|---|
| Agen tidak berjalan sesuai jadwal | Orkestrator tidak dapat dijangkau, atau trigger dinonaktifkan di sisi cloud | Periksa status Deployment; deploy ulang jika status trigger basi |
| Error kredensial pada run cloud pertama | Kredensial tidak direplikasi ke orkestrator | Deployment → Cloud Deploy → "Sync credentials"; verifikasi tab Connectors agen |
| Hasil tidak muncul di desktop | Sinkronisasi dijeda atau aplikasi offline saat run terjadi | Klik indikator sinkronisasi; event mengalir turun saat terhubung kembali |
| Agen cloud lebih lambat daripada lokal | Model / provider berbeda dikonfigurasi pada deploy; atau latensi jaringan dari agen ke penyedia AI | Periksa konfigurasi efektif agen di tampilan detail Cloud Deploy |
| Error "Version mismatch" pada deploy | Orkestrator pada rilis lebih lama | Upgrade orkestrator (BYOI) atau tunggu rollout cloud terkelola |

### Cara Kerjanya

Halaman status Deployment melakukan polling ke orkestrator terus-menerus saat desktop terhubung dan merender hasilnya sebagai dashboard tunggal. Setiap agen yang di-deploy memiliki status per-sumber daya (sehat / menurun / tidak dapat dijangkau) dengan masalah spesifik yang dinamai. Sebagian besar masalah memiliki resolusi satu klik yang ditawarkan langsung dari baris status.

:::warning
"Redeploy" adalah perbaikan termudah untuk banyak masalah cloud, tetapi mendorong *status lokal saat ini* ke orkestrator. Jika Anda memiliki perubahan lokal yang belum Anda tinjau (atau, pada orkestrator bersama, cloud memiliki perubahan yang belum mencapai lokal), men-deploy ulang dapat menimpa mereka. Selalu periksa status sinkronisasi terlebih dahulu — jika kuning, selesaikan sinkronisasi sebelum men-deploy ulang.
:::

:::tip
Masalah cloud yang paling umum jauh adalah "Saya lupa mereplikasi kredensial ke vault cloud". Sebelum men-deploy agen apa pun, wizard deploy memeriksa terlebih dahulu ketersediaan kredensial dan memperingatkan; perhatikan peringatan itu daripada mengabaikannya, dan sebagian besar error kredensial sisi-cloud menghilang.
:::
  `,
};
