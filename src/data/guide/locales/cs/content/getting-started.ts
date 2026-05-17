export const content: Record<string, string> = {
  "installing-personas": `
## Instalace Personas

Dostat Personas do svého počítače zabere přibližně minutu. Stáhni si instalátor pro svůj operační systém — Windows, macOS nebo Linux — ze stránky pro stahování a spusť ho. Instalátor je jediný soubor bez instalačního průvodce; poklepej na něj, schval bezpečnostní výzvu a aplikace se spustí. Aktualizace se doručují automaticky na pozadí, takže budeš vždy mít nejnovější verzi, aniž bys cokoli dělal/a.

Když se aplikace poprvé otevře, dostaneš se na úvodní obrazovku. Odtud můžeš buď rovnou skočit do tvorby agenta (Personas ti nabídnou nastavení AI poskytovatele, až ho budeš potřebovat), nebo si nejdřív otevřít trezor přihlašovacích údajů, pokud už máš API klíče, které chceš uložit. Obě cesty fungují.

:::steps
1. **Stáhni instalátor** — vyber správný soubor pro svůj OS (NSIS \`.exe\` na Windows, \`.dmg\` na macOS, \`.AppImage\` nebo \`.deb\` na Linuxu)
2. **Spusť instalátor** — poklepej na Windows, přetáhni do Applications na macOS, spusť na Linuxu
3. **Schval bezpečnostní výzvy** — tvůj OS tě může požádat o potvrzení; to je u nového desktopového softwaru normální
4. **Spusť Personas** — otevře se uvodní obrazovka s průvodním tour, který můžeš projít nebo přeskočit
5. **Volitelně: připoj poskytovatele** — vlož API klíč na stránce Connections, pokud chceš být připraven/a okamžitě tvořit
:::

:::info
Funguje na **Windows 10+**, **macOS 12+** a většině moderních **Linux** distribucí. Instalátor pro Windows je 53 MB NSIS \`.exe\`; binárka po instalaci má kolem 90 MB. Automatické aktualizace jsou pouze rozdílové, takže jsou obvykle mnohem menší.
:::

:::tip
Pokud narazíš na varování Windows SmartScreen nebo macOS Gatekeeper, je to tvůj OS, který je u nového softwaru opatrný. Schval to a jsi v cíli — instalátor je podepsán kódem.
:::
  `,

  "creating-your-first-agent": `
## Vytvoření prvního agenta

Tvůj první agent ti od prázdného plátna po fungujícího asistenta zabere asi pět minut. Máš dvě cesty: **začít ze šablony** (doporučeno pro tvého prvního agenta — build engine sestaví fungující konfiguraci z tvých odpovědí) nebo **začít od nuly** (plná manuální kontrola). Oba končí na stejném místě: agent, kterého můžeš spustit.

Pokud zvolíš cestu šablony, build engine spustí interaktivní seanci. Klade upřesňující otázky v dávkách („jaký druh vstupu očekáváš?", „kam by měl jít výstup?", „jak často by tohle mělo běžet?"), navrhuje parametry na základě tvých odpovědí a ukazuje živý náhled agenta, kterého se chystá postavit. Na konci to schválíš a agent přistane připraven k testování.

Pokud zvolíš cestu od nuly, prompt napíšeš sám/sama, vybereš AI model, připojíš nějaké nástroje a uložíš.

:::steps
1. **Otevři stránku Agents** — postranní panel → Agents, nebo stiskni \`Ctrl+1\` pro skok tam
2. **Klikni Create Agent** — vyber cestu: vyber šablonu nebo začni prázdně
3. **Odpověz na otázky buildu (cesta šablon)** — build engine dávkuje upřesňující otázky podle schopností a ukazuje živý náhled, jak tvé odpovědi tvarují agenta
4. **Uprav prompt a nástroje** — dolaď instrukce, které šablona vyprodukovala (nebo je napiš od nuly)
5. **Povýš, až bude připraveno** — přesune agenta z konceptu do aktivního stavu; kontroly stavu nastavení se spustí automaticky, aby označily nepřipojené přihlašovací údaje nebo nenakonfigurované spouštěče, než budeš moci povýšit
:::

### Jak to funguje

Cesta šablony je nejrychlejší způsob, jak získat *dobrého* agenta (šablony jsou navržené a otestované námi), ale vyrosteš z ní. Jakmile odešleš pár agentů založených na šablonách, začneš psát prompty přímo a šablony budeš brát spíš jako výchozí body než kompletní řešení.

:::tip
Neztrácej spánek nad dokonalostí prvního agenta. Historie verzí (zmíněná později) znamená, že můžeš svobodně experimentovat — každé uložení je checkpoint, ke kterému se můžeš vrátit.
:::
  `,

  "understanding-the-interface": `
## Orientace v rozhraní

Rozhraní Personas má tři hlavní oblasti. **Postranní panel** vlevo je tvá nejvyšší navigace — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment a Settings. Klikni na sekci nejvyšší úrovně a objeví se druhá úroveň navigace ukazující její podstránky (např. kliknutím na Agents se odkryje All Agents plus karty editoru pro aktuálně vybraného agenta: Prompt, Connectors, Lab, Activity, Health, Settings).

Středová oblast je **pracovní prostor**, kde se vše skutečně děje — editace promptů, sledování běhů, procházení katalogu přihlašovacích údajů. **Titulní lišta** nahoře obsahuje zvonek oznámení (klikni pro nejčerstvější detail běhu), přístup ke cockpitu („Talk to Athena") a globální vyhledávání. **Dolní pruh** ukazuje aktivní běhy a jakékoli urgentní systémové události.

| Oblast | Co dělá |
|------|-------------|
| Postranní panel úroveň 1 | Sekce nejvyšší úrovně — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Postranní panel úroveň 2 | Kontextová podnavigace pro aktivní sekci |
| Pracovní prostor | Hlavní editor / prohlížeč / dashboard pro libovolnou sekci, ve které se nacházíš |
| Titulní lišta | Zvonek oznámení, zkratka ke cockpitu, globální vyhledávání, ovládací prvky aplikace |
| Dolní pruh | Aktivní běhy, stav systému |

### Jak to funguje

Většinu toho, co děláš, se odehrává kliknutím na položku postranního panelu a editací v pracovním prostoru. Zvonek oznámení v titulní liště je jedna univerzální zkratka, kterou stojí za to si zapamatovat — vždy otevře nejnovější detail běhu, ať jsi kdekoli. Zkratka ke cockpitu („Talk to Athena") otevře v aplikaci chat se společníkem, který ti může pomoct stavět, ladit, nebo prostě zodpovědět otázky o tvém nastavení.

:::tip
Najeď myší na libovolnou ikonu postranního panelu pro tooltip s klávesovou zkratkou. \`Ctrl+1\` až \`Ctrl+9\` skočí přímo do sekcí nejvyšší úrovně a \`Ctrl+K\` otevře globální vyhledávání, takže můžeš najít cokoli podle názvu.
:::
  `,

  "what-is-an-ai-agent": `
## Co je AI agent?

AI agent je nakonfigurovaný AI model s úkolem. Dáš mu instrukce („přečti mé nepřečtené e-maily a shrň ty důležité"), řekneš mu, jaké nástroje může používat, a spustíš ho — ručně tlačítkem, podle plánu, na událost nebo jako krok v pipelině. Agent přečte payload spouštěče, dodržuje tvé instrukce, zavolá nástroje, které potřebuje, a vyprodukuje výstup. Na rozdíl od chatbota agent jedná: pošle e-mail, napíše soubor, pošle zprávu na Slack.

Každý agent v Personas je trvalý — pamatuje si své nastavení, svou historii, své přihlašovací údaje a (volitelně) paměti z minulých běhů. Můžeš ho klonovat, verzovat jeho prompt, spouštět ho v aréně proti alternativním promptům a zjistit, který funguje lépe, a řetězit ho s dalšími agenty pro stavbu vícekrokových pracovních postupů.

:::compare
**Chatbot**
Napíšeš dotaz, on odpoví. Každý tah je jednorázový. Užitečné pro rychlé dotazy, brainstorming, drafty. Žádné akce, žádná paměť napříč seancemi, žádná automatizace.
---
**AI Agent** [recommended]
Trvalá konfigurace s úkolem. Spouštěn ručně nebo automaticky; používá nástroje k akci; má verzovaný prompt, připojené přihlašovací údaje, historii běhů a indikátor zdraví. Model je motor, ale agent je celá sestava kolem něj.
:::

### Jak to funguje

:::diagram
[Spouštěč se aktivuje] --> [Agent čte vstup] --> [Model + nástroje provádějí] --> [Výstup je odeslán]
:::

Spouštěč balí vstupní payload (tělo webhooku, řetězec ze schránky, cestu k souboru, událost od jiného agenta...). Agent přečte svůj prompt, předá ho AI modelu spolu se vstupem a nechá model volat připojené nástroje, jak je potřeba. Finální výstup je odeslán přes výstupní kanál, který jsi nakonfiguroval/a — zpět do UI, zapsán do souboru, poslán na Slack nebo zařazen jako vstup pro dalšího agenta.

:::tip
Nejrychlejší cesta, jak pochopit agenty, je podívat se na své opakující se týdenní úkoly a zeptat se: „dalo by se tohle spustit, instruovat a zautomatizovat?" Pokud ano, ten úkol je agent.
:::
  `,

  "running-your-first-automation": `
## Spuštění první automatizace

Jakmile jsi vytvořil/a agenta, máš několik způsobů, jak ho spustit. Nejjednodušší je manuální tlačítko **Run** v horní části editoru agenta — klikni na něj a uvidíš živý stream běhu v panelu aktivity. Během několika sekund (nebo pár minut u pomalejších poskytovatelů nebo delších promptů) se objeví výstup.

Pro opakující se práci přidej plánovaný spouštěč, webhook spouštěč, file-watcher spouštěč nebo řetězový spouštěč, aby se agent spouštěl sám. Spouštěč nastavíš jednou, agent dělá zbytek.

:::steps
1. **Otevři agenta** — najdi ho na stránce Agents; editor se otevře s aktivní kartou Prompt
2. **Klikni Run** — pracovní prostor se automaticky přepne na kartu Activity; uvidíš, jak se prompt sestavuje, jak jde modelu volání ven a jak se vrací streamované tokeny
3. **Sleduj živý feed** — každý agent má svůj vlastní stream, takže můžeš spouštět víc agentů paralelně bez zmatku
4. **Prohlédni výstup** — řádek aktivity se rozšíří, aby ukázal plný prompt, odpověď modelu, případná volání nástrojů, dobu trvání a náklady
5. **Iteruj** — změň prompt nebo nastavení, ulož, spusť znovu; každý běh je zaznamenán
:::

### Jak to funguje

Běh je jediná exekuce: spouštěč → sestavení promptu → volání modelu → volání nástrojů → výstup. Každý krok je zachycen v trasování běhu a běh přistane na kartě Activity stránky Overview (globální pohled napříč všemi agenty) a na vlastní kartě Activity agenta. Z obou míst můžeš kliknout do běhu pro úplný modal s detaily.

Pokud běh selže (chyba modelu, vypršený přihlašovací údaj, výpadek sítě), indikátor zdraví agenta se zbarví žlutě nebo červeně a selhání se zachová v trasování, takže můžeš ladit.

:::tip
Tvůj první běh je částečně o tom, naučit se, co tvůj prompt v praxi skutečně dělá. Pokud výstup není to, co jsi chtěl/a, trasování ti přesně ukazuje, co model dostal — obvykle je oprava v tom, prompt upřesnit nebo omezit, místo aby se to zkusilo znovu.
:::
  `,

  "choosing-your-ai-provider": `
## Volba AI poskytovatele

Personas podporují hlavní AI poskytovatele — **Anthropic** (rodina Claude), **OpenAI** (rodina GPT), **Google** (Gemini) a **lokální modely** přes Ollama nebo libovolný endpoint kompatibilní s OpenAI. V Settings → Custom Models můžeš také nakonfigurovat vlastní poskytovatele. Každý agent si nezávisle vybírá svého poskytovatele/model, takže můžeš na rutinní práci spouštět levné modely a drahé si rezervovat pro úkoly, které je potřebují.

Připoj poskytovatele jednou na stránce Connections (vložíš API klíč — zašifrovaný v lokálním trezoru — nebo projdeš OAuth u poskytovatelů, kteří ho podporují). Poté výběr modelu každého agenta ukazuje nakonfigurované poskytovatele a jejich modely.

:::compare
**Anthropic Claude** [recommended]
Silné dodržování instrukcí, dlouhokontextové uvažování, strukturovaný výstup. Sonnet 4.6 je výchozí pro nové agenty. Modely Opus pro nejtěžší uvažování, Haiku pro rychlost/cenu. Vynikající ve smyčkách použití nástrojů.
---
**OpenAI GPT**
Nejširší ekosystém a nejvíce testované pro mnoho případů použití. Solidní všeumělec; modely třídy GPT-4o jsou silné pro obecnou asistentskou práci.
---
**Google Gemini**
Multimodální, velká kontextová okna, rychlá latence prvního tokenu. Silné pro výzkumné / dokumentační agenty.
---
**Local (Ollama / OpenAI-compatible)**
Běží na tvém stroji — žádná data neopouštějí zařízení. Menší modely, ale pro low-stakes nebo soukromou práci tenhle kompromis často stojí za to.
:::

### Jak to funguje

Jakmile je připojeno více poskytovatelů, Personas mohou provádět automatický failover na úrovni agenta: pokud tvůj primární poskytovatel vrací chyby nad prahovou hodnotu, další běh agenta použije nakonfigurovaného záložního poskytovatele. Když se primární zotaví, obnoví se normální rotace. To se konfiguruje na agenta v editoru → kartě Settings.

Pro sledování nákladů je každý běh otagován poskytovatelem, modelem a počtem tokenů, takže karta Overview → Usage může rozbít výdaje podle poskytovatele, modelu nebo agenta.

### Podívej se v akci

:::usecases
**Strategie model na agenta**
Tvoji agenti mají různé potřeby
---
Agent pro code-review používá Claude Opus (nejlepší uvažování); shrnovač e-mailů používá Haiku (rychlý a levný); osobní/soukromý agent běží lokálně na Ollama.
===
**Failover při výpadku poskytovatele**
Poskytovatel má regionální výpadek
---
Postižení agenti se automaticky přesměrují na nakonfigurovaný záložní; karta Health ukazuje, kteří agenti běží na záložním, a vyzdvihne obnovu, jakmile se primární vrátí.
===
**Snížení nákladů**
Měsíční výdaje za AI rostou
---
Overview → Usage ukazuje, kteří agenti a modely dominují útratě. Přehoď top-cost agenty na levnější třídu (Sonnet → Haiku, GPT-4o → GPT-4o-mini); Lab je může nejdřív A-B otestovat pro potvrzení, že kvalita drží.
:::

:::info
Výchozí poskytovatel pro nové agenty se nastavuje v Settings → Engine. Můžeš ho přepsat u každého agenta.
:::

:::tip
Většina poskytovatelů nabízí kredity pro bezplatnou zkušební verzi. Připoj dva nebo tři a spusť stejný prompt proti každému v aréně Labu — vycítíš rozdíly v osobnosti a vybereš si výchozí, který sedne tvému stylu.
:::
  `,


  "system-requirements": `
## Systémové požadavky

Personas jsou Tauri desktopová aplikace — Rust backend, React frontend, lokální SQLite databáze — a jsou záměrně nenáročné. Většina výpočetně náročné práce se odehrává na serverech AI poskytovatele, ne na tvém stroji. Aplikace v klidu spotřebovává téměř nulu CPU a používá několik set megabajtů RAM; škáluje se nahoru, jen když agenti aktivně běží lokálně.

Binárka po instalaci má kolem 90 MB. Pluginy (Artist pro generování obrázků, Obsidian Brain pro vektorové vyhledávání) mohou k tomu přidat, pokud je povolíš.

:::checklist
- Windows 10+, macOS 12+ nebo Ubuntu 20.04+ (doporučená nejnovější verze)
- Minimálně 4 GB RAM (8 GB+ doporučeno, pokud používáš pluginy pro embedding / vektorové vyhledávání)
- 1 GB volného místa na disku (více, pokud povolíš lokální modely pluginu Artist)
- Stabilní širokopásmové připojení — běh agenta je omezen latencí API AI poskytovatele
- Jakékoli moderní dvoujádrové CPU; čtyřjádrové nebo lepší doporučeno pro paralelní víceagentové běhy
:::

### Jak to funguje

Aplikace ukládá svou databázi (\`personas.db\`), trezor přihlašovacích údajů, historii běhů a konfiguraci lokálně v adresáři aplikačních dat specifickém pro tvůj OS. Nic se nenahrává, pokud explicitně nepovolíš cloudové nasazení nebo nepoužiješ cloudového AI poskytovatele. Pluginy, které dodávají lokální modely (např. obrazový generátor pluginu Artist + Gemini vize), stahují soubory modelů při prvním použití.

Windows build používá ONNX Runtime pro embedding, když je povolena funkce vector-knowledge-base; v takovém případě je to největší jednotlivá závislost.

:::tip
Pokud při víceagentovém běhu cítíš, že je aplikace pomalá, otevři kartu Health — ukazuje, kteří agenti a které závislosti (volání modelu, volání nástrojů, ONNX inference) přispívají k zátěži.
:::
  `,

  "keyboard-shortcuts-and-tips": `
## Klávesové zkratky a tipy

Pár klávesových zkratek pokrývá většinu třecích bodů v aplikaci. \`Ctrl+K\` otevře globální vyhledávání (najdi libovolného agenta, stránku nebo nastavení podle názvu). \`Ctrl+1\`–\`Ctrl+9\` skočí do sekcí nejvyšší úrovně postranního panelu. \`Ctrl+Enter\` spustí zaměřeného agenta. \`Ctrl+N\` otevře tok Create Agent.

Libovolnou klávesovou kombinaci si můžeš přizpůsobit v Settings → Appearance → Keyboard Shortcuts; výchozí kombinace tam, kde je to možné, sledují konvence OS.

### Základní zkratky

:::keys
Ctrl+K — Globální vyhledávání (najdi cokoli podle názvu)
Ctrl+N — Vytvořit nového agenta
Ctrl+Enter — Spustit zaměřeného agenta
Ctrl+S — Uložit změny v aktuálním editoru
Ctrl+/ — Přepnout postranní panel otevřeno/zavřeno
Ctrl+, — Otevřít Settings
Ctrl+? — Zobrazit přehled klávesových zkratek
:::

### Navigační zkratky

:::keys
Ctrl+1 — Home
Ctrl+2 — Overview
Ctrl+3 — Agents
Ctrl+4 — Events
Ctrl+5 — Connections
Ctrl+6 — Templates
Ctrl+7 — Plugins
Ctrl+Shift+P — Otevřít command paletu (spusť libovolnou akci podle názvu)
:::

### Jak to funguje

Command paleta (\`Ctrl+Shift+P\`) je plocha pro mocné uživatele. Napiš sloveso (\`run\`, \`clone\`, \`disable\`, \`open\`) plus název cíle a paleta ti ukáže odpovídající akce napříč celým tvým pracovním prostorem. Je to rychlejší než manuální navigace, jakmile znáš názvy věcí.

:::tip
Začni s \`Ctrl+K\`. Napiš pár písmen jména agenta a stiskni Enter — tahle jedna zkratka pokrývá asi 60 % každodenní navigace.
:::
  `,

  "where-to-get-help": `
## Kde získat pomoc

Nikdy nezůstaneš sám/sama. **Nápověda v aplikaci** je nejrychlejší cesta: chat ve cockpitu („Talk to Athena" v titulní liště) je společník poháněný LLM, který zná tvé nastavení, tvé nedávné běhy a produkt. Ptej se ho na otázky srozumitelnou češtinou a může také navrhovat změny konfigurace, odkázat tě na správnou kartu nebo otevřít ladicí seanci na selhávajícím běhu.

Pro věci, na které společník v aplikaci nedokáže odpovědět, je **průvodce** (tento web) dlouhou referencí, **komunita na Discordu** je místem, kde se ptáš ostatních uživatelů a týmu, a **e-mailová podpora** je pro otázky účtu nebo fakturace.

| Zdroj | Nejlepší pro | Doba odezvy |
|----------|----------|---------------|
| Cockpit / Athena (v aplikaci) | Otázky k nastavení, ladění, „kde je X?" | Okamžitě |
| Tento průvodce | Reference funkcí a návody | Okamžitě |
| Stránka dokumentace | Architektura, schéma, pokročilé integrace | Okamžitě |
| Komunita na Discordu | Tipy, recepty, „dělá tohle ještě někdo?" | Minuty |
| E-mailová podpora | Účet, fakturace, bezpečnost | Hodiny |
| Video tutoriály | Vizuální průchody klíčových toků | Okamžitě |

### Jak to funguje

Cockpit má přístup k doktríně — kurátorovanému souboru znalostí o produktu — a k tvému lokálnímu stavu (anonymizovanému). Může prohledat tvé běhy, doporučit změny a dokonce skládat in-line UI karty, které tě provedou opravou krok za krokem. Pokud nedokáže odpovědět, navrhne správný externí zdroj.

:::tip
Pro otázky typu „myslím, že je něco rozbité" otevři nejprve Athenu a zeptej se „diagnostikuj poslední selhávající běh agenta X". Ladicí tok cockpitu je pro tohle stavěn a obvykle poráží manuální čtení logů.
:::
  `,
};
