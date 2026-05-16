export const content: Record<string, string> = {
  "how-triggers-work": `
## Jak fungují spouštěče

Spouštěče jsou „kdy" tvého agenta. Prompt a nástroje definují *co* agent dělá; spouštěč definuje *kdy* a *s jakým vstupem*. Personas dodávají sedm typů spouštěčů: **manual** (klik na tlačítko), **schedule** (cron-styl), **webhook** (příchozí HTTP), **clipboard** (shoda události kopírování), **file watcher** (události souborového systému), **chain** (výstup jiného agenta) a **event-based** (interní události vyslané jinými agenty, pluginy nebo enginem samotným).

Každý agent může mít libovolný počet spouštěčů, smíchaných napříč typy. Jeden agent může běžet podle denního plánu, reagovat na webhook od Stripe, spouštět se, když zkopíruješ e-mailovou adresu, a být řetězitelný od upstreamových agentů — vše najednou.

### Typy spouštěčů

:::compare
**Manual**
Klik na tlačítko v editoru nebo z rychlého spuštění v titulní liště. Každý agent dostává tohle ve výchozím nastavení. Nejlepší pro testování a ad-hoc spouštění.
---
**Schedule**
Založené na cronu. Hodinově, denně, týdně nebo plný cron výraz s časovou zónou. Nejlepší pro rutinní práci, která běží bez vstupu — denní souhrny, týdenní reporty.
---
**Webhook**
Unikátní příchozí URL, na které agent naslouchá. Externí služby POSTují na ni pro spuštění agenta. Nejlepší pro „reaguj na událost ze služby třetí strany".
---
**Clipboard**
Spustí se, když zkopírovaný text odpovídá nakonfigurovanému vzoru (regex, typ obsahu nebo klíčové slovo). Nejlepší pro zkratky pro mocné uživatele — zkopíruj e-mail, agent ho dohledá.
---
**File Watcher**
Události souborového systému ve sledované složce (vytvoření / úprava / smazání). Nejlepší pro drop-zone workflow, kde soubory přicházejí v nepředvídatelných časech.
---
**Chain**
Výstup agenta A se stává vstupem agenta B. Nejlepší pro vícekrokové pipeliny složené z fokusovaných agentů.
---
**Event-Based**
Přihlašuje se k odběru interních událostí Personas (přihlašovací údaj vypršel, plugin emitoval událost, běh skončil s manual_review). Nejlepší pro reaktivní automatizace v rámci vlastního nastavení.
:::

### Klíčové body

- **Více spouštěčů na agenta** — žádná horní hranice; kombinuj typy volně
- **Nezávislé spouštění** — každý spouštěč se vyhodnocuje sám; spouštěč schedule neví ani ho nezajímá webhook spouštěč na stejném agentovi
- **Filtrování per-spouštěč** — každý spouštěč může mít vlastní podmínky filtru (např. webhook spouštěč se spustí jen na \`event_type=charge.succeeded\`)
- **Linie spouštěčů** — plátno Lineage (Events → Live Stream → Lineage) ukazuje, které spouštěče, kteří agenti a které události jsou propojeny, end-to-end napříč celým tvým nastavením
- **Pozastavení jednotlivě** — vypni jediný spouštěč, aniž bys se dotkl/a zbytku agenta

### Jak to funguje

Spouštěče se konfigurují na kartě Settings agenta nebo přidáním ze seznamu spouštěčů na stránce Events. Exekuční engine vyhodnocuje podmínky spouštěčů nezávisle a odesílá běh agentovi, kdykoli libovolný spouštěč odpovídá. Běh nese payload spouštěče (tělo webhooku, cesta k souboru, kopírovaný text, upstream výstup, data události) do agenta jako vstup.

:::tip
Začni každého agenta jen s manuálním spouštěčem. Jakmile důvěřuješ jeho chování, přidávej automatické spouštěče po jednom, takže můžeš izolovat, který způsobuje problém, pokud se něco pokazí.
:::
  `,

  "manual-triggers": `
## Ruční spouštěče

Manuální spouštěče jsou výchozí pro každého agenta. Klikni \`Run\` v editoru a agent se okamžitě spustí, nebo použij zkratku rychlého spuštění v titulní liště (\`Ctrl+Enter\` na zaměřeném agentovi). Manuální běhy jsou způsob, jak vyvíjíš a testuješ — jsou ekvivalentem přímého spuštění skriptu pro zjištění, co dělá, než přidáš cron záznam.

Pokaždé můžeš předat vlastní vstup. Editor agenta ukazuje malé vstupní pole vedle tlačítka Run, když agent deklaruje, že přijímá vstup; cokoli, co napíšeš, projde jako payload spouštěče.

### Klíčové body

- **Žádná konfigurace** — manuální spouštěče jsou vždy dostupné
- **Volitelný vstup** — napiš vstup přímo, vlož strukturované JSON nebo spusť bez vstupu pro agenty, kteří žádný nepotřebují
- **Diagnostické běhy** — manuální běhy jsou označeny \`manual\` v trace, takže je můžeš odfiltrovat z reportů nákladů / metrik, pokud chceš vidět jen automatickou aktivitu
- **Vědomé souběžnosti** — manuální běhy respektují limit souběžnosti agenta; pokud je limit dosažen, kliknutí je odmítnuto s jasnou zprávou

### Jak to funguje

Manuální spouštěče existují implicitně na každém agentovi — neexistuje přepínač, kterým je vypneš (použij \`Disable\` na celého agenta, pokud ho chceš zamknout). Engine zachází s manuálním během identicky jako s automatickým: stejná exekuční cesta, stejné zachycení trace, stejné účtování nákladů. Jediný rozdíl je tag spouštěče.

:::tip
Použij manuální běhy během iterace promptu. Ulož prompt, spusť, podívej se na trace, edituj. Aréna Labu je pro systematické porovnání; manuální je pro rychlou zpětnou vazbu v editoru.
:::
  `,

  "schedule-triggers": `
## Plánované spouštěče

Plánované spouštěče spouštějí agenta v opakující se kadenci — každou hodinu, každý všední den v 8 ráno, první pondělí měsíce nebo libovolný cron výraz, který umíš napsat. UI plánu ti dává předvolby (hodinově, denně, týdně) pro běžné případy a pole pro surový cron pro všechno ostatní.

Plány respektují konfigurovatelnou časovou zónu. Ve výchozím nastavení agent používá tvou systémovou časovou zónu, ale můžeš ji per-spouštěč přepsat — užitečné pro agenty, kteří musí běžet „v 9 hodin Eastern" bez ohledu na to, kde sedíš.

### Klíčové body

- **Předvolby a cron** — vyber z běžných kadencí nebo napiš plný cron výraz
- **Časová zóna per-spouštěč** — názvy IANA časových zón (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`); DST je zpracován automaticky
- **Náhled dalšího běhu** — spouštěč ukazuje další tři plánované časy, takže můžeš zkontrolovat zdravým rozumem svůj cron výraz
- **Pauza bez ztráty** — vypnutí plánovaného spouštěče ho neodstraní; znovu zapni pro obnovení

