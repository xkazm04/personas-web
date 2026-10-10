import type { Translations } from "../../en";

export const cs: Pick<Translations, "legalPage" | "cookiePolicy" | "privacyPolicy"> = {
    legalPage: {
      title: "Pr\u00e1vn\u00ed informace",
      heading: "Pr\u00e1vn\u00ed str\u00e1nky ji\u017e brzy",
      description: "Na\u0161e z\u00e1sady ochrany osobn\u00edch \u00fadaj\u016f a podm\u00ednky slu\u017eby se dokon\u010duj\u00ed. Pokud m\u00e1te mezit\u00edm jak\u00e9koli dotazy, obra\u0165te se na n\u00e1s."
    },
    cookiePolicy: {
      tldr: [
        "Tento web nenastavuje \u017e\u00e1dn\u00e9 vlastn\u00ed cookies. N\u011bkolik nastaven\u00ed ukl\u00e1d\u00e1 do m\u00edstn\u00edho \u00falo\u017ei\u0161t\u011b va\u0161eho prohl\u00ed\u017ee\u010de a pokud sp\u00e1rujete telefon, tak\u00e9 podpisov\u00fd kl\u00ed\u010d do datab\u00e1ze prohl\u00ed\u017ee\u010de v tomto telefonu. Ka\u017ed\u00e1 polo\u017eka je uvedena n\u00ed\u017ee.",
        "\u017d\u00e1dn\u00e1 reklama, sledov\u00e1n\u00ed nap\u0159\u00ed\u010d weby ani fingerprinting jak\u00e9hokoli druhu.",
        "V\u0161e m\u016f\u017eete kdykoli vymazat v nastaven\u00ed prohl\u00ed\u017ee\u010de."
      ],
      lastUpdated: "Naposledy aktualizov\u00e1no: {date}",
      approachHeading: "N\u00e1\u0161 p\u0159\u00edstup k cookies a \u00falo\u017ei\u0161ti",
      approachBody: "Ukl\u00e1d\u00e1me jen to, co web pot\u0159ebuje. \u00dalo\u017ei\u0161t\u011b prohl\u00ed\u017ee\u010de, nap\u0159\u00edklad m\u00edstn\u00ed \u00falo\u017ei\u0161t\u011b, se podle pravidel EU posuzuje stejn\u011b jako cookie, proto seznam n\u00ed\u017ee zahrnuje oboj\u00ed. Nepou\u017e\u00edv\u00e1me reklamn\u00ed cookies, sledovac\u00ed pixely ani fingerprinting.",
      registerHeading: "Co ukl\u00e1d\u00e1me do va\u0161eho za\u0159\u00edzen\u00ed",
      registerIntro: "V\u0161echny cookies a kl\u00ed\u010de \u00falo\u017ei\u0161t\u011b, kter\u00e9 tento web zapisuje, seskupen\u00e9 podle \u00fa\u010delu. N\u00e1zev kon\u010d\u00edc\u00ed znakem * ozna\u010duje skupinu kl\u00ed\u010d\u016f, nap\u0159\u00edklad jeden pro ka\u017edou z\u00e1sadu nebo kontroln\u00ed seznam.",
      categories: {
        necessary: {
          title: "Nezbytn\u011b nutn\u00e9",
          description: "Pot\u0159ebn\u00e9 k tomu, aby web ud\u011blal, o co jste po\u017e\u00e1dali. Jsou v\u017edy zapnut\u00e9."
        },
        preferences: {
          title: "P\u0159edvolby",
          description: "Pamatuj\u00ed si va\u0161e volby, aby web vypadal a choval se tak, jak jste si ho nastavili."
        },
        functional: {
          title: "Funk\u010dn\u00ed",
          description: "Udr\u017euj\u00ed funkce v chodu mezi n\u00e1v\u0161t\u011bvami: v\u00e1\u0161 postup, co jste u\u017e vid\u011bli, a va\u0161e hlasy."
        },
        analytics: {
          title: "Analytika",
          description: "Pro analytiku se nic neukl\u00e1d\u00e1. Pokud v li\u0161t\u011b cookies zvol\u00edte \"P\u0159ijmout v\u0161e\", web anonymn\u011b po\u010d\u00edt\u00e1 zobrazen\u00ed str\u00e1nek a n\u011bkolik kl\u00ed\u010dov\u00fdch akc\u00ed, ani\u017e by cokoli zapisoval do va\u0161eho za\u0159\u00edzen\u00ed. Pokud zvol\u00edte \"Jen nezbytn\u00e9\", nepo\u010d\u00edt\u00e1 se nic."
        }
      },
      mechanisms: {
        cookie: "Cookie",
        localStorage: "M\u00edstn\u00ed \u00falo\u017ei\u0161t\u011b",
        indexedDB: "Datab\u00e1ze prohl\u00ed\u017ee\u010de (IndexedDB)"
      },
      lifetimes: {
        oneYear: "1 rok",
        untilCleared: "Dokud ho nevyma\u017eete",
        untilSignOut: "Dokud se neodhl\u00e1s\u00edte",
        untilUnpaired: "Dokud telefon neodp\u00e1rujete nebo nevyma\u017eete data webu"
      },
      purposes: {
        consent: "Pamatuje si va\u0161i volbu v li\u0161t\u011b cookies.",
        authSession: "Udr\u017euje v\u00e1s p\u0159ihl\u00e1\u0161en\u00e9 k n\u00e1st\u011bnce. Zapisuje ho Supabase, n\u00e1\u0161 poskytovatel p\u0159ihl\u00e1\u0161en\u00ed, a to jen pokud se p\u0159ihl\u00e1s\u00edte.",
        theme: "Pamatuje si zvolen\u00fd barevn\u00fd motiv.",
        language: "Pamatuje si zvolen\u00fd jazyk.",
        tourVolume: "Pamatuje si hlasitost koment\u00e1\u0159e v pr\u016fvodci.",
        dashboardPrefs: "Pamatuje si va\u0161e zobrazen\u00ed, filtry a nastaven\u00ed n\u00e1st\u011bnky, nap\u0159\u00edklad eskalaci recenz\u00ed a p\u0159ed\u010d\u00edt\u00e1n\u00ed.",
        tourSeen: "Pamatuje si, \u017ee jste pr\u016fvodce u\u017e vid\u011bli, aby se znovu nenab\u00edzel.",
        policySeen: "Pamatuje si, kdy jste naposledy \u010detli jednotliv\u00e9 z\u00e1sady na t\u00e9to str\u00e1nce, aby bylo mo\u017en\u00e9 ozna\u010dit aktualizace.",
        dashboardActivity: "Pamatuje si, kdy jste naposledy otev\u0159eli n\u00e1st\u011bnku a kolikr\u00e1t se opakovala uk\u00e1zkov\u00e1 ud\u00e1lost.",
        checklist: "Pamatuje si, kter\u00e9 polo\u017eky kontroln\u00edch seznam\u016f v pr\u016fvodci jste za\u0161krtli.",
        voting: "N\u00e1hodn\u00e9 ID, d\u00edky kter\u00e9mu m\u016f\u017eete pro ka\u017edou funkci hlasovat jen jednou, a n\u00e1hodn\u00e1 p\u0159ezd\u00edvka (nap\u0159\u00edklad SwiftFox) zobrazen\u00e1 u va\u0161ich koment\u00e1\u0159\u016f. Oboj\u00ed se odes\u00edl\u00e1 s va\u0161imi hlasy a koment\u00e1\u0159i a ani jedno neobsahuje osobn\u00ed \u00fadaje.",
        pairedPhoneKey: "Jen v telefonu, kter\u00fd sp\u00e1rujete s desktopovou aplikac\u00ed: podpisov\u00fd kl\u00ed\u010d, kter\u00fd vytvo\u0159il prohl\u00ed\u017ee\u010d a kter\u00fd nejde exportovat, ID tohoto telefonu, ID po\u010d\u00edta\u010de, se kter\u00fdm je sp\u00e1rovan\u00fd, a \u010das sp\u00e1rov\u00e1n\u00ed. Kl\u00ed\u010d podepisuje p\u0159\u00edkazy, kter\u00e9 tento telefon pos\u00edl\u00e1, aby v\u00e1\u0161 po\u010d\u00edta\u010d mohl ov\u011b\u0159it, \u017ee poch\u00e1zej\u00ed z n\u011bj."
      },
      notUsedHeading: "Co nepou\u017e\u00edv\u00e1me",
      notUsed: [
        "\u017d\u00e1dn\u00e9 reklamn\u00ed ani remarketingov\u00e9 cookies",
        "\u017d\u00e1dn\u00e9 sledov\u00e1n\u00ed nap\u0159\u00ed\u010d weby",
        "\u017d\u00e1dn\u00e9 sledovac\u00ed pixely soci\u00e1ln\u00edch s\u00edt\u00ed",
        "\u017d\u00e1dn\u00e9 analytick\u00e9 cookies ani analytick\u00e9 \u00falo\u017ei\u0161t\u011b"
      ],
      thirdPartyHeading: "Cookies t\u0159et\u00edch stran",
      thirdPartyBody: "Pokud se p\u0159ihl\u00e1s\u00edte, projdete p\u0159es Supabase, na\u0161eho poskytovatele p\u0159ihl\u00e1\u0161en\u00ed, a p\u0159es poskytovatele \u00fa\u010dtu, kter\u00e9ho si zvol\u00edte, nap\u0159\u00edklad Google. Ti mohou b\u011bhem p\u0159ihl\u00e1\u0161en\u00ed nastavit cookies na sv\u00fdch vlastn\u00edch dom\u00e9n\u00e1ch podle sv\u00fdch vlastn\u00edch z\u00e1sad. Tyto cookies nepou\u017e\u00edv\u00e1me ke sledov\u00e1n\u00ed.",
      managingHeading: "Spr\u00e1va cookies a \u00falo\u017ei\u0161t\u011b",
      managingBody: "Cookies a data webu m\u016f\u017eete kdykoli vymazat nebo zablokovat v nastaven\u00ed prohl\u00ed\u017ee\u010de. Jejich vymaz\u00e1n\u00edm se odhl\u00e1s\u00edte a obnov\u00edte sv\u00e9 p\u0159edvolby. S dotazy se obra\u0165te na {email}.",
      manageButton: "Spravovat p\u0159edvolby cookies"
    },
    privacyPolicy: {
      tldr: [
        "Personas spou\u0161t\u00ed va\u0161e agenty na va\u0161em po\u010d\u00edta\u010di a ukl\u00e1d\u00e1 je tam, spolu s histori\u00ed b\u011bh\u016f, pozn\u00e1mkami a chaty. Va\u0161e prompty jdou jen k poskytovateli AI, kter\u00e9ho si zvol\u00edte.",
        "Cloudov\u00e1 synchronizace je voliteln\u00e1 a je vypnut\u00e1, dokud ji nezapnete. Kop\u00edruje va\u0161e agenty a jejich b\u011bhy do va\u0161eho \u00fa\u010dtu, abyste je vid\u011bli na webu. Pozn\u00e1mky a chaty se synchronizuj\u00ed, jen pokud zapnete i jejich vlastn\u00ed p\u0159ep\u00edna\u010de.",
        "Sp\u00e1rovan\u00fd telefon m\u016f\u017ee spou\u0161t\u011bt, pozastavovat, obnovovat a zastavovat va\u0161e agenty, schvalovat nebo zam\u00edtat jejich revize a chatovat s nimi i s Athenou, ani\u017e byste na po\u010d\u00edta\u010di cokoli klikli. Kdykoli ho m\u016f\u017eete odvolat.",
        "Kl\u00ed\u010de API jsou \u0161ifrovan\u00e9 pomoc\u00ed AES-256 a nikdy neopust\u00ed v\u00e1\u0161 po\u010d\u00edta\u010d, ani p\u0159i zapnut\u00e9 cloudov\u00e9 synchronizaci.",
        "Krom\u011b toho, co se rozhodnete synchronizovat, n\u00e1m desktopov\u00e1 aplikace pos\u00edl\u00e1 jen anonymn\u00ed hl\u00e1\u0161en\u00ed chyb a sign\u00e1ly o pou\u017e\u00edv\u00e1n\u00ed a v\u011bt\u0161inu z nich m\u016f\u017eete vypnout.",
        "V\u00e1\u0161 e-mail z\u00edsk\u00e1me, jen pokud se p\u0159ihl\u00e1s\u00edte kv\u016fli cloudov\u00fdm funkc\u00edm.",
        "Kdykoli m\u016f\u017eete v\u0161e exportovat nebo smazat. Sta\u010d\u00ed po\u017e\u00e1dat."
      ],
      lastUpdated: "Naposledy aktualizov\u00e1no: {date}",
      commitmentHeading: "N\u00e1\u0161 z\u00e1vazek k ochran\u011b soukrom\u00ed",
      commitmentBody: "Personas stoj\u00ed na jednoduch\u00e9 z\u00e1sad\u011b: va\u0161e data pat\u0159\u00ed v\u00e1m. Na\u0161e desktopov\u00e1 aplikace je local-first. Pokud nezapnete cloudovou synchronizaci, va\u0161i agenti, prompty, v\u00fdstupy ani p\u0159ihla\u0161ovac\u00ed \u00fadaje se k n\u00e1m nikdy nepos\u00edlaj\u00ed a jedin\u00e1 data, kter\u00e1 n\u00e1m aplikace pos\u00edl\u00e1, jsou anonymn\u00ed diagnostika popsan\u00e1 n\u00ed\u017ee. Va\u0161e p\u0159ihla\u0161ovac\u00ed \u00fadaje se k n\u00e1m nepos\u00edlaj\u00ed nikdy, ani p\u0159i zapnut\u00e9 cloudov\u00e9 synchronizaci.",
      desktopHeading: "Co ukl\u00e1d\u00e1 desktopov\u00e1 aplikace",
      desktopBody: "V\u0161e, co desktopov\u00e1 aplikace Personas vytvo\u0159\u00ed (va\u0161i agenti, pipeline, historie b\u011bh\u016f, pozn\u00e1mky, konverzace a konfigurace), je ulo\u017een\u00e9 na va\u0161em po\u010d\u00edta\u010di. Nic z toho se nepos\u00edl\u00e1 na na\u0161e servery, pokud nezapnete cloudovou synchronizaci popsanou n\u00ed\u017ee. Kdy\u017e agent b\u011b\u017e\u00ed, jeho prompt jde p\u0159\u00edmo z va\u0161eho po\u010d\u00edta\u010de ke zvolen\u00e9mu poskytovateli AI: ke Claude od Anthropicu, nebo k m\u00edstn\u00edmu modelu Ollama, kter\u00fd v\u00e1\u0161 po\u010d\u00edta\u010d nikdy neopust\u00ed.",
      telemetryHeading: "Hl\u00e1\u0161en\u00ed chyb a sign\u00e1ly o pou\u017e\u00edv\u00e1n\u00ed desktopov\u00e9 aplikace",
      telemetryBody: "Vydan\u00e9 verze desktopov\u00e9 aplikace pos\u00edlaj\u00ed do Sentry hl\u00e1\u0161en\u00ed chyb (chybovou zpr\u00e1vu, v\u00fdpis z\u00e1sobn\u00edku, opera\u010dn\u00ed syst\u00e9m, architekturu a verzi aplikace) a anonymn\u00ed sign\u00e1ly o pou\u017e\u00edv\u00e1n\u00ed (relace aplikace, kter\u00e9 sekce a karty otev\u00edr\u00e1te, kl\u00ed\u010dov\u00e9 akce jako vytvo\u0159en\u00ed agenta a jednor\u00e1zov\u00e9 miln\u00edky). Relace a miln\u00edky jsou sv\u00e1zan\u00e9 jen s n\u00e1hodn\u00fdm ID za\u0159\u00edzen\u00ed nebo instalace. IP adresy, e-mailov\u00e9 adresy, u\u017eivatelsk\u00e1 jm\u00e9na a t\u011bla a hlavi\u010dky po\u017eadavk\u016f se p\u0159ed odesl\u00e1n\u00edm odstran\u00ed. Nejsou tam \u017e\u00e1dn\u00e9 v\u00fdkonnostn\u00ed stopy, \u017e\u00e1dn\u00e9 z\u00e1znamy relac\u00ed ani identita u\u017eivatele a va\u0161e prompty, obsah person a p\u0159ihla\u0161ovac\u00ed \u00fadaje nejsou nikdy zahrnuty.",
      telemetryControls: "Sign\u00e1ly o pou\u017e\u00edv\u00e1n\u00ed a hl\u00e1\u0161en\u00ed chyb z rozhran\u00ed aplikace m\u016f\u017eete vypnout p\u0159i prvn\u00edm spu\u0161t\u011bn\u00ed nebo kdykoli v Nastaven\u00ed > \u00da\u010det. Hl\u00e1\u0161en\u00ed p\u00e1d\u016f z nativn\u00edho j\u00e1dra aplikace tento p\u0159ep\u00edna\u010d zat\u00edm nepokr\u00fdv\u00e1. V\u00fdvojov\u00e9 verze a verze, kter\u00e9 si sami sestav\u00edte ze zdrojov\u00e9ho k\u00f3du, nepos\u00edlaj\u00ed nic.",
      credentialsHeading: "Jak jsou chr\u00e1n\u011bn\u00e9 p\u0159ihla\u0161ovac\u00ed \u00fadaje",
      credentialsBody: "Kl\u00ed\u010de API a tajn\u00e9 \u00fadaje, kter\u00e9 do Personas p\u0159id\u00e1te, jsou v klidu \u0161ifrovan\u00e9 pomoc\u00ed AES-256-GCM a ulo\u017een\u00e9 v kl\u00ed\u010dence va\u0161eho opera\u010dn\u00edho syst\u00e9mu. Nikdy neopust\u00ed va\u0161e za\u0159\u00edzen\u00ed, ani kdy\u017e pou\u017e\u00edv\u00e1te cloudovou synchronizaci nebo sp\u00e1rovan\u00fd telefon.",
      syncHeading: "Voliteln\u00e1 cloudov\u00e1 synchronizace",
      syncIntro: "Cloudov\u00e1 synchronizace je vypnut\u00e1, dokud se nep\u0159ihl\u00e1s\u00edte a nezapnete ji v Nastaven\u00ed desktopov\u00e9 aplikace. D\u00edky n\u00ed m\u016f\u017eete sledovat sv\u00e9 agenty na webu Personas, i z telefonu. Dokud je zapnut\u00e1, aplikace kop\u00edruje do va\u0161eho \u00fa\u010dtu: va\u0161e agenty (v\u010detn\u011b jmen, popis\u016f a instrukc\u00ed), jejich b\u011bhy (v\u010detn\u011b vstupu, v\u00fdstupu, ceny a chyb), ud\u00e1losti, polo\u017eky \u010dekaj\u00edc\u00ed na va\u0161i kontrolu, zpr\u00e1vy, kter\u00e9 v\u00e1m agenti pos\u00edlaj\u00ed, pam\u011bti, nau\u010den\u00e9 vzorce, probl\u00e9my se stavem, \u010dasy pl\u00e1n\u016f, frontu b\u011bh\u016f a denn\u00ed sou\u010dty. Hodnoty, kter\u00e9 vypadaj\u00ed jako tajn\u00e9 \u00fadaje, se z dat ud\u00e1lost\u00ed p\u0159ed odesl\u00e1n\u00edm odstran\u00ed.",
      syncNever: "Nikdy se nesynchronizuj\u00ed: kl\u00ed\u010de API, hesla a jin\u00e9 p\u0159ihla\u0161ovac\u00ed \u00fadaje ani nastaven\u00ed spou\u0161t\u011b\u010d\u016f, nap\u0159\u00edklad konfigurace webhook\u016f.",
      syncOptIns: "Dal\u0161\u00ed dva druhy dat se synchronizuj\u00ed, jen pokud ve stejn\u00e9m Nastaven\u00ed zapnete i jejich vlastn\u00ed p\u0159ep\u00edna\u010de: \u201eSynchronizovat pozn\u00e1mky\u201c a \u201eSynchronizovat chaty\u201c. Oba jsou na za\u010d\u00e1tku vypnut\u00e9, i kdy\u017e u\u017e cloudov\u00e1 synchronizace b\u011b\u017e\u00ed.",
      syncNotes: "\u201eSynchronizovat pozn\u00e1mky\u201c kop\u00edruje va\u0161e c\u00edle z Notepadu: n\u00e1zev, text, stav a n\u00e1zev projektu ka\u017ed\u00e9 pozn\u00e1mky (nikdy slo\u017eku projektu na va\u0161em po\u010d\u00edta\u010di) a kr\u00e1tk\u00e9 shrnut\u00ed jej\u00edho v\u00fdsledku. Archivovan\u00e9 pozn\u00e1mky se nesynchronizuj\u00ed.",
      syncChats: "\u201eSynchronizovat chaty\u201c kop\u00edruje va\u0161e konverzace s Athenou i s va\u0161imi agenty, abyste je mohli \u010d\u00edst a pokra\u010dovat v nich z telefonu: n\u00e1zev ka\u017ed\u00e9 aktivn\u00ed konverzace a va\u0161e zpr\u00e1vy a odpov\u011bdi od 90 dn\u016f p\u0159ed zapnut\u00edm d\u00e1l. Odpov\u011bdi mohou citovat, co va\u0161i agenti p\u0159e\u010detli v aplikac\u00edch, kter\u00e9 jste propojili. Syst\u00e9mov\u00e9 zpr\u00e1vy, zpr\u00e1vy n\u00e1stroj\u016f, shrnut\u00ed konverzac\u00ed, pracovn\u00ed pam\u011b\u0165 agenta a archivovan\u00e9 konverzace se nikdy nesynchronizuj\u00ed.",
      syncMasking: "Ne\u017e text pozn\u00e1mky nebo chatu opust\u00ed v\u00e1\u0161 po\u010d\u00edta\u010d, zamaskuje se v\u0161e, co vypad\u00e1 jako kl\u00ed\u010d, token nebo heslo, a dlouh\u00fd text se zkr\u00e1t\u00ed: n\u00e1zvy na 1 KB, text pozn\u00e1mky na 16 KB a ka\u017ed\u00e1 zpr\u00e1va chatu na 32 KB.",
      syncDeletion: "Vypnut\u00edm \u201eSynchronizovat pozn\u00e1mky\u201c nebo \u201eSynchronizovat chaty\u201c se p\u0159i p\u0159\u00ed\u0161t\u00ed synchronizaci sma\u017eou pozn\u00e1mky nebo chaty, kter\u00e9 tento po\u010d\u00edta\u010d synchronizoval. Smaz\u00e1n\u00edm chatu s agentem na po\u010d\u00edta\u010di se sma\u017ee i jeho synchronizovan\u00e1 kopie a smaz\u00e1n\u00edm agenta se sma\u017ee jeho synchronizovan\u00e1 kopie v\u010detn\u011b jeho chat\u016f. Vypnut\u00ed samotn\u00e9 cloudov\u00e9 synchronizace zastav\u00ed nov\u00e9 kopie, ale nesma\u017ee to, co u\u017e bylo synchronizov\u00e1no. Napi\u0161te n\u00e1m a sma\u017eeme to.",
      syncWhere: "Synchronizovan\u00e1 data se ukl\u00e1daj\u00ed u Supabase, na\u0161eho cloudov\u00e9ho poskytovatele, v \u0159\u00e1dc\u00edch sv\u00e1zan\u00fdch s va\u0161\u00edm \u00fa\u010dtem. P\u0159\u00edstupov\u00e1 pravidla datab\u00e1ze dovoluj\u00ed tyto \u0159\u00e1dky \u010d\u00edst nebo m\u011bnit jen va\u0161emu p\u0159ihl\u00e1\u0161en\u00e9mu \u00fa\u010dtu, z desktopov\u00e9 aplikace nebo z webu. Data nejsou \u0161ifrovan\u00e1 end-to-end.",
      phonesHeading: "Sp\u00e1rovan\u00e9 telefony",
      phonesIntro: "Dokud je cloudov\u00e1 synchronizace zapnut\u00e1, m\u016f\u017eete sp\u00e1rovat telefon naskenov\u00e1n\u00edm k\u00f3du, kter\u00fd desktopov\u00e1 aplikace zobraz\u00ed v Nastaven\u00ed. Z webu Personas m\u016f\u017ee sp\u00e1rovan\u00fd telefon spou\u0161t\u011bt, pozastavovat a obnovovat va\u0161e agenty, zastavit b\u011bh, schv\u00e1lit nebo zam\u00edtnout revize, kter\u00e9 na v\u00e1s \u010dekaj\u00ed, a chatovat s Athenou nebo s kter\u00fdmkoli z va\u0161ich agent\u016f, i s pozastaven\u00fdm (jen kdy\u017e je zapnut\u00e9 \u201eSynchronizovat chaty\u201c). V\u00e1\u0161 po\u010d\u00edta\u010d to provede, ani\u017e by se v\u00e1s p\u0159edem ptal, a b\u011bhy, odpov\u011bdi a schv\u00e1len\u00e1 pr\u00e1ce, kter\u00e9 telefon spust\u00ed, \u010derpaj\u00ed v\u00e1\u0161 tarif Claude. P\u0159\u00edkaz se k po\u010d\u00edta\u010di dostane, jen kdy\u017e je zapnut\u00fd a online. P\u0159\u00edkaz, kter\u00fd ho do minuty nezastihne, vypr\u0161\u00ed a ne\u010dek\u00e1.",
      phonesLimits: "Sp\u00e1rovan\u00fd telefon nem\u016f\u017ee upravovat va\u0161e agenty, vid\u011bt ani m\u011bnit va\u0161e p\u0159ihla\u0161ovac\u00ed \u00fadaje ani m\u011bnit frontu b\u011bh\u016f bez va\u0161eho schv\u00e1len\u00ed na po\u010d\u00edta\u010di. Bez sp\u00e1rov\u00e1n\u00ed \u010dek\u00e1 po\u017eadavek z webu na spu\u0161t\u011bn\u00ed agenta, dokud ho na po\u010d\u00edta\u010di neschv\u00e1l\u00edte.",
      phonesKey: "P\u0159i p\u00e1rov\u00e1n\u00ed vytvo\u0159\u00ed prohl\u00ed\u017ee\u010d telefonu podpisov\u00fd kl\u00ed\u010d, kter\u00fd nejde exportovat, a ulo\u017e\u00ed ho do \u00falo\u017ei\u0161t\u011b tohoto prohl\u00ed\u017ee\u010de. Ka\u017ed\u00fd p\u0159\u00edkaz je j\u00edm podepsan\u00fd a v\u00e1\u0161 po\u010d\u00edta\u010d ov\u011b\u0159\u00ed podpis podle vlastn\u00edho seznamu sp\u00e1rovan\u00fdch telefon\u016f. N\u00e1zev telefonu (z jeho prohl\u00ed\u017ee\u010de, nap\u0159\u00edklad \u201eiPhone \u00b7 Safari\u201c), jeho ve\u0159ejn\u00fd kl\u00ed\u010d a p\u0159\u00edkazy, kter\u00e9 pos\u00edl\u00e1, i s jejich v\u00fdsledky se ukl\u00e1daj\u00ed s va\u0161imi synchronizovan\u00fdmi daty.",
      phonesRevoke: "Jeden telefon nebo v\u0161echny telefony m\u016f\u017eete kdykoli odvolat v Nastaven\u00ed desktopov\u00e9 aplikace. Odvol\u00e1n\u00ed plat\u00ed b\u011bhem n\u011bkolika sekund a u\u017e spu\u0161t\u011bn\u00fd b\u011bh dob\u011bhne. Sp\u00e1rov\u00e1n\u00ed m\u016f\u017eete zru\u0161it i p\u0159\u00edmo v telefonu, \u010d\u00edm\u017e se v n\u011bm kl\u00ed\u010d sma\u017ee.",
      accountHeading: "Co shroma\u017e\u010fujeme pro cloudov\u00e9 funkce",
      accountBody: "Pokud se kv\u016fli cloudov\u00fdm funkc\u00edm p\u0159ihl\u00e1s\u00edte p\u0159es Google, ulo\u017e\u00edme prost\u0159ednictv\u00edm Supabase, na\u0161eho poskytovatele p\u0159ihl\u00e1\u0161en\u00ed, va\u0161i e-mailovou adresu a z\u00e1kladn\u00ed \u00fadaje profilu. Pokud zapnete cloudovou synchronizaci nebo sp\u00e1rujete telefon, ulo\u017e\u00edme tak\u00e9 data popsan\u00e1 v\u00fd\u0161e.",
      analyticsHeading: "Analytika webu",
      analyticsBody: "Pokud v cookie li\u0161t\u011b zvol\u00edte \u201e{acceptAll}\u201c, tento web anonymn\u011b po\u010d\u00edt\u00e1 zobrazen\u00ed str\u00e1nek a n\u011bkolik kl\u00ed\u010dov\u00fdch akc\u00ed (kliknut\u00ed na sta\u017een\u00ed, p\u0159ihl\u00e1\u0161en\u00ed na \u010dekac\u00ed listinu, hlasy pro funkce a koment\u00e1\u0159e), abychom pochopili, kter\u00e9 str\u00e1nky jsou u\u017eite\u010dn\u00e9. Pokud zvol\u00edte \u201e{essentialOnly}\u201c, nic se nepo\u010d\u00edt\u00e1. Nesledujeme jednotliv\u00e9 u\u017eivatele, nevytv\u00e1\u0159\u00edme reklamn\u00ed profily a neprod\u00e1v\u00e1me data t\u0159et\u00edm stran\u00e1m.",
      thirdPartyHeading: "Slu\u017eby t\u0159et\u00edch stran",
      thirdPartySupabase: "p\u0159ihl\u00e1\u0161en\u00ed a cloudov\u00e9 \u00falo\u017ei\u0161t\u011b pro data, kter\u00e1 se rozhodnete synchronizovat",
      thirdPartySentry: "sledov\u00e1n\u00ed chyb a anonymn\u00ed po\u010dty uveden\u00e9 v\u00fd\u0161e na tomto webu a hl\u00e1\u0161en\u00ed chyb a sign\u00e1ly o pou\u017e\u00edv\u00e1n\u00ed desktopov\u00e9 aplikace",
      rightsHeading: "Va\u0161e pr\u00e1va",
      rightsBody: "Kdykoli m\u016f\u017eete po\u017e\u00e1dat o p\u0159\u00edstup k osobn\u00edm \u00fadaj\u016fm, kter\u00e9 o v\u00e1s m\u00e1me, o jejich opravu nebo v\u00fdmaz, a to v\u010detn\u011b synchronizovan\u00fdch dat. V\u0161echna sv\u00e1 m\u00edstn\u00ed data m\u016f\u017eete tak\u00e9 exportovat p\u0159\u00edmo z desktopov\u00e9 aplikace. Pro uplatn\u011bn\u00ed t\u011bchto pr\u00e1v n\u00e1s kontaktujte na {email}."
    },
};
