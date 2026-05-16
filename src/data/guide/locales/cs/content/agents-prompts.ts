export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Vytvoření nového agenta

Máš dva způsoby, jak vytvořit nového agenta. **Od nuly** — klikni \`Create Agent\`, pojmenuj ho a sám/sama napiš instrukce. **Ze šablony** — projdi galerii šablon, vyber tu, která odpovídá tomu, co chceš dělat (zpracování faktur, denní reporty, sociální posting...), odpověz na pár krátkých otázek o svém konkrétním případu použití a nech build engine, ať agenta sestaví za tebe. Většina lidí začíná se šablonou a odtud ladí.

V obou případech vybereš název a ikonu, zvolíš, jaký AI model agenta pohání, a vybereš, jaké nástroje (e-mail, vyhledávání na webu, přístup k souborům atd.) může používat. Žádná z těchto voleb není trvalá — libovolné nastavení můžeš později změnit.

:::steps
1. **Klikni Create Agent** — z postranního panelu nebo domovské obrazovky
2. **Vyber cestu** — začni prázdně nebo vyber šablonu z galerie
3. **Odpověz na otázky buildu** — pokud jsi šel/šla cestou šablon; build engine přizpůsobí agenta tvým odpovědím
4. **Pojmenuj svého agenta** — a vyber ikonu
5. **Uprav prompt a nástroje** — dolaď instrukce, které šablona vyprodukovala (nebo je napiš od nuly)
6. **Povýš, až bude připraveno** — agent se přesune z konceptu do aktivního stavu, jakmile to potvrdíš
:::

### Jak to funguje

Cesta šablon spouští interaktivní seanci buildu: engine klade upřesňující otázky o tvém případu použití, navrhuje parametry (tvar vstupu, výstupní kanály, kadenci plánu) a ukazuje živý náhled agenta, kterého se chystá sestavit. Na konci to schválíš a agent přistane připraven k testování. Cesta od nuly to vše přeskakuje — užitečné, když už přesně víš, co chceš, aby agent dělal.

:::tip
Dobré názvy agentů popisují úkol, ne technologii. „Morning Email Summary" je užitečnější než „GPT Agent 3."
:::
  `,

  "writing-effective-prompts": `
## Psaní efektivních promptů

Prompt je sada instrukcí, které dáváš svému agentovi. Dobré prompty jsou konkrétní, specifické a uspořádané: definuj roli agenta, uveď úkol, popiš tvar vstupu, specifikuj výstupní formát a upozorni na okrajové případy. Vágní prompty produkují vágní výstup — „shrň mi e-maily" funguje mnohem hůř než „přečti mých pět nejnovějších nepřečtených e-mailů a napiš dvouvětou shrnutí každého, seřazené podle důležitosti odesílatele."

Build engine ti tady pomáhá. Když přijmeš šablonu, engine klade upřesňující otázky v dávkách na schopnost (zdroj vstupu, výstupní kanál, formát, frekvence) a vplete tvé odpovědi do strukturovaného promptu. Pokud píšeš od nuly, to vplétání děláš sám/sama — ale stejných pět vstupů je to, co produkuje spolehlivé agenty.

### Checklist kvality promptu

:::checklist
- Definuj roli — „Jsi X, který dělá Y." Ukotvuje chování modelu.
- Uveď úkol konkrétně — slovesa, počty, časová okna. Vyhni se „pomoz mi s..."
- Popiš vstup — jaký tvar, jaké pole, co by měl agent ignorovat
- Specifikuj výstup — odrážky vs. odstavce vs. JSON, s názvy polí, pokud strukturovaný
- Ošetři okrajové případy — co dělat, když je vstup prázdný, neplatný nebo neočekávaný
- Použij příklady — i jeden pár vstup/výstup dramaticky zlepší konzistenci
:::

### Jak to funguje

Každý běh sestaví prompt z tvé uložené šablony, payloadu spouštěče a paměti agenta, kterou model může konzultovat. Model vidí stejný prompt, který jsi napsal/a (v pořadí, v jakém jsi ho napsal/a), plus vstup — co se vrací, je jeho upřímný pokus dodržet tvé instrukce. Karta trace v detailu běhu ti ukazuje přesný prompt, který byl poslán, takže když výstup uplave, můžeš vidět, jestli je viníkem prompt, nebo vstup.

:::tip
Piš prompt, jako bys instruoval/a chytrého, ale zcela nového dodavatele. Nepředpokládej nic. Až agent poprvé vyprodukuje výstup, podívej se na trace a zeptej se: „pochopil by lidský dodavatel, co jsem z tohoto promptu chtěl/a?"
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Jednoduchý vs strukturovaný režim promptu

Editor promptu nabízí dva režimy. **Jednoduchý režim** je jediné volné textové pole — píšeš prompt jako jeden blok prózy. Rychlé pro malé nebo experimentální agenty. **Strukturovaný režim** rozdělí prompt do pěti pojmenovaných sekcí (Identity, Instructions, Tools, Examples, Error Handling), abys mohl/a o každém aspektu přemýšlet zvlášť a editovat jednu, aniž bys ovlivnil/a ostatní.

Mezi režimy můžeš kdykoli přepínat, aniž bys přišel/přišla o práci. Editor parsuje prózu jednoduchého režimu do strukturovaných sekcí, když přepínáš nahoru, a spojuje strukturované sekce zpět do jednoho bloku, když přepínáš dolů.

:::compare
**Jednoduchý režim**
Jediné textové pole. Volná próza. Rychlé na první draft, rychlé na iteraci. Nejlepší pro experimentování a osobní agenty, kde jsi jediný čtenář.
---
**Strukturovaný režim** [recommended for shared/production agents]
Pět pojmenovaných sekcí — Identity, Instructions, Tools, Examples, Error Handling. Pomalejší na draft, ale snazší na údržbu. Každá sekce může být zkontrolována a změněna nezávisle, což je důležité, když se (ty nebo někdo jiný) vrátíš k agentovi za měsíce.
:::

:::info
Oba režimy produkují za běhu stejný prompt pod kapotou. Strukturovaný režim je UX vrstva, která ti pomáhá organizovat myšlení; model vidí vyrenderovaný prompt tak jako tak.
:::

### Jak to funguje

Přepínání režimů je nedestruktivní: editor ukládá strukturovanou reprezentaci interně a jednoduchý režim je sploštělý pohled na ni. Historie verzí zachovává režim, ve kterém jsi uložil/a, takže obnovení staré verze přinese zpět i režim, v jakém byla autorovaná.

:::tip
Začni v jednoduchém režimu, zatímco zjišťuješ, co by měl agent dělat. Jakmile jsi spokojen/a s chováním, přepni do strukturovaného režimu pro dlouhodobou perspektivu — vyplatí se to při prvním ladění jen sekce Examples bez nutnosti znovu pročítat celý prompt.
:::
  `,

  "structured-prompt-sections-explained": `
## Vysvětlení sekcí strukturovaného promptu

Strukturovaný režim rozdělí prompt do pěti sekcí. Každá má specifickou práci a build engine používá stejných pět košíků, když generuje prompty ze šablon — sekce tedy nejsou UI vrtochem, jsou stabilním kontraktem mezi tvým autorováním a tím, jak model agenta vidí.

### Pět sekcí

:::diagram
[Identity] --> [Instructions] --> [Tools] --> [Examples] --> [Error Handling]
:::

- **Identity** — kdo agent je. Role, osobnost, oblast expertízy, styl komunikace. Řádek „you are a...".
- **Instructions** — co agent dělá, krok za krokem. Hlavní úkol a libovolné podúkoly v pořadí, v jakém se mají odehrát.
- **Tools** — jaké schopnosti agent používá a jak je používat. Kdy zavolat který nástroj, jaké argumenty jsou důležité, co s výsledky.
- **Examples** — páry vstup/výstup, které ukazují, jak vypadá „dobré". Jediná nejvíce nedoceněná sekce a jedna z nejúčinnějších — jeden solidní příklad poráží tři další věty instrukcí.
- **Error Handling** — co dělat, když je vstup chybějící, neplatný nebo neočekávaný. Kde zastavit, co zkusit znovu, co eskalovat na manuální revizi.

### Jak to funguje

Renderer spojuje sekce v zobrazeném pořadí s jasnými oddělovači. Některé modely věnují více pozornosti rané sekce; pořadí je navrženo tak, aby kladlo roli a hlavní úkol jako první a příklady a ošetření chyb dole, kde jsou stále v kontextu, ale neředí titulek. Pokud používáš strukturované prompty poprvé, okamžitě vyplň Identity a Instructions a ostatní nech prázdné — model bude fungovat dobře a Examples / Error Handling můžeš přidat, jak se objeví okrajové případy.

:::tip
Když agent začne produkovat selhání v okrajových případech, podívej se na trace a zeptej se: „mohl jsem tomu zabránit příkladem?" Většina problémů „agent je špatný v X" je ve skutečnosti „nikdy jsem mu neukázal/a, jak vypadá dobré X."
:::
  `,

  "agent-settings-and-limits": `
## Nastavení a limity agenta

Karta Settings v editoru agenta je místem, kam dáváš zábradlí. Každý agent má limity na to, jak dlouho běží, kolik stojí na běh, kolik tahů modelu může udělat a kolik kopií může běžet paralelně. Výchozí hodnoty jsou konzervativní — dostatečné, aby se mohla odehrávat skutečná práce, dostatečně nízké, aby ti nepoctivý agent nemohl naúčtovat účet, než si toho všimneš.

Limity jsou obzvlášť důležité pro nezatížené agenty (plánované, webhook-spouštěné, řetězově spouštěné). Manuální běhy vidíš odehrávat se; plánované běhy ne, takže utíkající prompt by mohl běžet každou hodinu po dobu týdne, než to zkontroluješ.

### Klíčová nastavení

- **Timeout** — celkový čas v reálném čase, než je běh zabit. Výchozí 2 minuty, zvyš pro pomalé modely nebo dlouhé řetězce použití nástrojů.
- **Budget cap** — maximální cena na běh, hodnocená proti živému měřiči nákladů; běh se gracefully přeruší, když strop překročí.
- **Max turns** — počet zpětných výměn model ↔ nástroj povolených v jednom běhu. Zabrání smyčkám volání nástrojů, kdy model nikdy nezkonverguje.
- **Concurrency** — kolik paralelních běhů tohoto agenta je povoleno. Nastav na 1 pro stavové agenty (aby se nepřekrývaly na stejném vstupu); zvyš pro paralelní dávkovou práci.
- **Memory access** — zda agent za běhu čte ze svého úložiště paměti (výchozí zapnuto pro agenty s povolenými pamětmi).
- **Failover provider** — alternativní AI poskytovatel pro použití, když primární vrátí chyby nad práh. Nastav u agentů, na jejichž dostupnosti ti záleží.

### Jak to funguje

Limity vynucuje exekuční engine, ne model. Když běh narazí na limit, čistě se zastaví — částečný trace je zachován, běh je označen důvodem (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`) a žádný účet nebo mutace stavu se pro odříznutou část neukládá. Karta Health zobrazuje zastavení kvůli limitu jako varování, takže můžeš rozhodnout, jestli limit zvýšit, nebo opravit podkladový prompt.

