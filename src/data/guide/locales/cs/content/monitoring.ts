export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## Monitorovací dashboard

Stránka Overview je tvé velitelské centrum pro vše, co se děje napříč tvými agenty. Karta Dashboard se otevírá ve výchozím nastavení a ukazuje mřížku KpiTilů — jeden dlaždice na metriku (úspěšnost, celkový počet běhů, celkové náklady, průměrná doba trvání, aktivní agenti, selhání-dnes atd.). Každá dlaždice má tři režimy hustoty (kompaktní / standardní / detail), které přepínáš kliknutím; užitečné, když chceš rychlé číslo vs. když chceš trendový graf a rozpis.

Pod KpiTily zobrazuje Overview živou aktivitu, nedávná selhání a notifikace, ke kterým jsi se přihlásil/a. Vše na této stránce je filtrovatelné podle agenta, podle skupiny a podle časového rozsahu — stejná sada filtrů se aplikuje napříč každým panelem, takže jediným kliknutím můžeš omezit celý dashboard na „tento týden, jen mí Marketing agenti".

| Panel | Co ukazuje |
|---------|--------------|
| **KpiTiles** | Úspěšnost, běhy, náklady, doba trvání, počet selhání, aktivní agenti — každý na třech úrovních hustoty |
| **Activity feed** | Živý stream běhů napříč všemi agenty, scrollovatelný, prohledávatelný, klik pro detail |
| **Notifications** | Přihlášené alerty (selhání, rozpočtové stropy, manual review, anomálie) s prokliknutím na pachatelský běh |
| **Health snapshot** | Per-agent shrnutí zdraví — rychlý sken pro cokoli žluté nebo červené |

### Jak to funguje

Stránka Overview čte ze stejného úložiště běhů a událostí, které používá zbytek aplikace, takže co vidíš, je vždy živý stav. Filtry a preference hustoty přetrvávají napříč seancemi; nastavíš je jednou a dashboard si je pamatuje. Klikni na libovolný KpiTile pro proklik do per-agent rozpisu, klikni na libovolný řádek aktivity pro otevření modálu detailu běhu.

:::tip
Zvonek oznámení v titulní liště je zkratka jedním kliknutím odkudkoli v aplikaci k nejčerstvějšímu detailu běhu. Nemusíš ručně navigovat na Overview pro rutinní kontroly „co se právě stalo?".
:::
  `,

  "execution-logs": `
## Logy běhů

Každý běh agenta produkuje log: payload spouštěče, vyrenderovaný prompt poslaný modelu, odpověď modelu, každé volání nástroje (s argumenty a výsledkem), finální výstup, dobu trvání, náklady a případné chyby. Logy jsou neměnné — jsou jednou zapsány a zachovány na neurčito. Karta Activity (per-agent v editoru, nebo globální na Overview) je vstupním bodem.

Každý záznam logu je jednořádkový souhrn v seznamu; kliknutí otevře plný modal detailu se všemi výše uvedenými poli. Odtud můžeš zkopírovat libovolné pole, přehrát běh se stejným vstupem nebo skočit na související pohled trace pro krok-po-kroku ladění.

### Klíčové body

