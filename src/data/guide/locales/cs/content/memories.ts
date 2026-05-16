export const content: Record<string, string> = {
  "how-agent-memory-works": `
## Jak funguje paměť agenta

Tví agenti si mohou pamatovat minulé úkoly a učit se ze zkušeností. Pokaždé když agent běží, může ukládat užitečné informace — fakta, rozhodnutí, vzory a poučení. Ber to jako sešit, který tvůj agent nese od úkolu k úkolu, budujíc znalost v čase.

To znamená, že tví agenti jsou chytřejší, čím víc je používáš. Agent, který zvládl stovky dotazů zákazníků, bude mít kontext o běžných problémech, preferovaných řešeních a minulých rozhodnutích, který by zcela nový agent neznal.

### Klíčové body

- Agenti **automaticky se učí** z každého úkolu, který dokončí
- Paměti přetrvávají **mezi běhy** — tvůj agent si pamatuje předchozí práci
- Každá paměť je **kategorizována a řazena** podle důležitosti
- Můžeš **přezkoumat, editovat nebo smazat** libovolnou paměť kdykoli

### Jak to funguje

Během běhu, pokud agent narazí na něco, co stojí za zapamatování — užitečné fakto, důležité rozhodnutí nebo poučení — vytvoří záznam paměti. Až agent příště poběží, může si vybavit relevantní paměti pro lepší rozhodnutí. Máš plnou kontrolu nad přezkumem a správou toho, co si tvůj agent pamatuje.

:::tip
Paměť funguje nejlépe, když mají agenti konzistentní, soustředěné úkoly. Agent, který vždy zpracovává expense reporty, si bude budovat užitečnější paměti než ten, který dělá pokaždé jiný úkol.
:::
  `,

  "memory-categories": `
## Kategorie paměti

Paměti jsou organizovány do pěti kategorií, každá slouží jinému účelu. Tato struktura pomáhá tvému agentovi vybavit si správný druh znalostí ve správný čas — jako kapitoly v referenční knize.

Pochopení těchto kategorií ti pomáhá efektivněji přezkoumávat a spravovat znalosti tvého agenta. Každá kategorie ti říká nejen *co* agent ví, ale *jaký druh* znalosti to je.

### Pět kategorií

:::compare
**Fact**
Konkrétní informace získaná z úkolů. Příklad: „Klient preferuje formální jazyk." Přímé kousky znalostí, které tvůj agent sbírá.
---
**Decision**
Učiněné volby a uvažování za nimi. Příklad: „Zvolil Express dopravu, protože byla objednávka urgentní." Zaznamenává proč, ne jen co.
---
**Insight**
Vzory objevené přes více běhů. Příklad: „Tikety podpory špičkují každé pondělí ráno." Je chytřejší v čase.
---
**Learning**
Poučení z chyb nebo úspěchů. Příklad: „Kratší předměty mají vyšší míru otevření." Kontinuální zlepšení v akci.
---
**Warning**
Úskalí, na která dávat pozor. Příklad: „Nikdy neposílej faktury před podepsáním smlouvy." Brání tvému agentovi v opakování minulých chyb.
:::

### Jak to funguje

Když agent vytvoří paměť, automaticky ji kategorizuje na základě obsahu. Fakta jsou přímé kousky informací. Rozhodnutí zaznamenávají volby s uvažováním. Postřehy zachycují vzory. Poučení přicházejí z reflexe výsledků. Varování označují věci, kterých se vyhnout.

:::tip
Věnuj zvláštní pozornost kategorii Warnings během svých kontrol. Tyto paměti pomáhají tvému agentovi vyhnout se opakování minulých chyb — často jsou nejcennější.
:::
  `,

  "importance-levels": `
## Úrovně důležitosti

Každá paměť má skóre důležitosti od 1 do 5. Skóre 1 znamená, že jde o rutinní informaci, zatímco 5 znamená, že je kritická. Důležité paměti jsou vybavovány častěji, drží se déle a mají větší váhu, když agent dělá rozhodnutí — stejně jako si lépe pamatuješ velké životní události než to, co jsi měl/a k obědu minulé úterý.

Tento systém řazení drží tvého agenta soustředěného na to, co je nejdůležitější, místo aby se topil v triviálních detailech.

### Škála

| Úroveň | Štítek | Priorita vybavení | Popis |
|-------|-------|-----------------|-------------|
| 1 | Routine | Nízká | Drobné detaily, které mohou být občas užitečné |
| 2 | Useful | Mírná | Užitečný kontext, který obohacuje porozumění |
| 3 | Important | Standardní | Znalost, která pravidelně ovlivňuje rozhodnutí |
| 4 | Very Important | Vysoká | Klíčové informace, které by agent měl téměř vždy zvažovat |
| 5 | Critical | Vždy | Esenciální znalost, která nikdy nesmí být zapomenuta nebo ignorována |

### Jak to funguje

Důležitost je přiřazena automaticky při vytvoření paměti na základě faktorů jako jak často je informace odkazována a kolik ovlivnila výsledky. Můžeš také upravit úrovně důležitosti manuálně, pokud nesouhlasíš s automatickým přiřazením.

:::tip
Pokud agent opakovaně dělá stejnou chybu, zkontroluj, zda relevantní paměť existuje a zda je její úroveň důležitosti dostatečně vysoká. Posunutí na 4 nebo 5 zajistí, že agent na to bude dávat pozor.
:::
  `,

  "searching-agent-memories": `
## Vyhledávání v pamětech agenta

Jak tvoji agenti akumulují znalosti, schopnost prohledávat jejich paměti se stává esenciální. Napiš klíčové slovo nebo frázi a okamžitě uvidíš každou související paměť napříč všemi tvými agenty. Je to jako prohledávat e-mail — rychlé, jednoduché a můžeš filtrovat podle kategorie, důležitosti nebo data.

Vyhledávání ti pomáhá pochopit, co tví agenti vědí, ověřit, že se naučili správně, a rychle najít konkrétní informace.

### Klíčové body

- **Full-text vyhledávání** — najdi paměti podle libovolného klíčového slova nebo fráze, kterou obsahují
- **Filtruj podle kategorie** — zúžit výsledky na fakta, rozhodnutí, postřehy, poučení nebo varování
- **Filtruj podle důležitosti** — ukázat jen vysoko-prioritní nebo nízko-prioritní paměti
- **Cross-agent vyhledávání** — hledej napříč všemi tvými agenty najednou nebo se soustřeď na jednoho

### Jak to funguje

Otevři sekci \`Memories\` a napiš svůj vyhledávací dotaz do vyhledávací lišty. Výsledky se objevují okamžitě s odpovídajícím textem zvýrazněným. Použij filtrovací tlačítka pro zúžení podle kategorie, úrovně důležitosti, časového rozsahu nebo konkrétního agenta. Klikni na libovolný výsledek pro zobrazení plné paměti se vším jejím kontextem.

:::tip
Hledej téma předtím, než vytvoříš manuální paměť. Tvůj agent už možná ví, co se ho chystáš naučit — v takovém případě můžeš jednoduše aktualizovat existující paměť.
:::
  `,

  "creating-memories-manually": `
## Ruční vytváření pamětí

Občas chceš, aby tvůj agent něco věděl předtím, než to objeví sám — jako instruktáž nového zaměstnance v první den. Manuální paměti ti umožňují učit své agenty konkrétním faktům, preferencím nebo pravidlům přímo, dávajíc jim náskok v znalostech, které by jinak museli objevit zkušeností.

To je obzvlášť užitečné pro firemní informace, osobní preference nebo kritická pravidla, která by neměla být učena přes pokus a omyl.

:::steps
1. **Otevři sekci Memories** — klikni \`Memories\` v postranním panelu a pak \`Add Memory\`
2. **Vyber kategorii** — vyber fakto, rozhodnutí, postřeh, poučení nebo varování
3. **Napiš obsah paměti** — popiš znalost v prostém jazyce
4. **Nastav úroveň důležitosti** — přiřaď skóre od 1 (rutinní) do 5 (kritické)
5. **Přiřaď k agentovi** — vyber konkrétního agenta nebo udělej paměť dostupnou všem agentům
:::

### Jak to funguje

Paměť, kterou vytvoříš, se přidává do znalostní báze agenta stejně jako automaticky naučená paměť. Až agent příště poběží, může přistupovat k těmto informacím vedle všeho, co se naučil sám. Manuální paměti jsou označeny malou ikonou, takže je můžeš rozlišit od automatických.

:::tip
Vytvoř pár pamětí „Warning" pro svá nejkritičtější pravidla předtím, než agent půjde naživo. Například: „Nikdy nesdílej cenové informace bez schválení manažerem."
:::
  `,

  "memory-tiers-explained": `
## Vysvětlení úrovní paměti

Ne všechny paměti jsou stvořeny rovny a ne všechny musí být okamžitě dostupné. Personas organizují paměti do čtyř úrovní na základě toho, jak často jsou používány a jak důležité jsou. Ber to jako spisový systém: nejvíce používané položky zůstávají na stole, méně používané jdou do šuplíku a vzácně potřebné jsou založeny ve skříni.

Tento úrovňový systém drží tvého agenta rychlého a efektivního. Vybavuje si nejrelevantnější paměti okamžitě, zatímco má stále přístup ke starším znalostem, když je potřeba.

### Čtyři úrovně

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
Vždy nahráno. Trvalá kritická pravidla a fakta. Manuálně připnuto a nikdy nesníženo. Nejdůležitější znalost tvého agenta.
---
**Active**
Nahráno při vybavení. Často přistupované nedávné paměti. Auto-promovány podle frekvence použití. „Šuplík" užitečného kontextu.
---
**Working**
Session-scopovaná. Paměti z aktuálního úkolu nebo nedávných seancí. Vytvářeny během běhu a stárnou do Active v čase.
---
**Archive**
Jen na vyžádání. Starší paměti nedávno nepřistupované. Auto-snižovány po inaktivitě, ale uchovány na neurčito. Nic se nikdy neztratí.
:::

### Jak to funguje

Paměti se pohybují mezi úrovněmi automaticky na základě vzorů použití. Často vybavovaná paměť se promuje na vyšší úroveň; ta, ke které nebylo přistupováno chvíli, postupně směřuje k archivu. Můžeš také manuálně připnout paměti k úrovni Core, abys zajistil/a, že jsou vždy v centru pozornosti tvého agenta.

:::tip
Připni svá nejdůležitější pravidla a fakta k úrovni Core. To garantuje, že je tvůj agent vždy zvažuje, bez ohledu na to, jak jsou staré.
:::
  `,

  "memory-and-execution": `
## Paměť a běh

Když tvůj agent začíná nový úkol, nezačíná s prázdným listem. Automaticky si vybavuje relevantní paměti z předchozích běhů, přinášejíc kontext, preference a poučení do aktuální exekuce. To činí každý běh informovanějším než předchozí.

Proces vybavení je chytrý — nedumpsuje všechny paměti najednou. Místo toho vybírá ty nejrelevantnější pro aktuální úkol, podobně jako si přirozeně vybavuješ související zkušenosti, když čelíš známé situaci.

### Klíčové body

- **Automatické vybavení** — relevantní paměti jsou nahrány před každou exekucí
- **Vědom kontextu** — vybavují se jen paměti související s aktuálním úkolem
- **Vážené podle důležitosti** — paměti s vyšší důležitostí jsou pravděpodobněji vybaveny
- **Vytváření pamětí** — nové paměti mohou být vytvořeny během exekuce na základě výsledků

### Jak to funguje

Než tvůj agent zpracuje svůj úkol, paměťový systém prohledá relevantní záznamy na základě obsahu úkolu a kontextu. Tyto paměti jsou poskytnuty AI modelu vedle tvých instrukcí. Po dokončení úkolu agent vyhodnotí, zda se naučil něco nového, a vytvoří paměti odpovídajícím způsobem.

:::tip
Pokud agent nepoužívá své paměti efektivně, zkontroluj, zda jsou paměti správně kategorizovány a skórovány. Dobře organizované paměti jsou vybavovány spolehlivěji.
:::
  `,

  "reviewing-and-cleaning-memories": `
## Procházení a úklid pamětí

V čase se některé paměti stávají zastaralými, nesprávnými nebo redundantními. Pravidelné kontroly drží znalostní bázi tvého agenta přesnou a aktuální. Ber to jako jarní úklid pro mozek tvého agenta — vyklízení starých informací, aby tvůj agent činil rozhodnutí na základě aktuálních, správných znalostí.

Čistá paměťová báze vede k lepšímu výkonu agenta. Agent, který se opírá o zastaralé informace, může činit špatná rozhodnutí, aniž by si uvědomoval proč.

### Klíčové body

- **Procházej všechny paměti** s možnostmi řazení a filtrování
- **Edituj** libovolnou paměť pro opravu nepřesností nebo aktualizaci zastaralých informací
- **Smaž** paměti, které už nejsou relevantní
- **Sluč** duplicitní nebo podobné paměti do jednoho jasného záznamu

### Jak to funguje

Otevři sekci \`Memories\` a procházej seznam pamětí svého agenta. Seřaď podle data, důležitosti nebo kategorie pro zaměření své kontroly. Klikni na libovolnou paměť pro editaci jejího obsahu, změnu úrovně důležitosti nebo smazání. Systém také navrhuje potenciální duplikáty, které by mohly být sloučeny.

:::tip
Plánuj měsíční kontrolu pamětí svých nejaktivnějších agentů. Dokonce i 15 minut úklidu může znatelně zlepšit kvalitu rozhodování agenta.
:::
  `,

  "exporting-and-importing-memories": `
## Export a import pamětí

Můžeš exportovat celou paměťovou bázi svého agenta do souboru — perfektní pro zálohy, sdílení znalostí mezi agenty nebo přesun na nový počítač. Import nahrává dříve exportovaný soubor a přidává tyto paměti do znalostní báze cílového agenta.

Tato funkce je také skvělá pro dání novému agentovi výhody zkušeností jiného. Exportuj ze svého zkušeného agenta, importuj do nového a začíná s bohatstvím znalostí místo prázdného listu.

### Klíčové body

- **Export do souboru** — ulož všechny paměti jako přenosný soubor, který můžeš uložit nebo sdílet
- **Import ze souboru** — nahraj paměti do libovolného agenta na libovolném zařízení
- **Selektivní export** — vyber konkrétní kategorie nebo úrovně důležitosti k exportu
- **Zpracování konfliktů** — duplikáty jsou detekovány a sloučeny během importu

### Jak to funguje

Otevři nastavení paměti agenta a klikni \`Export\`. Vyber, které paměti zahrnout (všechny nebo filtrované podle kategorie/důležitosti) a ulož soubor. Pro import otevři nastavení paměti cílového agenta, klikni \`Import\` a vyber svůj soubor. Personas detekují duplikáty a nechají tě rozhodnout, jak je zpracovat.

:::tip
Před velkou změnou promptu agenta exportuj jeho paměti jako zálohu. Pokud nový prompt vytvoří zmatek, můžeš obnovit původní paměti.
:::
  `,

  "memory-best-practices": `
## Doporučené postupy pro paměť

Vytěžit z paměti agenta maximum se redukuje na pár klíčových návyků. Jako dobré studijní návyky pro studenta, způsob, jakým strukturuješ a udržuješ paměti, dělá velký rozdíl v tom, jak efektivně se tví agenti učí a vybavují informace.

Drž se těchto pokynů, abys budoval/a agenty, kteří se v čase skutečně zlepšují, místo aby akumulovali nepořádek.

### Doporučené postupy

- **Drž agenty soustředěné** — agent s konzistentním úkolem si buduje užitečnější paměti než generalista
- **Pravidelně kontroluj** — kontroluj paměti měsíčně a odstraňuj zastaralé nebo nesprávné záznamy
- **Použij manuální paměti pro kritická pravidla** — nečekej, až se agent naučí něco tvrdou cestou
- **Nastav vhodné úrovně důležitosti** — ne vše je kritické, a to je v pořádku
- **Připni esenciální znalosti** k úrovni Core, takže jsou vždy dostupné

### Jak to funguje

Dobrá správa paměti je trvalá praxe, ne jednorázové nastavení. Začni vytvořením pár manuálních pamětí pro svá nejdůležitější pravidla. Nech agenta učit se přirozeně z jeho běhů. Pravidelně kontroluj pro opravu chyb a odstranění zastaralých informací. Uprav úrovně důležitosti, jak se tvé porozumění toho, co je důležité, vyvíjí.

:::tip
Ber správu paměti jako péči o zahradu. Pravidelné malé úsilí — prořezávání, zalévání, přesazování — produkují mnohem lepší výsledky než občasné velké přestavby.
:::
  `,
};