:::tip
Začni s konzervativními limity u každého nového agenta. Nejlevnější okamžik k objevení utíkajícího promptu je třetí manuální běh, ne třetí plánovaný noční běh.
:::
  `,

  "assigning-tools-to-agents": `
## Přidělování nástrojů agentům

Nástroje jsou jako aplikace v telefonu — tvůj agent může používat jen ty, které mu nainstaluješ. Přidělením konkrétních nástrojů kontroluješ přesně, co tvůj agent může dělat. Agent s přístupem k e-mailu umí číst a posílat zprávy; ten s vyhledáváním na webu si může věci najít online.

:::warning
To je také bezpečnostní funkce. Agent nemůže omylem upravovat soubory, pokud nemá přístup k souborům, a nemůže posílat e-maily, pokud nemá e-mailové nástroje. Vždy máš kontrolu nad tím, čeho se tvoji agenti mohou a nemohou dotýkat.
:::

### Dostupné typy nástrojů

- **Email** — číst, draftit a posílat e-mailové zprávy
- **Web search** — vyhledávat informace na internetu
- **File access** — číst a zapisovat soubory na tvém počítači nebo v cloudovém úložišti
- **API calls** — interagovat s externími službami a databázemi
- **Clipboard** — číst ze schránky a zapisovat do ní
- **Messaging channels** — posílat výsledky na Slack, Discord, Teams nebo libovolný generický webhook endpoint jako součást výstupu agenta