### Nastavení plánu

:::steps
1. **Otevři nastavení spouštěče** — na kartě Settings agenta, nebo ze stránky Events; klikni \`Add trigger\` a vyber Schedule
2. **Vyber předvolbu nebo napiš cron** — \`0 8 * * 1-5\` pro „8 ráno všední dny", nebo použij předvolbu pro běžné případy
3. **Nastav časovou zónu** — výchozí je systémová; změň pro agenty vázané na konkrétní obchodní kalendář
4. **Potvrď náhled dalšího běhu** — zobrazí se tři nadcházející časy běhu; ověř, že odpovídají tvému očekávání
5. **Ulož** — spouštěč se okamžitě aktivuje a zobrazí se v seznamu spouštěčů agenta s odpočtem „next run"
:::

:::tip
Plánované spouštěče nedoplňují zmeškané běhy. Pokud je aplikace zavřená nebo je stroj uspaný, když projde plánovaný čas, ten běh se přeskočí. Pro kriticky důležitou plánovanou práci spusť cloudové nasazení (Builder tarif), aby orchestrátor zpracovával plánování server-side.
:::
  `,

  "webhook-triggers": `
## Webhook spouštěče

Webhook spouštěče vystavují unikátní příchozí URL, na které agent naslouchá. Když externí služba POSTuje na tu URL, tělo se stane payload spouštěče a agent se spustí. Většina služeb třetích stran, které podporují webhooky (Stripe, GitHub, Shopify, Linear, Twilio, vlastní interní API), funguje bez modifikace.

Spouštěč podporuje filtrování na těle requestu, headerech a metodě, takže jediný endpoint může být selektivní v tom, které události skutečně spustí agenta. Běžný vzor: jedna webhook URL na agenta, filtrovaná na konkrétní typy událostí z upstream služby.

### Klíčové body

- **Unikátní URL na spouštěč** — generována automaticky; nikdy nesdílena mezi agenty nebo spouštěči
- **Filtrovací výrazy** — JSONPath / shody headerů ti umožňují přijmout jen události, na kterých ti záleží
- **Endpoint pro replay** — každý přijatý webhook je zachován a může být manuálně přehrán ze stránky detailu spouštěče
- **Send Test** — vestavěné tlačítko, které POSTuje vzorové payloady proti tvému lokálnímu endpointu, abys mohl/a ověřit filtry a odezvu agenta bez externí služby
- **Příchozí a odchozí jsou oddělené** — viz níže

### Připojení webhooku

:::steps
1. **Přidej webhook spouštěč** — stránka Events → Add trigger → Webhook; navaž ho na agenta
2. **Zkopíruj vygenerovanou URL** — unikátní pro tento spouštěč; nikdy nevyprší, pokud spouštěč nesmažeš
3. **Nakonfiguruj externí službu** — vlož URL do konfigurace webhooku služby (Stripe Dashboard, nastavení GitHub repa atd.)
4. **Nastav filtrovací výrazy** — omez na konkrétní typy událostí nebo tvary payloadu, aby ses nespouštěl/a agentovi na každou událost, kterou služba emituje
5. **Testuj** — použij Send Test s vzorovým payloadem (nebo spusť skutečnou událost v upstream službě); zkontroluj trace a uprav filtry podle potřeby
:::

### Příchozí vs odchozí webhooky

Webhooky přicházejí ve dvou variantách a vyplatí se je rozlišovat:

- **Příchozí webhooky (toto téma)** — externí služba volá *tebe* pro spuštění agenta. Stripe ti zazvoní, když transakce uspěje; GitHub ti zazvoní, když se otevře PR.
- **Odchozí webhooky (samostatná funkce)** — *tvůj* agent posílá svůj výsledek ven na kanál, když skončí. Personas dodávají prvotřídní odchozí doručení na Slack, Discord, Microsoft Teams a generické webhook URL, konfigurované per-agent na kartě Connectors. Výstup agenta se naformátuje vhodně pro každý kanál (bohaté Slack bloky, Discord embedy, Teams karty) a odešle se po dokončení běhu.

Většina automatizací nakonec používá oba: příchozí webhook spustí agenta, agent udělá svou práci a odchozí kanál doručí výsledek tam, kde tvůj tým sleduje.

:::tip
Pro lokální dev nebo pre-produkční webhooky použij tlačítko \`Send Test\` s vzorovým payloadem místo konfigurace skutečného upstreamu. Budeš iterovat na filtrech a promptech mnohem rychleji bez round-trippingu služby třetí strany.
:::
  `,

  "clipboard-monitor": `
## Sledování schránky

Sledování schránky hlídá tvou systémovou schránku a spouští agenta, když zkopírovaný obsah odpovídá tvým pravidlům. Zkopíruj číslo objednávky — agent ho dohledá. Zkopíruj větu v cizím jazyce — agent ji přeloží. Zkopíruj e-mail zákazníka — agent vytáhne jeho účet.

Shodování může být na jednoduchých klíčových slovech, regex vzorech nebo heuristikách typu obsahu (e-mailová adresa, URL, telefonní číslo, JSON, číslo, strukturované ID). Spouštěč vyhodnocuje pravidlo při každé změně schránky a spustí se jen tehdy, když pravidlo odpovídá, takže sedí tiše na pozadí, dokud skutečně nezkopíruješ něco zajímavého.

### Klíčové body

- **Založené na pravidlech** — definuj jedno nebo více pravidel na spouštěč; první shoda vyhrává
- **Režimy shody** — klíčové slovo, regex nebo vestavěné heuristiky typu obsahu (email/URL/phone/JSON atd.)
- **Tiché ve výchozím nastavení** — kopírování bez shody netriggeruje ani log vyhodnocení; aktivitu vytvářejí pouze shody
- **Výstupní režimy** — zobrazit jako notifikaci na ploše, poslat do schránky Cockpitu, nebo zůstat tichý a jen zapisovat do feedu aktivity agenta
- **Soukromí** — obsah schránky zůstává lokální; nic se nenahrává kromě tomu, na AI poskytovatele, kterého sám agent volá

### Jak to funguje

Spouštěč se registruje u systému schránky OS při startu aplikace. Když se schránka změní, nový obsah se vyhodnotí proti každému pravidlu na tomto spouštěči; první shoda spustí agenta s kopírovaným obsahem jako vstupem. Kopírování bez shody se zahodí, aniž by zanechalo stopu, takže monitor nezahlcuje log aktivity.

:::tip
Buď s pravidly specifický/specifická. Sledování schránky shodující se s každým symbolem \`@\` se spustí na kopírování, která jsi nemyslel/a vážně. Použij plný e-mail regex, nebo se omez na „kopírování, která vypadají jako ID zákazníka" (shodující se s tvarem tvého vlastního ID).
:::
  `,

  "file-watcher-triggers": `
## Spouštěče sledování souborů

Spouštěče sledování souborů se spouští, když soubory ve složce, kterou jsi určil/a, vznikají, mění se nebo mizí. Hoď CSV do složky a agent ho zpracuje. Ulož obrázek do adresáře „Process" a agent OCR / klasifikace na něm zapracuje. Uprav konfigurační soubor a agent ho diffuje proti předchozí verzi.

Sledované složky mohou být v lokálním souborovém systému nebo v libovolném synchronizovaném umístění (OneDrive, Dropbox, iCloud). Filtry zužují události podle typu souboru / glob vzoru, takže se agent nespustí na irelevantní změny (jako macOS \`.DS_Store\` soubory nebo dočasné swap soubory editoru).

### Klíčové body

- **Sleduj libovolnou složku** — lokální nebo synchronizované cloudové úložiště; rekurze podsložek volitelná
- **Typy událostí** — vytvořit / upravit / smazat; přihlas se k jedné, dvěma nebo všem třem
- **Glob filtry** — \`*.csv\`, \`**/invoices/*.pdf\`; podporuje negační vzory
- **Debounce** — po sobě jdoucí rychlé úpravy se sloučí do jedné události spouštěče (žádné dvojité spouštění pro save-and-immediately-save toky)
- **Payload** — agent dostane cestu k souboru a (když je soubor dostatečně malý) inline obsah; jinak cestu, kterou si agent může přečíst svým nástrojem pro přístup k souborům

### Jak to funguje

Spouštěč používá file-watch API nativní pro OS (FSEvents na macOS, ReadDirectoryChangesW na Windows, inotify na Linuxu). Watcher běží v procesu enginu, zatímco je aplikace otevřená. Když událost odpovídá filtru spouštěče, engine odešle běh agenta s metadaty souboru jako vstupem. Engine také směruje události file-watcheru do **ambient producer**: libovolný agent přihlášený k relevantní ambient události může reagovat, aniž by potřeboval vlastní watcher.

:::tip
Vytvoř pro každého agenta, který používá file watcher, dedikovanou drop-zone složku. Míchání watcherů na sdílených složkách („Downloads", „Desktop") vede k překvapivým spuštěním, když si tam ukládáš nesouvisející soubory.
:::
  `,

  "chain-triggers": `
## Řetězové spouštěče

Řetězové spouštěče spojují agenty end-to-end: když agent A úspěšně skončí, agent B se spustí s výstupem A jako svým vstupem. Takhle se staví vícekrokové automatizace — každý agent je malý a soustředěný, řetězec je spojuje do pipeliny.

Řetězce se mohou větvit (výstup jednoho agenta krmí více downstream agentů) a slévat (více upstream agentů krmí do jednoho downstream). Mohou být také podmíněné — spouštěč může mít filtr, který předává jen výstup odpovídající podmínce, takže downstream agenta spouštíš jen v případech, na kterých ti záleží.

:::diagram
[Research Agent] --> [Writing Agent] --> [Formatting Agent] --> [Final Output]
:::

### Klíčové body

- **Zapojení výstup → vstup** — automatické; prompt downstream agenta vidí upstream výstup doslovně (nebo transformovaný, pokud nakonfiguruješ transformer)
- **Větvení a slévání** — many-to-one a one-to-many řetězce jsou podporovány
- **Podmíněné předávání** — filtrovací výrazy na řetězovém spouštěči ti umožní předávat jen za určitých podmínek (výstup obsahuje „error" nebo pole přesahuje prahovou hodnotu)
- **Selhání zastaví řetězec** — pokud upstream agent selže, downstream řetězoví agenti se nespustí; selhání se objeví v pohledu lineage, takže přesně vidíš, kde se řetězec rozbil
- **Viditelné end-to-end** — plátno Events → Live Stream → Lineage ukazuje plný graf řetězených agentů a živý tok běhu

### Jak to funguje

Na kartě Settings downstream agenta přidej Chain spouštěč a vyber upstream agenta. Engine přihlásí downstream agenta k události dokončení upstreamu; když upstream emituje „execution complete with success", engine předá výstup jako vstup downstreamu. Podmíněné filtry se vyhodnocují server-side, než se downstream běh odešle.

:::tip
Každý agent v řetězci by měl dělat přesně jednu věc dobře. Řetězec tří malých soustředěných agentů je mnohem snazší ladit než jeden velký multifunkční agent — v pohledu lineage vidíš, která fáze selhala, a můžeš vyměnit agenta za lepší verzi, aniž bys se dotkl/a zbytku řetězce.
:::
  `,

  "event-based-triggers": `
## Spouštěče založené na událostech

Spouštěče založené na událostech přihlašují agenta k interním událostem Personas. Cokoli v aplikaci, co emituje událost — jiný agent dokončující práci, vypršující přihlašovací údaj, plugin spouštějící (jako Drive plugin emitující události \`drive.document.*\`, když se soubory v Local Drive změní), nebo engine sám označující případ pro manual-review — může řídit přihlášeného agenta.

Tohle je nejflexibilnější typ spouštěče. Na rozdíl od webhooků (které přicházejí z externích systémů) nebo plánů (které se spouštějí podle hodin) události přicházejí zevnitř tvého vlastního nastavení Personas. Stavěj event-driven nastavení, kde jeden signál může vyfanout na více agentů bez explicitního zapojení.

### Klíčové body

- **Přihlas se k libovolné události** — události dokončení agenta, události pluginů, události enginu, vlastní události emitované jinými agenty
- **Vědomé payloadu** — každá událost nese data (výstup agenta, cesta k souboru, ID přihlašovacího údaje); přihlášený agent ji dostává jako vstup
- **One-to-many** — více agentů se může přihlásit ke stejné události a všichni běží paralelně, když se spustí
- **Filtrovací výrazy** — omez podle polí payloadu (spouštěj jen na události, kde \`severity = critical\`)
- **Objevitelné** — registr událostí je procházitelný na stránce Events; můžeš přesně vidět, jaké události jsou dostupné a jaká pole nesou

### Jak to funguje

Přidej spouštěč Event downstream agentovi a vyber událost z registru. Engine přihlásí agenta při bootu a odesílá běh s payloadem události, kdykoli se odpovídající událost spustí. Události emitované pluginy vypadají z perspektivy agenta identicky jako události emitované enginem — všechny tečou stejnou sběrnicí.

:::tip
Spouštěče založené na událostech jsou způsob, jak stavět vztahy „pokud X, pak také Y" bez měnění X. Přidej spouštěč události na nového agenta, namiř ho na událost, kterou emituje jiný agent, a nové chování se odehrává reaktivně — existující agent o tom neví a nezáleží mu na tom.
:::
  `,

  "combining-multiple-triggers": `
## Kombinování více spouštěčů

Agent může mít libovolný počet spouštěčů libovolných typů. Většina produkčních agentů má alespoň dva: manuální spouštěč (pro testování a ad-hoc spouštění) plus jeden nebo více automatických spouštěčů (schedule, webhook, chain, event). Je běžné vidět agenta s kombo schedule + webhook + chain — stejný agent může běžet jako součást denní dávky, v reakci na real-time webhook a jako krok v řetězené pipelině.

Více spouštěčů si nepřekáží. Každý se spouští podle vlastního plánu nebo události; pokud dva spustí ve stejném okamžiku, agent běží dvakrát (pokud to limit souběžnosti dovolí). Trace každého běhu zachycuje, který spouštěč ho rozjel.

### Klíčové body

- **Žádná horní hranice** — agent může mít desítky spouštěčů
- **Nezávislé vyhodnocování** — každý spouštěč se vyhodnocuje a odesílá nezávisle
- **Filtrování a konfigurace per-spouštěč** — plány mají svůj cron, webhooky svou URL atd.
- **Tag spouštěče v trace** — každý běh je otagován spouštěčem, který ho rozjel, takže můžeš filtrovat aktivitu podle zdroje spouštěče
- **Selektivní vypínání** — vypni jediný spouštěč, aniž bys se dotkl/a zbytku

### Jak to funguje

Karta Settings → Triggers na agentovi zobrazuje každý připojený spouštěč, jeho stav (zapnut/vypnut) a čas posledního spuštění. Přidej nové pomocí \`Add trigger\`; stejný picker ti umožní vytvořit libovolný ze sedmi typů spouštěčů. Vypnuté spouštěče zůstávají v seznamu, takže je můžeš později znovu zapnout, aniž bys je znovu konfiguroval/a.

:::tip
Užitečný vzor: drž manuální spouštěč aktivní navždy (pro ladění) a spáruj každý „skutečný" automatický spouštěč se sourozeneckým manuálním spouštěčem, který přijímá stejný tvar vstupu. Tím můžeš libovolný automatický payload manuálně přehrát, kdykoli ho budeš chtít vyšetřit.
:::
  `,

  "testing-and-debugging-triggers": `
## Testování a ladění spouštěčů

Karta Events → Test je tester spouštěčů. Pro libovolný spouštěč můžeš poslat vzorový payload (tělo webhooku, událost souboru, řetězec ze schránky, data události) a přesně vidět, co by agent dostal a jak by reagoval — bez externí služby nebo čekání na skutečný čas spouštěče.

Pro spouštěče, které se spustily a agent neběžel, jak jsi očekával/a, log spouštěče ukazuje každé vyhodnocení: shodující se filtry, odmítnuté, tvar payloadu, čas odeslání. Plátno lineage (Events → Live Stream → Lineage) je vizuální ekvivalent — ukazuje živá vyhodnocení a odeslání spouštěčů napříč celým tvým nastavením.

### Klíčové body

- **Simuluj libovolný spouštěč** — vlož payload a vidiš odezvu agenta
- **Log spouštěče** — každý pokus o spuštění je zaznamenán, včetně odmítnutí filtrem, takže můžeš vidět, co nesedělo
- **Plátno lineage** — vizuální graf spouštěčů, agentů a událostí s indikátory živého toku, když věci běží
- **Send Test pro webhooky** — vestavěné tlačítko, které POSTuje vzorové tělo proti lokálnímu endpointu
- **Replay** — minulá spuštění spouštěčů mohou být přehrána s přesným původním payloadem, užitečné pro „co se stane, když tento Stripe webhook narazí na agenta znovu"

### Ladění spouštěče krok za krokem

:::steps
1. **Potvrď, že je spouštěč zapnutý** — Settings → karta Triggers na agentovi; tlumená ikona znamená, že je spouštěč vypnutý
2. **Zkontroluj log spouštěče** — Events → Test → Logs filtrované podle tvého spouštěče; hledej vyhodnocení, která se neodesílala
3. **Zkontroluj filtry proti payloadu** — pokud se spouštěč vyhodnotil, ale neodeslal, filtrový výraz ho odmítá; zkopíruj payload a otestuj filtr explicitně
4. **Ověř, že odeslání dosáhlo agenta** — trace běhu by měl ukázat tag spouštěče; pokud se neobjevil žádný běh, spouštěč nikdy neodeslal (problém s filtrem, limit souběžnosti nebo vypnutý agent)
5. **Použij plátno lineage** — pro chain nebo event spouštěče otevři Lineage a sleduj cestu; uvidíš, kde je tok přerušen
:::

:::tip
„Můj spouštěč se nespouští" téměř vždy znamená jednu z věcí: spouštěč je vypnutý, filtr je příliš striktní, agent je vypnutý nebo externí služba ve skutečnosti neposílá to, co si myslíš, že posílá. Log spouštěče rozliší všechny čtyři během minuty.
:::
  `,
};
