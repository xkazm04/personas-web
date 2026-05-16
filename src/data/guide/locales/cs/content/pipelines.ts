export const content: Record<string, string> = {
  "what-are-pipelines": `
## Co jsou pipeliny?

Pipeline je koordinovaná skupina agentů, kteří si předávají práci mezi sebou pro zvládnutí vícekrokového úkolu. Místo jednoho velkého multifunkčního agenta stavíš malé soustředěné agenty a zapojuješ je dohromady — každý se specializuje, pipeline zvládá orchestraci. Sekce Pipeline v postranním panelu je tam, kde pipeliny žijí; Team Canvas uvnitř ní je tam, kde je skládáš.

Pipeliny v Personas jsou prvotřídní — mají svou vlastní historii běhů, své vlastní observabilita plochy, svou vlastní týmovou paměť (sdílený kontext, který mohou všichni agenti v pipeline číst) a mohou být spouštěny stejně jako jediný agent (schedule, webhook, manual, chain). Rozdíl je v tom, že jeden spouštěč spouští celou pipelinu místo jednoho agenta.

:::compare
**Jediný agent**
Jeden prompt, jedna sada nástrojů, jeden výstup. Jednoduchý na nastavení; omezený, když se úkol přirozeně rozpadá na fáze.
---
**Pipeline** [recommended for multi-stage work]
Několik soustředěných agentů zapojených do toku. Každý agent je malý a snadný na ladění; pipeline je skládá do větší schopnosti. Sdílená týmová paměť umožňuje agentům předávat strukturovaný kontext, ne jen text. Viditelné na týmovém plátně end-to-end.
:::

### Klíčové body

- **Multi-agent tok** — agenti předávají výstup vstupům podél definovaných spojení
- **Týmová paměť** — sdílené úložiště kontextu, které všichni pipeline agenti mohou číst a zapisovat, oddělené od per-agent paměti
- **Vizuální editor** — Team Canvas; umisti agenty, kresli spojení, konfiguruj směrování
- **Opakovaně použitelné** — stejná pipeline běží pro libovolný odpovídající payload spouštěče; pipeliny jsou také klonovatelné
- **Pozorovatelné** — plná historie běhů na úrovni pipeline s per-agent rozpisem

### Jak to funguje

Skládáš pipelinu na Team Canvas: pusť agenty, kresli spojení, nakonfiguruj podmíněné větve, pokud jsou potřeba. Když pipeline běží, data tečou podél spojení — výstup každého agenta se stává vstupem pro libovolného downstream agenta, kterého plátno zapojilo. Engine sleduje běh end-to-end, takže vidíš jeden běh pipeline místo N nesouvislých běhů agentů.

### Podívej se v akci

:::usecases
**DevOps automatizace**
Pull request se otevře na GitHubu
---
Agent PR Reviewer analyzuje diff, Test Runner ověřuje buildy, Release Notes draftuje changelog, Slack Notifier postuje souhrn na týmový kanál — jediná pipeline spouštěná GitHub webhookem.
===
**Workflow obsahu**
Potřebuješ publikovaný blog post z tématu
---
Research agent shromažďuje zdroje, Writer draftuje dílo, Editor vylepšuje, Publisher formátuje pro tvůj CMS — pipeline řídí předávky a týmová paměť nese sdílené vedení stylu.
===
**Třídění zákaznické podpory**
Přichází nový tiket
---
Classifier určuje naléhavost a kategorii, Knowledge agent vyhledává relevantní dokumenty, Drafter píše kandidátní odpověď, Router eskaluje k člověku, pokud je důvěra nízká.
:::

:::info
Žádný tvrdý horní limit na velikost pipeline. Začni se dvěma agenty pro validaci toku dat, rosti přidáváním jednoho specialisty po druhém. Pipeliny s 10+ agenty fungují stejně spolehlivě jako malé; engine zvládá orchestraci identicky.
:::

:::tip
Zacházej s každým agentem v pipeline jako s funkcí s jediným účelem: jeden specifický tvar vstupu, jeden specifický tvar výstupu. Čím menší a soustředěnější každý agent je, tím snáz se celá pipeline ladí a tím víc opakovaně použitelné jsou jednotlivé kousky napříč pipelinami.
:::
  `,

  "the-team-canvas": `
## Týmové plátno

Team Canvas je vizuální editor pro pipeliny. Otevři Pipeline → Team Canvas a uvidíš svou pipelinu jako graf: uzly agentů spojené směrovanými hranami. Pusť agenty z knihovního panelu vlevo, kresli spojení tažením z výstupního portu agenta na vstupní port jiného agenta, nakonfiguruj větve s podmíněnými uzly. Plátno podporuje pan, zoom, multi-select, auto-layout a navigaci klávesnicí.

Plátno není jen vizualizace — je to editor. Každá změna, kterou děláš na plátně (umístění agenta, kreslení spojení, přidání podmíněného uzlu), okamžitě aktualizuje definici pipeline. Ulož pro commitnutí; pipeline je verzována stejným způsobem jako prompty agentů.

### Klíčové body

- **Drag-and-drop** agenty z knihovny na plátno
- **Kreslení spojení** — click-and-drag z výstupního portu na vstupní port; data tečou podél spojení za běhu
- **Podmíněné uzly** — přidej směrovací uzel mezi agenty pro větvení na základě dat
- **Auto-layout** — jedno kliknutí uklidí plátno do toku zleva-doprava nebo shora-dolů
- **Verzováno** — snímky plátna jsou uloženy s pipelinou; obnov předchozí rozvržení a topologie

### Sestavení tvé první pipeline

:::steps
1. **Otevři Pipeline → Team Canvas** — postranní panel → Pipeline → New Pipeline (nebo otevři existující)
2. **Procházej knihovnu agentů** — levý panel; filtruj podle skupiny nebo hledej
3. **Přetáhni agenty na plátno** — umisti je zhruba v pořadí exekuce
4. **Kresli spojení** — výstupní port (pravý okraj) na vstupní port (levý okraj)
5. **Přidej podmíněné uzly v případě potřeby** — toolbar → Conditional; nakonfiguruj větve
6. **Ulož** — Ctrl+S; pipeline je commitnuta a okamžitě spustitelná
:::

:::tip
Zleva-doprava shora-dolů je nejčitelnější konvence. Použij auto-layout (tlačítko toolbaru), jakmile je topologie nastavena; produkuje čistý vizuální tok, který pomáhá komukoli, kdo čte plátno — včetně budoucího tebe — pochopit pipelinu jedním pohledem.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Přidávání agentů do pipeliny

Agenti se přidávají do pipelin z knihovního panelu vlevo Team Canvas. Přetáhni libovolného agenta na plátno pro umístění; výchozí nastavení agenta se přenášejí (prompt, nástroje, model, přihlašovací údaje), ale můžeš přepsat per-pipeline, pokud chceš, aby se tento agent choval mírně jinak tady než jinde.

Stejný agent se může účastnit více pipelin, každá s vlastními nastaveními přepsání. Změny podkladového agenta (např. revize promptu ve vlastním editoru agenta) propagují do všech pipelin, které ho používají; per-pipeline přepsání ne, žijí jen v pipelině.

### Klíčové body

- **Přetáhni z knihovny** — libovolný agent, kterého jsi vytvořil/a, je dostupný
- **Per-pipeline přepsání** — vstupní mapování, výstupní transformer, preference modelu (pokud chceš, aby tato pipeline použila levnější model pro tuto fázi), failover poskytovatel
- **Multi-pipeline opakované použití** — agent v pipeline A a pipeline B má nezávislé sady přepsání per pipeline
- **Změny podkladového agenta propagují** — editace promptu, změny nástrojů atd. tečou do každé pipeliny používající agenta (per-pipeline přepsání ne)
- **Nahrazení agenta na místě** — pravý klik → Replace; nový agent zdědí spojení starého, pokud odpovídají tvary vstupu/výstupu

### Jak to funguje

Umístění agenta na plátno vytváří *pipeline-scoped referenci* na toho agenta. Reference zahrnuje sadu přepsání (libovolné per-pipeline customizace) a pozici na plátně. Za běhu engine řeší referenci, aplikuje přepsání na základní konfiguraci agenta a odesílá běh.

:::tip
Odolej pokušení zapéct těžké per-pipeline customizace do sady přepsání. Pokud se přistihneš, že přepisuješ mnoho věcí v jedné pipeline, je obvykle čistší klonovat agenta (dej klonu jasné jméno jako „Email Writer - Pipeline B") a použít klon — drží per-pipeline customizace explicitní místo skryté uvnitř panelů přepsání.
:::
  `,

  "connecting-agents-with-data-flow": `
## Spojování agentů tokem dat

Spojení na plátně jsou směrované hrany z výstupního portu agenta na vstupní port jiného agenta. Každé spojení nese výstup upstream agenta downstream agentovi jako vstup — doslovně ve výchozím nastavení, nebo transformován inline transformerem (malý výraz, který přetváří výstup před předáním dál).

Spojení jsou konfigurovatelná: můžeš přidat transformery, označit je (užitečné ve složitých pipelinách) a dočasně je vypnout pro ladění bez odstranění. Více spojení může vyfanout z jednoho výstupu (broadcast: downstream agenti všichni dostanou stejná data) nebo se slévat do jednoho vstupu (engine kombinuje vstupy z více upstream agentů do jednoho vstupního objektu pro downstream).

### Klíčové body

- **Click-drag** z výstupního portu na vstupní port pro vytvoření spojení
- **Volitelný transformer** — inline výraz, který přetváří data při průchodu
- **Fan-out** — jeden výstup na mnoho downstream vstupů (paralelní větvení)
- **Fan-in** — mnoho upstream výstupů do jednoho downstream vstupu (kombinovaný objekt)
- **Přepínání zapnuto/vypnuto** — vypni spojení bez smazání (užitečné pro postupné rollouty)
- **Pojmenováno** — pojmenuj spojení pro jasnost ve složitých pipelinách
- **Smazání** — klikni na spojení → klávesa Delete

### Spojení dvou agentů

:::steps
1. **Najdi výstupní port** — malý kruh na pravém okraji zdrojového agenta
2. **Click-and-drag** na vstupní port — malý kruh na levém okraji cíle
3. **Pusť na vstupním portu** — čára nakreslena; spojení commitnuto
4. **Volitelně přidej transformer** — pravý klik na spojení → Add transformer; napiš malý výraz pro přetvoření dat
5. **Testuj spuštěním pipeline** — klikni na libovolné spojení během běhu pro inspekci dat procházejících
:::

:::tip
Používej štítky spojení a transformery liberálně v libovolné pipelině s víc než 3-4 agenty. Štítky činí topologii samodokumentující; transformery ti umožňují udržet agenty opakovaně použitelné napříč pipelinami (jeden agent nemusí vědět, jaký formát může jiná pipeline upstream produkovat — transformer ho adaptuje).
:::
  `,

  "pipeline-execution": `
## Běh pipeliny

Spuštění pipeline odesílá payload spouštěče do prvního agenta (nebo agentů, pokud je více startovních uzlů) a každý downstream agent běží, jakmile jsou jeho vstupy dostupné. Plátno ukazuje běh živě — agenti svítí, když běží, spojení animují s tekoucími daty a podmíněné uzly ukazují, která větev byla zvolena.

Engine zvládá paralelismus automaticky: pokud dva agenti mezi sebou nemají závislost, běží paralelně. Pokud agent závisí na výstupech z více upstream agentů, čeká, až všichni skončí. Celkový čas v reálném čase je určen kritickou cestou skrz graf, ne součtem všech dob trvání agentů.

### Klíčové body

- **Živá animace plátna** — viz, kteří agenti běží, která spojení tečou, které podmíněné větve jsou voleny
- **Automatický paralelismus** — nezávislí agenti běží souběžně; závislí agenti čekají na předpoklady
- **Kritická cesta určuje čas v reálném čase** — doba trvání pipeline = nejdelší řetězec závislostí, ne součet agentů
- **Stop-at-first-failure** — ve výchozím nastavení; konfigurovatelné per pipeline, pokud chceš toleranci na chyby
- **Re-run z libovolného kroku** — pokračuj po opravě bez znovu spouštění úspěšných upstream fází

### Jak to funguje

:::diagram
[Trigger] --> [Agent A] --> [Conditional] --> [Agent B or Agent C] --> [Agent D] --> [Output]
:::

Klikni \`Run\` (nebo počkej, až se spouštěč spustí automaticky). Engine staví exekuční plán z topologie plátna, odesílá startovní uzly a zpracovává graf v topologickém pořadí. Jak každý agent skončí, downstream agenti se stávají způsobilými a odesílají se automaticky. Selhání pozastavuje pipelinu na selhávajícím kroku s chybou viditelnou v inspektoru; oprav podkladový problém a klikni \`Retry Step\` pro obnovení.

:::tip
Nejpomalejší agent na kritické cestě určuje dobu trvání pipeliny. Pokud se ti pipeline zdá pomalá, spusť ji jednou, podívej se na per-agent doby trvání v trace, identifikuj nejdelší cestu a optimalizuj toho agenta na té cestě, který má nejvyšší dobu trvání. Paralelní větve nepomáhají, pokud je tvá kritická cesta pomalá.
:::
  `,

  "conditional-routing": `
## Podmíněné směrování

Uzly podmíněného směrování umožňují pipelině větvit se podle dat, která zpracovává. Pusť podmíněný uzel na plátno, definuj jedno nebo více pravidel („pokud amount > 1000", „pokud email obsahuje 'urgent'", „pokud klasifikátor výstup = 'support'") a zapoj každou větev k jiné downstream cestě. Za běhu se podmíněnost vyhodnotí a směruje na odpovídající větev — běží jen ta větev.

Pravidla jsou založená na výrazech: malý DSL porovnání a logických operátorů vyhodnocený proti výstupu upstream agenta. Žádný kód; editor výrazů má autocomplete pro tvar upstream výstupu, takže objevuješ dostupná pole, jak píšeš.

:::feature
**Směrování založené na výrazech**
Podmíněná pravidla jsou vyhodnocována jako výrazy proti upstream výstupu. Porovnávej pole, kombinuj s AND/OR, propadej do výchozí větve, když nic neodpovídá. Žádný kód není potřeba, ale plná expresivita, když ji potřebuješ.
:::

### Klíčové body

- **Více větví** — jeden podmíněný uzel, N pravidly definovaných větví, plus výchozí záloha
- **Výchozí větev je povinná** — garantuje, že data nikdy neuvíznou na nesplněných podmínkách
- **DSL výrazů** — porovnání (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), boolean operátory (\`and\`, \`or\`, \`not\`)
- **Autocomplete na upstream tvaru** — editor výrazů zná schéma výstupu upstream agenta
- **Živé vyhodnocení v trace** — viz, která větev byla zvolena na každém běhu pipeline

### Jak to funguje

Pusť Conditional uzel mezi agenty. Nakonfiguruj pravidlo každé větve v editoru pravidel; výchozí větev nepotřebuje pravidlo (je to záloha). Za běhu engine vyhodnocuje pravidla v pořadí; první shoda vyhrává; pokud žádné pravidlo neodpovídá, běží výchozí větev. Větev, která běží, vidí upstream výstup jako vstup; ostatní zůstávají nečinné pro tento běh.

:::warning
Vždy definuj výchozí větev. Bez ní nesplněný vstup uvízne uprostřed pipeline a produkuje zaseknutý běh — otravné na ladění. Výchozí větev může jednoduše směrovat na koncový agent „log and stop", pokud opravdu chceš, aby nesplněné vstupy selhaly hlasitě, ale větev musí existovat.
:::
  `,

  "team-members-and-roles": `
## Členové týmu a role

Každý agent v pipelině může nést štítek role — „Researcher", „Writer", „Editor", „Classifier" — který popisuje jeho funkci v pipelině. Role jsou čistě organizační; engine je nevynucuje ani nepoužívá. Jejich hodnota je lidská: když ty (nebo někdo jiný) otevřeš plátno za měsíc, štítky rolí činí pipelinu samodokumentující.

Kromě štítku jsou role také užitečné pro substituci agentů. Pokud máš více agentů, kteří mohou plnit roli „Editor" (s různými styly promptů nebo specializacemi), štítek role činí zřejmým, který slot vyměnit, když změníš názor. Team Canvas podporuje drag-replace na roli: pusť jiného agenta na existující roli a plátno se ptá, zda substituovat, zachovávajíc spojení.

### Klíčové body

- **Freetextové štítky rolí** — cokoli lidsky čitelné; běžné dostávají návrhy autocomplete
- **Viditelné na plátně** — štítky rolí se objevují nad každým uzlem agenta, takže struktura týmu je na pohled
- **Drag-replace podle role** — pusť nového agenta na slot role pro substituci, zachovávajíc spojení
- **Filtruj knihovnu podle role** — když máš mnoho podobných agentů, filtruj knihovnu podle role pro rychlé nalezení kandidátů
- **Šablony pipelin používají role** — šablona definuje role k vyplnění, ty přineseš agenty, kteří odpovídají každé roli

### Jak to funguje

Pravý klik na libovolného agenta na plátně → Set role. Štítek se objeví nad uzlem agenta. Role žijí v definici pipeline vedle reference agenta; nemodifikují agenta samotného. Šablony pipelin se dodávají s předdefinovanými rolemi; instancování šablony tě vyzve k výběru agenta pro každou roli.

:::tip
Pojmenuj role podle zodpovědnosti, ne podle aktuálního agenta. „Editor" je lepší než „Claude Sonnet Editor"; popis role přežívá, kterýkoli konkrétní agent ji aktuálně plní. Pokud přejdeš z Claude na GPT pro tu roli, štítek role je stále přesný.
:::
  `,

  "pipeline-run-history": `
## Historie běhů pipeliny

Běhy pipeliny jsou prvotřídní běhy ve stejném úložišti, kam jdou jednotlivé běhy agentů. Karta Pipeline → Run History ukazuje každý běh s jeho spouštěčem, vstupem, stavem, celkovou dobou trvání, celkovými náklady a per-agent rozpisem. Klikni na libovolný běh pro rozšíření plné trace: per-agent trace, podmíněná rozhodnutí, výstupy transformerů, finální výsledek.

Historie běhů přetrvává na neurčito (s ohledem na nastavení retence v Settings → Data) a podporuje stejné filtrování a vyhledávání jako per-agent pohledy aktivity. Každý běh je neměnný — jakmile je zachycen, trace je zmrazen, užitečné pro audity po faktu.

### Klíčové body

- **Kompletní zachycení** — vstup, per-agent trace (prompt, volání nástrojů, odpověď), podmíněná rozhodnutí, výstupy transformerů, finální výsledek
- **Per-agent stav** v rámci trace pipeline — úspěch / selhání / přeskočeno / čekající
- **Celkový + per-agent timing** — viz kritickou cestu a identifikuj úzká hrdla
- **Celkové + per-agent náklady** — náklady pipeline = součet per-agent nákladů
- **Prohledávatelné a filtrovatelné** — podle data, spouštěče, stavu, nákladů, doby trvání, agenta
- **Porovnání dvou běhů** — vyber dva běhy pro diff per-agent výstupů (užitečné pro „co se změnilo?")

### Jak to funguje

Běhy pipeline používají stejné úložiště běhů jako single-agent běhy, ale s dodatečným pipeline-level wrapperem, který odkazuje na všechny dětské exekuce agentů. Pohled historie dotazuje toto úložiště, spojuje k záznamům exekuce agentů pro per-agent rozpisy a renderuje strom trace.

:::tip
Po významné změně pipeline (nové podmíněné pravidlo, vyměněný agent, revize promptu na členském agentu) vyber běh „před" z historie a běh „po" z nového běhu, pak použij Compare pro přesné vidění toho, co je jiné. Diff na úrovni pipeline často odhalí dopad, který bys minul/a při pohledu na libovolného jednotlivého agenta izolovaně.
:::
  `,

  "pipeline-templates": `
## Šablony pipelin

Šablony pipelin jsou předpřipravené tvary pipeline, které můžeš přijmout jako výchozí bod. Šablona definuje topologii — jaké role existují, jaké podmíněné větve, jaké transformery — ale neváže konkrétní agenty na každou roli. Když instancuješ šablonu, plátno se otevře s topologií na místě a vyzve tě k vyplnění každé role z tvé vlastní knihovny agentů.

Šablony pokrývají běžné tvary: workflow obsahu (research → write → edit → publish), třídění podpory (classify → route → respond → escalate), zpracování dat (ingest → validate → transform → store). Knihovna šablon je v Pipelines → New Pipeline → Browse Templates.

### Klíčové body

- **Topologie-definovaná, role-flexibilní** — šablona zná tvar; ty přinášíš agenty
- **Předkonfigurovaná podmíněná pravidla a transformery** — běžná routovací logika je zabudovaná
- **Customizovatelné po instancování** — jakmile je instancována, plátno je tvoje k modifikaci
- **Best-practice vzory** — šablony se dodávají s ošetřením chyb a fallback větvemi jako standard
- **Rostoucí knihovna** — nové šablony jsou přidávány na základě požadavků uživatelů; můžeš také uložit vlastní pipeliny jako šablony pro opakované použití

### Jak to funguje

Šablona je definice plátna s rolovými sloty místo referencí agentů. Instancování vytváří novou pipelinu, kopíruje plátno šablony a žádá tě o vyplnění každé role z knihovny agentů. Jakmile je vyplněna, pipeline je plně editovatelná — není zpětně propojena se šablonou, takže aktualizace šablony se nepropagují (a editace pipeline neovlivňují šablonu).

:::tip
I když žádná šablona není přesně sedící, vyzvednutí nejbližší a její modifikace je obvykle rychlejší než stavění od nuly. Šablony pre-řeší tvar orchestrace (umístění podmíněnosti, polohy transformerů, fan-out/fan-in topologie); zbývající práce je výběr agentů a ladění promptu, což je práce, na kterou ses chtěl/a stejně soustředit.
:::
  `,

  "debugging-pipeline-issues": `
## Ladění problémů s pipelinou

Když běh pipeline selže, plátno označí selhávajícího agenta červeným indikátorem a běh se pozastaví na tom kroku. Otevři selhávající běh z historie (nebo klikni na indikátor na živém plátně) a debug panel ukazuje vstup agenta, chybu, trace až k selhání a libovolný částečný výstup, který agent vyprodukoval před selháním. Z téhož panelu můžeš zkusit znovu jen selhávající krok nebo znovu spustit celou pipelinu od začátku.

Nejčastější selhání pipeline jsou neshody tvaru dat — upstream agent produkuje výstup v mírně jiném formátu, než downstream agent očekává. Inspektor spojení (klikni na libovolné spojení) ukazuje data procházející v nejnovějším běhu, což obvykle stačí na odhalení neshody.

### Klíčové body

- **Selhávající krok zvýrazněn** — červený indikátor na plátně, plná chyba v debug panelu
- **Inspektor spojení** — klikni na libovolné spojení pro vidění živých nebo last-run dat procházejících
- **Retry z selhaného kroku** — oprav problém a pokračuj; úspěšné upstream fáze se neopakují
- **Step-by-step replay** — znovu spusť libovolnou minulou exekuci pipeline se stejným vstupem pro deterministickou reprodukci selhání
- **Validace spojení** — plátno může pre-kontrolovat, zda mají upstream a downstream agenti kompatibilní tvary vstupu/výstupu (zachycuje neshody před runtime)

### Jak to funguje

Engine pipeline emituje strukturované události selhání, když běh agenta zhavaruje. Debug panel se přihlašuje k těmto událostem a renderuje relevantní trace + inspektor. Retry-from-step je podporován enginem: znovu odesílá selhaného agenta se stejným upstream kontextem, zachovávajíc zbytek běhu pipeline.

:::tip
Většina selhání pipeline jsou problémy spojení, ne problémy agentů. Když se něco rozbije, nejprve prozkoumej spojení krmící selhávajícího agenta — jaký tvar skutečně dostal? Mnohem častěji je to „data byla špatná" než „agent byl špatný"; inspektor spojení ti řekne, který případ to je za méně než minutu.
:::
  `,
};