### Jak přidělit nástroje

:::steps
1. **Otevři kartu Connectors** — v editoru agenta; ukazuje každou schopnost, kterou tvůj agent potřebuje, proti tvému trezoru
2. **Vyber kategorii, ne konkrétní službu** — vyber „email" nebo „cloud storage" a picker ti ukáže odpovídající přihlašovací údaje, které už máš, plus navrhované konektory, pokud nemáš
3. **Autorizuj cokoli nového** — u OAuth služeb proklikáš jednorázovou obrazovku souhlasu; výsledný přihlašovací údaj přistane v trezoru a je opakovaně použitelný napříč agenty
4. **Pre-flight kontrola** — než agenta povýšíš, build engine zkontroluje každou požadovanou schopnost proti trezoru a označí cokoli, co chybí
5. **Ulož konfiguraci** — agent použije přiřazené nástroje při svém dalším běhu; pokud přihlašovací údaj později vyprší, uvidíš to v indikátoru zdraví agenta
:::

:::tip
Přiděluj jen ty nástroje, které tvůj agent skutečně potřebuje. Méně nástrojů znamená méně věcí, které se mohou pokazit, a tvůj agent zůstane soustředěný na svou práci.
:::
  `,

  "prompt-version-history": `
## Historie verzí promptu

Každé uložení promptu agenta vytváří neměnnou verzi. Historie žije vedle editoru promptu na kartě Prompt — otevři ji a vidíš každé uložení, s časovou značkou, s diffem proti předchozí verzi viditelným inline. Žádný limit; úplně první verze je zachována na neurčito.

