export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## Das Monitoring-Dashboard

Die Overview-Seite ist deine Kommandozentrale für alles, was über deine Agenten hinweg passiert. Der Dashboard-Tab öffnet standardmäßig und zeigt ein Raster aus KpiTiles — eine Kachel pro Metrik (Erfolgsrate, Gesamtläufe, Gesamtkosten, durchschnittliche Dauer, aktive Agenten, heutige Fehler usw.). Jede Kachel hat drei Dichte-Modi (kompakt / standard / detail), die du durch Anklicken wechselst; nützlich, wenn du eine schnelle Zahl willst vs. wenn du das Trenddiagramm und die Aufschlüsselung sehen möchtest.

Unter den KpiTiles zeigt die Overview Live-Aktivität, jüngste Fehler und Benachrichtigungen, die du abonniert hast. Alles auf dieser Seite ist nach Agent, Gruppe und Zeitbereich filterbar — derselbe Filtersatz gilt für jedes Panel, sodass du das gesamte Dashboard mit einem Klick auf "diese Woche, nur meine Marketing-Agenten" eingrenzen kannst.

| Panel | Was es zeigt |
|---------|--------------|
| **KpiTiles** | Erfolgsrate, Läufe, Kosten, Dauer, Fehleranzahl, aktive Agenten — jeweils auf drei Dichtestufen |
| **Aktivitäts-Feed** | Live-Stream von Ausführungen über alle Agenten hinweg, scrollbar, durchsuchbar, Klick für Details |
| **Benachrichtigungen** | Abonnierte Alerts (Fehler, Budget-Caps, Manual Review, Anomalien) mit Klick-Durchsteuerung zum betroffenen Lauf |
| **Health-Snapshot** | Health-Aggregation pro Agent — schneller Scan auf alles, was gelb oder rot ist |

### So funktioniert es

Die Overview-Seite liest aus demselben Ausführungs- und Ereignis-Store, den der Rest der App nutzt, sodass was du siehst immer der Live-Zustand ist. Filter und Dichte-Voreinstellungen bleiben über Sitzungen erhalten; einmal eingestellt, merkt sich das Dashboard alles. Klicke auf eine KpiTile, um in eine Aufschlüsselung pro Agent zu bohren, klicke auf eine Aktivitätszeile, um das Ausführungsdetail-Modal zu öffnen.

:::tip
Die Benachrichtigungsglocke in der Titelleiste ist ein Ein-Klick-Shortcut von überall in der App zum frischesten Ausführungsdetail. Du musst nicht manuell zu Overview navigieren für Routine-"was ist gerade passiert?"-Checks.
:::
  `,

  "execution-logs": `
## Ausführungs-Logs

Jede Agentenausführung produziert ein Ausführungs-Log: Trigger-Nutzlast, gerenderter Prompt, der ans Modell gesendet wurde, Modellantwort, jeder Tool-Aufruf (mit Argumenten und Ergebnis), finale Ausgabe, Dauer, Kosten und alle Fehler. Logs sind unveränderlich — sie werden einmal geschrieben und unbegrenzt bewahrt. Der Activity-Tab (pro Agent im Editor oder global in Overview) ist der Einstiegspunkt.

Jeder Log-Eintrag ist eine einzeilige Zusammenfassung in der Liste; ein Klick öffnet das vollständige Detail-Modal mit allen oben genannten Feldern. Von dort kannst du jedes Feld kopieren, den Lauf mit derselben Eingabe wiederholen oder zur zugehörigen Trace-Ansicht für schrittweises Debugging springen.

### Wichtige Punkte

