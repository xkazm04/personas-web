export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Lokální vs cloudové spouštění

Agenti Personas běží na dvou místech: na tvém lokálním stroji (vlastní engine desktopové aplikace) nebo na vzdáleném orchestrátoru (managed-cloud spravovaný námi nebo BYOI na tvé vlastní infrastruktuře). Lokální je výchozí a funguje out of the box; cloud je opt-in (Team / Builder tarif) a umožňuje 24/7 dostupnost bez nutnosti, aby byl tvůj stroj zapnutý. Stejný prompt, nástroje a přihlašovací údaje agenta fungují v obou prostředích — přepínání je rozhodnutí nasazení, ne redesign.

Rozhodující faktory jsou typicky požadavky na uptime a observabilita. Lokální skvěle funguje pro vývoj, testování, průzkumné agenty a cokoli, kde jsi poblíž a sleduješ práci. Cloud je správnou volbou pro plánované noční běhy, webhook agenty, kteří musí být dosažitelní, zatímco spíš, a libovolnou produkční automatizaci, kde „můj laptop byl zavřený" nemůže být módem selhání.

:::compare
**Lokální spouštění** [default]
Běží v enginu desktopové aplikace. Dostupné, dokud je aplikace otevřená. Nulové nastavení. Data a přihlašovací údaje nikdy neopouštějí tvůj stroj. Plná živá observabilita ve stejném UI, ve kterém stavíš. Nejlepší pro vývoj, testování, supervizovanou práci a cokoli citlivého na soukromí.
---
**Cloudové spouštění**
Běží na orchestrátoru (managed cloud nebo BYOI). Dostupné 24/7 bez ohledu na tvůj lokální stroj. Nastavení je jednorázové. Data a přihlašovací údaje jsou šifrovány v tranzitu k orchestrátoru a v klidu na něm. Výsledky se synchronizují na tvou plochu. Nejlepší pro plány, webhooky a produkční nezatíženou práci.
:::

### Jak to funguje

Lokální agenti jsou odesíláni in-app exekučním enginem — stejnou cestou, kterou používá vše ostatní v aplikaci. Cloudoví agenti jsou nasazeni: plná konfigurace agenta (prompt, nástroje, přihlašovací údaje referencí, spouštěče) je odeslána orchestrátoru, který spouští dlouhotrvající proces agenta, který zvládá spouštěče server-side. Výsledky se streamují zpět do desktopové aplikace a objevují se ve stejných monitorovacích pohledech jako lokální běhy.

:::tip
Vyvíjej a testuj lokálně, pak nasaď to, co funguje, do cloudu. Lokální engine má nejrychlejší edit-test smyčku; cloud je tam, kam dáváš agenty, jejichž plán nebo dostupnost záleží. Nemusíš globálně volit jedno nebo druhé — typická nastavení mají většinu agentů lokálně a hrstku produkčních v cloudu.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Připojení ke cloud orchestrátoru

Otevři Deployment → Cloud Deploy pro připojení k orchestrátoru. Dvě cesty: **managed orchestrátor** (my ho hostujeme; autentizuješ se svým účtem a jsi hotov/a za 30 sekund) nebo **BYOI** (hostuješ orchestrátor na své vlastní infrastruktuře; nastavíš desktopovou aplikaci na svůj endpoint a poskytneš auth klíč). V obou případech je připojení jednorázové per stroj a přetrvává napříč restarty aplikace.

Jakmile je připojeno, karta Settings každého agenta získává možnost „Deploy to cloud". Spuštění nasazení nahrává konfiguraci agenta na orchestrátor a startuje pro něj dlouhotrvající server-side proces. Cloudoví agenti se objevují ve stejných monitorovacích pohledech jako lokální, otagovaní malou ikonou cloudu.