Systém také automaticky verzuje, když build engine modifikuje prompt (např. během adopce šablony nebo přestavby parametrů), takže změny od engine se zobrazují vedle tvých manuálních editů s jasným štítkem „auto-generated".

### Klíčové body

- **Automatické snímky** při každém uložení — manuální editace i editace engine
- **Obnovení jedním kliknutím** — vybere libovolnou verzi a udělá z ní aktuální prompt; aktuální verze je nejprve uložena, takže obnovení nikdy není ztrátové
- **Inline diff** — viz, co se mezi dvěma verzemi změnilo, aniž bys opustil/a kartu
- **Neomezená retence** — verze nikdy nevyprší ani nejsou garbage-collectované

### Jak to funguje

Historie je uložena v lokální SQLite databázi (vedle samotného agenta), takže je okamžitě prohledávatelná a funguje offline. Když obnovíš verzi, editor se na ni přepne, ale dříve aktuální verze je také zachována — můžeš se přepnout zpět, aniž bys znovu dělal/a svou práci.

:::tip
Před riskantní změnou promptu udělej no-op uložení, takže je aktuální stav v historii zaznamenán. Pak svobodně experimentuj — obnovení je jedno kliknutí, pokud experiment selže.
:::
  `,

  "comparing-prompt-versions": `
## Porovnávání verzí promptů

Když se chování agenta změní a chceš vědět proč, pohled na diff v historii verzí přesně ukazuje, které znaky promptu se mezi libovolnými dvěma verzemi liší. Přidání jsou zvýrazněna zeleně, smazání červeně. Tohle je nejrychlejší způsob, jak lokalizovat regresi — obvykle můžeš vidět provinilou změnu během sekund.

Diff respektuje i sekce strukturovaného promptu: pokud porovnáváš dvě verze ve strukturovaném režimu, diff je segmentován podle sekcí, takže můžeš ignorovat irelevantní sekce a soustředit se na tu, která se změnila.

:::code-compare
### Původní
Shrň e-maily v mé schránce.
Dej mi klíčové body.
---
### Vylepšené
Přečti mých 5 nejnovějších nepřečtených e-mailů.
Pro každý e-mail napiš dvouvětou shrnutí
včetně jména odesílatele a potřebné akce.
Naformátuj jako číslovaný seznam.
:::

### Klíčové body

- **Pohled bok po boku** — obě verze viditelné najednou se zvýrazněním na úrovni znaků
- **Per-section diff** pro strukturované prompty — skoč přímo do změněné sekce
- **Porovnávej libovolné dvě verze** — ne jen sousední; užitečné pro „co se změnilo od fungující verze před třemi týdny"
- **Rychlé obnovení** — obnov libovolnou verzi přímo z pohledu diffu

### Jak to funguje

Otevři historii verzí na kartě Prompt, zaškrtni políčka u dvou verzí a klikni Compare. Diff se vyrenderuje v panelu bok po boku. Klikni Restore na kteroukoli stranu, abys ji udělal/a aktuální; diff zůstane otevřený, takže přesně vidíš, k čemu jsi se vrátil/a.

