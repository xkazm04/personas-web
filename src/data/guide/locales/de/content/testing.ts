export const content: Record<string, string> = {
  "why-test-your-agents": `
## Warum solltest du deine Agenten testen?

Testen ist, wie du Agenten vertrauenswürdig hältst, während du iterierst. Jede Prompt-Bearbeitung, jeder Modellwechsel, jedes neue Tool, das du hinzufügst, verändert das Verhalten des Agenten auf eine Weise, die du nicht allein durchs Lesen des Diffs vorhersagen kannst. Testen verwandelt diese Unsicherheit in Evidenz: lass die neue Version gegen repräsentative Eingaben laufen, vergleiche mit der vorherigen Version, sieh, ob du die Dinge verbessert hast, die du verbessern wolltest, und nichts verschlechtert, was du nicht verschlechtern wolltest.

Der Lab-Tab im Editor jedes Agenten ist der Ort, wo das passiert. Er hat vier Modi — Arena, A-B, Matrix, Eval — jeder beantwortet eine andere Frage. Arena vergleicht Modelle auf demselben Prompt. A-B vergleicht zwei Prompts auf demselben Modell. Matrix testet Kombinationen von Prompt-Komponenten. Eval ist das volle Gitter: jeder Prompt × jedes Modell.

### Wichtige Punkte

- **Regressionen früh abfangen** — nach jeder Änderung zu testen ist, wie du "der Agent hat funktioniert, was habe ich kaputt gemacht?" vermeidest
- **Alternativen systematisch vergleichen** — Arena und A-B lassen dich zwischen Optionen mit Evidenz statt Bauchgefühl wählen
- **Fitness-Daten generieren** — Lab-Läufe sammeln Pro-Prompt-Werte, die die Genome-Evolution speisen (Builder-Tier)
- **Wiederverwendbare Eingabesätze** — Testeingaben werden pro Agent gespeichert; gleiche Prompts, gleiche Daten, wiederholbare Vergleiche

### So funktioniert es

Jeder Lab-Modus versendet dieselbe Trigger-Nutzlast an mehrere Agenten-Varianten (verschiedene Prompts, verschiedene Modelle oder beides) parallel. Ausgaben werden nebeneinander mit quantitativen Metadaten (Dauer, Kosten, Token-Anzahl) und deinen subjektiven Bewertungsknöpfen präsentiert. Die Ergebnisse landen im Test-Verlauf des Agenten und fließen in das Fitness-Scoring ein.

:::tip
Der günstigste Moment, eine Prompt-Regression abzufangen, ist direkt nachdem du sie geschrieben hast. Mach Lab → A-B gegen die vorherige Prompt-Version zur Gewohnheit bei jeder Prompt-Bearbeitung; die Reibung ist viel niedriger als das Entdecken einer Regression in Produktivläufen drei Tage später.
:::
  `,

  "the-testing-lab-overview": `
## Das Testing-Lab im Überblick

Der Lab-Tab im Editor jedes Agenten ist ein Arbeitsbereich mit vier Modi. Wähle den Modus nach dem, was du lernen willst:

### Die vier Modi

:::compare
**Arena**
Gleicher Prompt, mehrere Modelle. Sendet eine Eingabe parallel durch Claude / GPT / Gemini / lokal. Am besten für "welches Modell ist das richtige für diesen Agenten?"
---
**A-B**
Zwei Prompts, gleiches Modell. Vergleiche eine Prompt-Änderung mit ihrem Vorgänger unter identischen Bedingungen. Am besten für "hat diese Bearbeitung die Dinge verbessert?"
---
**Matrix**
Kombinatorisch. Definiere Prompt-Komponenten, und die Matrix testet jede Kombination (3 × 4 = 12 Varianten). Am besten für "ich habe mehrere konkurrierende Ideen — welche Kombination gewinnt?"
---
**Eval**
Volles Gitter: N Prompts × M Modelle. Das vollständige Bild, wenn du Prompt *und* Modell zusammen optimieren willst. Am besten, wenn eine größere Änderung auf dem Tisch liegt.
:::

### So funktioniert es

Jeder Modus teilt denselben Eingabe-Picker (manuelle Eingabe, ein Einfügen von strukturiertem JSON oder Wiedergabe einer echten vergangenen Ausführung aus dem Verlauf dieses Agenten) und dieselbe Bewertungs-UI. Ausgabe-Spalten klappen für den vollständigen Trace (Modellaufruf, Tool-Aufrufe, Entscheidungszweige) auf, genau wie eine reguläre Ausführung. Ergebnisse werden im Test-Verlauf mit dem getaggten Testmodus gespeichert, sodass du vergangene Tests nach Modus durchsuchen kannst.

Bei verketteten Agenten testet das Lab nur diesen Agenten — der Upstream wird mit der von dir angegebenen Eingabe gemockt, damit du an einer Stufe einer Pipeline iterieren kannst, ohne die ganze Chain neu auszuführen.

:::tip
In den meisten Wochen reichen Arena und A-B. Matrix ist für "ich habe drei plausible Refaktorierungen und will sie vergleichen", Eval ist für "ich erwäge eine größere Umschreibung oder einen Tier-Wechsel". Greife nicht standardmäßig zum schweren Modus — die günstigeren sind meist ausreichend.
:::
  `,

  "arena-testing": `
## Arena-Tests

Arena sendet denselben Prompt und dieselbe Eingabe an mehrere Modelle parallel und legt dann die Ergebnisse nebeneinander aus. Kosten und Dauern werden neben den Ausgaben angezeigt, sodass du auf drei Achsen vergleichst — Qualität (dein Urteil), Geschwindigkeit (Engine-gemessen) und Kosten (Token für Token).

Die häufigste Verwendung ist die Modellauswahl-Entscheidung: "dieser Agent läuft auf Sonnet 4.6, würde Haiku 4.5 für 1/30 der Kosten standhalten?" Arena beantwortet das in einem Test statt in Wochen der Produktivbeobachtung.

### Wichtige Punkte

- **Paralleler Versand** — alle Modelle laufen gleichzeitig; gesamte Wanduhrzeit = das langsamste, nicht die Summe
- **Side-by-side-Ausgaben** — die vollständige Ausgabe jedes Modells ist sichtbar, ohne Tabs zu wechseln
- **Kosten + Dauer angezeigt** — unter jeder Ausgabe, in derselben Ansicht wie der Text
- **Bewertungs-UI pro Spalte** — Daumen hoch / Daumen runter / Stern pro Modell; Bewertungen persistieren in die Fitness-Daten des Agenten
- **Replay aus dem Verlauf** — Arena-Tests können Eingaben aus jeder vergangenen Ausführung dieses Agenten ziehen, sodass du auf echter Form testest

### So funktioniert es

Arena versendet eine Ausführung pro ausgewähltem Modell mit der aktuellen Prompt- und Tool-Konfiguration des Agenten. Jede Ausführung ist unabhängig (separater Trace, separate Kostenabrechnung) und mit \`arena\` getaggt, sodass sie nicht gegen die normalen Produktivmetriken des Agenten zählt. Ergebnisse erscheinen als Spalten; du bewertest jede Spalte; Bewertungen fließen in die Pro-Modell-Fitness-Daten für diesen Agenten ein.

:::tip
Wähle maximal 3 Modelle pro Arena-Lauf. Mehr als das, und das nebeneinander lesen wird unhandlich. Wenn du 5+ Modelle in Betracht ziehst, führe mehrere Arenas paarweise durch und behalte eine mentale Notiz darüber, welche Modelle jede Runde gewonnen haben.
:::
  `,

  "ab-testing-prompts": `
## A-B-Tests für Prompts

A-B führt dieselbe Eingabe durch zwei Prompt-Varianten auf demselben Modell aus, sodass die einzige Variable der Prompt ist. Das ist das richtige Werkzeug, um eine Prompt-Bearbeitung zu bewerten: lade die vorherige Version als A, die neue Version als B, lass auf repräsentativen Eingaben laufen, und sieh, welche das Ergebnis produziert, das du willst.

Der Versionen-Picker des Labs integriert sich mit dem Versionsverlauf des Prompts — du musst die alte Version nicht kopieren und einfügen, sondern wählst sie einfach aus dem Dropdown. Das macht "vergleiche meinen aktuellen Entwurf mit der funktionierenden Version letzter Woche" zu einer Ein-Klick-Einrichtung.

### Wichtige Punkte

- **Zwei Prompts, ein Modell, eine Eingabe** — Vergleich mit einer Variablen
- **Aus dem Versionsverlauf wählen** — A oder B kann jede vergangene Version des Prompts dieses Agenten sein
- **Gleiche Trace-Treue** — beide Varianten erhalten vollständige Ausführungs-Traces, sodass du Tool-Aufruf-Muster vergleichen kannst, nicht nur die finale Ausgabe
- **Mehrere Eingaberunden** — lasse das A-B nacheinander gegen mehrere verschiedene Eingaben laufen, um Generalisierung zu testen, nicht nur einen glücklichen Fall
- **Bewertung persistiert in Fitness** — A-B-Bewertungen speisen dieselben Fitness-Daten, die Arena und Genome nutzen

### So funktioniert es

Die A-B-Engine versendet beide Prompts als unabhängige Ausführungen und kennzeichnet sie als A und B im Ergebnisbereich. Darüber hinaus sind sie reguläre Ausführungen — gleicher Trace, gleiche Kostenabrechnung, aber mit \`ab_test\` getaggt, sodass sie im Test-Verlauf filterbar sind und die Produktivmetriken nicht verschmutzen.

:::code-compare
### Version A
Summarize the document.
Keep it short.
---
### Version B
Summarize the document in exactly
3 bullet points. Each bullet should
be one sentence. Start with the
most important finding.
:::

:::warning
Ändere pro A-B-Runde eine Sache. Wenn sich B von A in *sowohl* Format *als auch* Ton *als auch* Länge unterscheidet, kannst du nicht sagen, welche Dimension die Bewertungsänderung verursacht hat. Mach eine Änderung, lass A-B laufen, akzeptiere oder verwerfe, dann mach die nächste Änderung.
:::
  `,

  "matrix-testing": `
## Matrix-Tests

Matrix ist kombinatorisches A-B-C-D-… alles auf einmal. Du definierst deinen Prompt als Komponenten (Intro × Anweisungen × Ausgabeformat zum Beispiel), und die Matrix generiert jede Kombination, versendet sie alle und rangiert die Ergebnisse nach Fitness-Score.

Mit 3 Komponenten zu je 3 Optionen sind das 27 Kombinationen — weit mehr, als du manuell testen würdest, aber für die Engine einfach parallel auszufächern. Die Matrix ist am nützlichsten, wenn du mehrere konkurrierende Ideen hast, wie du einen Prompt strukturieren sollst, und herausfinden willst, welche Kombination tatsächlich am besten abschneidet, statt die zu nehmen, die du erraten hast.

### Wichtige Punkte

- **Komponenten definieren, Kombinationen bekommen** — die Matrix expandiert die Komponenten in alle gültigen Kombinationen
- **Paralleler Versand** — jede Kombination läuft gleichzeitig (unter Berücksichtigung der Rate-Limits des Anbieters)
- **Gereihte Ergebnisse** — fitness-bewertetes Gitter, sortiert von best zu schlechtesten
- **Komponentenebene-Zuordnung** — sieh, welche Komponenten mit hohen Bewertungen korrelieren; nützlich, selbst wenn du den Top-Gewinner nicht wortwörtlich übernimmst
- **Gewinnende Kombination speichern** — Ein-Klick, um die gewinnende Kombination als aktiven Prompt des Agenten zu setzen

### So funktioniert es

Du definierst jede Komponente als beschrifteten Satz von Varianten im Matrix-Tab. Die Engine konstruiert jede Kombination als renderbaren Prompt und versendet jede als unabhängige Ausführung. Die Ergebnisse werden zu einem Gitter aggregiert, gereiht nach deinem gewählten Fitness-Signal (Bewertung, Kosten-pro-Qualität, Geschwindigkeit, benutzerdefiniert). Die Zuordnung auf Komponentenebene wird berechnet, indem die Fitness über Kombinationen gemittelt wird, die diese Komponente teilen — sodass du, selbst wenn kein einziger Gewinner heraussticht, erfährst, welches Intro / welcher Anweisungsstil / welches Ausgabeformat im Schnitt am besten abschneidet.

:::info
Mit 3 Komponenten × 3 Optionen = 27 Varianten. Mit 4 × 4 = 256. Die Matrix kann große Gitter handhaben, aber du verbrennst Tokens proportional. Beginne mit 3 × 3 und erweitere nur, wenn das Ergebnis wirklich mehrdeutig ist.
:::

:::tip
Matrix ist am nützlichsten direkt nach einer größeren Umgestaltung des Prompts. Wenn du nicht sicher bist, ob die neue Struktur besser ist als die alte, teste matrixweise 3-4 Kandidatenstrukturen gegen einige repräsentative Eingaben — der Gewinner ist meist klarer, als du erwarten würdest.
:::
  `,

  "eval-testing": `
## Eval-Tests

Eval ist das volle Gitter: jede Prompt-Variante × jedes Modell. Du wählst die Prompts (typischerweise 2-3 Kandidaten), wählst die Modelle (typischerweise 2-4), und das Eval-Gitter lässt alle Kombinationen laufen und präsentiert eine Heatmap der Werte. Das beste Prompt-Modell-Paar wird hervorgehoben.

Das ist der Schwergewicht-Modus — am teuersten in Tokens, am gründlichsten in der Abdeckung. Nutze ihn, wenn du eine größere Entscheidung triffst, die beide Achsen betrifft: "wir überlegen, den Prompt umzuschreiben und auf ein günstigeres Modell zu wechseln, können wir beides auf einmal und trotzdem unsere Qualitätslatte erreichen?"

### Wichtige Punkte

- **N Prompts × M Modelle** — Heatmap der Werte über beide Dimensionen
- **Beste Kombination hervorgehoben** — fitness-gereiht, mit der optimalen Zelle visuell hervorgehoben
- **Aufschlüsselung pro Achse** — sieh, ob die Prompt-Änderung oder die Modell-Änderung die Bewertungsänderung getrieben hat
- **Mit Tag im Test-Verlauf** — Eval-Läufe landen im Verlauf unter dem \`eval\`-Tag für späteres Review
- **Ein-Klick-Übernahme** — wende die beste Kombination (Prompt-Version + Modellauswahl) auf den Live-Agenten an

### So funktioniert es

Eval versendet \`Prompts × Modelle\`-Ausführungen parallel (unter Berücksichtigung der Rate-Limits des Anbieters). Jede Zelle ist eine unabhängige Ausführung mit eigenem Trace. Die Gitter-Ansicht aggregiert nach Prompt-Modell-Paar; du bewertest Zellen mit derselben UI wie Arena und A-B; Fitness-Werte rollen zu Pro-Zellen-Ranking hoch. Die obere Zelle ist die empfohlene Kombination — übernimm sie direkt aus der Gitter-Ansicht.

:::warning
Eval ist der teuerste Modus. 3 Prompts × 4 Modelle × 5 Eingaben = 60 Ausführungen, jede mit eigenem Modellaufruf. Setze sparsam ein, auf repräsentativen Eingabesätzen, und nur, wenn die Entscheidung wirklich beide Achsen kreuzt. Für nur-Prompt-Entscheidungen, A-B; für nur-Modell-Entscheidungen, Arena.
:::
  `,

  "rating-and-scoring-results": `
## Ergebnisse bewerten und einstufen

Nach jedem Lab-Test hat jede Ausgabezeile Bewertungs-Steuerelemente: Daumen hoch / Daumen runter für binäre Beurteilung, oder eine 1-5-Stern-Skala für nuancierte Fälle. Deine Bewertungen speisen zwei Dinge: den Pro-Variante-Fitness-Score des Agenten (verwendet für Ranking in Matrix und Eval, und als Genome-Evolution-Selektionsdruck im Builder-Tier) und ein persönliches Präferenz-Signal über all deine Tests über die Zeit hinweg.

Die Bewertungen sind persönlich — sie kodieren dein Qualitätsurteil, keine objektive Metrik. Das ist beabsichtigt; du bist derjenige, der weiß, ob die Ausgabe des Agenten dem entspricht, was du brauchst, und das ist das Signal, gegen das das System optimiert.

### Wichtige Punkte

- **Binär oder 1-5 Sterne** — wähle die Skala, mit der du konsistent bleiben kannst
- **Bewertung pro Ausgabe** — jede Testausgabe bekommt ihre eigene Reihe Bewertungs-Steuerelemente; nichts wird automatisch aggregiert, bis du bewertest
- **Treibt Fitness-Werte** — Bewertungen speisen das Pro-Variante-Fitness-Signal, das Matrix / Eval / Genome nutzen
- **Feedback-Verlauf persistiert** — jede Bewertung, die du je gegeben hast, wird gespeichert; nützlich für "habe ich X höher als Y in vergangenen Tests bewertet?"
- **Konsistenz zählt mehr als Präzision** — ein 4-Sterne-Wert, den du konsistent geben würdest, ist nützlicher als ein 5-Sterne-Wert, den du einmal gibst und nie wieder

### So funktioniert es

Bewertungen werden gegen die spezifische Ausführung (Trace, Prompt-Version, Modell, Eingabe) gespeichert. Der Fitness-Aggregator liest Bewertungen + objektive Metriken (Kosten, Dauer, Erfolg) und berechnet einen Pro-Variante-Fitness-Score, der im Ranking verwendet wird. Genome-Evolution (Builder-Tier) nutzt Bewertungen als primären Selektionsdruck für die Wahl der Eltern-Prompts zum Züchten.

:::tip
Bewerte basierend darauf, was du tatsächlich willst, nicht was technisch beeindruckend ist. Eine kurze korrekte Antwort schlägt oft eine lange ausgefeilte. Das System optimiert gegen deine Präferenzen, sodass ehrliche, konsistente Bewertungen Agenten produzieren, die auf *dein* Urteil abgestimmt sind.
:::
  `,

  "genome-evolution-basics": `
## Grundlagen der Genome-Evolution

Die Genome-Evolution (Builder-Tier) züchtet automatisch neue Prompt-Varianten aus deinen am besten bewerteten vergangenen Tests. Jede "Generation" mutiert und rekombiniert die leistungsstärksten Prompts aus der vorherigen Generation; über mehrere Generationen konvergieren die Prompts auf Konfigurationen, die konsistent besser abschneiden als dein Ausgangspunkt. Das ist Evolutionssuche mit deinen Bewertungen als Fitness-Funktion.

Der Prozess ist unbeaufsichtigt, sobald du ihn startest. Du gibst den Start-Prompt und das Fitness-Signal an (typischerweise dein Bewertungsverlauf plus optionale objektive Metriken wie Kosten oder Dauer), setzt die Populationsgröße und die Generationenanzahl, und lässt es laufen. Die normalen Trigger des Agenten bleiben während der Evolution pausiert, damit der Vergleich sauber bleibt.

:::info
Die Genome-Evolution ist unbeaufsichtigt, sobald sie gestartet ist. Du setzt die Parameter, die Engine erstellt Variationen, testet sie gegen deinen Eingabesatz, bewertet sie nach deinen Bewertungen und rekombiniert die Gewinner in die nächste Generation. Du überprüfst die finale Population und übernimmst den Gewinner manuell — das System ändert nie still deinen Live-Prompt.
:::

### Wichtige Punkte

- **Automatische Variation + Selektion** — die Engine generiert Mutationen der leistungsstärksten Eltern und selektiert über Fitness
- **Generationen + Populationen** — typische Konfiguration ist 5-10 Generationen zu je 8-12 Varianten
- **Fitness-Funktion = deine Bewertungen** — primäres Signal; sekundäre Signale (Kosten, Dauer) sind konfigurierbare Gewichtungen
- **Alle Generationen versioniert** — jeder generierte Prompt wird im Versionsverlauf des Agenten bewahrt; nichts geht verloren
- **Manuelle Übernahme** — die Engine tauscht deinen Live-Prompt nie still aus; du überprüfst und übernimmst den Gewinner

### So funktioniert es

Jede Generation startet mit einer Eltern-Population. Die Engine generiert Kind-Varianten über kleine strukturierte Mutationen (Umformulieren, Umordnen von Abschnitten, Anpassen von Beispielen usw.) und Crossover (Kombinieren von Segmenten aus zwei Eltern). Jedes Kind läuft gegen deinen Eingabesatz; Bewertungen produzieren den Fitness-Score; die am höchsten bewerteten Kinder werden zur Eltern-Population der nächsten Generation. Nach der konfigurierten Anzahl von Generationen siehst du die finale gereihte Population und kannst jede Variante übernehmen.

### In Aktion

:::usecases
**E-Mail-Triage-Tuning**
Aktueller Prompt klassifiziert 15 % der E-Mails falsch
---
Lasse 5 Generationen von Population 10 laufen. Lande bei einer Variante, die 3 % falsch klassifiziert — mit einem Klick übernehmen.
===
**Format-Konsistenz**
Das Ausgabeformat des Agenten ist über Eingabeformen hinweg inkonsistent
---
Genome entwickelt sich auf einem diversen Eingabesatz mit Format-Konformität als Fitness-Signal; die Ausgabe stabilisiert sich.
===
**Kostenreduktion ohne Qualitätsverlust**
Du willst einen schlankeren Prompt finden, der trotzdem gute Ausgaben produziert
---
Füge Kosten-pro-Token zur Fitness-Funktion mit negativem Gewicht hinzu; die Evolution findet kürzere Prompts, die die Bewertung halten.
:::

:::info
Jede während der Evolution erstellte Variante wird im Prompt-Verlauf des Agenten versioniert. Wenn die übernommene Variante N+1 sich in der Produktion schlecht verhält, ist die Wiederherstellung von Variante N ein Klick — keine Arbeit ist verloren.
:::

:::tip
Geduld zahlt sich aus. Generation 1 ist meist nicht dramatisch besser als dein Start-Prompt — die Mutationen sind klein, und viele sind Nieten. Bei Generation 3-4 konzentriert sich die überlebende Population auf die tatsächlichen Verbesserungen; das ist typischerweise, wenn du einen klaren Gewinner siehst.
:::
  `,

  "running-a-breeding-cycle": `
## Einen Zuchtzyklus durchführen

Ein "Zuchtzyklus" ist ein vollständiger Evolutionslauf: Agent auswählen, Parameter setzen, starten, warten, Population überprüfen, übernehmen. Jeder Zyklus ist N Generationen von M Varianten, die gegen deinen gewählten Eingabesatz getestet werden. Die Gesamtkosten betragen ungefähr \`Generationen × Population × Eingabe-Anzahl × Kosten-pro-Lauf\` — vorhersagbar aus den Parametern.

Der Genome-Tab im Lab ist der Einstiegspunkt. Er öffnet mit Standardparametern, die für einen repräsentativen Ausgangspunkt abgestimmt sind (5 Generationen × 10 Varianten × 5 Eingaben), was genug ist, um eine bedeutsame Veränderung zu sehen, ohne übermäßig Tokens zu verbrennen. Passe die Parameter vor dem Start an, wenn du einen schwereren oder leichteren Zyklus willst.

:::steps
1. **Öffne Lab → Genome** am Agenten, den du entwickeln willst
2. **Wähle den Eingabesatz** — manuelle Eingabe, ein gespeicherter Satz oder Replay-aus-Verlauf
3. **Konfiguriere Fitness-Gewichte** — Bewertungsgewicht (primär), Kostengewicht (negativ, wenn du kürzer willst), Dauergewicht (negativ, wenn du schneller willst)
4. **Setze Generationen und Population** — 5 × 10 ist der Standard; erhöhe beides für schwerere Probleme, senke beides für schnelle Experimente
5. **Klicke Start Cycle** — die Engine läuft unbeaufsichtigt; du kannst die App offen lassen oder später zurückkommen
6. **Überprüfe die finale Population** — gereiht nach Fitness, mit Trace jeder Variante verfügbar
7. **Übernimm den Gewinner** — oder jede andere Variante, die du bevorzugst; der aktive Prompt des Agenten wird aktualisiert, und die vollständige Population des Zyklus bleibt im Versionsverlauf bewahrt
:::

### So funktioniert es

Jede Generation läuft parallel: die Engine versendet alle M Varianten gleichzeitig (unter Berücksichtigung der Rate-Limits des Anbieters) über den Eingabesatz, sammelt Ergebnisse, bewertet sie über die Fitness-Funktion, wählt Top-Performer als Eltern, generiert Kinder für die nächste Generation und fährt fort. Die Fortschritts-UI zeigt die Live-Best- und Durchschnittsfitness pro Generation, sodass du sehen kannst, ob sich die Population verbessert.

:::tip
Beginne mit einem kleinen Eingabesatz (3-5 repräsentative Fälle) und dem Standard-Zyklus 5 × 10. Wenn das Ergebnis klar verbessert ist, bist du fertig. Wenn es mehrdeutig ist, erweitere den Eingabesatz und lasse einen weiteren Zyklus laufen, der mit dem vorherigen Gewinner startet. Iterieren von Zyklen schlägt oft einen riesigen Zyklus.
:::
  `,

  "adopting-evolved-prompts": `
## Entwickelte Prompts übernehmen

Wenn ein Zuchtzyklus endet, siehst du die finale Population gereiht nach Fitness mit der oberen Variante hervorgehoben. Das Übernehmen ist ein Klick — die Variante wird zum aktiven Prompt des Agenten, der vorherige aktive Prompt wird im Versionsverlauf bewahrt (sodass das Rollback ebenfalls ein Klick ist), und die vollständige Population des Zyklus wird ebenfalls bewahrt, falls du später eine andere Variante übernehmen willst.

Die Adopt-Aktion führt denselben Pre-flight-Check wie jede andere Prompt-Änderung aus: Setup-Status verifiziert, dass Zugangsdaten und Tools des Agenten noch gültig sind, die Version wird im Verlauf gespeichert, und wenn der Agent geplante Trigger hat, nutzt der nächste geplante Lauf automatisch die übernommene Variante.

### Wichtige Punkte

- **Ein-Klick-Übernahme** aus der gereihten Populations-Ansicht
- **Vorherige Version bewahrt** im Verlauf; Wiederherstellung ist auch ein Klick
- **Vollständige Population bewahrt** — jede Variante aus dem Zyklus bleibt später übernehmbar
- **Pre-flight-Check läuft** — Setup-Status-Verifizierung, Zugangsdaten-Validierung, Trigger-Kompatibilität
- **Live-Trigger nutzen automatisch die neue Variante** — kein separater "Deploy"-Schritt

### So übernimmst du

:::steps
1. **Warte, bis der Zuchtzyklus endet** — meist 10-30 Minuten je nach Parametern
2. **Öffne die Ansicht der finalen Population** — Varianten gereiht nach Fitness mit Traces pro Variante zugänglich
3. **Lies den Prompt der oberen Variante** — schnelle Plausibilitätsprüfung auf unerwartete Formulierungen oder seltsame Mutationen
4. **Inspiziere optional die zweit-/drittplatzierten Varianten** — manchmal hat eine etwas niedrigere Fitness einen viel kürzeren / saubereren Prompt
5. **Klicke Adopt** auf deine Wahl; der Pre-flight-Check läuft; der aktive Prompt des Agenten aktualisiert atomar
6. **Verifiziere den nächsten Live-Lauf** — meist ist ein manueller Lauf mit einer repräsentativen Eingabe die günstigste Bestätigung, dass die übernommene Variante sich so verhält, wie die Testwerte versprachen
:::

:::tip
Lies die übernommene Variante, bevor du auf Adopt klickst. Die Evolution findet hochfitte Prompts, aber gelegentlich erzielt eine Variante hohe Werte, indem sie eine Eigenheit deines Eingabesatzes ausnutzt; den Prompt zu lesen ist der Sicherheitscheck, der "das würde meine Tests auch bestehen, ist aber seltsam" abfängt.
:::
  `,

  "fitness-scoring-explained": `
## Fitness-Bewertung erklärt

Fitness ist die einzelne Zahl, die die Matrix-/Eval-/Genome-Selektion antreibt. Sie kombiniert deine manuellen Bewertungen (primäres Signal) mit objektiven Metriken (Kosten, Dauer, Erfolgsrate, Konformität mit Ausgabelängenziel, benutzerdefinierte Signale) zu einem gewichteten Wert. Du konfigurierst die Gewichtungen pro Agent oder pro Test — standardmäßig dominieren Bewertungen, und objektive Metriken sind Tiebreaker.

Der Wert wird pro Variante pro Eingabe berechnet, dann über alle Eingaben im Testsatz aggregiert, um eine Fitness pro Variante zu produzieren. Varianten werden nach aggregierter Fitness gereiht; dieses Ranking ist das, was der Genome-Selektionsalgorithmus konsumiert und was die Lab-UI verwendet, um Gewinner hervorzuheben.

### Wichtige Punkte

- **Einzelner aggregierter Wert pro Variante** — typischerweise 0,0–1,0 oder 0–100 je nach Anzeigepräferenz
- **Mehrere Eingabequellen** — Bewertung (primär), Kosten, Dauer, Erfolg, Ausgabeformat-Konformität, benutzerdefinierte Fitness-Funktionen
- **Pro-Agent-Gewichte** — betone, was zählt; bei kostensensiblen Agenten gewichte Kosten mehr; bei qualitätssensiblen mehr die Bewertung
- **Aggregation über Eingaben** — Varianten werden pro Eingabe bewertet und dann gemittelt, sodass eine Variante, die bei einer Eingabe brillant und bei einer anderen kaputt ist, schlechter abschneidet als eine konstant mittelmäßige
- **Transparente Aufschlüsselung** — klicke auf jede Fitness-Zahl, um die Pro-Signal-Beiträge zu sehen

### So funktioniert es

Der Fitness-Aggregator liest Ausführungsergebnisse (Kosten, Dauer, Erfolg), Bewertungsverlauf (pro Ausführung) und alle benutzerdefinierten Fitness-Signale, die für den Agenten registriert sind. Jedes wird auf einen 0-1-Bereich normalisiert, mit seinem konfigurierten Gewicht multipliziert und summiert. Das Ergebnis ist die Fitness der Variante; das Aggregat über alle Eingaben im Testsatz ist der angezeigte Wert.

:::tip
Die Standardgewichte (90 % Bewertung, 10 % Kosten) sind für die meisten Agenten abgestimmt. Wenn du dich mit den "Gewinnern" des Systems in Eval-/Matrix-Tests nicht einig bist, ist die nützlichste Anpassung meist, das Bewertungsgewicht weiter zu erhöhen (95 %), sodass das System deinem Urteil mehr vertraut. Erhöhe das Kostengewicht bei sehr volumenstarken Agenten, wo Token-Kosten ein echtes Anliegen sind.
:::
  `,

  "test-history-and-trends": `
## Testverlauf und Trends

Jeder Lab-Test, den du durchführst, wird im Test-Verlauf des Agenten bewahrt. Die Verlaufs-Ansicht (Lab → History) zeigt vergangene Tests sortiert nach Datum mit dem Modus-Tag, Eingabesatz, Fitness-Werten und dem eventuellen Ergebnis (adopted / rejected / superseded). Klicke auf einen vergangenen Test, um ihn in seinem ursprünglichen Modus für eine erneute Überprüfung wieder zu öffnen oder Parameter in einen neuen Test zu klonen.

Der Trends-Untertab plottet Metriken auf Agent-Ebene über die Zeit — Fitness des aktuell aktiven Prompts, Kosten-pro-Lauf, Dauer-pro-Lauf, Business-Outcome-Rate. Der Plot ist mit signifikanten Ereignissen annotiert (Prompt-Änderungen, Modellwechsel, Trigger-Hinzufügungen), sodass du die Auswirkung jeder Änderung auf die Metriken des Live-Agenten sehen kannst.

### Wichtige Punkte

- **Jeder Test bewahrt** — vollständige Eingabe, Ausgabe, Bewertungen, Fitness; nichts wird per GC entfernt
- **Mit Modus getaggt** — filtere nach Arena / A-B / Matrix / Eval / Genome, um einen spezifischen vergangenen Test zu finden
- **Trend-Chart** mit Auto-Annotation an jedem bedeutsamen Änderungspunkt
- **Vergleiche einen vergangenen Test mit dem aktuellen Stand** — nützlich für "ist der aktuelle Prompt immer noch besser als der, den ich vor drei Wochen abgelehnt habe?"
- **Exportierbar** — der Test-Verlauf exportiert in CSV für externe Analysen

### So funktioniert es

Testergebnisse werden im selben Ausführungs-Store gespeichert wie Produktivläufe, mit dem Test-Modus-Tag zur Filterung. Die Trends-Ansicht aggregiert aus diesem Store; Auto-Annotationen werden aus dem Versionsverlauf und der Konfigurationshistorie extrahiert (die ebenfalls persistent sind). Nichts im Verlauf ist veränderlich — vergangene Tests sind unveränderliche Aufzeichnungen darüber, was wann getestet wurde.

:::tip
Die Trends-Ansicht ist der mit Abstand beste Ort, um "wird mein Agent tatsächlich mit der Zeit besser?" zu beantworten. Öffne sie einmal im Monat; wenn der Fitness-Trend flach ist oder fällt, helfen die jüngsten Änderungen nicht, und es ist Zeit zum Nachdenken, statt mehr Änderungen auszuliefern.
:::
  `,
};
