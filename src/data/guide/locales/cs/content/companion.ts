// Průvodce Companion (Athena) — česká lokalizace.
// Klíče odpovídají ID témat (viz ../../../topics.ts, categoryId "companion").
export const content: Record<string, string> = {
  "meet-athena": `
## Seznamte se s Athenou

Athena je vestavěná společnice Personas — vždy dostupná, vždy v kontextu. Není to chatbot přidaný stranou. Zná tvé agenty, tvé cíle, tvou paměť a může za tebe skutečně ovládat aplikaci.

Žije na dvou místech najednou. **Avatar ve spodním listu** — její animovaný obličej v pravém dolním rohu — je vstupním bodem: klepni na něj pro otevření chatovacího panelu, nebo stiskni a drž pro nadiktování hlasové zprávy, aniž by se panel vůbec otevřel. **Plovoucí koule** je její druhá podoba: přetahovatelný překryv, který pluje nad tvojí prací, takže Athena je dostupná kdekoli v aplikaci. Když je koule povolena (výchozí stav), avatar ve spodním listu ji vyvolá a skryje; vlastní klepnutí na kouli otevře plný chatovací panel.

Obě plochy na první pohled ukazují, co Athena dělá. Když přemýšlí, avatar změní postoj. Když mluví, koule se rozzáří podle úrovně hlasu. Když se dokončí úloha na pozadí, koule chvilku zareaguje. To není jen kosmetika — říká ti to její stav, aniž bys musel/a otevírat panel.

To, co Athena umí, jde daleko za pouhé odpovídání na otázky. Ano, může odpovídat na dotazy a vysvětlovat funkce, ale také se za tebe pohybovat v aplikaci, spouštět tvé agenty, ukládat paměti, navrhovat aktualizace identity a plánovat budoucí upomínky. Když je zapnutý autonomní režim, může řetězit více kroků za sebou bez jediného kliknutí z tvé strany.

### Klíčové body

- **Avatar ve spodním listu** — klepnutím otevřeš/zavřeš chatovací panel; stiskem a podržením nadiktuješ hlasový tah odkudkoli
- **Plovoucí koule** — přetahovatelný překryv, stejná dvě gesta; klouže do každé oblasti při průvodcích
- **Ovládá aplikaci** — Athena nejen radí; může navigovat mezi stránkami, spouštět agenty a skládat dashboardy
- **Vždy v kontextu** — před každou odpovědí čte tvou paměť, cíle a stav agentů, takže nikdy nezačíná od nuly
- **Výchozí bod** — témata v této sekci Companion jdou hlouběji: chat, hlas, paměť, proaktivní upomínky, průvodci, Decision Hub a ovládání aplikace přes chat

:::tip
Když zavřeš chatovací panel, Athena pokračuje v práci. Úlohy na pozadí běží v kouli, proaktivní upomínky stále přicházejí a hlasové odpovědi se stále přehrávají — zavřený panel ji nepozastaví.
:::
  `,

  "chatting-with-athena": `
## Chat s Athenou

Otevři panel a Athena tě přivítá **uvítací obrazovkou** — svým avatarem, krátkým pozdravem a sadou **úvodních promptů** pokrývajících nejčastější výchozí body. Klikni na libovolný čip a zpráva se okamžitě odešle; psát nemusíš.

Pro připravené prompty nad rámec úvodní sady zadej jako první znak prázdné zprávy \`/\`. Nad polem pro psaní se otevře **palette předvoleb**, ve které lze filtrovat psaním: **poznej mě** (vstupní rozhovor, který naplní Atheninu paměť), **ukáž cíle**, **co je ve frontě**, **nedávná rozhodnutí**, **živé operace**, **souhrn paměti** a **schopnosti**. Šipkami se pohybuješ v seznamu, Enterem vybereme označenou položku, Escapem palette zavřeš.

Když Athena odpovídá, často přidá **čipy rychlé odpovědi** — dva až pět návrhů dalšího dotazu odpovídajícího průběhu konverzace. Kliknutím ho odešleš jako svou další zprávu. Pod poslední dokončenou odpovědí máš také tři **čipy pro úpravu**: **Kratší**, **Více detailů** a **Jen kód**. Každý z nich přepošle tvou poslední zprávu s řídicí příponou, takže odpověď přetvoříš bez nutnosti přepisovat dotaz.

Pole pro psaní zůstává otevřené, i když Athena odpovídá. Psát můžeš kdykoli — pokud zpráva zní jako přesměrování („vlastně, zastav" nebo „počkej, místo toho…"), přeruší probíhající odpověď a zařadí tvůj nový požadavek do fronty. Pokud zpráva zní jako doplnění („a také…"), zařadí se za aktuální odpověď a spustí se potom. Zprávy ve frontě uvidíš jako malé čipy nad polem; každý z nich můžeš zrušit.

**Autonomní režim** (ikona ∞ v záhlaví panelu) nechá Athenu řetězit vícekrokovou práci sama od sebe. Když je zapnutý a má co dělat, naplánuje si následující tah přibližně za patnáct sekund, až dvacet po sobě jdoucích tahů. Tenký oddělovač v přepisu označí každé autonomní pokračování, takže na první pohled vidíš, kde jsi skončil/a ty a kde převzala ona.

### Klíčové body

- **Uvítací obrazovka** — úvodní čipy odesílají skutečné zprávy přes stejnou pipeline jako napsané
- **Palette předvoleb** — zadáním \`/\` procházíš předvolené prompty; filtruješ psaním, vybíráš Enterem
- **Čipy rychlé odpovědi** — 2–5 návrhů následného dotazu, které Athena nabídne na konci odpovědi
- **Čipy pro úpravu** — Kratší / Více detailů / Jen kód; jen pod poslední dokončenou odpovědí
- **Přesměrování uprostřed odpovědi** — piš, i když Athena odpovídá; automaticky se klasifikuje jako přerušení nebo fronta
- **Autonomní režim** — Athena řetězí až 20 tahů samořízené práce; jakákoli zpráva od tebe řetěz zruší

:::tip
Prompty v palette předvoleb jsou přeloženy do všech 14 podporovaných jazyků — pokud Personas používáš v jiném jazyce než angličtině, přednastavené zprávy přijdou ve tvém jazyce a Athena odpoví stejně.
:::
  `,

  "voice-and-hold-to-talk": `
## Hlas a stisk-a-drž

Athena podporuje plný obousměrný hlas: ty diktujete, ona přepíše a odpoví, a její odpověď se přehraje syntetizovaným hlasem. Každá část pipeline má volbu ochrany soukromí.

### Diktování Atheně

**Stiskni a drž** avatar ve spodním listu nebo plovoucí kouli přibližně čtvrt sekundy. Zobrazí se odznak mikrofonu a pulz a průběžný přepis se ukáže jako titulkový popis vedle koule. Jakmile domluvíš, uvolni — přepis se předá Atheně a spustí se standardní pipeline odpovědí. Odpověď se streamuje do panelu a, je-li nakonfigurován hlasový engine, automaticky se přehraje. Panel nikdy nemusí být otevřen; hlasový tah funguje i při jeho úplném skrytí.

**Globální klávesová zkratka Cmd/Ctrl+Shift+A** vyvolá Athenu odkudkoli v aplikaci a jedním stiskem spustí hlasový tah. Dalším stiskem zkratky odešleš, Escapem zrušíš bez odeslání. Používá stejnou seanci jako podržení koule — zkratka uprostřed průvodce je totéž co podržení koule.

### Enginy pro převod řeči na text

K dispozici jsou dva enginy, nastavitelné pod **Companion → Voice** v panelu STT:

:::compare
**Prohlížeč (výchozí)**
Používá Web Speech API v rendereru aplikace. Nevyžaduje žádné nastavení. Na Windows se zvuk přeposílá do cloudové řečové služby dodavatele OS — pohodlné, ale ne na zařízení.
---
**Lokální Whisper**
Přepis přímo na zařízení prostřednictvím sidecaru \`whisper-cli\`. Zvuk nikdy neopustí tvůj počítač. Vyžaduje stažení modelu Whisper a umístění binárky na očekávané místo (karta Voice ukazuje přesné umístění a stav stažení).
:::

### Enginy pro přehrávání hlasu

Když Athena odpovídá, mluvený souhrn může přijít z jednoho ze dvou hlasových engineů:

:::compare
**ElevenLabs (cloud)**
Vysoce kvalitní syntéza pomocí přihlašovacích údajů ElevenLabs API a zvoleného ID hlasu. Ladění na hlas: stabilita, podobnost, styl a rychlost. Přihlašovací údaje jsou uloženy ve tvém vaultu; API klíč se nikdy nedostane do rendereru aplikace.
---
**Piper (lokální ONNX)**
Syntéza přímo na zařízení bez síťového volání při syntéze a bez potřeby přihlašovacích údajů. Hlasy se stahují z kurátorovaného katalogu přibližně 17 hlasů v 14 jazycích. Karta Voice ukazuje, které jsou nainstalovány.
:::

### Proaktivní upomínky mluvené nahlas

Proaktivní upomínky (blížící se cíle, selhání agentů, připomínky) mohou být také vysloveny — i když je chatovací panel zavřen. Arrival-TTS se spustí okamžitě, když upomínka přijde, pomocí nakonfigurovaného enginu. Tlačítko **Přehrát znovu** ve spodním listu znovu přehraje poslední mluvenou zprávu, pokud ti ujde.

:::tip
Pokud chceš hlas bez jakýchkoli cloudových volání, spáruj lokální Whisper pro diktování s Piperem pro přehrávání. Obojí běží plně na zařízení. Karta Voice zobrazuje cestu pro instalaci a prohlížeč modelů pro každý engine.
:::
  `,

  "athenas-long-term-memory": `
## Dlouhodobá paměť Atheny

Athena si tě pamatuje napříč seancemi. Pokaždé když otevřeš panel, nezačíná od prázdného listu — před každou odpovědí si přečte svou paměť o tobě a použije ji k odpovědím odpovídajícím tvé skutečné situaci.

### Co si pamatuje

Paměť je organizována do úrovní, přičemž každá pokrývá jiný druh znalostí:

- **Fakta** — věci, které se naučila o tobě, tvých projektech a světě. „Dáváš přednost stručným shrnutím." „Hlavní větev tohoto repozitáře je master."
- **Procedurální preference** — pravidla chování, která si vyzvedla. „Při shrnutí dlouhého dokumentu začni jednověty s pointou." „Pro příklady kódu preferuj TypeScript."
- **Cíle** — aktivní cíle a termíny, které sleduje za tebe.
- **Profil identity** — vyvíjející se dokument \`identity.md\`, který se čte do každého systémového promptu. Je to jediný zdroj toho, „kdo jsi pro Athenu právě teď" a roste kotvovými úpravami, nikdy celkovými přepisáváními.
- **Epizody** — samotná historie konverzací uložená jako soubory markdown na tvém počítači. Doktrínu (vlastní referenční dokumenty Personas) tvoří znalosti o produktu.

### Nastartování vstupním rozhovorem

Na čerstvé instalaci Athena automaticky provede krátký rozhovor — několik cílených otázek, které jí dají dostatek pro napsání počátečního profilu identity. Rozhovor můžeš kdykoli znovu spustit výběrem **poznej mě** z palette předvoleb nebo kliknutím na odpovídající čip na uvítací obrazovce. Pokud profil identity již existuje, aktualizuje ho kotvovými úpravami; nikdy neodstraní kontext, který jsi jí dříve dal/a.

### Prohlížeč paměti

Otevři **Companion → Memory** a uvidíš vše, co Athena ví. Brain Viewer zobrazuje epizody, fakta, procedurální preference, cíle a identitní dokument — vše procházitelné. Klikni na libovolný záznam pro přečtení plného obsahu, přechod na propojené paměti a úpravu nebo opravu čehokoli, co je špatně.

**Opravy jsou na jedno kliknutí.** Každý bod v pohledu identity má možnost „To je špatně". Kliknutím Athena zaznamená opravu jako vysoce hodnotný učební signál a navrhne odebrání nesprávného bodu v jediné schvalovací kartě. Schválíš a špatné tvrzení zmizí.

### Soukromí

Data mozku — všech pět úrovní paměti — žijí na tvém počítači ve složce \`~/.personas/companion-brain/\`. Nic se neukládá do cloudové databáze. Pokud používáš lokální enginy Whisper STT a Piper TTS, žádný zvuk také neopustí tvůj počítač.

:::tip
Vstupní rozhovor je krátký (pár minut) a okamžitě přináší výsledky — prvních pár odpovědí Atheny po dobrém rozhovoru je znatelně přesnějších. Proveď ho před svou první skutečnou seancí.
:::
  `,

  "proactive-check-ins": `
## Proaktivní upomínky

Athena nečeká, až se zeptáš. Když se stane něco, co si zaslouží tvou pozornost — blížící se termín, čekající agent, připomínka, kterou jsi nastavil/a — sama se ozve. To jsou proaktivní upomínky: karty, které se zobrazují v chatovacím panelu, volitelně hlasem, aniž bys cokoli otevíral/a.

### Co upomínku spustí

Athena vyhodnocuje podmínky přibližně každých pět minut. Spouštěče, které mohou produkovat upomínku, zahrnují:

- **Blížící se termín cíle** — aktivní cíl má cílové datum do 24 hodin
- **Stárnutí nevyřízených položek** — závazek ze self-promise nebyl vyřešen po dobu přesahující úrovňový práh (eskalující od 1 dne přes 3 dny do 7 dní)
- **Splatná kadence** — rituál, který jsi nastavil/a (opakující se upomínka, soustředěná práce), odpovídá „nyní"
- **V tento den** — poznámka nebo reflexe ze stejného kalendářního dne před jedním, třemi nebo dvanácti měsíci, shodující se s tvými aktivními cíli
- **Agent potřebuje tebe** — seance flotily selhala, čeká na vstup déle než dvě minuty nebo se stala neaktivní
- **Vlastní závazky Atheny** — plánované upomínky, které Athena navrhla a ty schválil/a v průběhu konverzace, doručené přesně v čas, ke kterému se zavázala

### Ochranné prvky

Systém je navržen tak, aby byl užitečný, ne hlučný:

- **Tiché hodiny** — upomínky jsou zadrženy během jakéhokoli tichého okna, které si nakonfiguruješ; nic se nespustí, dokud jsi explicitně požádal/a o klid
- **Denní rozpočet** — ve výchozím nastavení Athena posílá maximálně tři upomínky za den z typů spouštěných událostmi; pokud určitý typ upomínky opakovaně odmítáš, jeho rozpočet se časem potichu snižuje
- **Deduplikace** — stejný spouštěč pro stejný předmět se může spustit pouze jednou, dokud ho nevyřešíš; selhávající agent nebude generovat novou upomínku každých pět minut

### Jak na upomínku reagovat

Každá karta nabízí dvě akce: **Zapojit se** a **Odmítnout**. Zapojení otevře příslušný kontext — detail cíle, aktivitu agenta, paměťový záznam. Odmítnutí zaznamená, že jsi upomínku viděl/a. Je-li nakonfigurován hlas, tělo upomínky se přehraje okamžitě po jejím příchodu, i se zavřeným chatovacím panelem.

:::info
Incidenty s vysokou, urgentní a kritickou závažností zcela obcházejí denní rozpočet upomínek — nikdy nejsou umlčeny frekvenčními limity ani tichými hodinami. Položky na bezpečnostní podlaze k tobě vždy dorazí.
:::

:::tip
Nastav si rituál tichých hodin v palette předvoleb (zadej \`/\` a vyber „co je ve frontě" pro zobrazení svých rituálů), aby ses definoval/a okno, kde Athena zadržuje všechny upomínky, dokud okno neskončí. To se hodí pro bloky hluboké práce, kdy chceš nulové vyrušení.
:::
  `,

  "guided-walkthroughs": `
## Průvodci

Když se Atheny zeptáš, jak něco udělat, může ti to ukázat místo pouhého vysvětlení. Řekni „ukaž mi, jak vytvořit personu" nebo „jak nastavím konektor?" a ona nabídne výběr: **Postav to za mě** (ona udělá práci) nebo **Ukaž mi, jak to postavit** (provede tě tím samotným).

Zvol cestu průvodce a začne prohlídka. Athenina koule klouže po obrazovce do příslušné oblasti — můžeš sledovat, jak se pohybuje. Prvek, na který chce, abys pohlédl/a, dostane jemný zářivý kroužek s rohovými závorkami, který se na něj uzamkne. Zbytek UI zůstane plně viditelný a klikatelný; nic není ztmaveno ani zablokováno. **Panel titulku** jede vedle koule s narací kroku a ovládacími prvky: Zpět, Pauza, Přeskočit a Zastavit.

### Jak každý krok funguje

Každý krok průvodce popisuje, na co se díváš, a pokud je co udělat, čeká, než to uděláš. Kliknutí na zvýrazněný prvek zároveň postoupí prohlídku i provede skutečnou akci — prohlídka a aplikace zůstávají synchronizovány. Některé kroky jsou momenty „jsi na řadě ty", kde je automatické postupování zcela pozastaveno, dokud neklikneš. Jiné kroky postoupí automaticky po krátkém prodlení, jakmile jsi přečetl/a naraci.

Průvodce je ovladatelný klávesnicí: šipkami vlevo/vpravo se vracíš a postupuješ, mezerník dává pauzu a obnovuje, Escape zastaví.

### Jaké průvodce jsou dostupné

Athena má připraveny prohlídky pro plochy, na které se uživatelé nejčastěji ptají:

- **Vytvoření persony** — studio tvorby, spouštěč „popiš svou personu" u sigilu a přepínač autonomního sestavení
- **Nastavení konektoru** — trasa Vault, průběh přidání nových přihlašovacích údajů a výběr typu konektoru
- **Vytvoření spouštěče** — centrum Events a canvas Builder
- **Přijetí šablony** — galerie šablon a prvek Adopt na kartě šablony
- **Třídění incidentu** — inbox Overview Incidents a řádek incidentu
- **Nastavení cíle a KPI** — nástěnka Goals a dashboard KPI

Každý průvodce se uzavírá výzvou k akci: Začni stavět, Otevři katalog, Otevři Builder nebo Nastav cíl — cesta „ukaž mi jak" tak vede přímo do cesty „udělej to".

### Ukázání a ad-hoc prohlídky

Kromě skriptovaných průvodců může Athena uprostřed konverzace ukázat na jednotlivé prvky. Zeptáš-li se „kde je feed aktivity?", může na něj nechat bliknout zářivý kroužek a přidat jednorázový titulek bez spouštění celé prohlídky. Může také na vy sestavit krátkou prohlídku o dvou až šesti krocích pro žádosti „ukaž mi se podívat kolem".

:::tip
Athena nabídne průvodce nebo cestu „postav-za-mě" automaticky, když popíšeš personu, kterou chceš — nemusíš znát správnou frázi. Stačí popsat, co chceš postavit, a ona oba způsoby nabídne.
:::
  `,

  "the-decision-hub": `
## Decision Hub

Některé Atheniny akce před spuštěním vyžadují tvůj výslovný souhlas. Když chce provést něco, co mění stav — spustit agenta, aktualizovat tvůj profil identity, naplánovat budoucí upomínku, vytvořit flotilové seance — navrhne to jako **schvalovací kartu**. Karta leží v chatovacím panelu, dokud ji nevyřešíš. Nic se nestane, dokud to neuděláš.

### Co se zobrazí jako schvalovací karta

Rozsah akcí, které se tímto způsobem zobrazují, je široký:

- **Spouštění agentů** — provedení persony s danými vstupy nebo spuštění autonomního jednorázového sestavení
- **Zápisy do paměti a identity** — aktualizace profilu identity, zápis nebo smazání faktu či procedurální preference, zápis nebo aktualizace cíle
- **Budoucí závazky** — plánovaná upomínka, kterou Athena navrhuje („Dám ti vědět za tři dny")
- **Projektová a vývojová práce** — registrace nového projektu, zařazení prohledávání kódu do fronty
- **Flotilové operace** — vytváření nových seancí Claude Code, odesílání vstupů do seance, ukončení seance, odeslání víceseanční operace

### Citlivé operace nejsou nikdy automaticky schvalovány

Určité kategorie se **nikdy** automaticky neschvalují, i když je autonomní režim zapnutý. Aktualizace identity a zápisy cílů vyžadují tvé přezkoumání pokaždé — Athena je může navrhnout, ale bez tvého kliknutí je nemůže potvrdit. To je záměrné: zápisy, které formují to, kdo jsi pro Athenu, a stav cílů, který pohání proaktivní upomínky, mají vždy člověka ve smyčce.

### Schválit vše

Když se ze stejné flotilové seance nahrne více schvalovacích karet — řekněme, seance čeká na tři zápisy souborů za sebou — skupina karet zobrazí tlačítko **Schválit vše**, které najednou vyřeší každou kartu typu schválení v té seanci. Žádosti o pokyny vyžadující napsané odpovědi se nikdy neseskupují; vždy zůstávají individuální.

### Kde Hub sídlí

Schvalovací karty se zobrazují přímo v chatovacím panelu, nad polem pro psaní. Tam také vidíš nevyřízená schválení z probíhajících seancí agentů — vše čekající na tvé rozhodnutí je na jednom místě, ne rozptýleno v jednotlivých pohledech agentů.

:::info
Pokud Athena navrhne akci a ty ji odmítneš, obdrží odmítnutí jako zpětnou vazbu a může navrhnout alternativu. Odmítnutí je vždy bezpečné — žádný stav se nemění, dokud neschválíš.
:::
  `,

  "operating-by-chat": `
## Ovládání aplikace přes chat

Athena umí víc než radit — může řídit aplikaci. Požádej ji, aby tě někam odvedla, otevřela editor, sestavila dashboard nebo zavolala připojenou službu, a ona to udělá, přičemž místo cíle zabliká, aby tvůj pohled přistál na tom, co právě otevřela.

### Navigace hlasem nebo textem

Požádej Athenu, aby otevřela libovolnou hlavní sekci aplikace — Overview, Agents, Events, Credentials, Settings a další — a ona přepne trasu v postranním panelu. Kontejner cíle na okamžik pulzuje, abys věděl/a, kde přistála. Funguje to i z hlasového tahu se zavřeným panelem: řekni „vezmi mě na feed aktivity" a aplikace naviguje, zatímco Athena v chatu potvrdí.

Z konkrétního kontextu může jít hlouběji. Požádej „skákni do Labu pro agenta sumarizátoru v porovnávacím režimu" a ona otevře editor toho agenta s předvolenou maticí porovnání. Výběr trasy a režimu proběhne v jediné akci.

### Sestavení vlastního řídicího panelu

Když chce Athena vysvětlit něco operačního — stav flotily agentů, souhrn připojené služby, nevyřízená schválení — může sestavit **cockpit**: mřížku widgetů na tvé kartě Home, která zobrazuje data přímo místo výpisu do chatu. Sestaví widgety, uloží specifikaci, navede tě tam a panel to potvrdí krátkým zablikáním kontejneru cockpitu.

Cockpit jí můžeš také výslovně zadat: „připrav dashboard s mými třemi nejlepšími agenty a případnými nevyřízenými revizemi." Widgety, které se osvědčí, lze jedním kliknutím trvale připnout.

### Tlačítka Radar a Sunrise

Dvě tlačítka v nástrojové liště průvodce ti dávají jedním klepnutím přístup k Atheniným dvěma nejčastějším operačním souhrnům:

- **Radar** — přehled flotily. Athena předem shromáždí výtah z tvého úložiště běhů — zdraví týmu, postup cílů, výkon agentů, skóre Directora — a v jednom soustředěném tahu nad ním přemýšlí. Použij to, když chceš upřímný přehled o tom, jak se daří celé tvé flotile.
- **Sunrise** — ranní přehled. Athena shrne posledních 24 hodin napříč Zprávami, Lidskou revizí a Incidenty: kolik přišlo, co je urgentní, co je po termínu. Použij to pro zorientování se na začátku seance.

Obě tlačítka přeskočí chatový tah pro krok sběru dat — tvé kliknutí je spouštěč a souhrn se streamuje zpět do panelu jako každá jiná odpověď.

### Zkratky „Zeptej se Atheny" v celé aplikaci

Jiné části Personas zobrazují tlačítka **Zeptej se Atheny**, která posílají kontext přímo k ní. Karta Fleet Optimization v Mission Control, stránky cílů, detailní pohledy zpráv a další plochy tato tlačítka mají. Kliknutím se příslušný kontext odešle jako hlasový tah přes vždy připojený panel — koule se krátce vynoří, potvrdí příjem a tah běží na pozadí, takže zůstáváš na obrazovce, kde jsi byl/a.

:::tip
Athena může v chatu přímo volat tvé připojené služby — problémy Sentry, pull requesty GitHubu, kanály Slacku, vlákna Gmailu. Připni konektor v nástrojové liště a ona z něj může v úloze na pozadí načíst data, pak výsledky ohlásit v příští odpovědi, aniž bys opustil/a konverzaci.
:::
  `,
};