:::tip
Když v diffu najdeš provinilou změnu, zkopíruj *novou* (rozbitou) verzi do promptu a pokračuj v editaci — tím historie verzí zaznamená tvůj záměr („zkusil jsem X, vrátil se k Y, pak vylepšil na Z"). Obnovení bez zanechání stopy ztrácí lekci.
:::
  `,

  "cloning-and-duplicating-agents": `
## Klonování a duplikování agentů

Klonování zkopíruje plnou konfiguraci agenta do nového agenta: prompt (včetně historie verzí), nástroje, spouštěče, nastavení, příznaky přístupu k paměti, failover poskytovatel, vše kromě běhového stavu (běhy, náklady a živé spouštěče se nepřenášejí). Klon je plně nezávislý — editace na obou stranách neovlivňují tu druhou.

Nejčastější použití je forknutí fungujícího agenta pro bezpečné experimentování. Originál pokračuje v produkci; klon je tvůj sandbox. Pokud experiment vyjde dobře, můžeš buď nahradit originál, nebo si klon nechat jako specializaci.

### Klíčové body

- **Plná konfigurace se přenáší** — prompt, nástroje, spouštěče, nastavení, paměť, failover
- **Běhový stav ne** — běhy, náklady, živé spouštěče patří jednomu agentovi najednou
- **Spouštěče jsou klonovány, ale vypnuté** — takže klon hned nezačne spouštět na stejném plánu/webhooku jako originál
- **Klonovaní agenti dostanou výchozí příponu „(Copy)"**; přejmenuj před povýšením

### Jak to funguje

Klikni pravým tlačítkem na agenta v postranním panelu nebo použij tříbodové menu v nástrojové liště editoru a vyber \`Clone\`. Nový agent se objeví ve stejné skupině s vypnutými spouštěči. Záměrně je znovu povol (a aktualizuj jejich konfiguraci, pokud nechceš, aby klon poslouchal na stejnou webhook URL jako originál, třeba).

:::tip
Klonování je nejbezpečnější způsob, jak A-B testovat změnu promptu bez narušení agenta, který už je v produkci. Udělej změnu v klonu, spusť oba v aréně Labu na stejných vstupech a vyměň produkčního agenta jen tehdy, když klon vyhraje.
:::
  `,

  "agent-groups-and-organization": `
## Skupiny agentů a organizace

Agenti v postranním panelu jsou organizováni do skupin — tvých vlastních složek pro řazení podle týmu, projektu, funkce nebo čehokoli, co považuješ za užitečné. Výchozí jsou prázdné; přidáváš skupiny, jak ti kolekce roste a plochý seznam přestává škálovat.

Postranní panel také podporuje vnořené skupiny (jedna úroveň vnoření), přeuspořádání pomocí drag-and-drop, stav sbalení/rozbalení, který přetrvává napříč seancemi, a ikony per-skupina pro rychlou vizuální rozpoznatelnost.

### Klíčové body

- **Vytváření skupin** podle potřeby — bez limitu počtu
- **Přetáhni pro přeskupení** — pusť agenta na skupinu pro přesun, nebo přeuspořádej seznam puštěním mezi sourozenci
- **Ikony a barvy per-skupina** — vyber ikonu, která naznačuje téma skupiny, abys jediným pohledem našel/našla správnou skupinu
- **Sbalení pro odklizení** — sbalené skupiny zůstávají sbalené napříč seancemi, takže dlouhý seznam s tebou při startu nebojuje
- **Vnořování o jednu úroveň** — užitečné pro „Personal > Email", „Work > Research" atd.

### Jak to funguje

Klikni pravým tlačítkem v postranním panelu agentů pro přidání skupiny, nebo přetáhni existující skupinu na jinou pro vnoření. Skupiny jsou uchovávány v lokální databázi a neovlivňují běh agenta — jsou čistě organizační vrstvou. Agenti mohou být v jedné skupině naráz, ale mezi nimi se svobodně přesouvají.

:::tip
Skupina „Drafts" nebo „Experimental" na vrchu postranního panelu je užitečný vzor. Cokoli, na čem stále iteruješ, žije tam, a tví produkční agenti zůstávají v jasně pojmenovaných skupinách dole. Vizuální oddělení snižuje šanci na editaci špatného agenta.
:::
  `,

  "disabling-and-archiving-agents": `
## Vypínání a archivace agentů

Dva způsoby, jak pozastavit agenta bez smazání. **Disable** zastaví spouštění všech spouštěčů a zablokuje manuální běhy; agent zůstává viditelný v postranním panelu s tlumenou ikonou, takže si pamatuješ, že existuje. **Archive** přesune agenta do skryté sekce archivu mimo dosah každodenního používání; přestane se spouštět, nepočítá se proti limitům tarifu a kdykoli může být obnoven.

Ani jedna operace se nedotýká běhů, nastavení ani historie verzí. Archive je těžší — použij ho pro agenty, se kterými jsi pro tuto chvíli skončil/a, ale možná je budeš chtít zpět. Disable je lehčí — použij ho, když potřebuješ agenta dočasně zastavit, aniž bys ho ztratil/a z dohledu.

### Klíčové body

- **Disable** — pozastavuje běh; agent stále viditelný v postranním panelu; jedno kliknutí pro znovuzapnutí
- **Archive** — skryje agenta a uvolní jeho slot proti tvému limitu tarifu; obnovitelné navždy
- **Ani jedno nemaže** — nastavení, historie promptu a minulé běhy jsou zachovány
- **Spouštěče respektují disable** — vypnutý agent ignoruje události schedule/webhook/file-watcher; nestaví se do fronty pro přehrání po znovuzapnutí

### Jak to funguje

Otevři tříbodové menu v nástrojové liště editoru agenta nebo klikni pravým tlačítkem na agenta v postranním panelu. Disable / Archive / Restore tam všechny žijí. Archivovaní agenti jsou dostupní ze sekce Archive na dolní straně postranního panelu agentů; obnovení vrátí agenta do jeho původní skupiny (nebo do koše „Ungrouped", pokud byla skupina mezitím smazána).

:::tip
Archivuj sezónní agenty (čtvrtletní reporty, prázdninové workflow, end-of-month vyrovnání) místo mazání. Obnov je, až se sezóna vrátí, a jsou připraveni okamžitě běžet.
:::
  `,

  "agent-health-indicators": `
## Ukazatele zdraví agenta

Každý agent má vedle svého jména malou barevnou tečku, která ti jedním pohledem řekne jeho stav. **Zelená** znamená, že vše běží hladce. **Žlutá** znamená, že něco vyžaduje tvou pozornost — možná přihlašovací údaj brzy vyprší nebo nedávný běh měl varování. **Červená** znamená, že je problém, který potřebuje opravu.

Tyto indikátory tě zbavují nutnosti kontrolovat každého agenta jednotlivě. Rychlý pohled na postranní panel ti řekne zdraví celého tvého nastavení.

:::feature
**Monitoring zdraví jedním pohledem**
Personas nepřetržitě sledují výsledky běhů, vypršení přihlašovacích údajů a úplnost konfigurace pro každého agenta. Ukazatele zdraví se aktualizují automaticky — žádné manuální kontroly nejsou nutné.
:::

### Co která barva znamená

| Barva | Stav | Význam |
|---|---|---|
| **Zelená** | Healthy | Všechny nedávné běhy uspěly, žádné problémy nezjištěny, nastavení dokončeno |
| **Žlutá** | Warning | Něco může brzy vyžadovat pozornost (vypršující přihlašovací údaj, pomalý výkon, nastavení částečně dokončeno) |
| **Červená** | Error | Agent nedávno selhal nebo má problém s konfigurací |
| **Šedá** | Inactive | Vypnutý nebo nikdy nespuštěný |

### Stav nastavení

Vedle zdraví má každý agent **stav nastavení** označující, jak je připraven autonomně běžet. Čerstvě povýšený agent často má mezery v nastavení — chybějící přihlašovací údaj, nenakonfigurovaný spouštěč, výstupní kanál stále v procesu zapojování. Štítek stavu nastavení odhaluje přesně, co zbývá udělat, v pořadí priority, takže nemusíš lovit přes karty pro zjištění, co blokuje. Agenti s přetrvávajícími problémy nastavení jsou automaticky vytaženi z jakékoli plánované nebo spouštěné rotace okruhovým jističem, takže nikdy nebudeš mít poloviční nastavovaného agenta běžícího tiše proti špatným datům.

### Jak to funguje

Zdraví je automaticky vypočítáno na základě výsledků nedávných běhů, stavu přihlašovacích údajů a úplnosti konfigurace. Klikni na indikátor pro zobrazení souhrnu toho, co způsobuje aktuální stav — včetně případných mezer v nastavení. Odtud můžeš skočit přímo do nastavení, logů nebo konkrétní karty, která vyžaduje pozornost.

:::tip
Udělej si zvyk jednou denně přehlédnout barvy v postranním panelu. Zachycení žlutého indikátoru včas brání tomu, aby se stal červeným — a řešení mezer v nastavení hned po povýšení je nejlevnější okamžik to udělat.
:::
  `,
};