:::steps
1. **Otevři Deployment → Cloud Deploy** — postranní panel → Deployment → Cloud Deploy
2. **Vyber prostředí** — Managed Cloud (sign-in jedním kliknutím) nebo BYOI (zadej URL svého orchestrátoru + auth klíč)
3. **Pro BYOI**: vlož URL orchestrátoru a auth token; průvodce spustí test připojení a ověří kompatibilitu verze orchestrátoru
4. **Pro Managed**: klikni „Sign in"; OAuth tok se otevře pro autentizaci proti tvému Personas účtu
5. **Ulož** — připojení přetrvává; agenti nyní zobrazují možnost „Deploy to cloud" v kartě Settings
:::

:::warning
Zacházej s BYOI auth tokenem jako s libovolným jiným přihlašovacím údajem: ulož ho v trezoru (Connections → Credentials → Custom), nevkládej ho do chatu ani ho necommituj do version control. Kdokoli drží token, může nasadit a stáhnout libovolného agenta na orchestrátoru.
:::

### Jak to funguje

Orchestrátor je dlouhotrvající server proces (jeden per prostředí), který drží nasazené konfigurace agentů a spouští je podle plánu, na webhook události nebo na vyžádání. Komunikace mezi desktopovou aplikací a orchestrátorem je přes TLS s mutual auth. Přihlašovací údaje nasazených agentů jsou šifrovány v čase nasazení pomocí per-tenant klíče orchestrátoru a dešifrovány pouze uvnitř procesu orchestrátoru za běhu.

:::tip
Otestuj připojení před nasazením čehokoli. Test připojení průvodce ověřuje kompatibilitu verze a dosažitelnost — pokud selže, selhání je mnohem snazší diagnostikovat nyní než po pokusu nasadit tři agenty.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Nasazení agenta do cloudu

S připojeným orchestrátorem je nasazení libovolného agenta jedno tlačítko v jeho kartě Settings. Akce deploy zabalí plnou konfiguraci agenta (prompt, nástroje, reference přihlašovacích údajů, definice spouštěčů, nastavení) a pošle to na orchestrátor přes TLS. Orchestrátor validuje, nastavuje agenta a začíná zvládat jeho spouštěče server-side. První běh se typicky stane během sekund.

Lokální a cloudové kopie stejného agenta zůstávají synchronizované přes stejný auto-sync systém, který zvládá veškerou koordinaci desktop ↔ cloud. Můžeš pokračovat v iteraci na agentovi lokálně a redeployovat, až bude připraveno; nemusíš volit mezi dvěma prostředími.

:::steps
1. **Ověř připojení orchestrátoru** — Deployment → Cloud Deploy by mělo ukazovat „Connected"
2. **Otevři agenta** — stránka Agents → ten, kterého chceš nasadit
3. **Karta Settings → Deploy to Cloud** — tlačítko v sekci nasazení
4. **Přezkoumej souhrn nasazení** — přihlašovací údaje, které se posílají, spouštěče, které se aktivují, výběr modelu, nastavení failoveru; vše by mělo odpovídat tomu, co jsi testoval/a lokálně
5. **Potvrď Deploy** — orchestrátor dostává konfiguraci, validuje, nastavuje agenta; stav se přepne na „Deployed" během sekund
6. **Ověř v dashboardu** — Overview → Activity ukazuje agenta s ikonou cloudu; další plánovaná / webhook událost bude směrována k cloudové instanci
:::

:::warning
Cloudoví agenti používají přihlašovací údaje z cloudového trezoru, ne přímo z tvého lokálního trezoru. Akce deploy posílá *reference* přihlašovacích údajů (šifrované) a orchestrátor je řeší server-side. Pokud je přihlašovací údaj jen lokální nebo nebyl replikován, deploy vyzdvihne varování „credential not available in cloud" a požádá tě, abys buď replikoval/a, nebo vybral/a náhradu před dokončením.
:::

### Jak to funguje

