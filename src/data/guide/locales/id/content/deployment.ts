export const content: Record<string, string> = {
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

};
