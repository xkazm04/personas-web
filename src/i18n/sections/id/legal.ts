import type { Translations } from "../../en";

export const id: Pick<Translations, "legalPage" | "cookiePolicy" | "privacyPolicy"> = {
    legalPage: {
      title: "Hukum",
      heading: "Halaman hukum segera hadir",
      description: "Kebijakan privasi dan ketentuan layanan kami sedang diselesaikan. Sementara itu, jika Anda memiliki pertanyaan silakan hubungi kami."
    },
    cookiePolicy: {
      tldr: [
        "Situs ini tidak memasang cookie miliknya sendiri. Situs ini menyimpan beberapa pengaturan di penyimpanan lokal browser Anda dan, jika Anda menautkan ponsel, sebuah kunci tanda tangan di database browser ponsel tersebut. Setiap item tercantum di bawah.",
        "Tanpa iklan, pelacakan lintas situs, atau sidik jari digital dalam bentuk apa pun.",
        "Anda dapat menghapus semuanya kapan saja di pengaturan browser."
      ],
      lastUpdated: "Terakhir diperbarui: {date}",
      approachHeading: "Pendekatan kami terhadap cookie dan penyimpanan",
      approachBody: "Kami hanya menyimpan apa yang dibutuhkan situs. Menurut aturan UE, penyimpanan browser seperti penyimpanan lokal diperlakukan sama dengan cookie, jadi daftar di bawah mencakup keduanya. Kami tidak menggunakan cookie iklan, piksel pelacak, atau sidik jari digital.",
      registerHeading: "Apa yang kami simpan di perangkat Anda",
      registerIntro: "Semua cookie dan kunci penyimpanan yang ditulis situs ini, dikelompokkan menurut tujuannya. Nama yang diakhiri * mewakili sekelompok kunci, misalnya satu untuk setiap kebijakan atau daftar periksa.",
      categories: {
        necessary: {
          title: "Sangat diperlukan",
          description: "Dibutuhkan agar situs dapat melakukan apa yang Anda minta. Selalu aktif."
        },
        preferences: {
          title: "Preferensi",
          description: "Mengingat pilihan Anda, agar situs tampil dan berperilaku sesuai pengaturan Anda."
        },
        functional: {
          title: "Fungsional",
          description: "Menjaga fitur tetap berjalan antarkunjungan: kemajuan Anda, apa yang sudah Anda lihat, dan suara Anda."
        },
        analytics: {
          title: "Analitik",
          description: "Tidak ada yang disimpan untuk analitik. Jika Anda memilih \"Terima Semua\" di banner cookie, situs menghitung tampilan halaman dan beberapa tindakan utama secara anonim, tanpa menulis apa pun ke perangkat Anda. Jika Anda memilih \"Hanya yang Penting\", tidak ada yang dihitung."
        }
      },
      mechanisms: {
        cookie: "Cookie",
        localStorage: "Penyimpanan lokal",
        indexedDB: "Database browser (IndexedDB)"
      },
      lifetimes: {
        oneYear: "1 tahun",
        untilCleared: "Sampai Anda menghapusnya",
        untilSignOut: "Sampai Anda keluar",
        untilUnpaired: "Sampai Anda melepas tautan ponsel atau menghapus data situs"
      },
      purposes: {
        consent: "Mengingat pilihan Anda di banner cookie.",
        authSession: "Menjaga Anda tetap masuk ke dasbor. Ditulis oleh Supabase, penyedia login kami, dan hanya jika Anda masuk.",
        theme: "Mengingat tema warna yang Anda pilih.",
        language: "Mengingat bahasa yang Anda pilih.",
        tourVolume: "Mengingat volume narasi tur terpandu.",
        dashboardPrefs: "Mengingat tampilan, filter, dan pengaturan dasbor Anda, seperti eskalasi tinjauan dan baca dengan suara.",
        tourSeen: "Mengingat bahwa Anda sudah melihat tur terpandu, agar tidak ditawarkan lagi.",
        policySeen: "Mengingat kapan terakhir kali Anda membaca setiap kebijakan di halaman ini, agar pembaruan dapat ditandai.",
        dashboardActivity: "Mengingat kapan terakhir kali Anda membuka dasbor dan berapa kali sebuah peristiwa demo dicoba ulang.",
        checklist: "Mengingat item daftar periksa panduan mana yang sudah Anda centang.",
        voting: "ID acak yang memungkinkan Anda memberi suara sekali per fitur, dan nama panggilan acak (seperti SwiftFox) yang ditampilkan pada komentar Anda. Keduanya dikirim bersama suara dan komentar Anda, dan tidak satu pun berisi informasi pribadi.",
        pairedPhoneKey: "Hanya di ponsel yang Anda tautkan dengan aplikasi desktop: kunci tanda tangan yang dibuat oleh browser dan tidak dapat diekspor, ID untuk ponsel ini, ID komputer yang ditautkan dengannya, dan waktu penautannya. Kunci ini menandatangani perintah yang dikirim ponsel ini, sehingga komputer Anda dapat memeriksa bahwa perintah itu memang berasal darinya."
      },
      notUsedHeading: "Yang tidak kami gunakan",
      notUsed: [
        "Tidak ada cookie iklan atau pemasaran ulang",
        "Tidak ada pelacakan lintas situs",
        "Tidak ada piksel pelacak media sosial",
        "Tidak ada cookie analitik atau penyimpanan analitik"
      ],
      thirdPartyHeading: "Cookie pihak ketiga",
      thirdPartyBody: "Jika Anda masuk, Anda melewati Supabase, penyedia login kami, dan penyedia akun pilihan Anda, seperti Google. Mereka dapat memasang cookie di domain mereka sendiri selama proses masuk, sesuai kebijakan mereka sendiri. Kami tidak menggunakan cookie tersebut untuk pelacakan.",
      managingHeading: "Mengelola cookie dan penyimpanan",
      managingBody: "Anda dapat menghapus atau memblokir cookie dan data situs di pengaturan browser kapan saja. Menghapusnya akan membuat Anda keluar dan mengatur ulang preferensi Anda. Untuk pertanyaan, hubungi {email}.",
      manageButton: "Kelola preferensi cookie"
    },
    privacyPolicy: {
      tldr: [
        "Personas menjalankan agen Anda di komputer Anda dan menyimpannya di sana, bersama riwayat eksekusi, catatan, dan obrolan Anda. Prompt Anda hanya dikirim ke penyedia AI yang Anda pilih.",
        "Sinkronisasi cloud bersifat opsional dan mati sampai Anda menyalakannya. Fitur ini menyalin agen dan eksekusinya ke akun Anda agar Anda dapat melihatnya di web. Catatan dan obrolan hanya disinkronkan jika Anda juga menyalakan tombol masing-masing.",
        "Ponsel yang Anda tautkan dapat menjalankan, menjeda, melanjutkan, dan menghentikan agen Anda, menyetujui atau menolak tinjauan mereka, serta mengobrol dengan agen Anda dan Athena tanpa satu klik pun di komputer. Anda dapat mencabutnya kapan saja.",
        "Kunci API dienkripsi dengan AES-256 dan tidak pernah meninggalkan mesin Anda, bahkan saat sinkronisasi cloud menyala.",
        "Selain yang Anda pilih untuk disinkronkan, aplikasi desktop hanya mengirimkan laporan kesalahan dan sinyal penggunaan anonim kepada kami, dan sebagian besar dapat Anda matikan.",
        "Kami hanya mengumpulkan email Anda jika Anda masuk untuk menggunakan fitur cloud.",
        "Anda dapat mengekspor atau menghapus semuanya kapan saja. Cukup minta."
      ],
      lastUpdated: "Terakhir diperbarui: {date}",
      commitmentHeading: "Komitmen kami terhadap privasi",
      commitmentBody: "Personas dibangun di atas prinsip sederhana: data Anda milik Anda. Aplikasi desktop kami mengutamakan lokal. Kecuali Anda menyalakan sinkronisasi cloud, agen, prompt, output, dan kredensial Anda tidak pernah dikirim kepada kami, dan satu-satunya data yang dikirim aplikasi kepada kami adalah diagnostik anonim yang dijelaskan di bawah. Kredensial Anda tidak pernah dikirim kepada kami, bahkan saat sinkronisasi cloud menyala.",
      desktopHeading: "Apa yang disimpan aplikasi desktop",
      desktopBody: "Semua yang dibuat aplikasi desktop Personas (agen, pipeline, riwayat eksekusi, catatan, percakapan, dan konfigurasi Anda) berada di komputer Anda. Tidak ada yang dikirim ke server kami kecuali Anda menyalakan sinkronisasi cloud yang dijelaskan di bawah. Saat agen berjalan, prompt-nya langsung dikirim dari komputer Anda ke penyedia AI yang Anda pilih: Claude dari Anthropic, atau model Ollama lokal yang tidak pernah meninggalkan komputer Anda.",
      telemetryHeading: "Laporan kesalahan dan sinyal penggunaan aplikasi desktop",
      telemetryBody: "Build rilis aplikasi desktop mengirimkan laporan kesalahan (pesan kesalahan, stack trace, sistem operasi, arsitektur, dan versi aplikasi) serta sinyal penggunaan anonim (sesi aplikasi, bagian dan tab yang Anda buka, tindakan penting seperti membuat agen, dan pencapaian satu kali) ke Sentry. Sesi dan pencapaian hanya dikaitkan dengan ID perangkat atau ID instalasi acak. Alamat IP, alamat email, nama pengguna, serta isi dan header permintaan dihapus sebelum apa pun dikirim. Tidak ada jejak performa, tidak ada rekaman sesi, dan tidak ada identitas pengguna, dan prompt, konten persona, serta kredensial Anda tidak pernah disertakan.",
      telemetryControls: "Anda dapat mematikan sinyal penggunaan dan laporan kesalahan antarmuka aplikasi saat pertama kali dibuka atau kapan saja di Pengaturan > Akun. Laporan crash dari inti native aplikasi belum dicakup oleh tombol itu. Build pengembangan dan build yang Anda kompilasi sendiri dari kode sumber tidak mengirim apa pun.",
      credentialsHeading: "Cara kredensial dilindungi",
      credentialsBody: "Kunci API dan rahasia yang Anda tambahkan ke Personas dienkripsi saat disimpan menggunakan AES-256-GCM dan disimpan di keyring sistem operasi Anda. Semuanya tidak pernah meninggalkan perangkat Anda, bahkan saat Anda menggunakan sinkronisasi cloud atau ponsel yang tertaut.",
      syncHeading: "Sinkronisasi cloud opsional",
      syncIntro: "Sinkronisasi cloud mati sampai Anda masuk dan menyalakannya di Pengaturan aplikasi desktop. Fitur ini memungkinkan Anda memantau agen di situs web Personas, termasuk dari ponsel. Selama menyala, aplikasi menyalin hal berikut ke akun Anda: agen Anda (termasuk nama, deskripsi, dan instruksinya), eksekusinya (termasuk input, output, biaya, dan kesalahan), event, item yang menunggu tinjauan Anda, pesan yang dikirim agen kepada Anda, memori, pola yang dipelajari, masalah kesehatan, waktu jadwal, antrean eksekusi, dan total harian. Nilai yang tampak seperti rahasia dihapus dari data event sebelum dikirim.",
      syncNever: "Tidak pernah disinkronkan: kunci API, kata sandi, dan kredensial lain, maupun pengaturan pemicu seperti konfigurasi webhook.",
      syncOptIns: "Dua jenis data lain hanya disinkronkan jika Anda juga menyalakan tombol masing-masing di Pengaturan yang sama: \"Sinkronkan catatan\" dan \"Sinkronkan obrolan\". Keduanya mati di awal, bahkan jika sinkronisasi cloud sudah menyala.",
      syncNotes: "\"Sinkronkan catatan\" menyalin tujuan Anda dari Notepad: judul, teks, status, dan nama proyek setiap catatan (tidak pernah folder proyek di komputer Anda), serta ringkasan singkat hasilnya. Catatan yang diarsipkan tidak disinkronkan.",
      syncChats: "\"Sinkronkan obrolan\" menyalin percakapan Anda dengan Athena dan dengan agen Anda, agar Anda dapat membacanya dan melanjutkannya dari ponsel: judul setiap percakapan aktif, serta pesan Anda dan balasan mulai dari 90 hari sebelum Anda menyalakannya. Balasan dapat mengutip apa yang dibaca agen Anda melalui aplikasi yang Anda hubungkan. Pesan sistem, pesan alat, ringkasan percakapan, memori kerja agen, dan percakapan yang diarsipkan tidak pernah disinkronkan.",
      syncMasking: "Sebelum teks catatan atau obrolan meninggalkan komputer Anda, apa pun yang tampak seperti kunci, token, atau kata sandi akan disamarkan, dan teks panjang dipotong: judul pada 1 KB, teks catatan pada 16 KB, dan setiap pesan obrolan pada 32 KB.",
      syncDeletion: "Mematikan \"Sinkronkan catatan\" atau \"Sinkronkan obrolan\" akan menghapus catatan atau obrolan yang disinkronkan komputer ini, pada sinkronisasi berikutnya. Menghapus obrolan dengan agen di komputer Anda juga menghapus salinan yang tersinkron, dan menghapus agen menghapus salinannya yang tersinkron, termasuk obrolannya. Mematikan sinkronisasi cloud itu sendiri menghentikan salinan baru tetapi tidak menghapus apa yang sudah disinkronkan. Kirimi kami email dan kami akan menghapusnya.",
      syncWhere: "Data yang disinkronkan disimpan di Supabase, penyedia cloud kami, dalam baris yang terkait dengan akun Anda. Aturan akses database hanya mengizinkan akun Anda yang sedang masuk untuk membaca atau mengubah baris tersebut, dari aplikasi desktop atau situs web. Data tidak dienkripsi end-to-end.",
      phonesHeading: "Ponsel tertaut",
      phonesIntro: "Selama sinkronisasi cloud menyala, Anda dapat menautkan ponsel dengan memindai kode yang ditampilkan di Pengaturan aplikasi desktop. Dari situs web Personas, ponsel yang tertaut dapat menjalankan, menjeda, dan melanjutkan agen Anda, menghentikan eksekusi, menyetujui atau menolak tinjauan yang menunggu Anda, dan mengobrol dengan Athena atau dengan agen mana pun milik Anda, termasuk yang sedang dijeda (hanya saat \"Sinkronkan obrolan\" menyala). Komputer Anda menjalankannya tanpa bertanya lebih dulu, dan eksekusi, balasan, serta pekerjaan yang disetujui dari ponsel menggunakan paket Claude Anda. Perintah hanya sampai ke komputer saat komputer menyala dan online. Perintah yang tidak sampai dalam satu menit akan kedaluwarsa, bukan menunggu.",
      phonesLimits: "Ponsel yang tertaut tidak dapat mengedit agen Anda, melihat atau mengubah kredensial Anda, atau mengubah antrean eksekusi tanpa persetujuan Anda di komputer. Tanpa penautan, permintaan dari situs web untuk menjalankan agen akan menunggu sampai Anda menyetujuinya di komputer.",
      phonesKey: "Saat ditautkan, browser ponsel membuat kunci tanda tangan yang tidak dapat diekspor dan menyimpannya di penyimpanan browser tersebut. Setiap perintah ditandatangani dengannya, dan komputer Anda memeriksa tanda tangan itu terhadap daftar ponsel tertautnya sendiri. Nama ponsel (dari browsernya, misalnya \"iPhone \u00b7 Safari\"), kunci publiknya, serta perintah yang dikirimnya beserta hasilnya disimpan bersama data tersinkron Anda.",
      phonesRevoke: "Anda dapat mencabut satu ponsel, atau semua ponsel, di Pengaturan aplikasi desktop kapan saja. Pencabutan berlaku dalam hitungan detik, dan eksekusi yang sudah dimulai akan selesai. Anda juga dapat melepas tautan dari ponsel itu sendiri, yang akan menghapus kuncinya di sana.",
      accountHeading: "Apa yang kami kumpulkan untuk fitur cloud",
      accountBody: "Jika Anda masuk dengan Google untuk menggunakan fitur cloud, kami menyimpan alamat email dan informasi profil dasar Anda melalui Supabase, penyedia login kami. Jika Anda menyalakan sinkronisasi cloud atau menautkan ponsel, kami juga menyimpan data yang dijelaskan di atas.",
      analyticsHeading: "Analitik situs web",
      analyticsBody: "Jika Anda memilih \"{acceptAll}\" di banner cookie, situs web ini menghitung secara anonim tampilan halaman dan beberapa tindakan penting (klik unduhan, pendaftaran daftar tunggu, voting fitur, dan komentar) untuk membantu kami memahami halaman mana yang berguna. Jika Anda memilih \"{essentialOnly}\", tidak ada yang dihitung. Kami tidak melacak pengguna individual, tidak membuat profil iklan, dan tidak menjual data kepada pihak ketiga.",
      thirdPartyHeading: "Layanan pihak ketiga",
      thirdPartySupabase: "login, dan penyimpanan cloud untuk data yang Anda pilih untuk disinkronkan",
      thirdPartySentry: "pelacakan kesalahan dan hitungan anonim di atas pada situs web ini, serta laporan kesalahan dan sinyal penggunaan aplikasi desktop",
      rightsHeading: "Hak Anda",
      rightsBody: "Anda dapat meminta akses, koreksi, atau penghapusan data pribadi apa pun yang kami simpan kapan saja, termasuk data tersinkron Anda. Anda juga dapat mengekspor semua data lokal langsung dari aplikasi desktop. Untuk menggunakan hak ini, hubungi kami di {email}."
    },
};