Nasazení je atomické: buď orchestrátor přijme celou konfiguraci a agent jde naživo, nebo odmítne (s konkrétním důvodem) a nic se na server-side nemění. Jakmile je nasazeno, orchestrátor vlastní vyhodnocení spouštěčů — tvá lokální aplikace už pro toho agenta nespouští plány / webhooky (jinak bys dostal/a duplikáty). Manuální běhy z desktopové aplikace jsou směrovány k cloudové instanci přes stejné připojení.

:::tip
Nasazuj plánované agenty první, když začínáš s cloudem. Mají největší užitek z 24/7 uptime a jsou nejsnažší na ověření (uvidíš běh přistát na očekávaném plánu, ať je tvůj laptop otevřený, nebo ne).
:::
  `,

  "cloud-execution-monitoring": `
## Monitoring cloudového spouštění

Cloudoví agenti jsou viditelní ze stejných stránek Overview jako lokální agenti — stejný feed Activity, stejná karta Health, stejné rozpisy Usage. Malá ikona cloudu odlišuje cloudové agenty od lokálních. Klikni do libovolné cloudové exekuce a dostaneš plný trace stejně jako u lokálního běhu: vyrenderovaný prompt, volání modelu, volání nástrojů, výstup, náklady.

Desktopová aplikace polluje orchestrátor nepřetržitě, dokud je otevřená, a přihlašuje se k živým event streamům, dokud je připojena, takže co vidíš, je živý stav se zpožděním měřeným v sekundách, ne minutách. Když je aplikace zavřená, orchestrátor drží vše v chodu sám; otevření aplikace později dohání lokální stav z autoritativního úložiště orchestrátoru.

### Klíčové body

- **Sjednocený monitorovací povrch** — lokální a cloudoví agenti sdílejí stejné pohledy Activity / Health / Usage
- **Živé event streamování**, dokud je desktop připojen; orchestrátor-side persistence garantuje, že nic se neztratí, když jsi offline
- **Ikona cloudu** odlišuje cloud-rezidentní agenty
- **Atribuce nákladů ke cloudu** — grafy využití zahrnují jak lokální, tak cloudové výdaje, rozpracované podle prostředí
- **Catch-up při reconnect** — otevření aplikace po prodloužené offline době synchronizuje všechny zmeškané události z orchestrátoru

### Jak to funguje

Cloudoví agenti emitují stejné záznamy běhů a událostí jako lokální; orchestrátor je ukládá server-side a replikuje do desktopové aplikace při připojení. Activity feed slévá lokální a cloudové event streamy v chronologickém pořadí, takže smíšené lokální + cloudové nastavení vypadá jako jeden sjednocený pohled místo dvou paralelních.

:::tip
Nastav per-day rozpočtové stropy na cloudové agenty od prvního dne. Cloudoví agenti nemají implicitní kontrolu „sleduji to děje" jako lokální manuální běhy; per-day strop je tvá záchranná síť proti utíkajícímu promptu přes noc.
:::
  `,

  "github-actions-integration": `
## Integrace GitHub Actions

Agenti mohou spouštět GitHub Actions workflow přes GitHub nástroj na své kartě Connectors a GitHub Actions mohou spouštět agenty přes standardní webhook spouštěč. Dva vzory dobře kombinují: GitHub událost (PR otevřen, push na main, release otagován) spustí webhook, který spustí Personas agenta, agent dělá svou věc a (pokud je potřeba) agent spustí workflow jako součást svého výstupu.

GitHub konektor se dodává v Katalogu (Connections → Catalog → Developer Tools → GitHub). Auth je OAuth nebo fine-grained PAT — OAuth je preferovaný, když agent potřebuje jen read přístup; PATy fungují dobře pro write operace jako odesílání workflow.

### Klíčové body

- **GitHub → Personas přes příchozí webhook** — standardní webhook spouštěč; nakonfiguruj GitHub, aby POSToval na URL agenta
- **Personas → GitHub přes GitHub nástroj** — agent může odesílat workflow, komentovat PRy, otvírat issues, cokoli, co vystavuje GitHub API
- **Scopovaný auth** — OAuth pro převážně-read agenty, fine-grained PAT pro write operace; minimální scopy per agent
- **Synchronizace živého stavu** — trace agenta ukazují požadavek workflow_dispatch a odpověď GitHubu; agent může čekat na dokončení workflow, pokud je potřeba