- **Kompletní zachycení** — vstup, prompt, odpověď, volání nástrojů (s parametry a výsledky), výstup, doba trvání, náklady, chyby
- **Neměnná historie** — logy se po dokončení běhu nikdy nemění; pokud je prompt agenta později upraven, staré běhy stále ukazují, co bylo posláno v té době
- **Replay z libovolného běhu** — znovu spustí agenta s původním vstupem; užitečné pro ověření opravy na dříve selhávajícím payloadu
- **Otagované spouštěčem** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\` atd., takže můžeš filtrovat aktivitu podle zdroje
- **Marker manual-review** — běhy, které si sám agent označil k revizi (přes direktivu \`manual_review\`), dostanou odznak, takže je rychle najdeš

### Jak to funguje

Úložiště běhů je lokální SQLite, zapisované transakčně, jak běh probíhá. Karta trace uvnitř modálu detailu rozšiřuje každý krok do jeho podsobytí (stream tokenů modelu, odeslané volání nástroje, přijatý výsledek nástroje, vybraná větev rozhodnutí). Filtruj podle časového rozsahu, agenta, typu spouštěče, stavu, business_outcome nebo plnotextového vyhledávání na vstupu/výstupu.

:::tip
Když agent produkuje neočekávaný výstup, karta trace — ne výstup — je místem, kde žije odpověď. Hledej volání nástroje, které vrátilo špatná data, nebo rozhodnutí modelu, které se rozvětvilo špatnou cestou. Výstup je symptom; trace je příčina.
:::
  `,

  "real-time-activity-feed": `
## Aktivita v reálném čase

Feed aktivity ti ukazuje, co se právě teď děje napříč všemi tvými agenty. Jak každý agent zpracovává svůj úkol, aktualizace se objevují v reálném čase — je to jako sledovat živou výsledkovou tabuli. Vidíš výsledky ve chvíli, kdy nastanou, bez obnovování nebo kontroly jednotlivých agentů.

To je obzvlášť užitečné, když máš mnoho agentů běžících současně nebo když chceš sledovat kritickou automatizaci, jak se odehrává.

### Klíčové body

- **Živé aktualizace** — viz aktivitu agentů, jak se odehrává, žádné obnovování není potřeba
- **Všichni agenti** — jeden feed pokrývá každého běžícího agenta ve tvém nastavení
- **Záznamy s časovými značkami** — každá aktualizace ukazuje, kdy přesně nastala
- **Změny stavu** — viz, kdy agenti začínají, končí, uspívají nebo selhávají v reálném čase

### Jak to funguje

Otevři feed aktivity z monitorovacího dashboardu nebo z postranního panelu. Aktualizace se streamují automaticky, jak tvoji agenti pracují. Každý záznam ukazuje název agenta, akci, časovou značku a výsledek. Klikni na libovolný záznam — nebo na zvonek oznámení v titulní liště — pro přímé otevření modálu detailu běhu na kartě Overview › Activity, kde uvidíš trace, vyrenderovaný prompt, vstup, výstup a případné chyby. Sám feed je scrollovatelný a prohledávatelný.

:::tip
Drž feed aktivity otevřený v bočním panelu, zatímco testuješ nové agenty. Sledování živého výstupu ti pomáhá okamžitě odhalit problémy a iterovat rychleji. Pro každodenní použití je zvonek oznámení v titulní liště nejrychlejší cestou — vždy otevře nejčerstvější detail běhu, aniž bys musel/a navigovat.
:::
  `,

  "cost-tracking-per-agent": `
## Sledování nákladů na agenta

Každý AI poskytovatel účtuje za token a Personas tagují každý běh přesným počtem tokenů, modelem a poskytovatelem, takže per-agent náklady jsou vždy známé. Overview → Usage ukazuje seřaditelný seznam každého agenta s jeho náklady za zvolené časové okno — den, týden, měsíc nebo vlastní rozsah — plus trendové šipky, takže jedním pohledem vidíš, kterým agentům náklady rostou.

Prokliknej se do libovolného řádku pro rozpis: distribuce nákladů na běh (medián vs. p95), náklady podle modelu, když má agent nakonfigurovaný failover, celkové tokeny (vstup vs. výstup) a trendový graf v čase. Pokud agentovi rostou náklady, je to první místo, kde se to objeví.

### Klíčové body

- **Rozpis per-agent** — každý běh je přiřazen ke svému agentovi
- **Filtrovatelná časová okna** — dnes, tento týden, tento měsíc, vše, nebo vlastní rozsah
- **Distribuce nákladů na běh** — medián, p95, max; odhaluje, jestli jedna drahá odlehlá hodnota dominuje celku
- **Rozpis tokenů** — vstupní vs. výstupní tokeny, takže poznáš, jestli agent hodně čte nebo hodně produkuje
- **Trendové šipky** — změna týden-přes-týden ukázaná vedle každého agenta, takže regrese nákladů se ukazují okamžitě

### Jak to funguje

Měřič nákladů tiká živě během běhu, jak proudí tokeny. Když běh skončí, finální náklady se finalizují a uloží spolu s logem běhu. Pohled Usage agreguje z tohoto úložiště, takže změna filtru časového rozsahu prostě znovu dotazuje stejná data — žádná samostatná „úloha účtování nákladů" neběží.

:::tip
Pokud jediný agent dominuje tvým nákladům, distribuce na běh je užitečnější než celek. Vysoký medián znamená, že prompt je konzistentně drahý (podívej se na velikost promptu a počet volání nástrojů). Vysoký p95 s normálním mediánem znamená vzácné odlehlé hodnoty (podívej se na neobvyklé vstupy v historii trace).
:::
  `,

  "cost-tracking-per-model": `
## Sledování nákladů podle modelu

Různé modely mají velmi rozdílné ceny — Claude Haiku je ~30× levnější než Opus za token, GPT-4o-mini je ~20× levnější než GPT-4o a lokální modely stojí za token v podstatě nic (jen výpočet). Pohled per-model na Overview → Usage rozpisuje výdaje podle poskytovatele a modelu, takže vidíš, kam peníze jdou, a zda výdaje odpovídají hodnotě.

:::feature
**Chytré optimalizační nápovědy** color=#34d399
Systém taguje běhy, které vypadají, že mohly běžet na levnějším modelu s podobnou kvalitou. Když je drahý model použit pro vzor úkolů, který levnější model jinde zvládá v pořádku, nápověda se objeví vedle řádku nákladů — ukazuje ti kandidáty agentů, které A-B otestovat v Labu.
:::

### Klíčové body

- **Podle poskytovatele a modelu** — náklady rozdělené podle přesného identifikátoru modelu (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Volání, tokeny, náklady** — tři pohledy na stejná data; náklady jsou to, co platíš, tokeny jsou to, co utrácíš, volání je to, jak často voláš
- **Porovnání nákladů na volání** — stejná metrika napříč modely, takže můžeš porovnávat stejné se stejným
- **Optimalizační nápovědy** — odhalují kandidáty agentů, kteří by mohli být downgradováni; klikni do Labu pro A-B test
- **Atribuce per-agent** — prokliknej řádek modelu pro zjištění, kteří agenti ho používají nejvíc

### Jak to funguje

Pohled Usage seskupuje stejné záznamy běhů jako pohled per-agent, ale v dimenzi modelu místo toho. Ceny jsou nakonfigurované per-model v Settings → Engine, s výchozími hodnotami odpovídajícími veřejným cenám každého poskytovatele; můžeš přepsat, pokud máš vyjednanou sazbu nebo používáš BYOI na levnějším endpointu.

:::tip
Jednou za měsíc prohlédni pohled per-model seřazený podle celkových nákladů. Vrchní záznam je tvou největší příležitostí k úsporám — hoď ho do arény Labu proti dalšímu levnějšímu modelu a podívej se, jestli kvalita drží. Většina agentů toleruje downgrade modelu v pohodě; ti, kteří ne, jsou ti, kteří si zaslouží své výdaje.
:::
  `,

  "success-rate-metrics": `
## Metriky úspěšnosti

Každý běh skončí se stavem: úspěch, selhání nebo manual-review. Úspěšnost je procento běhů, které se úspěšně dokončily na pozadí očekávaného chování. Karta Overview → Health a per-agent karta Activity obě zobrazují úspěšnost s trendovým indikátorem — změna týden-přes-týden — takže jedním pohledem vidíš, jestli spolehlivost drží.

Metrika nyní jde dál než čistý úspěch/selhání. Se sledováním **business_outcome** může sám agent deklarovat, zda úspěšný běh vyprodukoval výsledek, který jsi skutečně chtěl/a (prodej, schválený dokument, užitečný souhrn) — samostatný signál od „dokončil se běh bez chyb". Úspěšnost se dělí na „čistě dokončené" a „vyprodukovalo požadovaný obchodní výsledek" — to druhé je užitečnější číslo pro většinu agentů.

### Klíčové body

- **Per-agent úspěšnost** s trendovou šipkou
- **Míra business-outcome** — oddělená od míry čistého dokončení; sleduje, zda byla práce agenta skutečně užitečná
- **Rozdělení per-spouštěč** — stejný agent může uspět z 99 % na manuálních bězích, ale ze 70 % na plánovaných bězích; rozpis ti ukáže, který zdroj spouštěče má problémy
- **Prahové alerty** — nastav práh per-agent; obdržíš upozornění, když míra klesne pod něj
- **Klasifikace důvodů selhání** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\` atd., takže vidíš *proč* běhy selhávají

### Jak to funguje

Karta Health agreguje stavy běhů přes posuvné okno per-agent. Sledování business-outcome vyžaduje, aby agent emitoval direktivu \`business_outcome\` ve svém výstupu (většina šablon, které to potřebují, to dělá ve výchozím nastavení; vlastní agenti to mohou přidat explicitně). Prahové alerty se konfigurují per-agent a spouštějí se přes stejné notifikační kanály, se kterými je agent nastaven.

:::tip
Nastav práh 90 % na každého produkčního agenta. Alert ti neřekne, proč agent selhává, ale řekne ti, že něco. Klasifikace důvodů selhání na kartě Health je místo, kam jdeš dál diagnostikovat.
:::
  `,

  "execution-tracing": `
## Trasování běhů

Trasování je per-běh krok-po-kroku záznam toho, co agent dělal. Otevři libovolný běh z feedu Activity a klikni na kartu Trace: uvidíš každou událost v chronologickém pořadí — začátek a konec streamování tokenů modelu, každé volání nástroje s argumenty, každý výsledek nástroje, každou větev rozhodnutí v řetězeném agentu, vyrenderovaný prompt, výstup. Každý krok je rozšiřitelný pro plný detail.

Pro řetězené pipeliny se trace rozpíná napříč více agenty — plátno lineage (Events → Lineage) ukazuje cross-agent pohled, zatímco per-run trace ukazuje within-agent detail. Spolu ti umožňují ladit jak „kde se tato pipeline rozbila?", tak „co agent rozhodl krok po kroku?".

### Klíčové body

- **Chronologické** — každá událost s časovou značkou a dobou trvání
- **Rozšiřitelné per-krok** — klikni na libovolný krok pro plný vstup/výstup toho kroku
- **Doba trvání per-krok** — viz, který krok je pomalý; obvykle volání nástroje nebo dlouhá odpověď modelu
- **Řetězené trace** — když je agent spuštěn řetězcem, trace odkazuje zpět na upstream agenta, takže můžeš navigovat pipelinou
- **Token po tokenu** pro model — užitečné pro pomalu streamované poskytovatele, kde uživatel čeká

### Jak to funguje

Každý běh zapisuje události do úložiště trace, jak běží; karta trace dotazuje to úložiště a renderuje časovou osu. Události na úrovni tokenů jsou vzorkovány v sazbě, která drží trace použitelný i pro dlouhé odpovědi (odpověď s 10k tokeny by mohla zachytit 500 vzorkovaných událostí místo 10k). Pro smyčky použití nástrojů je zachycena každá iterace round-tripu modelu/nástroje.

:::tip
Použij trace pro potvrzení toho, co model *skutečně* dostal. Největším zdrojem chyb „agent udělal něco divného" je model dostávající jiný vstup, než jsi očekával/a — obvykle kvůli výsledku nástroje, který nevypadal jako to, co prompt agenta předpokládal.
:::
  `,

  "performance-trends": `
## Trendy výkonu

Trendy jsou dlouhodobý pohled na chování agenta — úspěšnost, náklady, doba trvání, kvalita výstupu (kde se měří) vykreslené v čase, takže vidíš dopad změn, které děláš. Overview → Trends ti dává pohled grafu; vybíráš agenty a metriky a rozsah dat, a grafy se vyrenderují.

Nejužitečnější vzor je „před vs. po": změnil/a jsi prompt agenta 5. března, věci se zlepšily nebo zhoršily? Pohled trendů na to odpoví během sekund — čáry, na kterých ti záleží, jdou nahoru nebo dolů k datu, kdy jsi udělal/a změnu.

### Klíčové body

- **Více metrik na jednom grafu** — překryj úspěšnost, náklady, dobu trvání, míru business-outcome
- **Multi-agent překrytí** — porovnej stejnou metriku napříč více agenty na jednom grafu
- **Vlastní rozsahy dat** — zoomuj od „této hodiny" po „všechny časy"
- **Anotace** — významné události (uložení verzí promptu, změny nastavení, rotace přihlašovacích údajů) jsou připnuty k časové ose, takže můžeš korelovat
- **Export** — data grafu se exportují do CSV, pokud chceš dělat vlastní analýzu

### Jak to funguje

Trendy agregují ze stejného úložiště běhů a trace jako zbytek monitorovacích pohledů — stejná data, jiná vizualizace. Anotace jsou automaticky generovány z historie verzí a historie konfigurace (které jsou také trvalé), takže nemusíš manuálně označovat „udělal jsem změnu tady"; systém už to ví.

:::tip
Po jakékoli významné změně agenta (revize promptu, výměna modelu, nový nástroj) zkontroluj trendy týden později. Většina změn promptu, které „v testování působily lépe", produkuje měřitelně rozdílné metriky; graf to potvrdí (nebo vyvrátí tvůj instinkt).
:::
  `,

  "setting-budget-limits": `
## Nastavení rozpočtových limitů

Rozpočtové limity stropují AI výdaje na úrovni agenta a globální úrovni. Nastav rozpočet na běh (tato jediná exekuce nemůže stát víc než $X), rozpočet na den (tento agent nemůže utratit víc než $Y za den napříč všemi běhy) nebo globální strop napříč všemi agenty. Když je limit dosažen, postižený agent se čistě pozastaví — částečný běh je zachycen v trace, žádný účet nepřetrvává za stropem a spustí se notifikace.

To je jedna z nejvíce nedoceněných funkcí pro nezatížené agenty. Plánovaný nebo webhook-spouštěný agent bez rozpočtového stropu by mohl přes noc nasekat neočekávané náklady, pokud prompt nebo vstup udělá něco patologického. Rozpočtové stropy znamenají, že nejhorší případ je omezen tím, co jsi rozhodl/a předem, ne tím, co může udělat zbloudilý běh modelu.

### Klíčové body

- **Strop na běh** — tvrdý limit na jednu exekuci
- **Strop na den / na týden / na měsíc** — okénkový limit výdajů per-agent
- **Globální strop** — limit napříč všemi agenty; užitečný jako záchranná síť, i když má každý agent svůj vlastní strop
- **Graceful zastavení** — agenti se na stropě čistě zastaví; částečný trace je zachován
- **Notifikace** — každý dosažený strop ti dá vědět, takže můžeš rozhodnout, jestli strop zvýšit nebo opravit podkladový prompt
- **Měkká varování** — volitelné pre-stropové prahy (např. „varuj při 80 %"), takže víš, že agent míří ke stropu

### Jak to funguje

Stropy se konfigurují na kartě Settings agenta (per-run, per-window) nebo v Settings → Engine → Budget (globální). Exekuční engine sleduje živé náklady během běhu; když náklady překročí strop, engine přeruší běh stejnou cestou jako timeout. Přerušený stav je zachován v trace s důvodem \`budget_exceeded\`.

:::warning
Vždy nastav alespoň denní strop pro jakéhokoli automaticky spouštěného agenta (schedule, webhook, file watcher, chain). Bez něj by patologický vstup nebo smyčka modelu mohly utratit neohraničené množství, než si všimneš. Strop je tvá záchranná síť.
:::

:::tip
Začni se stropy zhruba 3× to, co očekáváš, že typický den bude stát. Dostatečně těsné, aby chytly utíkajícího agenta, dostatečně volné, aby normální variance strop nepřekročila. Uprav po týdnu skutečných dat.
:::
  `,

  "anomaly-detection": `
## Detekce anomálií

Detekce anomálií porovnává každý nový běh proti nedávnému baseline agenta a označuje běhy, které vypadají neobvykle. Baseline se staví per-agent: typická doba trvání, typické náklady, typická délka výstupu, typický počet volání nástrojů. Nový běh, který se na libovolném z těchto výrazně odchyluje, dostane označení s důvodem — „doba trvání 5× normální", „nárůst nákladů", „počet volání nástrojů anomální", „výstup neobvykle krátký".

To zachytává třídu problémů, které čisté metriky úspěch/selhání míjejí: běh se dokončil, ale něco bylo špatně. Agent zabral pět minut, když obvykle zabere třicet sekund. Výstup jsou tři věty, když obvykle jsou tři odstavce. Náklady se zdvojnásobily bez změny vstupu. Tohle jsou signály, které stojí za vidění, než se stanou trendy.

### Klíčové body

- **Multi-signální baseline** — doba trvání, náklady, velikost výstupu, počet volání nástrojů, míra selhání
- **Per-agent baseliny** — každý agent má svou vlastní normalitu; co je anomální pro jednoho, je normální pro jiného
- **Alerty s označením důvodu** — alert pojmenuje, který signál se odchýlil a o kolik
- **Nízký šum** — kalibrováno tak, aby zobrazovalo skutečné odlehlé hodnoty, ne normální varianci
- **Integruje s notifikacemi** — anomálie se spouštějí přes notifikační kanály, se kterými je agent nakonfigurován

### Jak to funguje

Baseline je posuvné okno nedávných běhů (konfigurovatelné; výchozí 50). Každý nový běh je hodnocen na každém signálu; pokud libovolný signál překročí nakonfigurovaný práh (výchozí 3 směrodatné odchylky od posuvného průměru), je běh označen a vyslána událost anomálie. Události anomálie se zobrazují na Overview → Notifications a na kartě Health pro toho agenta.

:::tip
Anomálie, které prozkoumáš a vyřešíš, by měly být vymazány (označ je „vyšetřeno"). Baseline vylučuje vyšetřené anomálie ze svého posuvného okna, takže systém nedrejtuje k tomu, aby považoval anomální běh za „normální".
:::
  `,

  "the-director": `
## Director — automatický koučink agentů

**Director** je vestavěný meta-agent, který sleduje tvé ostatní agenty a koučuje je, aby byli skutečně užiteční. Místo toho, abys musel/a číst každý běh sám/sama, Director je přezkoumá za tebe a zanechá verdikt.

Ty rozhoduješ, co sleduje, pomocí **hvězdiček** u agentů (⭐ na každém řádku v sekci Všichni agenti). Agent s hvězdičkou je „ve scope Directora" — Director ho přezkoumává; agenti bez hvězdičky jsou ponecháni stranou. Director sám je systémový agent a nelze ho smazat.

### Velitelské centrum

Director sídlí pod **Přehled › Director** — jedna přehledná obrazovka:

- **Přehled portfolia**: kolik práce tvé flotily skutečně přineslo hodnotu, průměrné skóre verdiktu, náklady na běh s přidanou hodnotou a distribuce 0–5 ukazující, jak si vedou tvoji agenti s hvězdičkou.
- **Tabulka koučinku** každého agenta ve scope — skóre, trendová sparkline (posunuje koučink jehlu?), míra hodnoty, poslední přezkoumání a **štítky pozornosti**, které přesně označí, co je třeba řešit (čeká na první přezkoumání, nízké skóre, klesá, zastaralé). Filtruj na agenty, kteří potřebují pozornost. Klikni na libovolného agenta pro otevření jeho **detailu** — úplná historie verdiktů s odůvodněním a konkrétními návrhy za každým skóre.
- Tenký záhlaví s tlačítkem **Přezkoumat vše ve scope**, výběrem **Přidat do scope** a přepínačem dlouhodobé **paměti**.

Stránka Všichni agenti má tenký pruh Directora, který vede přímo sem.

### Jak vypadá verdikt

Každé přezkoumání přináší celkové **skóre 0–5** a volitelné koučovací poznámky:

- Sloupec **Verdikt** v seznamu Aktivita zobrazuje skóre jako hvězdičky přímo vedle agenta — jedním pohledem vidíš, které běhy stály za své náklady.
- Karta **Director** u libovolného běhu otevře celé hodnocení ve čitelném markdownu: skóre, jednořádkové shrnutí a konkrétní návrhy (úprava promptu, guardrail, změna třídy modelu, chybějící nástroj).
- Použitelné poznámky se také dostanou do tvé fronty přezkoumání, kde jejich schvalování nebo odmítání učí Directora tvůj vkus postupem času.

Zdravý agent dosahuje vysokého skóre s minimem nebo žádným koučinkem — Director mlčí, když není co zlepšovat.

### Dlouhodobá paměť (volitelné)

Pokud používáš **Obsidian Brain**, můžeš zapnout dlouhodobou paměť Directora. Pak si před každým přezkoumáním přečte své vlastní dřívější poznámky o daném agentovi (aby se rady kumulovaly místo opakování) a každý nový verdikt zapíše do složky \`Director/\` ve tvém vaultu — trvalá, lidsky čitelná koučovací história.

### Proč na tom záleží

Surová čísla (běhy, náklady, míra úspěchu) ti říkají *co* se stalo, ne *zda to stálo za to*. Director přidává chybějící vrstvu úsudku — poctivé, na důkazech založené čtení hodnoty a efektivity každého agenta — takže flotila agentů zůstává užitečná, aniž bys musel/a ručně auditovat každý běh.
  `,

  "tracking-goals": `
## Sledování cílů

Cíle jsou vrstvou výsledků nad jednotlivými běhy. Místo sledování každého spuštění si definuješ, čeho chceš dosáhnout — a postup se automaticky sloučí z práce, kterou dělá tvůj tým a tví agenti.

Cíl má název, volitelné cílové datum, stav a procento postupu. Stav sleduje jednoduchý model čtyř hodnot: **otevřený** (nezahájený), **probíhající** (pracuje se), **blokovaný** (čeká na něco) a **hotový**. Postup je hybridní: systém vypočte návrh z položek kontrolního seznamu cíle, dílčích cílů a propojených kroků týmového zadání — a zobrazí ti ho jako výzvu **Přijmout / upravit**. Ty rozhoduješ; manuální přepsání vždy vyhraje.

### Tři pohledy

Cíle se nacházejí v sekci Teams a nabízejí tři plochy přepínatelné přes postranní panel:

- **Nástěnka** — kanban uspořádaný podle stavu. Karty zobrazují plný název cíle a vložený kontrolní seznam (první několik úkolů jako přepínatelné zaškrtávací políčko, zbytek za odkazem „+N dalších"). Když má cíl úkoly, jejich dokončení posouvá postup — pruh se pohybuje, jak se položky odklikávají.
- **Mapa** — plátno s posouváním a přibližováním ukazující, jak cíle navzájem souvisejí. Hrany závislostí (blokuje, navazuje) propojují cíle do řízeného grafu. Zvýraznění **Nyní** (jantarový pulzující kroužek) označuje právě probíhající cíle; zvýraznění **Dále** (modrý kroužek) označuje cíle, jejichž blokátory jsou všechny hotové a jsou připraveny začít. Oddal pro zobrazení souhvězdí; přiblíž pro plná metadata každého uzlu.
- **Časová osa** — cíle na svislé kolejnici termínů seskupené podle naléhavosti: Po termínu, Tento týden, Tento měsíc, Později, Bez data.

### Klíčový tah: Předej svému AI týmu

Zásobník detailů libovolného cíle obsahuje ovládací prvek **Předej svému AI týmu**. Stisknutím se cíl promění v probíhající týmové zadání propojené zpět s cílem. Tým cíl rozloží na kroky (nebo přijme stávající úkoly doslova), pracuje je jeden po druhém a automaticky odklikává postup, jak se každý krok dokončí. Cíl se sám přesune z otevřeného na probíhající na hotový — a vynoří se v tvé frontě přezkoumání jen tehdy, když krok skutečně potřebuje lidské rozhodnutí.

:::tip
Nemusíš hned předávat cíl svému týmu. Nejdříve pomocí Nástěnky ručně sestav kontrolní seznam — tým pak přijme každý úkol v pořadí, což ti dává jemnou kontrolu nad tím, co se pracuje a v jakém sledu.
:::
  `,

  "measuring-outcomes-with-kpis": `
## Měření výsledků pomocí KPI

KPI jsou číselnou vrstvou nad cíli. Zatímco cíl popisuje výsledek, kterého chceš dosáhnout, KPI sleduje, zda se k němu skutečně blížíš — aktuální hodnotu, cíl a čtení tempa, které ti říká, zda jsi na správné cestě.

Každý KPI zobrazuje aktuální hodnotu vůči cíli se stavem **tempa**: **na správné cestě**, **mimo cestu**, **splněno** nebo **neměřeno** (když měření ještě neproběhlo). Pruh postupu a indikátor čerstvosti měření doplňují kartu na první pohled.

### Čtyři způsoby měření

KPI se všechny neměří stejně. Personas podporují čtyři způsoby měření, každý vhodný pro jiný datový zdroj:

:::info
- **Kódová základna** — spouští příkaz vůči tvému repozitáři a analyzuje výsledek. Vhodné pro věci jako procento pokrytí testy nebo počet chyb linteru, které žijí zcela v kódu.
- **Odvozené** — čte z vlastních dat orchestrátoru: počty běhů, míry výsledků, trendy nákladů a podobné operační metriky, které Personas už sledují.
- **Konektor** — stahuje hodnotu z připojené externí služby (analytika, provoz, sledování chyb). Pokud potřebný konektor ještě není ve tvém vaultu, karta KPI zobrazí výzvu „Připojit \<službu\>", která vede přímo do katalogu přihlašovacích údajů.
- **Manuální** — hodnotu zadáváš sám/sama. Vhodné pro obchodní čísla, která nežijí v žádném systému, který jsi připojil/a, nebo pro KPI, které chceš sledovat neformálně, než automatizuješ měření.
:::

### Kde KPI žijí

**Teams › KPI** má za segmentovaným přepínačem dva pohledy. Pohled **Dashboard** zobrazuje všechna aktivní KPI jako karty — kliknutím na libovolnou kartu se otevře zásobník detailů s úplnou historií měření, sparkline a polem pro ruční zadání hodnoty. Pohled **Návrhy** je fronta přezkoumání: kliknutím na „Prohledat KPI" se spustí bezobslužný analytický průchod přes kontextovou mapu tvého projektu a stávající KPI a navrhne KPI s jednořádkovým odůvodněním a přesným způsobem měření, který by použil. Přijmeš (volitelně nejprve upravíš cíl) nebo odmítneš. Odmítnuté návrhy jsou archivovány a předány zpět budoucím prohledáváním jako záporné příklady, aby se stejný návrh neopakoval.

:::tip
Nech prohledávání navrhnout KPI, než je začneš ručně vytvářet. Čte kontextovou mapu tvého projektu, stávající cíle a seznam konektorů tvého vaultu — a má tendenci navrhovat měření, která jsou skutečně automatizovatelná s tím, co již máš připojeno.
:::
  `,

  "director-verdicts-and-categories": `
## Verdikty a kategorie Directora

Každé přezkoumání Directorem produkuje strukturovaný verdikt — ne jen prošel/neprošel, ale vrstvené hodnocení, které ti říká, co agent dělá dobře, co potřebuje koučink a jak tento koučink zařadit, aby skutečně zafungoval.

Povinnou součástí je **celkové skóre 0–5** s jednořádkovým shrnutím. Toto skóre se připojí k záznamu spouštění a zobrazí se jako hvězdičky v seznamu Aktivita — takže rychlý pohled na nedávné běhy libovolného agenta ti řekne, které z nich stály za své náklady. Skóre také pohání trendovou sparkline v tabulce Agents: krátký pruh historie zbarvený podle posledního hodnocení.

### Co funguje

Přezkoumání nezačíná kritikou. Před jakýmikoli koučovacími poznámkami Director vyzdvihuje věci, které agent skutečně dělá správně — co dokumenty nazývají **výhrami**. Ty se zobrazují v horní části úplného hodnocení v markdownu jako sekce „Co funguje". Agent, který podává dobré výkony, může dostat jen výhry; Director mlčí, když není co zlepšovat.

### Koučovací poznámky a kategorie

Po výhrách přicházejí koučovací poznámky: konkrétní, realizovatelné návrhy zařazené do jedné ze šesti **kategorií**:

- **Prompt** — instrukce nebo formulace agenta potřebují doladit
- **Zdraví** — problémy se spolehlivostí nebo zpracováním chyb
- **Spouštěče** — jak a kdy se agent spouští (plán, webhook, nastavení řetězu)
- **Přihlašovací údaje** — mezery ve vaultu nebo oprávněních blokující agenta
- **Paměť** — co agent ukládá a vybavuje (nebo selhává v tom)
- **Užitečnost** — zda je výstup agenta skutečně hodnotný pro jeho deklarovaný účel

Koučovací poznámky přistávají v tvé **frontě přezkoumání** jako položky, které schvalíš nebo odmítneš. To není jen administrativa: schvalování nebo odmítání poznámek učí Directora tvůj vkus. Příští přezkoumání si přečte, které poznámky jsi přijal/a a které jsi odmítl/a, takže zpětná vazba se kumuluje — Director se stále lépe ví, na čem ti u každého agenta záleží, a přestane navrhovat věci, které jsi již vyřadil/a.

Velitelské centrum Directora obsahuje souhrnný přehled **Problémy podle kategorie**, který sčítá koučovací poznámky napříč celou tvou flotilou, takže na úrovni portfolia vidíš, zda jsou mezery v přihlašovacích údajích tvým nejčastějším problémem nebo zda je kvalita promptů místem, kde většina agentů potřebuje pozornost.

:::tip
Zdraví agenti dosahují vysokého skóre a generují málo nebo žádné koučovací poznámky. Pokud agent konzistentně dostává hodnocení 4–5 bez čekajících položek k přezkoumání, je to signál nechat ho být a soustředit pozornost na ty s klesajícími trendy nebo nízkými skóre.
:::
  `,

  "director-momentum-and-stale-sweep": `
## Momentum Directora a Přehled zastaralých

Nad jednotlivými verdikty Director buduje pohled na úrovni portfolia toho, jak celá tvá flotila trenduje. Toto je longitudinální pohled — ne „co tento agent udělal v posledním běhu", ale „posunuje koučink jehlu napříč mými agenty v čase?"

### Scorecard

Velitelské centrum Directora se otevírá **scorecardou**, která na první pohled odpovídá na čtyři otázky: jaká část práce tvé flotily přinesla hodnotu (míra **přidané hodnoty**), jaké je průměrné skóre verdiktu napříč všemi agenty ve scope, jaké jsou **náklady na užitečný běh** a kolik agentů je momentálně ve scope. Pod hlavními KPI **pruh rozpisu hodnoty** rozloží míru přidané hodnoty do plné taxonomie výsledků — doručeno, částečné, blokováno, bez vstupu, nehodnoceno — takže vidíš, kde hodnota uniká, nejen zda uniká.

Graf **distribuce skóre 0–5** ukazuje, jak si vedou tvoji agenti s hvězdičkou na plné hodnoticí škále, s přerušovanou čarou označující průměr portfolia. Selektor období přezkoumání (7 / 30 / 90 dní) vymezuje celou scorecardou.

### Momentum

Pruh **momentum** odpovídá na nejdůležitější otázku portfolia: zlepšují se věci? Sečte, kolik agentů se **zlepšilo**, **udrželo** nebo **zhoršilo** oproti předchozímu přezkoumání. Zlepšující se flotila znamená, že koučink funguje; zhoršující se flotila znamená, že něco systémového potřebuje pozornost — změny modelů, odchylka přihlašovacích údajů, opotřebení promptů.

### Štítky pozornosti a třídění

Tabulka koučinku označí každého agenta ve scope **štítky pozornosti** na základě pravidel odvozených od klienta: čeká na první přezkoumání (nikdy nehodnocen), nízké skóre (≤ 2), klesající trend nebo zastaralé přezkoumání (nekoučováno déle než 14 dní). Pruh třídění pozornosti v horní části tabulky tyto příznaky shrne — N nových, N nízkých, N klesajících, N zastaralých — takže vidíš rozsah problému před tím, než s ním začneš pracovat.

Kliknutím na čip třídění se tabulka vyfiltruje na tento příznak. Po filtrování akce **Přezkoumat těchto N** spustí Director sekvenčně přesně přes tyto agenty — třídění vede přímo do akce.

### Přehled zastaralých

Tlačítko **Přehled zastaralých** přezkoumat každého agenta s hvězdičkou, který nebyl koučován více než 14 dní, jedním kliknutím. Zobrazí se pouze tehdy, když existují zastaralí agenti. Toto je rutinní průchod údržby: spusť ho jednou za měsíc a Director zachytí každého agenta, který se od posledního hodnocení odchýlil.

### Dlouhodobá paměť

S povoleným **Obsidian Brain** si Director před každým přezkoumáním přečte své vlastní dřívější poznámky o agentovi a nový verdikt zapíše do složky \`Director/\` ve tvém vaultu. Koučink se kumuluje místo opakování — Director nenavrhuje znovu věci, které již prozkoumal, a staví na tom, co jsi schválil/a a odmítl/a v čase.

:::tip
Přehled zastaralých a pruh třídění pozornosti jsou dva nejrychlejší způsoby, jak udržet velkou flotilu zdravou bez trávení času na agentech, kteří již fungují dobře. Použij pruh třídění pro nalezení agentů, kteří skutečně potřebují pozornost; použij přehled zastaralých, abys zajistil/a, že nic tiše neuniká bez přezkoumání.
:::
  `,
};