- **Vollständige Erfassung** — Eingabe, Prompt, Antwort, Tool-Aufrufe (mit Parametern und Ergebnissen), Ausgabe, Dauer, Kosten, Fehler
- **Unveränderlicher Verlauf** — Logs ändern sich nach Abschluss des Laufs nie; wenn der Prompt des Agenten später bearbeitet wird, zeigen alte Läufe weiterhin, was zum damaligen Zeitpunkt gesendet wurde
- **Replay von jedem Lauf** — führt den Agenten erneut mit der ursprünglichen Eingabe aus; nützlich, um einen Fix gegen eine zuvor fehlschlagende Nutzlast zu verifizieren
- **Nach Trigger getaggt** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\` usw., damit du Aktivität nach Quelle filtern kannst
- **Manual-Review-Markierung** — Läufe, die der Agent selbst zur Überprüfung markiert hat (via \`manual_review\`-Direktive), bekommen ein Badge, damit du sie schnell findest

### So funktioniert es

Der Ausführungs-Store ist lokale SQLite, transaktional geschrieben, während der Lauf fortschreitet. Der Trace-Tab im Detail-Modal expandiert jeden Schritt in seine Unterereignisse (Modell-Token-Stream, Tool-Aufruf versendet, Tool-Ergebnis empfangen, Entscheidungszweig genommen). Filtere nach Datumsbereich, Agent, Trigger-Typ, Status, business_outcome oder Volltext auf Eingabe/Ausgabe.

:::tip
Wenn ein Agent unerwartete Ausgaben produziert, ist der Trace-Tab — nicht die Ausgabe — der Ort, an dem die Antwort lebt. Suche nach dem Tool-Aufruf, der falsche Daten zurückgab, oder der Modellentscheidung, die in die falsche Richtung verzweigte. Die Ausgabe ist das Symptom; der Trace ist die Ursache.
:::
  `,

  "real-time-activity-feed": `
## Echtzeit-Aktivitäts-Feed

Der Aktivitäts-Feed zeigt dir, was gerade über alle deine Agenten hinweg passiert. Während jeder Agent seine Aufgabe verarbeitet, erscheinen Updates in Echtzeit — wie das Beobachten einer Live-Anzeigetafel. Du siehst Ergebnisse in dem Moment, in dem sie passieren, ohne zu aktualisieren oder einzelne Agenten zu prüfen.

Das ist besonders nützlich, wenn du viele Agenten gleichzeitig laufen hast oder wenn du eine kritische Automatisierung beim Ausführen beobachten willst.

### Wichtige Punkte

- **Live-Updates** — sieh die Agentenaktivität, während sie passiert, ohne Aktualisieren
- **Alle Agenten** — ein Feed deckt jeden laufenden Agenten in deinem Setup ab
- **Einträge mit Zeitstempel** — jedes Update zeigt genau, wann es eintrat
- **Statusänderungen** — sieh in Echtzeit, wann Agenten starten, beenden, erfolgreich oder fehlschlagen

### So funktioniert es

Öffne den Aktivitäts-Feed über das Monitoring-Dashboard oder die Seitenleiste. Updates streamen automatisch herein, während deine Agenten arbeiten. Jeder Eintrag zeigt den Agentennamen, die Aktion, den Zeitstempel und das Ergebnis. Klicke auf jeden Eintrag — oder auf die Benachrichtigungsglocke in der Titelleiste —, um das vollständige Ausführungsdetail-Modal direkt im Overview › Activity-Tab zu öffnen, wo du den Trace, den gerenderten Prompt, die Eingabe, die Ausgabe und alle Fehler sehen kannst. Der Feed selbst ist scrollbar und durchsuchbar.

:::tip
Halte den Aktivitäts-Feed in einem Seitenpanel offen, während du neue Agenten testest. Die Live-Ausgabe zu beobachten hilft dir, Probleme sofort zu erkennen und schneller zu iterieren. Für den Alltag ist die Benachrichtigungsglocke in der Titelleiste der schnellste Weg — sie öffnet immer das frischeste Ausführungsdetail, ohne dass du navigieren musst.
:::
  `,

  "cost-tracking-per-agent": `
## Kostenverfolgung pro Agent

Jeder KI-Anbieter berechnet pro Token, und Personas taggt jeden Lauf mit der genauen Token-Anzahl, dem Modell und dem Anbieter, sodass die Kosten pro Agent immer bekannt sind. Overview → Usage zeigt eine sortierbare Liste jedes Agenten mit seinen Kosten über das gewählte Zeitfenster — Tag, Woche, Monat oder benutzerdefinierter Bereich — plus Trend-Pfeile, damit du auf einen Blick siehst, welche Agentenkosten steigen.

Bohre in jede Zeile für eine Aufschlüsselung: Kosten-pro-Lauf-Verteilung (Median vs. p95), Kosten nach Modell, wenn der Agent Failover konfiguriert hat, Gesamt-Token (Eingabe vs. Ausgabe) und ein Trenddiagramm über die Zeit. Wenn die Kosten eines Agenten schleichend steigen, ist das der erste Ort, an dem es auftaucht.

### Wichtige Punkte

- **Aufschlüsselung pro Agent** — jeder Lauf wird seinem Agenten zugeordnet
- **Filterbare Zeitfenster** — heute, diese Woche, dieser Monat, gesamte Zeit oder benutzerdefiniert
- **Kosten-pro-Lauf-Verteilung** — Median, p95, Max; zeigt, ob ein teurer Ausreißer das Total dominiert
- **Token-Aufschlüsselung** — Eingabe- vs. Ausgabe-Token, damit du erkennen kannst, ob der Agent viel liest oder viel produziert
- **Trend-Pfeile** — wöchentliche Änderung wird neben jedem Agenten angezeigt, damit Kosten-Regressionen sofort auftauchen

### So funktioniert es

Der Kostenzähler tickt live während eines Laufs, während Tokens hereinströmen. Wenn der Lauf abschließt, werden die finalen Kosten finalisiert und neben dem Ausführungs-Log persistiert. Die Usage-Ansicht aggregiert aus diesem Store, sodass das Ändern des Zeitbereichsfilters einfach dieselben Daten neu abfragt — kein separater "Kostenbuchhaltungs"-Job läuft.

:::tip
Wenn ein einzelner Agent deine Kosten dominiert, ist die Verteilung pro Lauf nützlicher als das Total. Ein hoher Median bedeutet, der Prompt ist konsistent teuer (schau dir die Prompt-Größe und die Tool-Aufruf-Anzahl an). Ein hoher p95 mit normalem Median bedeutet seltene Ausreißer (schau dir ungewöhnliche Eingaben im Trace-Verlauf an).
:::
  `,

  "cost-tracking-per-model": `
## Kostenverfolgung pro Modell

Verschiedene Modelle haben sehr unterschiedliche Preispunkte — Claude Haiku ist ~30× günstiger als Opus pro Token, GPT-4o-mini ist ~20× günstiger als GPT-4o, und lokale Modelle kosten im Wesentlichen nichts pro Token (nur Rechenleistung). Die Pro-Modell-Ansicht in Overview → Usage schlüsselt Ausgaben nach Anbieter und Modell auf, damit du sehen kannst, wohin das Geld geht und ob die Ausgaben den Wert rechtfertigen.

:::feature
**Smarte Optimierungs-Hinweise** color=#34d399
Das System taggt Läufe, die wie sie auf einem günstigeren Modell mit ähnlicher Qualität hätten laufen können. Wenn ein hochpreisiges Modell für ein Aufgabenmuster verwendet wird, das das günstigere Modell anderswo problemlos handhabt, erscheint der Hinweis neben der Kostenzeile — und weist dich auf Kandidaten-Agenten hin, die du im Lab per A-B testen kannst.
:::

### Wichtige Punkte

- **Nach Anbieter und Modell** — Kosten aufgeteilt nach genauer Modell-ID (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Aufrufe, Tokens, Kosten** — drei Ansichten derselben Daten; Kosten ist was du zahlst, Tokens ist was du ausgibst, Aufrufe ist wie oft du aufrufst
- **Kosten-pro-Aufruf-Vergleich** — dieselbe Metrik über Modelle hinweg, damit du wie mit wie vergleichen kannst
- **Optimierungs-Hinweise** — zeigt Kandidaten-Agenten, die heruntergestuft werden könnten; klicke ins Lab, um A-B zu testen
- **Zuordnung pro Agent** — bohre in eine Modellzeile, um zu sehen, welche Agenten es am meisten nutzen

### So funktioniert es

Die Usage-Ansicht gruppiert dieselben Ausführungsdatensätze wie die Pro-Agent-Ansicht, aber auf der Modell-Dimension. Die Preisgestaltung wird pro Modell in Settings → Engine konfiguriert, mit Standardwerten, die den öffentlichen Preisen jedes Anbieters entsprechen; du kannst überschreiben, wenn du einen ausgehandelten Tarif hast oder BYOI auf einem günstigeren Endpunkt nutzt.

:::tip
Einmal im Monat scanne die Pro-Modell-Ansicht sortiert nach Gesamtkosten. Der oberste Eintrag ist deine größte Einsparmöglichkeit — wirf ihn in die Lab-Arena gegen das nächst-günstigere Modell und sieh, ob die Qualität hält. Die meisten Agenten tolerieren eine Modell-Herabstufung gut; die, die es nicht tun, sind die, die die Ausgaben wirklich wert sind.
:::
  `,

  "success-rate-metrics": `
## Erfolgsraten-Kennzahlen

Jeder Lauf endet mit einem Status: success, failure oder manual-review. Die Erfolgsrate ist der Prozentsatz erfolgreich abgeschlossener Läufe vor dem Hintergrund des erwarteten Verhaltens. Der Overview → Health-Tab und der Activity-Tab pro Agent zeigen beide die Erfolgsrate mit einem Trend-Indikator — wöchentliche Änderung —, sodass du auf einen Blick sehen kannst, ob die Zuverlässigkeit hält.

Die Metrik geht jetzt über reine Erfolg/Misserfolg hinaus. Mit **business_outcome**-Verfolgung kann der Agent selbst angeben, ob ein erfolgreicher Lauf das Ergebnis erzeugt hat, das du eigentlich wolltest (einen Verkauf, ein genehmigtes Dokument, eine nützliche Zusammenfassung) — ein separates Signal davon "lief der Lauf ohne Fehler". Die Erfolgsrate teilt sich auf in "sauber abgeschlossen" und "produzierte das gewünschte Business-Ergebnis" — die zweite ist für die meisten Agenten die nützlichere Zahl.

### Wichtige Punkte

- **Erfolgsrate pro Agent** mit Trend-Pfeil
- **Business-Outcome-Rate** — getrennt von der Clean-Completion-Rate; verfolgt, ob die Arbeit des Agenten tatsächlich nützlich war
- **Aufteilung pro Trigger** — derselbe Agent kann bei manuellen Läufen zu 99 % erfolgreich sein, bei geplanten Läufen aber nur zu 70 %; die Aufschlüsselung zeigt dir, welche Trigger-Quelle Probleme hat
- **Schwellwert-Alerts** — setze einen Schwellwert pro Agent; du wirst benachrichtigt, wenn die Rate darunterfällt
- **Klassifizierung der Fehlerursachen** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\` usw., damit du sehen kannst, *warum* Läufe fehlschlagen

### So funktioniert es

Der Health-Tab aggregiert Lauf-Status über ein rollendes Fenster pro Agent. Die Business-Outcome-Verfolgung erfordert, dass der Agent eine \`business_outcome\`-Direktive in seiner Ausgabe emittiert (die meisten Vorlagen, die das brauchen, machen das standardmäßig; eigene Agenten können es explizit hinzufügen). Schwellwert-Alerts werden pro Agent konfiguriert und feuern über dieselben Benachrichtigungskanäle, mit denen der Agent eingerichtet ist.

:::tip
Setze einen 90 %-Schwellwert auf jeden Produktiv-Agenten. Der Alert wird dir nicht sagen, warum ein Agent fehlschlägt, aber er wird dir sagen, dass etwas nicht stimmt. Die Klassifizierung der Fehlerursachen im Health-Tab ist der nächste Ort zur Diagnose.
:::
  `,

  "execution-tracing": `
## Ausführungs-Tracing

Tracing ist die schrittweise Aufzeichnung pro Lauf dessen, was der Agent getan hat. Öffne eine beliebige Ausführung aus dem Activity-Feed und klicke auf den Trace-Tab: du siehst jedes Ereignis in chronologischer Reihenfolge — Modell-Token-Streaming-Start und -Ende, jeder Tool-Aufruf mit Argumenten, jedes Tool-Ergebnis, jeder Entscheidungszweig in einem verketteten Agenten, der gerenderte Prompt, die Ausgabe. Jeder Schritt ist für volle Details erweiterbar.

Für verkettete Pipelines spannt der Trace mehrere Agenten — die Lineage-Canvas (Events → Lineage) zeigt die agentenübergreifende Sicht, während der Trace pro Lauf das Detail innerhalb des Agenten zeigt. Zusammen lassen sie dich sowohl "wo ist diese Pipeline gebrochen?" als auch "was entschied der Agent Schritt für Schritt?" debuggen.

### Wichtige Punkte

- **Chronologisch** — jedes Ereignis mit Zeitstempel und Dauer
- **Erweiterbar pro Schritt** — klicke auf jeden Schritt für vollständige Eingabe/Ausgabe dieses Schritts
- **Dauer pro Schritt** — sieh, welcher Schritt langsam ist; meist ein Tool-Aufruf oder eine lange Modellantwort
- **Verkettete Traces** — wenn ein Agent durch eine Chain getriggert wird, verlinkt der Trace zurück zum Upstream-Agenten, damit du die Pipeline navigieren kannst
- **Token-für-Token** für das Modell — nützlich für langsam streamende Anbieter, wo der Nutzer wartet

### So funktioniert es

Jede Ausführung schreibt Ereignisse in den Trace-Store, während sie läuft; der Trace-Tab fragt diesen Store ab und rendert die Zeitleiste. Token-Level-Ereignisse werden mit einer Rate abgetastet, die den Trace auch für lange Antworten nutzbar hält (eine 10k-Token-Antwort könnte 500 abgetastete Ereignisse erfassen statt 10k). Für Tool-Use-Schleifen wird jede Iteration des Modell/Tool-Roundtrips erfasst.

:::tip
Nutze den Trace, um zu bestätigen, was das Modell *tatsächlich* erhalten hat. Die größte Quelle für "der Agent hat etwas Komisches gemacht"-Bugs ist, dass das Modell andere Eingaben als erwartet erhält — meist wegen eines Tool-Ergebnisses, das nicht so aussah, wie der Prompt des Agenten annahm.
:::
  `,

  "performance-trends": `
## Performance-Trends

Trends sind die Langzeitansicht des Agenten-Verhaltens — Erfolgsrate, Kosten, Dauer, Ausgabequalität (wo gemessen) über die Zeit aufgetragen, damit du die Auswirkungen deiner Änderungen sehen kannst. Overview → Trends gibt dir die Diagramm-Ansicht; du wählst die Agenten und Metriken und den Datumsbereich, und die Diagramme werden gerendert.

Das nützlichste Muster ist "vorher vs. nachher": du hast den Prompt eines Agenten am 5. März geändert, wurde es besser oder schlechter? Die Trends-Ansicht beantwortet das in Sekunden — die Linien, die dich interessieren, steigen oder fallen am Datum deiner Änderung.

### Wichtige Punkte

- **Mehrere Metriken auf einem Diagramm** — überlagere Erfolgsrate, Kosten, Dauer, Business-Outcome-Rate
- **Multi-Agenten-Überlagerung** — vergleiche dieselbe Metrik über mehrere Agenten auf einem Diagramm
- **Benutzerdefinierte Datumsbereiche** — zoom von "diese Stunde" bis "gesamte Zeit"
- **Annotationen** — signifikante Ereignisse (Prompt-Versionsspeicher, Einstellungsänderungen, Zugangsdaten-Rotationen) sind an die Zeitleiste angeheftet, damit du korrelieren kannst
- **Export** — Diagramm-Daten exportieren in CSV, wenn du eigene Analysen machen willst

### So funktioniert es

Trends aggregieren aus demselben Ausführungs- und Trace-Store wie der Rest der Monitoring-Ansichten — gleiche Daten, andere Visualisierung. Annotationen werden automatisch aus dem Versionsverlauf und der Konfigurationshistorie generiert (die ebenfalls persistent sind), damit du nicht manuell "ich habe hier etwas geändert" markieren musst; das System weiß es bereits.

:::tip
Nach jeder bedeutsamen Änderung an einem Agenten (Prompt-Überarbeitung, Modellwechsel, neues Tool) prüfe die Trends eine Woche später. Die meisten Prompt-Änderungen, die "sich in Tests besser anfühlten", produzieren messbar unterschiedliche Metriken; das Diagramm bestätigt das (oder widerlegt dein Bauchgefühl).
:::
  `,

  "setting-budget-limits": `
## Budgetgrenzen festlegen

Budgetgrenzen begrenzen KI-Ausgaben auf Agentenebene und auf globaler Ebene. Setze ein Budget pro Lauf (diese einzelne Ausführung darf nicht mehr als $X kosten), ein Tagesbudget (dieser Agent darf nicht mehr als $Y pro Tag über alle Läufe ausgeben) oder ein globales Limit über alle Agenten hinweg. Wenn ein Limit erreicht ist, pausiert der betroffene Agent sauber — der partielle Lauf wird im Trace erfasst, keine Gebühr bleibt über das Limit hinaus bestehen, und eine Benachrichtigung feuert.

Das ist eines der am meisten unterschätzten Features für unbeaufsichtigte Agenten. Ein geplanter oder webhook-getriggerter Agent ohne Budgetgrenze könnte über Nacht unerwartete Kosten anhäufen, wenn ein Prompt oder eine Eingabe etwas Pathologisches macht. Budgetgrenzen bedeuten, dass der schlimmste Fall durch das begrenzt ist, was du im Voraus entschieden hast, nicht durch das, was eine fehlerhafte Modellausführung tun kann.

### Wichtige Punkte

- **Limit pro Lauf** — hartes Limit für eine einzelne Ausführung
- **Pro-Tag- / Pro-Woche- / Pro-Monat-Limit** — fensterbasiertes Ausgabelimit pro Agent
- **Globales Limit** — Limit über alle Agenten hinweg; nützlich als Sicherheitsnetz, auch wenn jeder Agent sein eigenes Limit hat
- **Sauberer Stopp** — Agenten stoppen sauber am Limit; partieller Trace wird bewahrt
- **Benachrichtigungen** — jedes Erreichen eines Limits benachrichtigt dich, damit du entscheiden kannst, ob du das Limit erhöhst oder den zugrundeliegenden Prompt korrigierst
- **Sanfte Warnungen** — optionale Vor-Limit-Schwellwerte (z. B. "warne bei 80 %"), damit du weißt, dass ein Agent auf ein Limit zusteuert

### So funktioniert es

Limits werden im Settings-Tab des Agenten konfiguriert (pro Lauf, pro Fenster) oder in Settings → Engine → Budget (global). Die Execution-Engine verfolgt die Live-Kosten während des Laufs; wenn die Kosten das Limit überschreiten, bricht die Engine den Lauf über denselben Pfad wie ein Timeout ab. Der abgebrochene Zustand bleibt im Trace mit Grund \`budget_exceeded\` erhalten.

:::warning
Setze immer mindestens ein Tageslimit für jeden Agenten, der automatisch getriggert wird (Schedule, Webhook, File Watcher, Chain). Ohne eines könnte eine pathologische Eingabe oder eine Modell-Schleife eine unbegrenzte Menge ausgeben, bevor du es merkst. Das Limit ist dein Sicherheitsnetz.
:::

:::tip
Beginne mit Limits in etwa 3-fach dem, was du an einem typischen Tag erwartest. Eng genug, um Ausreißer zu fangen, locker genug, dass normale Schwankungen das Limit nicht auslösen. Passe nach einer Woche echter Daten an.
:::
  `,

  "the-director": `
## Der Director — Automatisches Agenten-Coaching

Der **Director** ist ein eingebauter Meta-Agent, der deine anderen Agenten beobachtet und ihnen hilft, wirklich nützlich zu werden. Statt jeden Lauf selbst zu lesen, prüft der Director sie für dich und hinterlässt ein Urteil.

Du bestimmst, was er beobachtet, indem du Agenten **mit einem Stern markierst** (das ⭐ in jeder Zeile unter Alle Agenten). Ein markierter Agent ist "im Zuständigkeitsbereich des Directors" – der Director prüft ihn; nicht markierte Agenten bleiben unberührt. Der Director selbst ist ein System-Agent und kann nicht gelöscht werden.

### Die Kommandozentrale

Der Director befindet sich unter **Übersicht › Director** – ein fokussierter Bildschirm:

- Ein **Portfolio-Scorecard**: wie viel von der Arbeit deiner Flotte tatsächlich Wert geliefert hat, der durchschnittliche Urteilswert, deine Kosten pro wertgeliefertem Lauf und eine 0–5-Verteilung, die zeigt, wie deine markierten Agenten abschneiden.
- Eine **Coaching-Tabelle** aller Agenten im Zuständigkeitsbereich – Wert, ein Trend-Sparkline (bewegt das Coaching etwas?), Wertrate, letzte Prüfung und **Aufmerksamkeits-Tags**, die genau anzeigen, was zu tun ist (wartet auf erste Prüfung, niedriger Wert, rückläufig, veraltet). Filtere auf die Agenten, die Aufmerksamkeit brauchen. Klicke auf einen Agenten, um seine **Details** zu öffnen – vollständiger Urteilsverlauf mit Begründung und konkreten Vorschlägen hinter jedem Wert.
- Eine schlanke Kopfzeile mit **Alle im Zuständigkeitsbereich prüfen**, einer **Zum Zuständigkeitsbereich hinzufügen**-Auswahl und dem Langzeit-**Memory**-Schalter.

Die Seite Alle Agenten enthält einen schmalen Director-Streifen, der direkt hierher verlinkt.

### Wie ein Urteil aussieht

Jede Prüfung erzeugt einen **0–5-Gesamtwert** sowie optionale Coaching-Hinweise:

- Die **Urteil**-Spalte in der Aktivitätsliste zeigt den Wert als Sterne direkt neben dem Agenten – ein Blick sagt dir, welche Läufe ihre Kosten wert waren.
- Der **Director**-Tab bei jedem Lauf öffnet die vollständige Bewertung in lesbarem Markdown: der Wert, eine einzeilige Zusammenfassung und konkrete Vorschläge (eine Prompt-Anpassung, eine Leitplanke, ein Modellwechsel, ein fehlendes Tool).
- Umsetzbare Hinweise landen auch in deiner Prüfungs-Queue, wo das Annehmen oder Ablehnen dem Director mit der Zeit deinen Geschmack beibringt.

Ein gesunder Agent erzielt hohe Werte mit wenig oder keinem Coaching – der Director bleibt ruhig, wenn es nichts zu verbessern gibt.

### Langzeitgedächtnis (optional)

Wenn du das **Obsidian Brain** nutzt, kannst du das Langzeitgedächtnis des Directors einschalten. Er liest dann seine eigenen früheren Notizen zu einem Agenten vor jeder Prüfung (sodass sich Ratschläge summieren statt zu wiederholen) und schreibt jedes neue Urteil zurück in einen \`Director/\`-Ordner in deinem Vault – ein dauerhafter, menschenlesbarer Coaching-Verlauf.

### Warum das wichtig ist

Rohe Zahlen (Läufe, Kosten, Erfolgsrate) sagen dir *was* passiert ist, nicht *ob es die Mühe wert war*. Der Director fügt die fehlende Urteilsebene hinzu – eine ehrliche, evidenzbasierte Einschätzung des Werts und der Effizienz jedes Agenten – damit eine Flotte von Agenten nützlich bleibt, ohne dass du jeden Lauf von Hand auditieren musst.
  `,

  "anomaly-detection": `
## Anomalie-Erkennung

Die Anomalie-Erkennung vergleicht jeden neuen Lauf mit der jüngsten Baseline des Agenten und markiert Läufe, die ungewöhnlich aussehen. Die Baseline wird pro Agent aufgebaut: typische Dauer, typische Kosten, typische Ausgabelänge, typische Tool-Aufruf-Anzahl. Ein neuer Lauf, der signifikant in einer dieser Größen abweicht, wird mit einem Grund markiert — "Dauer 5× normal", "Kostenspitze", "Tool-Aufruf-Anzahl anomal", "Ausgabe ungewöhnlich kurz".

Das fängt eine Klasse von Problemen ab, die reine Erfolgs-/Misserfolgs-Metriken übersehen: der Lauf wurde abgeschlossen, aber etwas war falsch. Der Agent brauchte fünf Minuten, wenn er normalerweise dreißig Sekunden braucht. Die Ausgabe sind drei Sätze, wenn sie normalerweise drei Absätze sind. Die Kosten haben sich verdoppelt, ohne dass sich die Eingabe geändert hat. Das sind Signale, die es wert sind, gesehen zu werden, bevor sie zu Trends werden.

### Wichtige Punkte

- **Multi-Signal-Baseline** — Dauer, Kosten, Ausgabegröße, Tool-Aufruf-Anzahl, Fehlerrate
- **Baselines pro Agent** — jeder Agent hat sein eigenes Normal; was für einen anomal ist, ist für einen anderen normal
- **Mit Grund getaggte Alerts** — der Alert nennt, welches Signal abgewichen ist und um wie viel
- **Geringes Rauschen** — kalibriert, um echte Ausreißer zu zeigen, nicht normale Schwankungen
- **Integriert sich mit Benachrichtigungen** — Anomalien feuern über die Benachrichtigungskanäle, mit denen der Agent konfiguriert ist

### So funktioniert es

Die Baseline ist ein rollendes Fenster jüngster Läufe (konfigurierbar; Standard 50). Jeder neue Lauf wird auf jedem Signal bewertet; wenn ein Signal den konfigurierten Schwellwert überschreitet (Standard 3 Standardabweichungen vom rollenden Mittel), wird der Lauf markiert und ein Anomalie-Ereignis emittiert. Anomalie-Ereignisse tauchen in Overview → Notifications und im Health-Tab für diesen Agenten auf.

:::tip
Anomalien, die du untersuchst und löst, solltest du als geklärt markieren (markiere sie als "investigated"). Die Baseline schließt untersuchte Anomalien aus ihrem rollenden Fenster aus, sodass das System nicht dazu driftet, den anomalen Lauf als "normal" zu betrachten.
:::
  `,

  "tracking-goals": `
## Ziele verfolgen

Ziele sind die Ergebnisebene über einzelnen Läufen. Statt Ausführungen einzeln zu beobachten, definierst du, was du erreichen willst — und lässt den Fortschritt automatisch aus der Arbeit deines Teams und deiner Agenten hochrollen.

Ein Ziel hat einen Titel, ein optionales Zieldatum, einen Status und einen Fortschritts-Prozentsatz. Der Status folgt einem einfachen Vier-Werte-Modell: **offen** (noch nicht begonnen), **in Bearbeitung** (wird bearbeitet), **blockiert** (wartet auf etwas) und **erledigt**. Der Fortschritt ist hybrid: Das System berechnet einen Vorschlag aus den Checklisten-Elementen, Unterzielen und verknüpften Team-Zuweisungsschritten des Ziels — und zeigt ihn dir als **Annehmen / Bearbeiten**-Hinweis. Du entscheidest; eine manuelle Überschreibung gewinnt immer.

### Drei Ansichten

Ziele befinden sich im Teams-Bereich und bieten drei Oberflächen, die über die Seitenleiste umgeschaltet werden:

- **Board** — ein Kanban, geordnet nach Status. Karten zeigen den vollständigen Zieltitel und eine eingebettete Checkliste (die ersten paar To-dos als umschaltbare Kontrollkästchen, der Rest hinter einem „+N weitere"-Link). Wenn ein Ziel To-dos hat, treibt das Abhaken dieser Punkte den Fortschritt voran — der Balken bewegt sich, wenn Einträge abgehakt werden.
- **Karte** — eine Pan-und-Zoom-Canvas, die zeigt, wie Ziele miteinander zusammenhängen. Abhängigkeitskanten (blockiert, folgt) verbinden Ziele zu einem gerichteten Graphen. **Jetzt**-Hervorhebung (ein bernsteinfarbener pulsierender Ring) markiert aktuell in Bearbeitung befindliche Ziele; **Nächste**-Hervorhebung (ein blauer Ring) markiert Ziele, deren Blocker alle erledigt sind und die bereit zum Start sind. Herauszoomen zeigt die Konstellation; Hineinzoomen zeigt vollständige Metadaten auf jedem Knoten.
- **Zeitlinie** — Ziele auf einer vertikalen Fälligkeitsdatum-Schiene, nach Dringlichkeit sortiert: Überfällig, Diese Woche, Diesen Monat, Später, Kein Datum.

### Der entscheidende Schritt: An dein KI-Team übergeben

Die Detailleiste für jedes Ziel hat ein Steuerelement **An dein KI-Team übergeben**. Wenn du es drückst, wird das Ziel in eine laufende Team-Zuweisung verwandelt, die zurück auf das Ziel verlinkt. Das Team zerlegt das Ziel in Schritte (oder übernimmt die vorhandenen To-dos wörtlich), bearbeitet sie nacheinander und hakt den Fortschritt automatisch ab, wenn jeder Schritt abgeschlossen ist. Das Ziel bewegt sich von selbst von offen über in Bearbeitung bis erledigt — und taucht nur dann in deiner Prüfungs-Queue auf, wenn ein Schritt wirklich eine menschliche Entscheidung braucht.

:::tip
Du musst ein Ziel nicht sofort an dein Team übergeben. Nutze das Board, um zuerst die Checkliste manuell aufzubauen — das Team übernimmt dann jeden To-do-Punkt der Reihe nach, was dir eine feinkörnige Kontrolle darüber gibt, was bearbeitet wird und in welcher Reihenfolge.
:::
  `,

  "measuring-outcomes-with-kpis": `
## Ergebnisse mit KPIs messen

KPIs sind die Zahlenebene über den Zielen. Während ein Ziel ein Ergebnis beschreibt, das du erreichen möchtest, verfolgt ein KPI, ob du tatsächlich vorankommst — ein aktueller Wert, ein Zielwert und eine Takt-Einschätzung, die dir sagt, ob du auf Kurs bist.

Jeder KPI zeigt seinen aktuellen Wert im Vergleich zum Ziel mit einem **Takt**-Status: **im Plan**, **nicht im Plan**, **erreicht** oder **nicht gemessen** (wenn noch keine Messung vorgenommen wurde). Ein Fortschrittsbalken und ein Messfrischikeitsindikator runden die Karte auf einen Blick ab.

### Vier Messarten

KPIs werden nicht alle auf dieselbe Weise gemessen. Personas unterstützt vier Messarten, jede für eine andere Datenquelle geeignet:

:::info
- **Codebase** — führt einen Befehl gegen dein Repository aus und analysiert das Ergebnis. Nützlich für Dinge wie Test-Abdeckungs-Prozentsatz oder Lint-Fehleranzahl, die vollständig im Code liegen.
- **Abgeleitet** — liest aus den eigenen Daten des Orchestrators: Laufzählungen, Ergebnisraten, Kostentrends und ähnliche operative Metriken, die Personas bereits verfolgt.
- **Connector** — zieht einen Wert aus einem verbundenen externen Dienst (Analytics, Traffic, Fehler-Tracking). Wenn der benötigte Connector noch nicht in deinem Vault ist, zeigt die KPI-Karte eine "Dienst verbinden"-Aufforderung, die direkt zum Zugangsdatenkatalog verlinkt.
- **Manuell** — du gibst den Wert selbst ein. Nützlich für Geschäftszahlen, die in keinem verbundenen System liegen, oder für KPIs, die du informell verfolgen möchtest, bevor du die Messung automatisierst.
:::

### Wo KPIs zu finden sind

**Teams › KPIs** hat zwei Ansichten hinter einem segmentierten Umschalter. Die **Dashboard**-Ansicht zeigt alle aktiven KPIs als Karten — klicke auf eine Karte, um die Detailleiste mit der vollständigen Messhistorie, einem Sparkline und einem manuellen Werteingabefeld zu öffnen. Die **Vorschläge**-Ansicht ist eine Prüfungs-Queue: Ein Klick auf "KPIs scannen" führt einen kopflosen Analyse-Durchlauf über die Kontext-Karte und bestehenden KPIs deines Projekts aus und zeigt vorgeschlagene KPIs mit einer einzeiligen Begründung und dem genauen Messverfahren, das verwendet würde. Du nimmst an (optional den Zielwert zuerst anpassend) oder lehnst ab. Abgelehnte Vorschläge werden archiviert und bei künftigen Scans als negative Beispiele zurückgespielt, damit derselbe Vorschlag nicht erneut kommt.

:::tip
Lass den Scan KPIs vorschlagen, bevor du sie manuell erstellst. Er liest die Kontext-Karte deines Projekts, deine bestehenden Ziele und den Connector-Bestand deines Vaults — und schlägt in der Regel Messungen vor, die mit dem, was du bereits verbunden hast, tatsächlich automatisierbar sind.
:::
  `,

  "director-verdicts-and-categories": `
## Director-Urteile und Kategorien

Jede Director-Prüfung erzeugt ein strukturiertes Urteil — nicht nur ein Bestehen/Nichtbestehen, sondern eine mehrschichtige Einschätzung, die dir sagt, was ein Agent gut macht, was Coaching braucht und wie dieses Coaching abgelegt werden soll, damit es wirklich nützt.

Das verpflichtende Element ist ein **Gesamtwert von 0–5** mit einer einzeiligen Zusammenfassung. Dieser Wert landet im Ausführungsdatensatz und erscheint als Sterne in der Aktivitätsliste — ein schneller Blick auf die jüngsten Läufe eines Agenten verrät dir, welche ihre Kosten wert waren. Der Wert treibt auch den Trend-Sparkline in der Agenten-Tabelle an: ein kurzer Verlaufsbalken, der in der Farbe der jüngsten Bewertung eingefärbt ist.

### Was gut läuft

Die Prüfung beginnt nicht mit Kritik. Bevor Coaching-Hinweise kommen, hebt der Director hervor, was der Agent wirklich gut macht — was die Dokumentation als **Erfolge** bezeichnet. Diese erscheinen oben in der vollständigen Bewertungs-Markdown als Abschnitt "Was gut läuft". Ein Agent, der gut abschneidet, bekommt vielleicht nur Erfolge; der Director bleibt ruhig, wenn es nichts zu verbessern gibt.

### Coaching-Hinweise und Kategorien

Nach den Erfolgen kommen die Coaching-Hinweise: spezifische, umsetzbare Vorschläge, eingeteilt unter eine von sechs **Kategorien**:

- **Prompt** — die Anweisungen oder Rahmung des Agenten müssen angepasst werden
- **Health** — Zuverlässigkeits- oder Fehlerbehandlungsprobleme
- **Trigger** — wie und wann der Agent feuert (Zeitplan, Webhook, Chain-Setup)
- **Zugangsdaten** — Vault- oder Berechtigungslücken, die den Agenten blockieren
- **Memory** — was der Agent speichert und abruft (oder nicht abruft)
- **Nützlichkeit** — ob die Ausgabe des Agenten tatsächlich wertvoll für seinen angegebenen Zweck ist

Coaching-Hinweise landen als Elemente in deiner **Prüfungs-Queue**, die du genehmigst oder ablehnst. Das ist nicht nur Verwaltungsarbeit: das Annehmen oder Ablehnen von Hinweisen bringt dem Director mit der Zeit deinen Geschmack bei. Die nächste Prüfung liest zurück, welche Hinweise du angenommen und welche du verworfen hast, sodass die Feedbackschleife sich potenziert — der Director wird besser darin, zu wissen, was dir bei jedem Agenten wichtig ist, und hört auf, Dinge vorzuschlagen, die du bereits ausgeschlossen hast.

Das Command Center des Directors enthält eine **Probleme nach Kategorie**-Zusammenfassung, die Coaching-Hinweise über deinen gesamten Fleet hinweg zählt, damit du auf Portfolio-Ebene sehen kannst, ob Zugangsdatenlücken dein häufigstes Problem sind oder ob die Prompt-Qualität der Bereich ist, in dem die meisten Agenten Aufmerksamkeit brauchen.

:::tip
Gesunde Agenten erzielen hohe Werte und erzeugen wenig oder keine Coaching-Hinweise. Wenn ein Agent konsequent 4–5 erzielt und keine ausstehenden Review-Elemente hat, ist das das Signal, ihn in Ruhe zu lassen und sich auf die Agenten mit rückläufigen Trends oder niedrigen Werten zu konzentrieren.
:::
  `,

  "director-momentum-and-stale-sweep": `
## Director-Momentum und Stale-Sweep

Über einzelne Urteile hinaus erstellt der Director ein Portfolio-weites Bild davon, wie sich dein gesamter Fleet entwickelt. Das ist die Langzeitansicht — nicht "was hat dieser Agent im letzten Lauf gemacht", sondern "bewegt das Coaching die Nadel für deine Agenten über die Zeit?"

### Die Scorecard

Das Command Center des Directors öffnet sich mit einer **Scorecard**, die vier Fragen auf einen Blick beantwortet: Welcher Anteil der Arbeit deines Fleets hat Wert geliefert (die **Wertlieferungsrate**), wie hoch ist der durchschnittliche Urteilswert über alle in-scope Agenten, was sind die **Kosten pro nützlichem Lauf**, und wie viele Agenten sind derzeit im Scope. Unterhalb der Haupt-KPIs zerlegt ein **Wertaufschlüsselungs**-Balken die Wertlieferungsrate in die vollständige Ergebnis-Taxonomie — geliefert, teilweise, blockiert, kein Input, nicht bewertet — damit du sehen kannst, wo Wert verloren geht, nicht nur ob er verloren geht.

Ein **0–5-Score-Verteilungs**-Diagramm zeigt, wie deine markierten Agenten über die gesamte Bewertungsskala verteilt sind, mit einer gestrichelten Linie, die den Portfolio-Durchschnitt markiert. Eine Prüfzeitraum-Auswahl (7 / 30 / 90 Tage) begrenzt die gesamte Scorecard.

### Momentum

Der **Momentum**-Streifen beantwortet die wichtigste Portfolio-Frage: Werden die Dinge besser? Er zählt, wie viele Agenten sich im Vergleich zur vorherigen Prüfung **verbessert**, **gehalten** oder **verschlechtert** haben. Ein sich verbessernder Fleet bedeutet, dass das Coaching wirkt; ein sich verschlechternder Fleet bedeutet, dass etwas Systemisches Aufmerksamkeit braucht — Modellwechsel, Zugangsdaten-Drift, Prompt-Verfall.

### Aufmerksamkeits-Tags und Triage

Die Coaching-Tabelle markiert jeden in-scope Agenten mit **Aufmerksamkeits-Tags** basierend auf clientseitig abgeleiteten Regeln: wartet auf erste Prüfung (noch nie bewertet), niedriger Wert (≤ 2), rückläufiger Trend oder veraltete Prüfung (seit mehr als 14 Tagen nicht gecoacht). Eine Aufmerksamkeits-Triage-Leiste oben in der Tabelle fasst diese Flags zusammen — N neu, N niedrig, N rückläufig, N veraltet — damit du den Umfang des Problems siehst, bevor du anfängst, es durchzuarbeiten.

Ein Klick auf einen Triage-Chip filtert die Tabelle auf dieses Flag. Nach dem Filtern führt eine Aktion **Diese N prüfen** den Director sequenziell über genau diese Agenten aus — die Triage führt direkt zur Aktion.

### Der Stale Sweep

Die Schaltfläche **Stale Sweep** prüft alle markierten Agenten, die seit mehr als 14 Tagen nicht gecoacht wurden, mit einem einzigen Klick erneut. Sie erscheint nur, wenn veraltete Agenten vorhanden sind. Das ist der Routine-Wartungs-Durchlauf: Führe ihn einmal im Monat aus, und der Director fängt jeden Agenten ab, der seit seiner letzten Bewertung abgedriftet ist.

### Langzeitgedächtnis

Mit aktiviertem **Obsidian Brain** liest der Director seine eigenen früheren Notizen zu einem Agenten vor jeder Prüfung und schreibt das neue Urteil zurück in einen \`Director/\`-Ordner in deinem Vault. Das Coaching summiert sich, statt sich zu wiederholen — der Director schlägt nicht erneut Dinge vor, die er bereits angesprochen hat, und baut auf dem auf, was du über die Zeit angenommen und abgelehnt hast.

:::tip
Der Stale Sweep und die Aufmerksamkeits-Triage-Leiste sind die zwei schnellsten Wege, einen großen Fleet gesund zu halten, ohne Zeit mit Agenten zu verbringen, die bereits gut laufen. Nutze die Triage-Leiste, um die Agenten zu finden, die wirklich Aufmerksamkeit brauchen; nutze den Stale Sweep, um sicherzustellen, dass nichts still und leise ungeprüft abrutscht.
:::
  `,
};