### Jak to funguje

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

GitHub nástroj obaluje GitHub REST/GraphQL API a vystavuje high-level akce agentovi: „dispatch workflow", „comment on PR", „open issue", „merge PR" atd. Prompt agenta pojmenovává akci, kterou by měl podniknout na základě spouštěče; nástroj zvládá auth, konstrukci payloadu a zpracování odpovědi.

:::warning
Použij fine-grained PATy přes klasické PATy, kdykoli to tvůj GitHub plán podporuje. Klasické PATy udělují široká org-wide oprávnění; fine-grained PATy omezují na konkrétní repozitáře a konkrétní permission scopy, což dramaticky utěsňuje blast radius, pokud token kdy unikne.
:::

:::tip
Začni s low-stakes workflow jako cíl — jako workflow „notify Slack", které jen postuje zprávu. Jakmile je agent → GitHub Actions handoff prokázán, postup k high-stakes cílům (deploy, release-cut atd.).
:::
  `,

  "gitlab-ci-cd-integration": `
## Integrace GitLab CI/CD

Personas integrují s GitLab dvěma způsoby: přímý GitLab plugin, který dává agentům API-level přístup (status pipeline, MR komentáře, správa issues), a GitLab CI YAML export, který spouští Personas agenty jako kroky uvnitř tvých existujících pipelines. Oba se dodávají; vyber ten, který odpovídá tvaru workflow tvého týmu.

Plugin (Plugins → GitLab) zvládá API-stranní integraci: nainstaluj, autentizuj a tví agenti dostanou \`gitlab\` nástrojový povrch s high-level akcemi (start pipeline, comment on MR, manage issues). CI YAML export jde opačným směrem — tví agenti se stávají kroky v tvých GitLab CI pipelines, spouštěnými GitLab runners, s výsledky předávanými dopředu do dalších kroků.

### Klíčové body

- **GitLab plugin** — API-level integrace; agent používá GitLab jako nástroj z karty Connectors
- **CI YAML export** — agent se stává krokem v tvé GitLab pipelině; běží na tvých GitLab runners
- **Obousměrné** — GitLab události mohou spouštět agenty (webhook) a agenti mohou spouštět GitLab pipelines (plugin)
- **Token scopy** — použij project access tokens nebo group access tokens scopované na minimální potřebná oprávnění
- **Pipeline události jako spouštěče** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` jsou všechny konzumovatelné přes webhook spouštěč

### Jak to funguje

Plugin používá GitLab API tokeny uložené v trezoru přihlašovacích údajů. Když agent vyvolá akci GitLab nástroje, engine odešle API volání, zachytí odpověď a krmí ji zpět jako výsledek nástroje pro další tah modelu.

