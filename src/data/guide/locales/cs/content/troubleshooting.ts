export const content: Record<string, string> = {
  "common-error-messages": `
## Běžné chybové zprávy

Chybové zprávy mohou vypadat děsivě, ale většina z nich má jednoduchá řešení. Tento průvodce překládá nejčastější chyby do prostého jazyka a říká ti přesně, co dělat. Nemusíš rozumět technickým detailům — jen sladit chybu s opravou.

Většina chyb spadá do několika kategorií: problémy s přihlašovacími údaji, problémy s timeoutem a neshody formátu vstupu. Jakmile znáš vzory, troubleshooting se stává druhou přirozeností.

### Rychlý diagnostický checklist

:::checklist
- Zkontroluj, zda je API AI poskytovatele online a tvůj účet je aktivní
- Ověř zdraví přihlašovacích údajů v panelu Credentials (hledej červené/žluté indikátory)
- Přezkoumej rate limity — počkej minutu, pokud jsi poslal/a příliš mnoho požadavků
- Zkus manuální běh s jednoduchým testovacím vstupem pro izolaci problému
- Zkontroluj formát vstupu, pokud data pocházejí ze spouštěče nebo pipeline
:::

### Nejčastější chyby

- **„Authentication failed"** — tvůj přihlašovací údaj vypršel nebo byl zadán nesprávně. Jdi do \`Credentials\` a obnov nebo znovu zadej.
- **„Request timed out"** — AI poskytovateli to trvalo příliš dlouho na odpověď. Zkus to znovu, nebo zvyš timeout v nastavení agenta.
- **„Rate limit exceeded"** — udělal/a jsi příliš mnoho požadavků příliš rychle. Počkej minutu a zkus to znovu, nebo upgraduj plán poskytovatele.
- **„Invalid input format"** — data poslaná tvému agentovi nebyla v očekávaném formátu. Zkontroluj spouštěč nebo pipelinu krmící data tomuto agentovi.

### Jak to funguje

Když nastane chyba, objeví se v logu běhu s kódem a popisem. Klikni na chybu pro zobrazení podrobného vysvětlení a navrhované opravy. Mnoho chyb zahrnuje tlačítko \`Fix Now\`, které tě vezme přímo do nastavení, které vyžaduje pozornost.

:::tip
Nepanikař, když uvidíš chybu. Pečlivě si přečti zprávu — téměř vždy ti říká, co se pokazilo, a nasměruje tě k řešení.
:::
  `,

  "agent-not-responding": `
## Agent nereaguje

Pokud se tvůj agent zdá zamrznutý, zaseknutý nebo prostě neprodukuje výsledky, neboj se — obvykle je to jednoduchá oprava. Nejčastější příčiny jsou timeout připojení k AI poskytovateli, problém s přihlašovacím údajem nebo agent narážející na svůj maximální limit tahů. Drž se tohoto checklistu pro návrat na správnou cestu.

Většina problémů s nereagujícím agentem se vyřeší sama, když identifikuješ a opravíš podkladovou příčinu, což je téměř nikdy trvalý problém.

### Diagnostický checklist

:::steps
1. **Zkontroluj log běhu** — hledej chybové zprávy nebo varování, která vysvětlují zaseknutí
2. **Ověř svého AI poskytovatele** — ujisti se, že API tvého poskytovatele je online a tvůj účet je aktivní
3. **Zkontroluj přihlašovací údaje** — zajisti, že přihlašovací údaje agenta nevypršely
4. **Přezkoumej limity** — agent mohl narazit na své nastavení timeoutu nebo max turns
5. **Zkus manuální běh** — spusť agenta s jednoduchým testovacím vstupem pro izolaci problému
:::

### Jak to funguje

Otevři agenta a zkontroluj jeho nejnovější log běhu. Pokud ukazuje chybu, drž se opravy pro tu konkrétní chybu. Pokud log ukazuje, že agent stále běží, může zpracovávat obzvlášť složitý úkol. Zkontroluj nastavení timeoutu — pokud je příliš krátké, agent se může zastavovat, než skončí.

:::tip
Pokud je agent skutečně zaseknutý (žádný pokrok po několik minut), klikni \`Stop\` a pak zkus manuální běh s jednodušším vstupem. To ti pomůže určit, zda je problém ve vstupu nebo v agentovi samotném.
:::
  `,

  "credential-errors": `
## Chyby přihlašovacích údajů

Když se agent nemůže připojit ke službě, je to obvykle proto, že přihlašovací údaj vypršel, heslo bylo změněno nebo oprávnění bylo odvoláno. Tohle jsou nejčastější problémy v jakémkoli automatizačním systému a téměř vždy jsou rychlé na opravu.

Klíčem je identifikovat, který přihlašovací údaj způsobuje problém, pak ho obnovit nebo nahradit.

### Běžné příčiny

- **Vypršený token** — OAuth tokeny periodicky vyprší a potřebují obnovení
- **Změněné heslo** — pokud jsi změnil/a heslo jinde, aktualizuj ho i v Personas
- **Odvolaná oprávnění** — služba mohla odvolat přístup, který jsi původně udělil/a
- **Špatný přihlašovací údaj přiřazen** — agent může používat špatný přihlašovací údaj pro službu

### Jak to funguje

Zkontroluj chybovou zprávu v logu běhu — zmíní, která služba selhala. Jdi do \`Credentials\` a najdi přihlašovací údaj pro tu službu. Zkontroluj jeho stav zdraví. Pokud je červený nebo žlutý, klikni na něj pro zjištění, co je špatně, a drž se navrhované opravy — obvykle obnovení tokenu nebo opětovné zadání hesla.

:::tip
Nastav kontroly zdraví přihlašovacích údajů, aby běžely automaticky. Zachytí vypršující přihlašovací údaje předtím, než způsobí selhání agentů, proměňujíc potenciální krizi na rutinní údržbu.
:::
  `,

  "trigger-not-firing": `
## Spouštěč se nespouští

Spouštěč, který se nespouští, je frustrující, ale příčinou je obvykle něco drobného — překlep v konfiguraci, problém s časováním nebo chybějící oprávnění. Tento průvodce tě provede nejčastějšími viníky, abys mohl/a uvést své automatizace zpět do provozu.

Log spouštěče je tvůj nejlepší přítel tady. Zaznamenává každý pokus o aktivaci, včetně těch, které byly odfiltrovány nebo selhaly tiše.

### Diagnostické kroky

:::steps
1. **Zkontroluj log spouštěče** — otevři nastavení spouštěče agenta a klikni na kartu \`Log\` pro zobrazení každého pokusu, včetně selhání
2. **Ověř, že je spouštěč zapnutý** — hledej přepínač; vypnuté spouštěče se nespouští
3. **Zkontroluj filtry** — přezkoumej své filtrovací podmínky, které mohou být příliš striktní a blokovat všechny události
4. **Testuj manuálně** — použij tester spouštěčů pro simulaci události a ověření konfigurace
5. **Zkontroluj oprávnění** — potvrď, že file watchery mají přístup ke složkám a webhooky mají přístup k síti
:::

### Jak to funguje

Otevři nastavení spouštěče agenta a klikni na kartu \`Log\`. Každý pokus spouštěče je vypsán se stavem: spuštěno, odfiltrováno nebo selhalo. Klikni na libovolný záznam pro zjištění, proč se nespustil. Nejčastější zjištění je filtr, který je trochu příliš striktní — úprava obvykle vyřeší problém okamžitě.

:::tip
Při nastavování nového spouštěče začni bez filtrů. Jakmile potvrdíš, že se spouští správně, přidávej filtry jeden po druhém. Takhle víš, že každý filtr funguje, jak se očekává.
:::
  `,

  "self-healing-explained": `
## Samouzdravení vysvětleno

Když se během běhu agenta něco pokazí, samouzdravovací systém se pokusí problém opravit a automaticky to zkusit znovu. Je to jako mít záchrannou síť, která chytí většinu chyb dřív, než si jich vůbec všimneš. Běžné problémy jako dočasné síťové glitche, krátké výpadky API nebo rate limity jsou zvládány bez tvého zásahu.

Samouzdravení neznamená, že tvůj agent nikdy neselhává — znamená, že se zotaví z toho druhu malých, dočasných problémů, které by jinak vyžadovaly, abys ho manuálně restartoval/a.

### Klíčové body

- **Automatický retry** — přechodné chyby se opakují s chytrým backoff časováním
- **Klasifikace chyb** — systém rozlišuje mezi opravitelnými a neopravitelnými chybami
- **Obnovení přihlašovacích údajů** — vypršené tokeny se obnovují automaticky, kdykoli je to možné
- **Transparentní** — každá akce samouzdravení je logována, takže můžeš vidět, co se stalo

### Jak to funguje

Když nastane chyba, samouzdravovací systém ji vyhodnotí. Přechodné chyby (síťové timeouty, rate limity, dočasné výpadky) spouští automatický retry po krátkém čekání. Vypršení přihlašovacích údajů spouští pokus o automatické obnovení. Trvalé chyby (neplatná konfigurace, chybějící oprávnění) jsou ti hlášeny okamžitě, protože vyžadují tvou pozornost.

:::success
Když samouzdravení uspěje, agent pokračuje, jako by se nic nestalo. Log běhu označuje obnovenou chybu zeleným odznakem „healed", takže můžeš vidět, co bylo zachyceno a automaticky vyřešeno.
:::

:::tip
Občas zkontroluj log samouzdravení, abys viděl/a, co se zachycuje. Pokud se stejná chyba opakovaně uzdravuje, může to naznačovat podkladový problém, který stojí za trvalou opravu.
:::
  `,

  "checking-system-health": `
## Kontrola zdraví systému

Vestavěná kontrola zdraví prohledá celou tvou instalaci Personas a hlásí jakékoli problémy — zastaralé komponenty, chybějící soubory, problémy s konfigurací nebo problémy s konektivitou. Spusť ji, kdykoli něco působí divně, pro rychlé posouzení celkového stavu tvého systému.

Ber to jako návštěvu u lékaře pro tvé nastavení Personas. Rychlá prohlídka může zachytit malé problémy předtím, než se stanou velkými.

### Co kontroluje

- **Verze aplikace** — zda běžíš nejnovější verzi
- **Integrita databáze** — tvé lokální datové soubory jsou nedotčené a zdravé
- **Stav přihlašovacích údajů** — všechny uložené přihlašovací údaje jsou platné a fungují
- **Konektivita poskytovatele** — tví AI poskytovatelé jsou dosažitelní a odpovídají
- **Cloudové připojení** — připojení k tvému orchestrátoru je aktivní (pokud je nakonfigurované)

### Jak to funguje

Jdi do \`Settings > System Health\` a klikni \`Run Health Check\`. Sken zabere několik sekund a produkuje report. Zelené položky jsou zdravé, žluté položky brzy vyžadují pozornost a červené položky vyžadují okamžitou opravu. Každá položka zahrnuje popis problému a navrhovanou opravu.

:::tip
Spusť kontrolu zdraví po instalaci aktualizací, po problémech s konektivitou nebo před nasazením kritického agenta. Trvá to jen sekundy a dává ti klid mysli.
:::
  `,

  "log-files-and-debugging": `
## Soubory logů a ladění

Soubory logů jsou jako černá skříňka pro tvou instalaci Personas. Zachycují vše, co se stalo — běhy agentů, systémové události, chyby a další — v podrobném chronologickém pořadí. Když se něco pokazí a log běhu nestačí, tyto soubory obsahují plný příběh.

Nemusíš číst logy pravidelně, ale vědět, kde jsou a jak je používat, je neocenitelné při troubleshootingu složitého problému.

### Klíčové body

- **Automatické logování** — vše je zaznamenáno, aniž bys zapínal/a cokoli
- **Organizováno podle data** — události každého dne jsou v samostatném souboru pro snadné procházení
- **Prohledávatelné** — najdi konkrétní události podle klíčového slova, data nebo úrovně závažnosti
- **Sdílitelné** — pokud kontaktuješ podporu, můžeš sdílet relevantní výňatky logů

### Jak to funguje

Soubory logů jsou uloženy lokálně na tvém počítači. Přistupuj k nim z \`Settings > Logs\` nebo naviguj přímo do složky logů. Každý soubor pokrývá jeden den a obsahuje záznamy s časovými značkami. Použij vestavěný prohlížeč logů pro vyhledávání, filtrování a procházení. Pro žádosti o podporu tlačítko \`Export Log\` vytváří sdílitelný výňatek.

:::tip
Při kontaktování podpory o problému zahrn relevantní výňatek logu. Dramaticky to urychluje proces troubleshootingu, protože tým podpory může vidět přesně, co se stalo.
:::
  `,

  "resetting-to-defaults": `
## Reset na výchozí nastavení

Pokud jsi změnil/a nastavení a nemůžeš zjistit, co způsobuje problém, reset na výchozí ti dá čistý výchozí bod. To resetuje pouze tvé preference a konfigurační nastavení — tví agenti, přihlašovací údaje, paměti a data jsou všechna zachována. Nic důležitého se neztrácí.

Ber to jako obnovení místnosti do jejího původního uspořádání. Všechen tvůj majetek (agenti a data) zůstává, ale nábytek (nastavení) jde zpět tam, kde začal.

:::warning
Reset vymaže všechny customizované preference v jedné akci. To zahrnuje tvé téma, výchozí model, nastavení notifikací a klávesové zkratky. Tví agenti, přihlašovací údaje, paměti a data nejsou ovlivněna — ale jakékoli pečlivě naladěné preference budou muset být překonfigurovány manuálně poté.
:::

### Co se resetuje

- **Preference zobrazení** — téma, rozvržení, šířka postranního panelu a vizuální nastavení
- **Výchozí model** — vrací se na doporučené výchozí
- **Nastavení notifikací** — reset na standardní chování notifikací
- **Klávesové zkratky** — obnoveny na původní kombinace kláves

### Co zůstává v bezpečí

- Všichni tví **agenti** a jejich prompty, historie a konfigurace
- Všechny tvé **přihlašovací údaje** v trezoru
- Všechny tvé **paměti**, testovací výsledky a logy běhů
- Všechny tvé **pipeliny** a týmové konfigurace

### Jak to funguje

Jdi do \`Settings > Advanced > Reset to Defaults\`. Přezkoumej, co se resetuje, pak klikni \`Confirm\`. Tvá nastavení se vrací na své továrenské hodnoty, zatímco veškerá tvá práce je zachována. Pak můžeš překonfigurovat nastavení jedno po druhém pro identifikaci, která změna způsobovala problém.

:::tip
Před resetem si poznamenej jakákoli nastavení, která jsi záměrně customizoval/a. Takhle můžeš rychle obnovit ta, která chceš, poté co reset opraví tvůj problém.
:::
  `,
};
