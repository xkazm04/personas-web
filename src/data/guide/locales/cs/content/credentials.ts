export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Jak Personas chrání tvá data

Bezpečnost je vestavěna do Personas od základu. API klíče, tokeny a hesla žijí v lokálním zašifrovaném trezoru ve tvém vlastním stroji — nikdy neopouštějí zařízení, pokud je agent explicitně neposílá AI poskytovateli nebo službě třetí strany během běhu. Sám soubor trezoru je zašifrován pomocí **AES-256-GCM** a klíč, který ho odemyká, je obalen tvým OS-nativním keyringem (Windows DPAPI, macOS Keychain, Linux Secret Service), takže prosté klíče nikdy nesedí na disku.

Když spustíš agenta, engine dešifruje pouze konkrétní přihlašovací údaje, které ten agent potřebuje, drží je v paměti po dobu trvání volání a pak prostý text vymaže. Logy, trace a exporty nikdy neobsahují surové hodnoty přihlašovacích údajů — kdekoli by se přihlašovací údaj objevil, vidíš tokenovou referenci (\`cred:gmail-work\`) místo toho.

### Klíčové body

- **AES-256-GCM** — autentizované šifrování (každý ciphertext přihlašovacího údaje je integrity-checkovaný, takže pozměněný soubor trezoru je detekován, ne tiše dešifrován)
- **Hlavní klíč obalený OS keyringem** — DPAPI na Windows, Keychain na macOS, Secret Service na Linuxu; žádné hlavní heslo na psaní každou seanci
- **Pouze lokální ve výchozím nastavení** — nic se nenahrává; cloudové nasazení je opt-in a šifruje v tranzitu přes TLS k tebou zvolenému orchestrátoru
- **Tokenové reference v logu** — agent trace a exporty používají ID přihlašovacích údajů, ne surová tajemství
- **Důkaz pozměnění** — GCM autentizační tagy zachytí jakoukoli modifikaci souboru trezoru

### Jak to funguje

Uložení přihlašovacího údaje ho zašifruje pomocí klíče trezoru (per-vault AES-256-GCM klíč, sám obalený OS keyringem) a zapíše ciphertext do lokální SQLite. Použití přihlašovacího údaje během běhu agenta ho dešifruje v paměti, předá ho relevantnímu nástroji nebo HTTP klientovi a uvolní buffer okamžitě. Surová hodnota není nikdy logována, nikdy zobrazena po počátečním zadání a nikdy serializována nikam mimo zašifrovaný trezor.

### Podívej se v akci

:::usecases
**Více služeb, izolované přihlašovací údaje**
Tvoji agenti mluví se Slack, GitHubem a Jirou
---
Každý přihlašovací údaj je zašifrován nezávisle s vlastním náhodným nonce. Kompromis jednoho záznamu neodhaluje ostatní.
===
**Rotace přihlašovacích údajů**
Token vyprší nebo je rotován
---
OAuth přihlašovací údaje se automaticky obnovují přes refresh token poskytovatele. Manuálně rotované klíče vyměníš na záznamu přihlašovacího údaje bez restartu čehokoli.
===
**Trace přátelské k auditu**
Potřebuješ prokázat, který přihlašovací údaj byl použit kde
---
Trace každého běhu zaznamenává ID přihlašovacího údaje, který použil. Skutečná hodnota se nikdy neobjeví; ID stačí k prokázání původu.
:::

:::info
Trezor je vázán k tvému OS uživatelskému účtu přes OS keyring. Kopírování souboru trezoru na jiný stroj, i se stejným OS, ho neudělá dešifrovatelným — obalovací klíč žije v OS keyringu a není přenositelný.
:::

:::warning
Pokud změníš heslo svého OS účtu na macOS nebo Linuxu, keyring může obalovací klíč znovu zamknout. Personas si vyžádají nové přihlašovací údaje při prvním běhu po změně. Pokud je keyring smazán (tovární reset, smazání účtu), trezor se stane neobnovitelným — zazálohuj surová tajemství externě, pokud potřebuješ disaster recovery nad rámec lokálního stroje.
:::

:::tip
Model „pouze lokální" je správným výchozím pro osobní automatizaci. Pro týmovou / produkční práci, kde více strojů potřebuje stejné přihlašovací údaje, cloudové nasazení (Team / Builder tarif) replikuje stav trezoru přes orchestrátor s end-to-end šifrováním.
:::
  `,

  "adding-a-new-credential": `
## Přidání nového přihlašovacího údaje

Otevři Connections → Credentials a klikni \`Add Credential\`. Vyber kategorii (e-mail, cloudové úložiště, platby, komunikace, vývojářské nástroje, CRM, AI poskytovatel, generický) — picker ti ukáže odpovídající předpřipravené konektory, které autokonfigurují typ autentizace, požadovaná pole a nápovědy ke štítkům. Pokud tvá služba není v katalogu, vyber „Custom" a definuj přihlašovací údaj sám/sama (název, typ, pole).

Pro služby podporující OAuth tok otevře okno prohlížeče na obrazovku souhlasu poskytovatele. Pro služby s API klíčem vlož klíč do bezpečného vstupu. V obou případech přistane přihlašovací údaj zašifrovaný a picker nabídne aplikovat ho na agenty, kteří mají otevřený slot schopnosti v odpovídající kategorii.

### Krok za krokem

:::steps
1. **Naviguj na Connections → Credentials** — postranní panel → Connections, pak karta Credentials
2. **Klikni Add Credential** — tlačítko vpravo nahoře v seznamu přihlašovacích údajů
3. **Vyber kategorii** — e-mail / úložiště / platby atd.; odpovídající katalog konektorů se automaticky filtruje
4. **Spusť autentizační tok** — OAuth otevře okno souhlasu; služby s API klíčem používají pole bezpečného vstupu
5. **Pojmenuj a ulož** — dej přihlašovacímu údaji štítek, který poznáš („Stripe Live", „Gmail Personal"); přihlašovací údaj je zašifrován pomocí AES-256-GCM a uložen
6. **Volitelně: naváž k agentům nyní** — picker ukazuje agenty s odpovídajícími otevřenými schopnostmi; bind jedním kliknutím ti ušetří později jejich lov
:::

### Jak to funguje

Když klikneš Save, surová hodnota přihlašovacího údaje je zašifrována klíčem trezoru odvozeným z OS keyringu, pak komitnuta do úložiště přihlašovacích údajů. Uložení vrací jen ID přihlašovacího údaje a štítek — surová hodnota je okamžitě smazána z paměti. Od tohoto okamžiku může karta Connectors editoru agenta odkazovat na přihlašovací údaj podle ID.

:::warning
Nikdy nevkládej přihlašovací údaje do promptů agentů, komentářů kódu nebo chatových oken. Použij pouze pole bezpečného vstupu přihlašovacích údajů — cokoli jiného riskuje zachycení surové hodnoty v logu, synchronizaci nebo screenshotu.
:::

:::tip
Konvence pojmenování záleží, jakmile máš 20+ přihlašovacích údajů. \`<service>-<env>-<account>\` („stripe-live-main", „gmail-prod-support") činí okamžitě jasným, který přihlašovací údaj vybrat při konfiguraci karty Connectors agenta.
:::
  `,



  "credential-health-checks": `
## Kontroly stavu přihlašovacích údajů

Přihlašovací údaje časem driftují — tokeny vyprší, klíče se rotují na upstreamu, OAuth scopy se mění. Kontroly stavu přihlašovacích údajů periodicky pingnou každý uložený přihlašovací údaj lehkým testovacím voláním (no-op API požadavek, který nic nestojí a říká ti, zda je přihlašovací údaj stále platný). Výsledky se objevují jako indikátor stavu na kartě přihlašovacího údaje a jako alerty, když se přihlašovací údaj degraduje.

Plán kontrol je konfigurovatelný. Ve výchozím nastavení OAuth přihlašovací údaje kontroluje denně (protože tok refresh tokenu potřebuje, aby byl přihlašovací údaj periodicky používán stejně), API-klíčové přihlašovací údaje kontroluje týdně. Manuální kontroly mohou být spuštěny kdykoli z karty přihlašovacího údaje.

### Klíčové body

- **Per-credential stav** — zelená (zdravý), žlutá (brzy vyprší / scope změněn), červená (rozbitý / odvolaný)
- **Konfigurovatelná kadence** — per-credential přepsání, pokud služba rate-limituje agresivní kontrolu
- **Manuální kontrola** — test jedním kliknutím z karty přihlašovacího údaje; užitečné před nasazením nového agenta
- **Projekce vypršení** — pro přihlašovací údaje se známými daty vypršení (signovaná JWT, scopované tokeny) se stav přepne na žlutou N dní před vypršením (konfigurovatelné, výchozí 7)
- **Směrování alertů** — selhání směruje přes stejné notifikační kanály, které jsi nakonfiguroval/a pro agenty

### Jak to funguje

Každý konektor definuje vlastní volání kontroly stavu (nejlehčí možný požadavek, který procvičí přihlašovací údaj). Kontrola běží na pozadí na nakonfigurované kadenci; výsledky jsou uloženy a aktualizují stav přihlašovacího údaje. Pokud kontrola selže, stav se přepne, karta přihlašovacího údaje se zvýrazní a závislí agenti zdědí varování na svých vlastních indikátorech zdraví — takže rozbitý Gmail přihlašovací údaj udělá každého Gmail-používajícího agenta žlutým, dokud to neopravíš.

:::tip
Spusť manuální kontrolu stavu před libovolným produkčním nasazením nebo plánovaným nočním během. Pět sekund nyní místo selhání běhu ve 3 ráno, protože se tiše rotoval token.
:::
  `,

  "auto-credential-browser": `
## Automatický prohlížeč přihlašovacích údajů

Automatický prohlížeč přihlašovacích údajů je katalogem řízené onboardování pro nové přihlašovací údaje. Otevři Connections → Catalog a vidíš každý konektor, který Personas dodávají předkonfigurovaný: 60+ služeb v době psaní, organizovaných podle kategorie (e-mail, úložiště, platby, komunikace, vývojářské nástroje, CRM, AI poskytovatelé atd.). Každý konektor zná správný typ autentizace, požadovaná pole, OAuth scopy, API endpointy a libovolné service-specifické zvláštnosti.

Když vybereš konektor, průvodce tě provede přesnými kroky pro tu službu — včetně odkazů na konkrétní stránky v UI služby, kde najdeš API klíč, které OAuth scopy schválit, jaká oprávnění jsou důležitá. Pro služby, kde Personas mohou detekovat úspěšné spojení (většinu), průvodce ověřuje v reálném čase před uložením.

### Klíčové body

- **60+ předkonfigurovaných konektorů** — typ autentizace, pole, scopy, endpointy zabudované
- **Service-specifické vedení** — přímé odkazy na přesnou stránku API klíče nebo kartu nastavení
- **Živá validace** — průvodce testuje přihlašovací údaj před uložením u většiny služeb
- **Tok suggested-for-agent** — katalog může být také vstoupen z karty Connectors agenta, kde je filtrován na konektory odpovídající otevřenému slotu schopnosti
- **Žádost o nové konektory** — služby ještě nezahrnuté v katalogu lze požadovat; pro jednorázovky použij typ generického / custom konektoru

### Jak to funguje

Definice konektorů jsou dodávány s aplikací a aktualizovány skrz pravidelný release cyklus. Každá definice deklaruje svůj autentizační tok, požadovaná pole, validační endpoint a seznam scopů. Když vybereš konektor, průvodce přečte definici, vyrenderuje odpovídající formulář, spustí OAuth nebo API-klíčový tok a validuje před uložením. Skutečná hodnota přihlašovacího údaje je zašifrována v čase uložení pomocí stejné cesty jako manuálně přidaný přihlašovací údaj.

:::tip
Katalog je také nejrychlejším způsobem objevení toho, co je integrováno. Pokud zvažuješ, zda Personas mohou udělat X se službou Y, prohledej katalog jako první — pokud je Y tam s relevantní schopností, integrace je jedno kliknutí.
:::
  `,

  "which-agents-use-which-credentials": `
## Kteří agenti používají které přihlašovací údaje

Karta Dependencies v Connections ukazuje graf credential → agent. Vyber přihlašovací údaj vlevo a uvidíš každého agenta, který na něj odkazuje, vpravo, s pojmenovaným konkrétním slotem schopnosti („Gmail účet pro agenta email-summary"). Vyber agenta a uvidíš každý přihlašovací údaj, na kterém závisí. Graf je obousměrný — užitečné pro oboje „co se rozbije, když rotuji tento klíč?" a „které přihlašovací údaje tento agent potřebuje, než ho můžu povýšit?".

Stejná mapa závislostí pohání pre-flight kontrolu build enginu: když povyšuješ agenta, engine zkontroluje každou požadovanou schopnost proti trezoru a označí chybějící nebo vypršelé přihlašovací údaje před povolením povýšení. To je důvod, proč u nově vytvořených agentů téměř nikdy nedostaneš za běhu chybu „credential not found" — kontrola závislostí proběhla v čase povýšení a zachytila to.

### Klíčové body

- **Obousměrný graf** — credential → agenti a agent → credentials
- **Pojmenované sloty schopností** — závislost ti říká nejen „tento přihlašovací údaj je použit", ale „použit jako schopnost email-send"
- **Pre-flight kontrola** — validace v čase povýšení používající stejný graf
- **Náhled dopadu** — výběr přihlašovacího údaje zvýrazní každého agenta, který by byl odstraněním ovlivněn
- **Detekce nepoužitých přihlašovacích údajů** — přihlašovací údaje s nulovými závislostmi agentů se ukazují v shrnutí Connections, takže je můžeš uklidit

### Jak to funguje

Karta Connectors každého agenta ukládá referenci přihlašovacího údaje per slot schopnosti. Pohled Dependencies dotazuje toto úložiště v obou směrech pro vyrenderování grafu. Události rotace, vypršení nebo odstranění přihlašovacího údaje se propagují grafem: libovolný agent závisející na degradovaném přihlašovacím údaji zdědí varovný stav na svém indikátoru zdraví, takže graf není jen statickou referencí — je živou cestou propagace.

:::warning
Před rotací nebo smazáním libovolného přihlašovacího údaje použitého nezatíženým (schedule / webhook / chain) agentem zkontroluj mapu závislostí a aktualizuj agenty, aby ukazovali na náhradní přihlašovací údaj nejprve. Pre-flight kontrola tě chytne v čase povýšení; pro již povýšené agenty je runtime selhání jediným signálem.
:::

:::tip
Měsíční rutina „credential audit": otevři Connections → Dependencies, seřaď podle nejstaršího a ptej se „používám stále tento přihlašovací údaj?" pro spodní tucet. Nepoužité přihlašovací údaje jsou plocha pro nic, takže jejich odstranění je čistý úklid.
:::
  `,

  "refreshing-expired-tokens": `
## Obnovení vypršených tokenů

Některé přihlašovací údaje jsou časově omezené záměrně — OAuth přístupové tokeny vyprší v minutách až hodinách; tokeny vydávané službou (Slack bot tokeny, GitHub PAT) mají často N-denní nebo N-roční vypršení. Personas sledují vypršení, kde ho poskytovatel publikuje, a zobrazují žlutý stav „brzy vyprší" pár dní před cutoffem (konfigurovatelné, výchozí 7 dní).

Pro OAuth přihlašovací údaje s refresh tokenem je obnovení automatické a tiché na pozadí. Pro API klíče a tokeny, které se neobnovují, uvidíš žluté varování a karta přihlašovacího údaje nabídne tlačítko „Reconnect" nebo „Replace" — kliknutí otevře stejného průvodce, který přihlašovací údaj vytvořil.

### Klíčové body

- **Automatické obnovení pro OAuth** — refresh token použit tiše; tohle se ti neukáže
- **Pokročilé varování pro neobnovitelné údaje** — žlutý stav N dní před vypršením; konfigurovatelné varovné okno
- **Reconnect jedním kliknutím** — karta přihlašovacího údaje má tlačítko Reconnect, které znovu spustí autentizační tok
- **Zero-downtime výměna** — pro přihlašovací údaje s aktivními závislými agenty nahrazuje nový token starý na místě; agenti pochytají novou hodnotu při svém dalším běhu
- **Selhání se objevuje v zdraví agenta** — přihlašovací údaje, které selhávají v obnovení, dělají své závislé agenty žlutými / červenými na kartě Health

### Jak to funguje

Obnovení běží jako součást stejné úlohy na pozadí, která dělá kontroly stavu. Pro OAuth úloha používá refresh token pro vytvoření nového přístupového tokenu od poskytovatele a aktualizuje záznam přihlašovacího údaje. Pro neobnovitelné tokeny úloha jen aktualizuje projekci vypršení (takže se žluté varování objeví ve správný čas); skutečná výměna je manuální akce, kterou děláš, když varování spustí.

:::tip
Když se spustí žluté varování o vypršení, obnov okamžitě místo čekání. Obnovení nyní je úkol na jednu minutu. Nechat plánovaného agenta selhat ve 3 ráno, protože token přes noc vypršel, je mnohem dražší v rozplétání zmeškaných běhů.
:::
  `,


  "connector-catalog": `
## Katalog konektorů

Katalog v Connections → Catalog je kurátorovaný seznam služeb, se kterými Personas integrují out of the box. V době psaní 60+ konektorů napříč 9 kategoriemi, s novými konektory přidávanými každým releasem na základě požadavků uživatelů. Každý konektor deklaruje svůj typ autentizace (OAuth, API klíč, basic auth, bot token), požadované scopy / schopnosti a povrch nástrojů na straně agenta, který vystavuje.

Když karta Connectors agenta potřebuje schopnost („email-send", „cloud-storage-write", „chat-message-send"), dotazuje katalog na konektory, které tu schopnost splňují, pak shoduje proti tvému trezoru. Pokud už máš přihlašovací údaj pro jeden z těch konektorů, je to okamžitá shoda. Pokud ne, katalog nabídne přidání jednoho — otevřením stejného průvodce popsaného v tématu Automatický prohlížeč přihlašovacích údajů.

### Kategorie konektorů

| Kategorie | Příkladové služby | Autentizace |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Cloud Storage | Google Drive, Dropbox, OneDrive, S3, Local Drive | OAuth / API |
| Payments | Stripe, PayPal, Square | API klíč |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Developer Tools | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Communication | Slack, Discord, Microsoft Teams, Telegram, generický webhook | OAuth / bot token |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| AI Providers | Anthropic, OpenAI, Google, lokální Ollama, custom OpenAI-compatible | API |
| Data | Postgres, Snowflake, BigQuery, generický SQL/HTTP | URL + přihlašovací údaje |

### Klíčové body

- **Capability-based shoda** — konektory vystavují schopnosti; agenti potřebují schopnosti; katalog je shoduje
- **Service-specifické zvláštnosti zabudované** — Slack workspace ID, GitHub PAT scopy, OAuth callback URL atd., všechno předkonfigurované
- **Indikátory typu autentizace** — jedním pohledem viz, které konektory jsou OAuth vs. API-klíč vs. lokální
- **Generický / Custom záloha** — pro služby ne v katalogu typ Generic konektoru přijímá surovou HTTP/REST konfiguraci
- **Konektory pro doručování na kanál** — Slack, Discord, Teams, generický webhook se zde objevují i pro odchozí výstup agenta (konfigurovaný per-agent na kartě Connectors)

### Jak to funguje

Definice konektorů žijí v aplikaci a jsou verzovány spolu s binárkou. Karta Connectors každého agenta dotazuje katalog dynamicky — přidání konektoru do katalogu (v release) ho udělá dostupným existujícím agentům bez per-agent migrace. Custom / Generic konektory, které konfiguruješ lokálně, jsou trezor-scopované a neprocházejí katalogem.

:::tip
Katalog je také plochou objevování. Procházej příležitostně, i když nemáš konkrétní potřebu — často najdeš integraci, která navrhne novou automatizaci. Kategorie Communication je zvlášť bohatá pro use cases na straně výstupu (doručování výsledků agentů na Slack / Discord / Teams).
:::
  `,
};