Pro CI export: otevři kartu Settings agenta → Export → GitLab CI YAML. Průvodce generuje definici úlohy, která obaluje agenta v CI-spustitelném tvaru (typicky Docker image s Personas CLI plus referencí agenta). Commitni vygenerované YAML do \`.gitlab-ci.yml\` tvého repozitáře; agent běží jako součást tvé pipeline vedle dalších CI úloh.

:::warning
Exportovaný CI YAML odkazuje na proměnné přihlašovacích údajů pro věci jako klíče AI poskytovatele. Definuj tyto jako **masked, protected** GitLab CI/CD proměnné v nastavení tvého projektu — nikdy nehardkóduj tajemství v samotném YAML souboru, protože pipeline YAML žije v tvém repu a je viditelný komukoli s read přístupem.
:::

:::tip
Plugin je lehčí variantou pro většinu týmů. CI YAML export je nejužitečnější, když agent musí běžet uvnitř GitLab runneru stejně (síťová izolace, internal-network zdroje, infrastruktura mandátovaná compliancí) — jinak ti plugin umožní držet agenta v Personas, kde jsou jeho observabilita a ladění nejbohatší.
:::
  `,

  "n8n-workflow-integration": `
## Integrace pracovních postupů n8n

n8n je populární open-source nástroj automatizace workflow a Personas s ním integrují obousměrně. Můžeš importovat existující n8n workflow do Personas jako šablony (Templates → n8n Import) — průvodce importu parsuje JSON workflow a mapuje n8n uzly na ekvivalentní Personas agenty, konektory a spouštěče. Můžeš také volat Personas agenty *z* n8n pomocí HTTP/webhook uzlů pro vyvolání URL příchozího webhooku agenta.

n8n import je jednosměrný a jednorázový: přináší *tvar* workflow do Personas, ale neudržuje n8n originál synchronizovaný. Po importu je importovaná pipeline tvá k nezávislé editaci.

### Klíčové body

- **n8n → Personas import** — Templates → n8n Import; parsuje JSON workflow, mapuje uzly na Personas ekvivalenty
- **Personas → n8n spouštěč** — HTTP/webhook uzly n8n mohou POSTovat na URL webhook spouštěče agenta
- **n8n → Personas spouštěč** — n8n může volat Personas agent webhook jako součást n8n workflow; odpověď agenta (konfigurovatelná) teče zpět do n8n
- **Nesynchronizováno** — importované pipeliny se rozcházejí od svého n8n zdroje; ber import jako jednorázový výchozí bod
- **Pokrytí mapovaných uzlů** — importer zvládá běžné uzly (HTTP, function, IF, switch); exotické / community uzly mohou importovat jako placeholdery pro manuální dokončení

### Jak to funguje

Průvodce importu čte JSON workflow n8n (export z n8n → „Download" na workflow), mapuje každý uzel na svůj nejbližší Personas ekvivalent (HTTP uzly → nástroje, function uzly → agenti, IF/switch → podmíněné směrování atd.) a stage výsledek jako pipelinu, kterou si prohlédneš před přijetím. Mapování je best-effort: cokoli, co importer nemůže mapovat s důvěrou, se stává placeholderem s poznámkou pro tebe k vyplnění.

Pro opačný směr je URL webhooku Personas agenta jen URL — libovolný n8n HTTP uzel ji může volat. Předej vstup jako tělo požadavku; agent zpracuje a (volitelně) odpoví synchronně svým výstupem.

:::tip
n8n vyniká v „přesouvání dat mezi službami" instalatérství; Personas vyniká v „přemýšlení" — analýze, rozhodování, psaní. Nejsilnější kombinovaná workflow používají n8n pro orchestraci plus Personas agenty pro AI-poháněné rozhodovací body, místo snahy dělat vše jedním v druhém.
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

BYOI (Builder tarif) znamená, že spouštíš orchestrátor sám/sama místo používání našeho managed cloudu. Nainstaluješ orchestrátorový software (poskytnutý jako Docker image a Kubernetes Helm chart) na svou vlastní infrastrukturu, nakonfiguruješ ho podle svých preferencí (auth, úložiště, networking) a nasměruješ desktopovou aplikaci na URL svého orchestrátoru. Od tohoto bodu nasazení agentů funguje identicky jako managed cloud — jen běží na tvém hardwaru.

BYOI je správnou volbou, když záleží na data sovereignty (regulační prostředí, izolace zákaznických dat, air-gapped sítě), když máš existující infrastrukturu, kterou chceš využít (místo platby za managed hosting navíc), nebo když chceš plnou kontrolu nad runtime prostředím (custom networking, specifické záruky dostupnosti, integrace s tvým existujícím observability stackem).

### Klíčové body

- **Self-hosted orchestrátor** — Docker image + Helm chart publikované per release
- **Data sovereignty** — exekuční data, přihlašovací údaje a trace nikdy neopouštějí tvou infrastrukturu
- **Stejná sémantika agenta** — agenti nasazení do BYOI orchestrátoru se chovají identicky jako managed cloud
- **Tvůj auth, tvé úložiště, tvá síť** — orchestrátor integruje s tvým existujícím identity providerem, databází a network policies
- **Builder-tier funkce** — vyžaduje Builder subskripci pro licenci softwaru orchestrátoru

### Jak to funguje

Orchestrátor běží jako dlouhotrvající server proces. Docker image je self-contained pro single-node nasazení; Helm chart podporuje HA multi-node nastavení se sdíleným úložištěm. Auth integruje s OIDC poskytovateli, takže můžeš použít své existující SSO; úložiště používá Postgres (managed nebo self-hosted); klíče šifrování trezoru přihlašovacích údajů žijí ve tvém KMS dle volby (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Nasazení agenta do BYOI orchestrátoru je z perspektivy desktopové aplikace identické jako managed cloud — stejné UI, stejný tok, stejná observabilita. Endpoint orchestrátoru je jen nakonfigurován tak, aby ukazoval na tvou instalaci místo na naši.

:::info
BYOI je opravdu infrastrukturní práce. Software orchestrátoru je dobře zdokumentovaný a Helm chart zvládá většinu nastavení, ale stále budeš potřebovat někoho pohodlného se spouštěním produkčního server softwaru. Pro týmy bez té kapacity je managed cloud lepším výchozím bodem — přepni na BYOI později, pokud se požadavky změní.
:::

:::tip
Spusť BYOI v stagingovém prostředí nejprve, pokud jsi v tom nový/á. Setup guide obsahuje „minimal local stack" Docker Compose, který spouští orchestrátor + Postgres + Vault na jediném stroji — perfektní pro zprovoznění pohyblivých částí před nasazením produkčního hardwaru.
:::
  `,

  "syncing-desktop-and-cloud": `
## Synchronizace plochy a cloudu

Když máš agenty nasazené do cloudového orchestrátoru, desktopová aplikace udržuje stav synchronizovaný mezi dvěma automaticky. Lokální editace nasazeného agenta (změna promptu, ladění nastavení, rotace přihlašovacího údaje) se po uložení odesílají na orchestrátor. Cloud-side události (výsledky běhů, spuštění spouštěčů, změny zdraví) se synchronizují zpět na desktop a objevují se v monitorovacích pohledech.

Sync běží na pozadí nepřetržitě, dokud je desktop připojen. Když je aplikace offline, lokální změny se řadí do fronty a odesílají při reconnect; cloudové události se kumulují server-side a streamují dolů při reconnect. Status bar ukazuje stav synchronizace s malým indikátorem (zelená = plně synchronizováno, oranžová = sync v běhu / čekající změny, červená = chyba sync vyžaduje pozornost).

### Klíčové body

- **Obousměrná, automatická** — lokální změny se odesílají při uložení; cloudové události se nepřetržitě streamují dolů
- **Tolerantní k offline** — lokální změny se řadí do fronty, dokud jsi offline, a odesílají při reconnect; cloud zachovává události pro catch-up
- **Detekce konfliktů** — pokud je stejný agent editován lokálně i vzdáleně (např. spoluhráčem používajícím stejný orchestrátor), desktop vyzve k vyřešení před commitnutím
- **Indikátor stavu** — element spodní lišty ukazuje živý stav synchronizace
- **Manuální synchronizace** — klikni na indikátor pro explicitní spouštění synchronizace; užitečné těsně před odpojením

### Jak to funguje

Sync používá per-resource version vector. Každý agent, přihlašovací údaj, spouštěč a záznam běhu nese verzi, která se inkrementuje při změně. Sync je „pošli mé verze, dostaň libovolné novější" — efektivní, vědom konfliktů. Konflikty (vzácné, ale možné v shared-orchestrátorových nastaveních) se objevují jako prompt pro vyřešení; vybíráš, která verze vyhraje, nebo slučuješ manuálně.

:::tip
Pohlédni na indikátor synchronizace po významných změnách. Zelená znamená, že je bezpečné zavřít aplikaci a důvěřovat, že cloud má nejnovější. Oranžová znamená, že změny jsou v letu — počkej pár sekund před odpojením, pokud chceš mít jistotu.
:::
  `,

  "cloud-troubleshooting": `
## Řešení problémů s cloudem

Většina cloudových problémů spadá do malé sady: orchestrátor nedostupný (síť / firewall / orchestrátor down), neshoda přihlašovacího údaje (přihlašovací údaj, který agent používá, není replikován na stranu orchestrátoru), neshoda verze (orchestrátor na starším releasu než desktop, chybějící funkce) nebo out-of-sync konfigurace (lokální má neuložené změny, které nebyly odeslány). Stránka Deployment → Cloud Deploy status je jediný nejlepší diagnostický povrch — ukazuje zdraví orchestrátoru, stav synchronizace a per-agent stav nasazení s konkrétními důvody selhání.

Pro problémy na úrovni agenta (agent nasazen, ale neběží, běhy selhávající v cloudu, ale uspívající lokálně) karta Health agenta ukazuje stejné diagnostiky pro cloud jako pro lokální — stav přihlašovacího údaje, nedávné důvody selhání, úplnost konfigurace. Trace běhu také ukazuje, zda běh běžel na cloudu nebo lokálně, takže můžeš rychle izolovat „cloud-only" problémy.

### Běžné problémy a opravy

| Symptom | Pravděpodobná příčina | Oprava |
|---|---|---|
| Agent neběží podle plánu | Orchestrátor nedostupný nebo spouštěč vypnutý cloud-side | Zkontroluj stav Deployment; redeployuj, pokud je stav spouštěče zastaralý |
| Chyba přihlašovacího údaje při prvním cloudovém běhu | Přihlašovací údaj nereplikován na orchestrátor | Deployment → Cloud Deploy → „Sync credentials"; ověř kartu Connectors agenta |
| Výsledky se neobjevují na desktopu | Sync pozastaven nebo aplikace offline, když se běh stal | Klikni na indikátor synchronizace; události se streamují dolů při reconnect |
| Cloudový agent pomalejší než lokální | Jiný model / poskytovatel nakonfigurován při nasazení; nebo síťová latence z agenta k AI poskytovateli | Zkontroluj efektivní konfiguraci agenta v Cloud Deploy detail view |
| Chyba „Version mismatch" při nasazení | Orchestrátor na starším releasu | Upgraduj orchestrátor (BYOI) nebo počkej na managed-cloud rollout |

### Jak to funguje

Stránka Deployment status polluje orchestrátor nepřetržitě, dokud je desktop připojen, a renderuje výsledek jako jediný dashboard. Každý nasazený agent má per-resource stav (zdravý / degradovaný / nedostupný) s pojmenovaným konkrétním problémem. Většina problémů má one-click resolution nabízenou přímo z řádku stavu.

:::warning
„Redeploy" je nejsnažší opravou pro mnoho cloudových problémů, ale odesílá *aktuální lokální stav* na orchestrátor. Pokud máš lokální změny, které jsi nepřezkoumal/a (nebo, na sdíleném orchestrátoru, cloud má změny, které nedosáhly lokálu), redeploy může přepsat. Vždy nejprve zkontroluj stav synchronizace — pokud oranžová, vyřeš sync před redeployem.
:::

:::tip
Nejčastější cloudový problém je zdaleka „zapomněl/a jsem replikovat přihlašovací údaj do cloudového trezoru". Před nasazením libovolného agenta deploy průvodce pre-kontroluje dostupnost přihlašovacích údajů a varuje; věnuj tomu varování pozornost místo jeho odmítání a většina cloud-side chyb přihlašovacích údajů zmizí.
:::
  `,
};
