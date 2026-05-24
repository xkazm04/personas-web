export const content: Record<string, string> = {
  "why-test-your-agents": `
## Proč testovat své agenty?

Testování je způsob, jak udržuješ agenty důvěryhodné, zatímco iteruješ. Každá editace promptu, každá výměna modelu, každý nový nástroj, který přidáš, mění chování agenta způsoby, které nemůžeš plně předpovědět ze čtení diffu. Testování proměňuje tu nejistotu na evidenci: spusť novou verzi proti reprezentativním vstupům, porovnej s předchozí verzí, viz, zda jsi zlepšil/a věci, které jsi měl/a v plánu, a nezhoršil/a věci, které jsi neměl/a.

Karta Lab v editoru každého agenta je místem, kde se to děje. Má čtyři režimy — Arena, A-B, Matrix, Eval — každý odpovídá na jinou otázku. Arena porovnává modely na stejném promptu. A-B porovnává dva prompty na stejném modelu. Matrix testuje kombinace komponent promptu. Eval je plná mřížka: každý prompt × každý model.

### Klíčové body

- **Zachyť regrese včas** — testování po každé změně je způsob, jak se vyhneš „agent fungoval, co jsem rozbil?"
- **Porovnávej alternativy systematicky** — Arena a A-B ti umožňují volit mezi možnostmi s evidencí místo instinktu
- **Generuj fitness data** — Lab běhy akumulují per-prompt skóre, které krmí evoluci genomu (Builder tarif)
- **Opakovaně použitelné sady vstupů** — testovací vstupy jsou uloženy per-agent; stejné prompty, stejná data, opakovatelná porovnání

### Jak to funguje

Každý Lab režim odesílá stejný payload spouštěče více variantám agenta (různým promptům, různým modelům nebo oběma) paralelně. Výstupy jsou prezentovány bok po boku s kvantitativními metadaty (doba trvání, náklady, počet tokenů) a tvými subjektivními hodnotícími tlačítky. Výsledky přistávají v historii testů agenta a krmí dopředu do fitness skórování.

:::tip
Nejlevnější okamžik k zachycení regrese promptu je hned po jeho napsání. Udělej z Lab → A-B proti předchozí verzi promptu svůj zvyk při každé editaci promptu; tření je mnohem nižší než objevení regrese v produkčních bězích o tři dny později.
:::
  `,

  "the-testing-lab-overview": `
## Přehled testovací laboratoře

Karta Lab v editoru každého agenta je jeden pracovní prostor se čtyřmi režimy. Vyber režim podle toho, co se snažíš naučit:

### Čtyři režimy

:::compare
**Arena**
Stejný prompt, více modelů. Posílá jeden vstup skrz Claude / GPT / Gemini / lokální paralelně. Nejlepší pro „který model je správný pro tohoto agenta?"
---
**A-B**
Dva prompty, stejný model. Porovnej změnu promptu proti jejímu předchůdci za identických podmínek. Nejlepší pro „zlepšila tato editace věci?"
---
**Matrix**
Kombinatorické. Definuj komponenty promptu a matrix otestuje každou kombinaci (3 × 4 = 12 variant). Nejlepší pro „mám více soupeřících nápadů — která kombinace vyhraje?"
---
**Eval**
Plná mřížka: N promptů × M modelů. Kompletní obraz, když chceš optimalizovat prompt *a* model společně. Nejlepší, když je na stole velká změna.
:::

### Jak to funguje

Každý režim sdílí stejný picker vstupu (manuální zadání, vložení strukturovaného JSON nebo replay skutečného minulého běhu z historie tohoto agenta) a stejné UI pro hodnocení. Výstupní sloupce se rozšiřují pro plný trace (volání modelu, volání nástrojů, větve rozhodnutí) stejně jako u běžného běhu. Výsledky jsou uloženy do historie testů s otagovaným režimem testu, takže můžeš procházet minulé testy podle režimu.

Pro řetězené agenty Lab testuje jen tohoto agenta — upstream je mockován pomocí vstupu, který jsi specifikoval/a, takže můžeš iterovat na jedné fázi pipeline bez znovu spouštění celého řetězce.

:::tip
Většinu týdnů Arena a A-B stačí. Matrix je pro „mám tři pravděpodobné refaktory a chci porovnat", Eval je pro „zvažuji velkou přepisku nebo změnu třídy". Nesahej po těžkém režimu jako výchozí — ty levnější obvykle stačí.
:::
  `,

  "arena-testing": `
## Testování v aréně

Arena posílá stejný prompt a stejný vstup více modelům paralelně, pak rozloží výsledky bok po boku. Náklady a doby trvání jsou ukázány vedle výstupů, takže porovnáváš na třech osách — kvalita (tvůj úsudek), rychlost (engine-měřená) a náklady (token-po-tokenu).

Nejčastější použití je rozhodnutí o výběru modelu: „tento agent běžel na Sonnet 4.6, drží Haiku 4.5 za 1/30 nákladů?" Arena na to odpoví jedním testem místo týdnů produkčního pozorování.

### Klíčové body

- **Paralelní odeslání** — všechny modely běží najednou; celkový čas v reálném čase = nejpomalejší, ne součet
- **Výstupy bok po boku** — plný výstup každého modelu je viditelný bez přepínání karet
- **Náklady + doba trvání ukázány** — pod každým výstupem, ve stejném pohledu jako text
- **Hodnotící UI per sloupec** — palec nahoru / palec dolů / hvězdička per model; hodnocení přetrvávají do fitness dat agenta
- **Replay z historie** — Arena testy mohou táhnout vstup z libovolného minulého běhu tohoto agenta, takže testuješ na skutečném tvaru

### Jak to funguje

Arena odesílá jeden běh per vybraný model pomocí aktuálního promptu a konfigurace nástrojů agenta. Každý běh je nezávislý (samostatný trace, samostatné účtování nákladů) a otagován \`arena\`, takže se nepočítá do normálních produkčních metrik agenta. Výsledky se zobrazují jako sloupce; hodnotíš každý sloupec; hodnocení krmí per-model fitness data pro tohoto agenta.

:::tip
Vyber maximálně 3 modely per Arena běh. Více než to a čtení bok po boku se stává nepřehledným. Pokud zvažuješ 5+ modelů, spusť více Arén v párech a drž si v paměti, které modely vyhrály každé kolo.
:::
  `,

  "ab-testing-prompts": `
## A-B testování promptů

A-B spouští stejný vstup skrz dvě varianty promptu na stejném modelu, takže jedinou proměnnou je prompt. To je správný nástroj pro hodnocení editace promptu: nahraj předchozí verzi jako A, novou verzi jako B, spusť na reprezentativních vstupech a viz, která produkuje výsledek, který chceš.

Picker verzí Labu se integruje s historií verzí promptu — nemusíš kopírovat-vkládat starou verzi, jen ji vyber z dropdown menu. Tím se „porovnej můj aktuální draft s minulým fungujícím" stává nastavením na jedno kliknutí.

### Klíčové body

- **Dva prompty, jeden model, jeden vstup** — porovnání jedné proměnné
- **Vyber z historie verzí** — A nebo B může být libovolná minulá verze promptu tohoto agenta
- **Stejná věrnost trace** — obě varianty dostávají plné trace běhů, takže můžeš porovnávat vzory volání nástrojů, ne jen finální výstup
- **Více kol vstupu** — spusť A-B proti několika různým vstupům v sekvenci pro test generalizace, ne jen jednoho šťastného případu
- **Skóre přetrvává do fitness** — A-B hodnocení krmí stejná fitness data, která Arena a genome používají

### Jak to funguje

A-B engine odesílá oba prompty jako nezávislé běhy a označuje je A a B v panelu výsledků. Kromě toho jsou to běžné běhy — stejný trace, stejné účtování nákladů, ale otagované \`ab_test\`, takže jsou filtrovatelné v historii testů a neznečišťují produkční metriky.

:::code-compare
### Verze A
Shrň dokument.
Drž to krátké.
---
### Verze B
Shrň dokument v přesně
3 odrážkách. Každá odrážka by měla
být jedna věta. Začni
nejdůležitějším zjištěním.
:::

:::warning
Měň jednu věc per A-B kolo. Pokud se B liší od A v *obou* formátu *i* tónu *i* délce, nemůžeš říct, která dimenze způsobila změnu skóre. Udělej jednu změnu, spusť A-B, přijmi nebo odmítni, pak udělej další změnu.
:::
  `,

  "matrix-testing": `
## Maticové testování

Matrix je kombinatorické A-B-C-D-... vše najednou. Definuješ svůj prompt jako komponenty (úvod × instrukce × výstupní formát, například) a matrix generuje každou kombinaci, odesílá je všechny a řadí výsledky podle fitness skóre.

S 3 komponentami po 3 možnostech každá to je 27 kombinací — mnohem víc, než bys testoval/a manuálně, ale snadné pro engine vyfanout paralelně. Matrix je nejužitečnější, když máš více soupeřících nápadů, jak strukturovat prompt, a chceš najít kombinaci, která skutečně funguje nejlépe, místo té, kterou jsi uhádl/a.

### Klíčové body

- **Definuj komponenty, dostaň kombinace** — matrix rozšiřuje komponenty do všech platných kombinací
- **Paralelní odeslání** — každé kombo běží současně (s ohledem na rate limity poskytovatele)
- **Řazené výsledky** — fitness-skórovaná mřížka, seřazená od nejlepšího po nejhorší
- **Atribuce na úrovni komponent** — viz, které komponenty korelují s vysokými skóre; užitečné, i když nepřijmeš nejvyššího vítěze doslovně
- **Ulož vítězné kombo** — jedno kliknutí pro nastavení vítězné kombinace jako aktivního promptu agenta

### Jak to funguje

Definuješ každou komponentu jako pojmenovanou sadu variant v kartě matrix. Engine konstruuje každou kombinaci jako vyrenderovatelný prompt a odesílá každou jako nezávislý běh. Výsledky jsou agregovány do mřížky řazené podle tebou vybraného fitness signálu (hodnocení, cost-per-quality, rychlost, custom). Atribuce per-komponenta je vypočtena průměrováním fitness napříč kombinacemi sdílejícími tu komponentu — takže i když žádný jeden vítěz nevyniká, naučíš se, který úvod / styl instrukcí / výstupní formát funguje nejlépe v průměru.

:::info
S 3 komponentami × 3 možnostmi = 27 variant. Se 4 × 4 = 256. Matrix zvládá velké mřížky, ale spálíš tokeny proporcionálně. Začni s 3 × 3 a rozšiřuj jen tehdy, když je výsledek skutečně dvojznačný.
:::

:::tip
Matrix je nejužitečnější hned po velkém redesignu promptu. Když si nejsi jistý/jistá, zda je nová struktura lepší než stará, matrix-otestuj 3-4 kandidátní struktury proti pár reprezentativním vstupům — vítěz je obvykle jasnější, než bys čekal/a.
:::
  `,

  "eval-testing": `
## Eval testování

Eval je plná mřížka: každá varianta promptu × každý model. Vybereš prompty (typicky 2-3 kandidáty), vybereš modely (typicky 2-4) a eval mřížka spustí všechny kombinace a prezentuje heatmapu skóre. Nejlepší pár prompt-model je zvýrazněn.

To je těžkotonážní režim — nejdražší v tokenech, nejdůkladnější v pokrytí. Použij ho, když děláš velké rozhodnutí, které ovlivňuje obě osy: „zvažujeme přepsat prompt a přejít na levnější model, můžeme udělat obojí najednou a stále zasáhnout naši laťku kvality?"

### Klíčové body

- **N promptů × M modelů** — heatmapa skóre napříč oběma dimenzemi
- **Nejlepší kombinace zvýrazněna** — fitness-řazená, s optimální buňkou vizuálně vytaženou ven
- **Per-axis rozpisy** — viz, zda změna promptu nebo změna modelu pohnula skóre
- **Test-historií otagované** — eval běhy přistávají v historii pod tagem \`eval\` pro pozdější přezkum
- **Adopce jedním kliknutím** — aplikuj nejlepší kombinaci (verze promptu + výběr modelu) na živého agenta

### Jak to funguje

Eval odesílá \`prompts × models\` běhů paralelně (s ohledem na rate limity poskytovatele). Každá buňka je jeden nezávislý běh s vlastním trace. Pohled mřížky agreguje podle páru prompt-model; hodnotíš buňky pomocí stejného UI jako Arena a A-B; fitness skóre se kumulují do řazení per-cell. Horní buňka je doporučená kombinace — přijmi ji přímo z pohledu mřížky.

:::warning
Eval je nejdražší režim. 3 prompty × 4 modely × 5 vstupů = 60 běhů, každý s vlastním voláním modelu. Spouštěj střídmě, na reprezentativních sadách vstupů, a jen tehdy, když rozhodnutí skutečně překračuje obě osy. Pro rozhodnutí jen o promptu A-B; pro rozhodnutí jen o modelu Arena.
:::
  `,

  "rating-and-scoring-results": `
## Hodnocení a skórování výsledků

Po libovolném Lab testu má každý výstupní řádek hodnotící ovládací prvky: palec nahoru / palec dolů pro binární úsudek, nebo 1-5 hvězdičkovou škálu pro odstínované případy. Tvá hodnocení krmí dvě věci: fitness skóre per-variant agenta (použité pro řazení v matrix a eval a jako tlak výběru evoluce genomu na Builder tarifu) a osobní signál preference napříč celým tvým testováním v čase.

Hodnocení jsou osobní — zakódovávají tvůj úsudek o kvalitě, ne objektivní metriku. To je záměrné; ty jsi ten, kdo ví, zda výstup agenta odpovídá tomu, co potřebuješ, a to je signál, proti kterému systém optimalizuje.

### Klíčové body

- **Binární nebo 1-5 hvězdiček** — vyber tu škálu, na které jsi pohodlný/á být konzistentní
- **Per-output hodnocení** — každý testovací výstup dostane svůj řádek hodnotících ovládacích prvků; nic se neagreguje automaticky, dokud nehodnotíš
- **Pohání fitness skóre** — hodnocení krmí signál fitness per-variant, který Matrix / Eval / genome používají
- **Historie zpětné vazby přetrvává** — každé hodnocení, které jsi kdy dal/a, je uloženo; užitečné pro „hodnotil jsem X výš než Y v minulých testech?"
- **Konzistence záleží víc než přesnost** — 4 hvězdičky, které bys dával/a konzistentně, jsou užitečnější než 5 hvězdiček, které dáváš jednou a už nikdy

### Jak to funguje

Hodnocení jsou uložena proti konkrétnímu běhu (trace, verze promptu, model, vstup). Fitness agregátor čte hodnocení + objektivní metriky (náklady, doba trvání, úspěch) a počítá fitness skóre per-variant, které se používá v řazení. Evoluce genomu (Builder tarif) používá hodnocení jako primární tlak výběru pro volbu rodičovských promptů ke šlechtění.

:::tip
Hodnoť na základě toho, co skutečně chceš, ne toho, co je technicky působivé. Krátká správná odpověď často poráží dlouhou propracovanou. Systém optimalizuje proti tvým preferencím, takže poctivá, konzistentní hodnocení produkují agenty naladěné na *tvůj* úsudek.
:::
  `,

  "genome-evolution-basics": `
## Základy evoluce genomu

Evoluce genomu (Builder tarif) automaticky šlechtí nové varianty promptů z tvých nejlépe hodnocených minulých testů. Každá „generace" mutuje a rekombinuje nejvýkonnější prompty z předchozí generace; přes několik generací prompty konvergují na konfigurace, které skórují konzistentně lépe než tvůj výchozí bod. Je to evoluční hledání s tvými hodnoceními jako fitness funkcí.

Proces je nezatížený, jakmile ho spustíš. Poskytneš startovní prompt a fitness signál (typicky historie tvých hodnocení plus volitelné objektivní metriky jako náklady nebo doba trvání), nastavíš velikost populace a počet generací a necháš to běžet. Normální spouštěče agenta zůstávají pozastaveny během evoluce, aby porovnání zůstalo čisté.

:::info
Evoluce genomu je nezatížená, jakmile ji rozjedeš. Nastavíš parametry, engine vytváří variace, testuje je proti tvé sadě vstupů, skóruje je podle tvých hodnocení a rekombinuje vítěze do další generace. Manuálně přezkoumáš finální populaci a přijmeš vítěze — systém nikdy tiše nezmění tvůj živý prompt.
:::

### Klíčové body

- **Automatická variace + výběr** — engine generuje mutace nejvýkonnějších rodičů a vybírá přes fitness
- **Generace + populace** — typická konfigurace je 5-10 generací po 8-12 variantách každá
- **Fitness funkce = tvá hodnocení** — primární signál; sekundární signály (náklady, doba trvání) jsou konfigurovatelné váhy
- **Všechny generace verzovány** — každý generovaný prompt je zachován v historii verzí agenta; nic se neztratí
- **Manuální adopce** — engine nikdy tiše nevyměňuje tvůj živý prompt; přezkoumáš a přijmeš vítěze

### Jak to funguje

Každá generace začíná s rodičovskou populací. Engine generuje dětské varianty přes malé strukturované mutace (přeformulování, přerovnání sekcí, úprava příkladů atd.) a křížení (kombinování segmentů ze dvou rodičů). Každé dítě běží proti tvé sadě vstupů; hodnocení produkují fitness skóre; děti s vysokým skóre se stávají rodičovskou populací pro další generaci. Po nakonfigurovaném počtu generací uvidíš finální řazenou populaci a můžeš přijmout libovolnou variantu.

### Podívej se v akci

:::usecases
**Ladění třídění e-mailů**
Aktuální prompt nesprávně klasifikuje 15 % e-mailů
---
Spusť 5 generací populace 10. Skončíš s variantou, která nesprávně klasifikuje 3 % — přijmi jedním kliknutím.
===
**Konzistence formátu**
Výstupní formát agenta je nekonzistentní napříč tvary vstupu
---
Genome se vyvíjí na diverzní sadě vstupů s konformitou formátu jako fitness signálem; výstup se stabilizuje.
===
**Snížení nákladů bez ztráty kvality**
Chceš najít štíhlejší prompt, který stále produkuje dobrý výstup
---
Přidej cost-per-token do fitness funkce s negativní váhou; evoluce najde kratší prompty, které udržují hodnocení.
:::

:::info
Každá varianta vytvořená během evoluce je verzována v historii promptu agenta. Pokud přijatá varianta N+1 dopadne v produkci špatně, obnovení varianty N je jedno kliknutí — žádná práce se neztratí.
:::

:::tip
Trpělivost se vyplácí. Generace 1 obvykle není dramaticky lepší než tvůj startovní prompt — mutace jsou malé a mnoho z nich jsou nepovedeniny. K generaci 3-4 se přeživší populace koncentruje na skutečná zlepšení; to je typicky, když uvidíš jasného vítěze.
:::
  `,

  "running-a-breeding-cycle": `
## Spuštění šlechtitelského cyklu

„Šlechtitelský cyklus" je jeden plný evoluční běh: vyber agenta, nastav parametry, rozjeď, čekej, přezkoumej populaci, přijmi. Každý cyklus je N generací M variant testovaných proti tvé zvolené sadě vstupů. Celkové náklady jsou zhruba \`generations × population × input-count × per-run-cost\` — předvídatelné z parametrů.

Karta Genome v Labu je vstupním bodem. Otevírá se s výchozími parametry naladěnými na reprezentativní výchozí bod (5 generací × 10 variant × 5 vstupů), což stačí na vidění významné změny bez vyhoření přebytečných tokenů. Uprav parametry před rozjetím, pokud chceš těžší nebo lehčí cyklus.

:::steps
1. **Otevři Lab → Genome** u agenta, kterého chceš vyvíjet
2. **Vyber sadu vstupů** — manuální zadání, uloženou sadu nebo replay z historie
3. **Nakonfiguruj fitness váhy** — váha hodnocení (primární), váha nákladů (negativní, pokud chceš kratší), váha doby trvání (negativní, pokud chceš rychlejší)
4. **Nastav generace a populaci** — 5 × 10 je výchozí; zvyš obě pro těžší problémy, sniž obě pro rychlé experimenty
5. **Klikni Start Cycle** — engine běží nezatížený; můžeš nechat aplikaci otevřenou nebo přijít později
6. **Přezkoumej finální populaci** — řazena podle fitness, s dostupným trace každé varianty
7. **Přijmi vítěze** — nebo libovolnou jinou variantu, kterou preferuješ; aktivní prompt agenta je aktualizován a plná populace cyklu je zachována v historii verzí
:::

### Jak to funguje

Každá generace běží paralelně: engine odesílá všechny M variant současně (s ohledem na rate limity poskytovatele) napříč sadou vstupů, sbírá výsledky, skóruje je přes fitness funkci, vybírá top výkony jako rodiče, generuje děti pro další generaci a pokračuje. Progress UI ukazuje živé per-generation best a average fitness, takže můžeš vidět, zda se populace zlepšuje.

:::tip
Začni s malou sadou vstupů (3-5 reprezentativních případů) a výchozím cyklem 5 × 10. Pokud je výsledek jasně zlepšen, jsi hotov/a. Pokud je dvojznačný, rozšiř sadu vstupů a spusť další cyklus počínaje od předchozího vítěze. Iterace cyklů často poráží jeden obří cyklus.
:::
  `,

  "adopting-evolved-prompts": `
## Adopce vyvinutých promptů

Když šlechtitelský cyklus skončí, uvidíš finální populaci řazenou podle fitness s zvýrazněnou horní variantou. Adopce je jedno kliknutí — varianta se stává aktivním promptem agenta, předchozí aktivní prompt je zachován v historii verzí (takže rollback je také jedno kliknutí) a plná populace cyklu je také zachována pro případ, že bys chtěl/a přijmout jinou variantu později.

Akce adopce běží stejnou pre-flight kontrolou jako jakákoli jiná změna promptu: setup-status ověřuje, že přihlašovací údaje a nástroje agenta jsou stále platné, verze je zaznamenána v historii a pokud má agent plánované spouštěče, další plánovaný běh automaticky použije přijatou variantu.

### Klíčové body

- **Adopce jedním kliknutím** z pohledu řazené populace
- **Předchozí verze zachována** v historii; obnovení je také jedno kliknutí
- **Plná populace zachována** — libovolná varianta z cyklu zůstává adoptovatelná později
- **Pre-flight kontrola běží** — ověření setup-status, validace přihlašovacích údajů, kompatibilita spouštěčů
- **Živé spouštěče automaticky používají novou variantu** — žádný samostatný krok „deploy"

### Jak přijmout

:::steps
1. **Počkej, až šlechtitelský cyklus skončí** — obvykle 10-30 minut v závislosti na parametrech
2. **Otevři pohled finální populace** — varianty řazené podle fitness s trace dostupnými per variant
3. **Přečti prompt horní varianty** — rychlá kontrola zdravým rozumem pro neočekávanou formulaci nebo divné mutace
4. **Volitelně prohlédni 2./3. variant** — někdy mírně nižší fitness přichází s mnohem kratším / čistším promptem
5. **Klikni Adopt** na svém výběru; pre-flight kontrola běží; aktivní prompt agenta se aktualizuje atomicky
6. **Ověř další živý běh** — obvykle manuální běh s reprezentativním vstupem je nejlevnější potvrzení, že přijatá varianta se chová tak, jak testovací skóre slibovala
:::

:::tip
Přečti přijatou variantu před kliknutím na Adopt. Evoluce najde prompty s vysokou fitness, ale občas varianta skóruje dobře využitím nějaké zvláštnosti tvé sady vstupů; čtení promptu je bezpečnostní kontrola, která zachytí „tohle by také prošlo mými testy, ale je divné".
:::
  `,

  "fitness-scoring-explained": `
## Vysvětlení fitness skóre

Fitness je jediné číslo, které pohání výběr Matrix / Eval / Genome. Kombinuje tvá manuální hodnocení (primární signál) s objektivními metrikami (náklady, doba trvání, úspěšnost, konformita s cílovou délkou výstupu, custom signály) do váženého skóre. Konfiguruješ váhy per-agent nebo per-test — ve výchozím nastavení hodnocení dominují a objektivní metriky jsou tiebreakery.

Skóre se počítá per-variant per-input, pak je agregováno přes všechny vstupy v testovací sadě pro produkci jednoho fitness per variant. Varianty jsou řazeny podle agregátního fitness; to řazení je to, co konzumuje algoritmus výběru genomu a co Lab UI používá pro zvýraznění vítězů.

### Klíčové body

- **Jediné agregátní skóre per variant** — typicky 0.0–1.0 nebo 0–100 v závislosti na preferenci zobrazení
- **Více vstupních zdrojů** — hodnocení (primární), náklady, doba trvání, úspěch, konformita s formátem výstupu, custom fitness funkce
- **Per-agent váhy** — zdůrazni, co je důležité; pro náklady-citlivé agenty zvaž náklady více; pro kvalitu-citlivé zvaž hodnocení více
- **Agregace přes vstupy** — varianty jsou skórovány na každém vstupu, pak průměrovány, takže varianta, která je brilantní na jednom vstupu a rozbitá na jiném, skóruje hůř než stálý průměr
- **Transparentní rozpis** — klikni na libovolné fitness číslo pro zobrazení per-signálních příspěvků

### Jak to funguje

Fitness agregátor čte výsledky běhů (náklady, doba trvání, úspěch), historii hodnocení (per běh) a libovolné custom fitness signály registrované pro agenta. Každý je normalizován na rozsah 0-1, vynásoben svou nakonfigurovanou váhou a sečten. Výsledek je fitness varianty; agregát napříč všemi vstupy v testovací sadě je zobrazené skóre.

:::tip
Výchozí váhy (90 % hodnocení, 10 % náklady) jsou naladěné pro většinu agentů. Pokud se přistihneš, že nesouhlasíš s „vítězi" systému v eval / matrix testech, nejužitečnější úpravou je obvykle ještě zvýšit váhu hodnocení (95 %), aby systém víc důvěřoval tvému úsudku. Upravuj váhu nákladů nahoru pro agenty s velmi vysokým objemem, kde jsou náklady na tokeny skutečnou starostí.
:::
  `,

  "test-history-and-trends": `
## Historie testů a trendy

Každý Lab test, který spustíš, je zachován v historii testů agenta. Pohled historie (Lab → History) ukazuje minulé testy řazené podle data s tagem režimu, sadou vstupů, fitness skóre a případným výsledkem (přijato / odmítnuto / nahrazeno). Klikni na libovolný minulý test pro znovuotevření v jeho původním režimu pro znovupřezkum nebo pro klon parametrů do nového testu.

Podstránka Trends vykresluje metriky na úrovni agenta v čase — fitness aktuálně aktivního promptu, cost-per-run, duration-per-run, míra business-outcome. Vykreslení je anotováno významnými událostmi (změny promptů, výměny modelů, přidání spouštěčů), takže můžeš vidět dopad každé změny na metriky živého agenta.

### Klíčové body

- **Každý test zachován** — plný vstup, výstup, hodnocení, fitness; nic se nezahazuje
- **Otagované režimem** — filtruj podle Arena / A-B / Matrix / Eval / Genome pro nalezení konkrétního minulého testu
- **Trendový graf** s automatickou anotací u každého významného bodu změny
- **Porovnej minulý test se současným stavem** — užitečné pro „je aktuální prompt stále lepší než ten, který jsem odmítl/a před třemi týdny?"
- **Exportovatelné** — historie testů se exportuje do CSV pro externí analýzu

### Jak to funguje

Výsledky testů jsou uloženy ve stejném úložišti běhů jako produkční běhy, s tagem testovacího režimu pro filtrování. Pohled Trends agreguje z tohoto úložiště; automatické anotace jsou extrahovány z historie verzí a historie konfigurace (které jsou také trvalé). Nic v historii není měnitelné — minulé testy jsou neměnnými záznamy toho, co bylo testováno kdy.

:::tip
Pohled Trends je nejlepší místo pro odpověď na „je můj agent v čase skutečně lepší?" Otevři ho jednou za měsíc; pokud je trend fitness plochý nebo klesá, nedávné změny nepomáhají a je čas přemýšlet místo dodávat víc změn.
:::
  `,
};
