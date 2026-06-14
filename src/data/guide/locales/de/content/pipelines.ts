export const content: Record<string, string> = {
  "what-are-pipelines": `
## Was sind Pipelines?

Eine Pipeline ist eine koordinierte Gruppe von Agenten, die Arbeit untereinander weitergeben, um eine mehrstufige Aufgabe zu bewältigen. Statt eines großen Allrounder-Agenten baust du kleine fokussierte Agenten und verkabelst sie miteinander — jeder spezialisiert sich, die Pipeline übernimmt die Orchestrierung. Der Pipeline-Bereich in der Seitenleiste ist, wo Pipelines leben; die Team-Canvas darin ist, wo du sie komponierst.

Pipelines in Personas sind erstklassige Bürger — sie haben ihren eigenen Ausführungsverlauf, ihre eigenen Observability-Oberflächen, ihren eigenen Team-Memory (geteilter Kontext, den alle Agenten in der Pipeline lesen können), und sie können wie ein einzelner Agent getriggert werden (Schedule, Webhook, Manual, Chain). Der Unterschied ist, dass ein Trigger eine ganze Pipeline statt eines Agenten feuert.

:::compare
**Einzelner Agent**
Ein Prompt, ein Tool-Set, eine Ausgabe. Einfach einzurichten; begrenzt, wenn die Aufgabe sich natürlich in Stufen zerlegt.
---
**Pipeline** [recommended for multi-stage work]
Mehrere fokussierte Agenten, in einen Flow verkabelt. Jeder Agent ist klein und leicht zu debuggen; die Pipeline komponiert sie zu einer größeren Fähigkeit. Geteiltes Team-Memory lässt Agenten strukturierten Kontext weitergeben, nicht nur Text. End-to-end auf der Team-Canvas sichtbar.
:::

### Wichtige Punkte

- **Multi-Agenten-Flow** — Agenten geben Ausgaben entlang definierter Verbindungen an Eingaben weiter
- **Team-Memory** — ein geteilter Kontext-Store, den alle Pipeline-Agenten lesen und schreiben können, getrennt vom Memory pro Agent
- **Visueller Editor** — die Team-Canvas; Agenten platzieren, Verbindungen zeichnen, Routing konfigurieren
- **Wiederverwendbar** — dieselbe Pipeline läuft für jede passende Trigger-Nutzlast; Pipelines sind auch klonbar
- **Beobachtbar** — vollständiger Pipeline-Ebenen-Ausführungsverlauf mit Aufschlüsselung pro Agent

### So funktioniert es

Du komponierst eine Pipeline auf der Team-Canvas: lege Agenten ab, zeichne Verbindungen, konfiguriere bei Bedarf bedingte Verzweigungen. Wenn die Pipeline läuft, fließen Daten entlang der Verbindungen — die Ausgabe jedes Agenten wird zur Eingabe für den nächstgelagerten Agenten, den die Canvas verkabelt hat. Die Engine verfolgt den Lauf end-to-end, sodass du eine Pipeline-Ausführung statt N disjunkter Agent-Läufe siehst.

### In Aktion

:::usecases
**DevOps-Automatisierung**
Ein Pull Request öffnet auf GitHub
---
PR-Reviewer-Agent analysiert den Diff, Test-Runner verifiziert Builds, Release-Notes entwirft ein Changelog, Slack-Notifier postet die Zusammenfassung in deinen Team-Kanal — einzelne Pipeline, getriggert vom GitHub-Webhook.
===
**Content-Workflow**
Du brauchst einen veröffentlichten Blog-Post aus einem Thema
---
Research-Agent sammelt Quellen, Writer entwirft das Stück, Editor poliert, Publisher formatiert für dein CMS — die Pipeline verwaltet die Übergaben, und Team-Memory trägt geteilte Stilrichtlinien.
===
**Kundensupport-Triage**
Ein neues Ticket kommt an
---
Classifier bestimmt Dringlichkeit und Kategorie, Knowledge-Agent ruft relevante Dokumente ab, Drafter schreibt eine Kandidat-Antwort, Router eskaliert an einen Menschen bei geringem Vertrauen.
:::

:::info
Keine harte Obergrenze für die Pipeline-Größe. Beginne mit zwei Agenten, um den Datenfluss zu validieren, wachse, indem du einen Spezialisten nach dem anderen hinzufügst. Pipelines mit 10+ Agenten funktionieren so zuverlässig wie kleine; die Engine handhabt die Orchestrierung identisch.
:::

:::tip
Behandle jeden Agenten in der Pipeline wie eine Einzweck-Funktion: eine spezifische Eingabeform, eine spezifische Ausgabeform. Je kleiner und fokussierter jeder Agent ist, desto leichter ist die gesamte Pipeline zu debuggen und desto wiederverwendbarer sind die einzelnen Teile über Pipelines hinweg.
:::
  `,

  "the-team-canvas": `
## Die Team-Canvas

Die Team-Canvas ist der visuelle Editor für Pipelines. Öffne Pipeline → Team Canvas, und du siehst deine Pipeline als Graph: Agenten-Knoten verbunden durch gerichtete Kanten. Lege Agenten aus dem Bibliothekspanel links ab, zeichne Verbindungen, indem du vom Ausgabe-Port eines Agenten zum Eingabe-Port eines anderen ziehst, konfiguriere Verzweigungen mit bedingten Knoten. Die Canvas unterstützt Schwenken, Zoomen, Mehrfachauswahl, Auto-Layout und Tastatur-Navigation.

Die Canvas ist nicht nur Visualisierung — sie ist der Editor. Jede Änderung, die du auf der Canvas vornimmst (Platzieren eines Agenten, Zeichnen einer Verbindung, Hinzufügen eines bedingten Knotens), aktualisiert sofort die Definition der Pipeline. Speichere, um zu committen; die Pipeline wird auf dieselbe Weise versionskontrolliert wie Agenten-Prompts.

### Wichtige Punkte

- **Drag-and-Drop** Agenten aus der Bibliothek auf die Canvas
- **Verbindungs-Zeichnen** — Klick-und-Ziehen vom Ausgabe-Port zum Eingabe-Port; Daten fließen zur Laufzeit entlang der Verbindung
- **Bedingte Knoten** — füge einen Routing-Knoten zwischen Agenten hinzu, um basierend auf Daten zu verzweigen
- **Auto-Layout** — ein Klick räumt die Canvas in einen links-rechts- oder oben-unten-Flow auf
- **Versioniert** — Canvas-Snapshots werden mit der Pipeline gespeichert; stelle vorherige Layouts und Topologien wieder her

### Deine erste Pipeline bauen

:::steps
1. **Öffne Pipeline → Team Canvas** — Seitenleiste → Pipeline → New Pipeline (oder öffne eine bestehende)
2. **Durchstöbere die Agenten-Bibliothek** — linkes Panel; filtere nach Gruppe oder durchsuche
3. **Ziehe Agenten auf die Canvas** — platziere sie grob in Ausführungsreihenfolge
4. **Zeichne Verbindungen** — Ausgabe-Port (rechte Kante) zum Eingabe-Port (linke Kante)
5. **Füge bei Bedarf bedingte Knoten hinzu** — Toolbar → Conditional; konfiguriere Zweige
6. **Speichern** — Ctrl+S; die Pipeline wird committet und ist sofort ausführbar
:::

:::tip
Links-nach-rechts oben-nach-unten ist die lesbarste Konvention. Verwende Auto-Layout (Toolbar-Knopf), sobald die Topologie steht; es erzeugt einen sauberen visuellen Flow, der jedem, der die Canvas liest — einschließlich Future-You — hilft, die Pipeline auf einen Blick zu verstehen.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Agenten zu einer Pipeline hinzufügen

Agenten werden Pipelines aus dem Bibliothekspanel links der Team-Canvas hinzugefügt. Ziehe jeden Agenten auf die Canvas, um ihn zu platzieren; die Standardeinstellungen des Agenten werden übernommen (Prompt, Tools, Modell, Zugangsdaten), aber du kannst pro Pipeline überschreiben, wenn du willst, dass sich dieser Agent hier etwas anders verhält als anderswo.

Derselbe Agent kann an mehreren Pipelines teilnehmen, jede mit eigenen Override-Einstellungen. Änderungen am zugrundeliegenden Agenten (z. B. eine Prompt-Überarbeitung im eigenen Editor des Agenten) breiten sich zu allen Pipelines aus, die ihn nutzen; Pro-Pipeline-Overrides nicht, sie leben nur in der Pipeline.

### Wichtige Punkte

- **Aus der Bibliothek ziehen** — jeder Agent, den du erstellt hast, ist verfügbar
- **Pro-Pipeline-Overrides** — Eingabe-Mapping, Ausgabe-Transformer, Modellpräferenz (wenn du willst, dass diese Pipeline ein günstigeres Modell für diese Stufe verwendet), Failover-Provider
- **Multi-Pipeline-Wiederverwendung** — ein Agent in Pipeline A und Pipeline B hat unabhängige Override-Sätze pro Pipeline
- **Änderungen am zugrundeliegenden Agenten breiten sich aus** — Prompt-Bearbeitungen, Tool-Änderungen usw. fließen durch zu jeder Pipeline, die den Agenten nutzt (Pro-Pipeline-Overrides nicht)
- **Agent an Ort und Stelle ersetzen** — Rechtsklick → Replace; der neue Agent erbt die Verbindungen des alten, wenn die Eingabe/Ausgabe-Formen passen

### So funktioniert es

Das Platzieren eines Agenten auf der Canvas erstellt eine *pipeline-scoped Referenz* auf diesen Agenten. Die Referenz enthält den Override-Satz (alle Pro-Pipeline-Anpassungen) und die Position auf der Canvas. Zur Laufzeit löst die Engine die Referenz auf, wendet die Overrides auf die Basis-Konfiguration des Agenten an und versendet den Lauf.

:::tip
Widerstehe der Versuchung, schwere Pro-Pipeline-Anpassungen in den Override-Satz zu backen. Wenn du dich dabei ertappst, viele Dinge in einer Pipeline zu überschreiben, ist es meist sauberer, den Agenten zu klonen (dem Klon einen klaren Namen wie "Email Writer - Pipeline B" zu geben) und den Klon zu verwenden — das hält die Pro-Pipeline-Anpassungen explizit, statt sie in Override-Panels zu verstecken.
:::
  `,

  "connecting-agents-with-data-flow": `
## Agenten mit Datenfluss verbinden

Verbindungen auf der Canvas sind gerichtete Kanten vom Ausgabe-Port eines Agenten zum Eingabe-Port eines anderen Agenten. Jede Verbindung trägt die Ausgabe des Upstream-Agenten zum Downstream-Agenten als Eingabe — standardmäßig wortwörtlich, oder transformiert durch einen Inline-Transformer (ein kleiner Ausdruck, der die Ausgabe umformt, bevor sie weitergegeben wird).

Verbindungen sind konfigurierbar: du kannst Transformer hinzufügen, sie beschriften (nützlich in komplexen Pipelines) und sie temporär zum Debuggen ausschalten, ohne sie zu entfernen. Mehrere Verbindungen können von einer Ausgabe ausfächern (Broadcast: Downstream-Agenten erhalten alle dieselben Daten) oder zu einer Eingabe einfächern (die Engine kombiniert Eingaben von mehreren Upstream-Agenten in einem Eingabe-Objekt für den Downstream).

### Wichtige Punkte

- **Klick-Ziehen** vom Ausgabe-Port zum Eingabe-Port, um eine Verbindung zu erstellen
- **Optionaler Transformer** — Inline-Ausdruck, der die Daten unterwegs umformt
- **Fan-out** — eine Ausgabe zu vielen Downstream-Eingaben (paralleles Verzweigen)
- **Fan-in** — viele Upstream-Ausgaben in eine Downstream-Eingabe (kombiniertes Objekt)
- **Ein-/Ausschalten** — deaktiviere eine Verbindung, ohne sie zu löschen (nützlich für gestufte Rollouts)
- **Beschriftet** — benenne Verbindungen für Klarheit in komplexen Pipelines
- **Löschen** — Klick auf Verbindung → Delete-Taste

### Zwei Agenten verbinden

:::steps
1. **Finde den Ausgabe-Port** — kleiner Kreis an der rechten Kante des Quell-Agenten
2. **Klick-und-Ziehen** zum Eingabe-Port — kleiner Kreis an der linken Kante des Ziels
3. **Fallenlassen auf dem Eingabe-Port** — Linie gezeichnet; Verbindung committet
4. **Optional einen Transformer hinzufügen** — Rechtsklick auf Verbindung → Add transformer; schreibe einen kleinen Ausdruck, um Daten umzuformen
5. **Teste durch Ausführen der Pipeline** — klicke während eines Laufs auf jede Verbindung, um die durchfließenden Daten zu inspizieren
:::

:::tip
Verwende Verbindungs-Beschriftungen und Transformer großzügig in jeder Pipeline mit mehr als 3-4 Agenten. Beschriftungen machen die Topologie selbsterklärend; Transformer lassen dich Agenten über Pipelines hinweg wiederverwendbar halten (ein Agent muss nicht wissen, welches Format eine andere Pipeline-Upstream produzieren könnte — der Transformer passt sie an).
:::
  `,

  "pipeline-execution": `
## Pipeline-Ausführung

Das Ausführen einer Pipeline versendet die Trigger-Nutzlast in den ersten Agenten (oder Agenten, wenn mehrere Startknoten), und jeder Downstream-Agent läuft, sobald seine Eingaben verfügbar werden. Die Canvas zeigt die Ausführung live — Agenten leuchten, wenn sie laufen, Verbindungen animieren mit den fließenden Daten, und bedingte Knoten zeigen, welcher Zweig genommen wurde.

Die Engine handhabt Parallelität automatisch: wenn zwei Agenten keine Abhängigkeit zueinander haben, laufen sie parallel. Wenn ein Agent von Ausgaben mehrerer Upstream-Agenten abhängt, wartet er auf alle. Die gesamte Wanduhrzeit wird vom kritischen Pfad durch den Graphen bestimmt, nicht von der Summe aller Agenten-Dauern.

### Wichtige Punkte

- **Live-Canvas-Animation** — sieh, welche Agenten laufen, welche Verbindungen fließen, welche bedingten Zweige genommen werden
- **Automatische Parallelität** — unabhängige Agenten laufen gleichzeitig; abhängige Agenten warten auf Voraussetzungen
- **Kritischer Pfad bestimmt die Wanduhrzeit** — Pipeline-Dauer = längste Abhängigkeitskette, nicht Summe der Agenten
- **Stop-at-first-failure** — standardmäßig; konfigurierbar pro Pipeline, wenn du fehlertolerante Ausführung willst
- **Re-run von jedem Schritt** — nimm nach einer Behebung wieder auf, ohne erfolgreiche Upstream-Stufen neu laufen zu lassen

### So funktioniert es

:::diagram
[Trigger] --> [Agent A] --> [Conditional] --> [Agent B or Agent C] --> [Agent D] --> [Output]
:::

Klicke \`Run\` (oder warte, bis der Trigger automatisch feuert). Die Engine baut einen Ausführungsplan aus der Canvas-Topologie, versendet Startknoten und verarbeitet den Graphen in topologischer Reihenfolge. Wenn jeder Agent fertig ist, werden Downstream-Agenten berechtigt und versenden automatisch. Ein Fehler pausiert die Pipeline am fehlschlagenden Schritt mit dem Fehler im Inspector sichtbar; behebe das zugrundeliegende Problem und klicke \`Retry Step\`, um fortzufahren.

:::tip
Der langsamste Agent auf dem kritischen Pfad bestimmt die Pipeline-Dauer. Wenn sich deine Pipeline langsam anfühlt, lass sie einmal laufen, schau die Pro-Agent-Dauern im Trace an, identifiziere den längsten Pfad und optimiere den Agenten auf diesem Pfad mit der höchsten Dauer. Parallele Zweige helfen nicht, wenn dein kritischer Pfad langsam ist.
:::
  `,

  "conditional-routing": `
## Bedingtes Routing

Bedingte Routing-Knoten lassen eine Pipeline anhand der zu verarbeitenden Daten verzweigen. Lege einen bedingten Knoten auf der Canvas ab, definiere eine oder mehrere Regeln ("wenn amount > 1000", "wenn email contains 'urgent'", "wenn classifier output = 'support'") und verkabele jeden Zweig mit einem anderen Downstream-Pfad. Zur Laufzeit wertet die Bedingung aus und routet zum passenden Zweig — nur dieser Zweig läuft.

Regeln sind ausdrucksbasiert: eine kleine DSL aus Vergleichen und logischen Operatoren, ausgewertet gegen die Ausgabe des Upstream-Agenten. Kein Code; der Ausdrucks-Editor hat Autocomplete für die Upstream-Ausgabeform, sodass du die verfügbaren Felder beim Tippen entdeckst.

:::feature
**Ausdrucksbasiertes Routing**
Bedingte Regeln werden als Ausdrücke gegen die Upstream-Ausgabe ausgewertet. Vergleiche Felder, kombiniere mit AND/OR, falle auf einen Default-Zweig zurück, wenn nichts passt. Kein Code nötig, aber volle Ausdruckskraft, wenn du sie brauchst.
:::

### Wichtige Punkte

- **Mehrere Zweige** — ein bedingter Knoten, N regeldefinierte Zweige, plus ein Default-Fallback
- **Default-Zweig ist Pflicht** — garantiert, dass Daten nie an unzutreffenden Bedingungen hängenbleiben
- **Ausdrucks-DSL** — Vergleiche (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), boolesche Operatoren (\`and\`, \`or\`, \`not\`)
- **Autocomplete auf Upstream-Form** — der Ausdrucks-Editor kennt das Ausgabe-Schema des Upstream-Agenten
- **Live-Auswertung im Trace** — sieh, welcher Zweig bei jedem Pipeline-Lauf genommen wurde

### So funktioniert es

Lege einen Conditional-Knoten zwischen Agenten ab. Konfiguriere die Regel jedes Zweigs im Regel-Editor; der Default-Zweig braucht keine Regel (er ist der Fallback). Zur Laufzeit wertet die Engine die Regeln in Reihenfolge aus; die erste Übereinstimmung gewinnt; passt keine Regel, läuft der Default-Zweig. Der laufende Zweig sieht die Upstream-Ausgabe als Eingabe; die anderen bleiben für diesen Lauf untätig.

:::warning
Definiere immer einen Default-Zweig. Ohne einen bleibt eine nicht passende Eingabe mitten in der Pipeline stecken und produziert einen hängenden Lauf — nervig zu debuggen. Der Default-Zweig kann einfach zu einem Terminal-"log and stop"-Agenten routen, wenn du wirklich willst, dass nicht passende Eingaben laut fehlschlagen, aber der Zweig muss existieren.
:::
  `,

  "team-members-and-roles": `
## Teammitglieder und Rollen

Jeder Agent in einer Pipeline kann ein Rollen-Label tragen — "Researcher", "Writer", "Editor", "Classifier" — das seine Funktion innerhalb der Pipeline beschreibt. Rollen sind rein organisatorisch; die Engine erzwingt oder nutzt sie nicht. Ihr Wert ist menschlich: wenn du (oder jemand anderes) die Canvas einen Monat später öffnet, machen Rollen-Labels die Pipeline selbsterklärend.

Über das Label hinaus sind Rollen auch nützlich für Agentensubstitution. Wenn du mehrere Agenten hast, die die "Editor"-Rolle besetzen könnten (mit verschiedenen Prompt-Stilen oder Spezialitäten), macht das Rollen-Label offensichtlich, welchen Slot du tauschen musst, wenn du deine Meinung änderst. Die Team-Canvas unterstützt Drag-Replace auf einer Rolle: lege einen anderen Agenten auf die bestehende Rolle, und die Canvas fragt, ob substituiert werden soll, wobei die Verbindungen erhalten bleiben.

### Wichtige Punkte

- **Freie Textrollen-Labels** — alles Menschenlesbare; übliche bekommen Autocomplete-Vorschläge
- **Canvas-sichtbar** — Rollen-Labels erscheinen über jedem Agenten-Knoten, sodass die Team-Struktur auf einen Blick sichtbar ist
- **Drag-Replace nach Rolle** — lege einen neuen Agenten auf einen Rollen-Slot, um zu substituieren, wobei Verbindungen erhalten bleiben
- **Filtere Bibliothek nach Rolle** — wenn du viele ähnliche Agenten hast, filtere die Bibliothek nach Rolle, um Kandidaten schnell zu finden
- **Pipeline-Vorlagen nutzen Rollen** — die Vorlage definiert zu füllende Rollen, du bringst Agenten, die zu jeder Rolle passen

### So funktioniert es

Rechtsklick auf einen Agenten auf der Canvas → Set role. Das Label erscheint über dem Agenten-Knoten. Rollen leben in der Pipeline-Definition neben der Agenten-Referenz; sie modifizieren den Agenten selbst nicht. Pipeline-Vorlagen werden mit vordefinierten Rollen ausgeliefert; das Instanziieren einer Vorlage fordert dich auf, einen Agenten für jede Rolle zu wählen.

:::tip
Benenne Rollen nach Verantwortlichkeit, nicht nach dem aktuellen Agenten. "Editor" ist besser als "Claude Sonnet Editor"; die Rollenbeschreibung überlebt jeden spezifischen Agenten, der sie aktuell besetzt. Wenn du für diese Rolle von Claude zu GPT wechselst, ist das Rollen-Label immer noch genau.
:::
  `,

  "pipeline-run-history": `
## Pipeline-Ausführungsverlauf

Pipeline-Läufe sind erstklassige Ausführungen im selben Store, in dem auch einzelne Agenten-Läufe landen. Der Pipeline → Run History-Tab zeigt jeden Lauf mit seinem Trigger, Eingabe, Status, Gesamtdauer, Gesamtkosten und Aufschlüsselung pro Agent. Klicke auf jeden Lauf, um den vollständigen Trace zu erweitern: Traces pro Agent, bedingte Entscheidungen, Transformer-Ausgaben, das finale Ergebnis.

Der Ausführungsverlauf bleibt unbegrenzt erhalten (vorbehaltlich der Aufbewahrungseinstellungen in Settings → Data) und unterstützt dieselbe Filterung und Suche wie Aktivitäts-Ansichten pro Agent. Jeder Lauf ist unveränderlich — einmal erfasst, ist der Trace eingefroren, nützlich für nachträgliche Audits.

### Wichtige Punkte

- **Vollständige Erfassung** — Eingabe, Traces pro Agent (Prompt, Tool-Aufrufe, Antwort), bedingte Entscheidungen, Transformer-Ausgaben, finales Ergebnis
- **Status pro Agent** innerhalb des Pipeline-Traces — success / failure / skipped / pending
- **Gesamt- + Pro-Agent-Timing** — sieh den kritischen Pfad und identifiziere Engpässe
- **Gesamt- + Pro-Agent-Kosten** — Pipeline-Kosten = Summe der Pro-Agent-Kosten
- **Durchsuchbar und filterbar** — nach Datum, Trigger, Status, Kosten, Dauer, Agent
- **Zwei-Lauf-Vergleich** — wähle zwei Läufe, um Pro-Agent-Ausgaben zu vergleichen (nützlich für "was hat sich geändert?")

### So funktioniert es

Pipeline-Läufe nutzen denselben Ausführungs-Store wie Einzel-Agenten-Läufe, aber mit einem zusätzlichen Pipeline-Ebenen-Wrapper, der zu allen Kind-Agent-Ausführungen verlinkt. Die Verlaufs-Ansicht fragt diesen Store ab, joint mit den Agent-Ausführungs-Datensätzen für Aufschlüsselungen pro Agent und rendert den Trace-Baum.

:::tip
Nach einer bedeutsamen Pipeline-Änderung (neue bedingte Regel, getauschter Agent, Prompt-Überarbeitung an einem Mitgliedsagenten) wähle einen "vorher"-Lauf aus dem Verlauf und den "nachher"-Lauf aus dem neuen Lauf, dann nutze Compare, um genau zu sehen, was anders ist. Das Diff auf Pipeline-Ebene offenbart oft Auswirkungen, die du beim Betrachten eines einzelnen Agenten isoliert übersehen würdest.
:::
  `,

  "pipeline-templates": `
## Pipeline-Vorlagen

Pipeline-Vorlagen sind vorgefertigte Pipeline-Formen, die du als Ausgangspunkt übernehmen kannst. Die Vorlage definiert die Topologie — welche Rollen existieren, welche bedingten Verzweigungen, welche Transformer — bindet aber keine spezifischen Agenten an jede Rolle. Wenn du eine Vorlage instanziierst, öffnet die Canvas mit der Topologie im Platz und fordert dich auf, jede Rolle aus deiner eigenen Agenten-Bibliothek zu füllen.

Vorlagen decken gängige Formen ab: Content-Workflows (Research → Write → Edit → Publish), Support-Triage (Klassifizieren → Routen → Antworten → Eskalieren), Datenverarbeitung (Aufnehmen → Validieren → Transformieren → Speichern). Die Vorlagen-Bibliothek befindet sich in Pipelines → New Pipeline → Browse Templates.

### Wichtige Punkte

- **Topologie-definiert, rollen-flexibel** — die Vorlage kennt die Form; du bringst die Agenten
- **Vorkonfigurierte bedingte Regeln und Transformer** — gängige Routing-Logik ist eingebacken
- **Anpassbar nach Instanziierung** — einmal instanziiert, gehört die Canvas dir zum Modifizieren
- **Best-Practice-Muster** — Vorlagen werden mit Fehlerbehandlung und Fallback-Zweigen als Standard ausgeliefert
- **Wachsende Bibliothek** — neue Vorlagen werden basierend auf Nutzerwünschen hinzugefügt; du kannst auch deine eigenen Pipelines als Vorlagen zur Wiederverwendung speichern

### So funktioniert es

Eine Vorlage ist eine Canvas-Definition mit Rollen-Slots statt Agenten-Referenzen. Die Instanziierung erstellt eine neue Pipeline, kopiert die Canvas der Vorlage und fordert dich auf, jede Rolle aus der Agenten-Bibliothek zu füllen. Einmal gefüllt, ist die Pipeline voll bearbeitbar — sie ist nicht mit der Vorlage verknüpft, sodass Updates der Vorlage sich nicht ausbreiten (und Bearbeitungen der Pipeline die Vorlage nicht beeinflussen).

:::tip
Selbst wenn keine Vorlage exakt passt, ist die nächstgelegene zu wählen und zu modifizieren meist schneller als von Grund auf zu bauen. Vorlagen lösen die Orchestrierungs-Form vor (bedingte Platzierung, Transformer-Standorte, Fan-out/Fan-in-Topologie); die verbleibende Arbeit ist Agentenauswahl und Prompt-Tuning, was die Arbeit ist, auf die du dich ohnehin konzentrieren wolltest.
:::
  `,

  "team-assignments": `
## Team-Aufgaben

Pipelines verdrahten jeden Schritt von Hand. Aufgaben drehen das um: du gibst dem Team ein **Ziel** in natürlicher Sprache, und das Team erarbeitet die Schritte selbst. Es zerlegt das Ziel in eine Checkliste, wählt den besten Agenten für jeden Schritt und führt sie parallel aus – es hält nur dann inne, wenn ein Schritt fehlschlägt oder eine Entscheidung nötig ist.

Stell es dir wie den Unterschied zwischen dem Zeichnen eines Flussdiagramms und dem Briefing eines Projektmanagers vor. Mit einer Pipeline entwirfst du den Ablauf; mit einer Aufgabe nennst du das Ergebnis und lässt das Team sich darum organisieren.

### Wichtige Punkte

- **Ziel zuerst** — beschreibe, was du willst; das Team zerlegt es in geordnete Schritte
- **Intelligente Zuweisung** — jeder Schritt wird an den dafür am besten geeigneten Agenten weitergeleitet (du kannst Agenten manuell festlegen, schnelles lokales Matching nutzen oder das Modell entscheiden lassen)
- **Auto-Zerlegung** — ein Klick verwandelt ein Ziel in eine bearbeitbare Schritt-Liste, die du vor dem Start anpassen kannst
- **Parallele Ausführung** — unabhängige Schritte laufen gleichzeitig; abhängige Schritte warten auf ihre Reihe
- **Menschliche Prüfung bei Fehlern** — ein fehlgeschlagener Schritt pausiert nur diese Aufgabe und bietet dir Bearbeiten / Neu zuweisen / Überspringen an, mit einer Benachrichtigung in der Titelleiste
- **Wiederverwendbare Vorlagen** — speichere ein Ziel und ein Schritt-Layout als Vorlage und starte neue Aufgaben daraus
- **Chat-Versand** — bitte Athena, "lass das Research-Team das übernehmen", und sie richtet es zur Genehmigung für dich ein

### So funktioniert es

Öffne die Canvas eines Teams und klicke auf das **Aufgaben**-Badge (unten links). Klicke auf **Neu**, gib ein Ziel ein und fülle entweder die Schritte selbst aus oder klicke auf **Auto-Zerlegung**, damit der Assistent sie vorschlägt. Wähle, wie Agenten den Schritten zugewiesen werden, lege fest, wie viele gleichzeitig laufen, und klicke auf **Erstellen & starten**. Beobachte, wie sich die Checkliste live aktualisiert; wenn ein Schritt fehlschlägt, löse ihn direkt inline. Speichere alles, das du öfter nutzen wirst, als Vorlage.

:::tip
Nutze eine Aufgabe, wenn du das Ergebnis kennst, aber nicht die genauen Schritte. Nutze eine Pipeline, wenn du präzise, wiederholbare Kontrolle über jede Verbindung willst. Vorlagen verbinden beides – eine gespeicherte Aufgabe wird zum Ausgangspunkt auf einen Klick.
:::
  `,

  "team-memory-and-goals": `
## Team-Memory & Ziele

Ein Team ist mehr als eine Gruppe von Agenten – es sind Agenten, die **gemeinsam erinnern** und auf ein geteiltes Ergebnis hinarbeiten. Zwei Dinge machen das möglich: geteiltes Team-Memory und Ziele.

### Geteiltes Team-Memory

Während ein Team arbeitet, hält es Entscheidungen und Rahmenbedingungen fest – "wir haben uns auf dieses Format geeinigt", "dieses Konto ist außerhalb des Umfangs", "der Reviewer hat Ansatz X abgelehnt". Diese Notizen werden zum **Team-Memory**, und ein kompakter Auszug der wichtigsten davon fließt beim nächsten Lauf in den Kontext jedes Mitglieds ein.

Der Effekt: das Team konvergiert, statt sich zu wiederholen. Ein Agent entdeckt eine Entscheidung, die ein Teammitglied bereits getroffen hat, nicht neu – er übernimmt sie. Du kannst dieses Memory im Team-Memory-Panel auf der Canvas einsehen und pflegen.

### Ziele – steuern ohne zu mikromanagen

Verknüpfe ein Team mit einem **Ziel** und hör auf, einzelne Läufe zu beaufsichtigen. Das Ziel verfolgt den Fortschritt, während das Team arbeitet, und die App zeigt nur das an, was wirklich einen Menschen braucht – ein ins Stocken geratenes Ziel, eine nahende Deadline, ein Schritt, der auf deine Prüfung wartet. Alles andere läuft einfach weiter.

Das ist die "Richtung vorgeben, auf Überblicksebene bleiben"-Schleife: du definierst das Ergebnis und die Leitplanken; das Team kümmert sich um den Rest und meldet sich, wenn es dich braucht.

:::tip
Stell dir das Team-Memory als das institutionelle Wissen des Teams vor und das Ziel als seinen Nordstern. Memory hält das Team von Lauf zu Lauf konsistent; das Ziel hält es auf etwas Erstrebenswertes ausgerichtet.
:::

### Wichtige Punkte

- **Geteiltes Memory** — vom Team erfasste Entscheidungen und Rahmenbedingungen werden beim nächsten Lauf in den Kontext jedes Mitglieds injiziert
- **Konvergenz** — Mitglieder bauen auf den Schlussfolgerungen der anderen auf, statt sie neu herzuleiten
- **Ziel-Verknüpfung** — verknüpfe ein Team mit einem Ziel, um Fortschritt und Deadlines zu verfolgen
- **Aufmerksamkeit, nicht Lärm** — die Aufmerksamkeits-Queue zeigt nur, was dich braucht (ins Stocken geraten, überfällig, wartet auf Prüfung)
- **Pflege es** — prüfe, bearbeite oder entferne Team-Memories im Canvas-Panel
  `,

  "debugging-pipeline-issues": `
## Pipeline-Probleme debuggen

Wenn ein Pipeline-Lauf fehlschlägt, markiert die Canvas den fehlschlagenden Agenten mit einem roten Indikator, und der Lauf pausiert an diesem Schritt. Öffne den fehlgeschlagenen Lauf aus dem Verlauf (oder klicke auf den Indikator auf der Live-Canvas), und das Debug-Panel zeigt die Eingabe des Agenten, den Fehler, den Trace bis zum Fehler und alle teilweisen Ausgaben, die der Agent vor dem Fehlschlag produziert hat. Vom selben Panel kannst du nur den fehlschlagenden Schritt wiederholen oder die ganze Pipeline von vorn neu starten.

Die häufigsten Pipeline-Fehler sind Datenform-Inkompatibilitäten — ein Upstream-Agent produziert eine Ausgabe in einem leicht anderen Format als der Downstream-Agent erwartet. Der Verbindungs-Inspector (klicke auf jede Verbindung) zeigt die Daten, die im jüngsten Lauf durchgegangen sind, was meist reicht, um die Inkompatibilität zu erkennen.

### Wichtige Punkte

- **Fehlschlagender Schritt hervorgehoben** — roter Indikator auf der Canvas, vollständiger Fehler im Debug-Panel
- **Verbindungs-Inspector** — klicke auf jede Verbindung, um Live- oder letzte-Lauf-Daten zu sehen, die durchgehen
- **Wiederholen ab fehlgeschlagenem Schritt** — behebe das Problem und fahre fort; erfolgreiche Upstream-Stufen laufen nicht neu
- **Schrittweise Wiedergabe** — lasse jede vergangene Pipeline-Ausführung mit derselben Eingabe neu laufen, um einen Fehler deterministisch zu reproduzieren
- **Verbindungs-Validierung** — die Canvas kann vorab prüfen, ob Upstream- und Downstream-Agenten kompatible Eingabe-/Ausgabe-Formen haben (fängt Inkompatibilitäten vor der Laufzeit ab)

### So funktioniert es

Die Pipeline-Engine emittiert strukturierte Fehler-Ereignisse, wenn eine Agentenausführung einen Fehler hat. Das Debug-Panel abonniert diese Ereignisse und rendert den relevanten Trace + Inspector. Wiederholen-ab-Schritt wird von der Engine unterstützt: sie versendet den fehlgeschlagenen Agenten mit demselben Upstream-Kontext erneut und bewahrt den Rest des Pipeline-Laufs.

:::tip
Die meisten Pipeline-Fehler sind Verbindungsprobleme, keine Agentenprobleme. Wenn etwas bricht, inspiziere zuerst die Verbindungen, die den fehlschlagenden Agenten speisen — welche Form hat er tatsächlich erhalten? Es ist viel öfter "die Daten waren falsch" als "der Agent war falsch"; der Verbindungs-Inspector sagt dir in weniger als einer Minute, welcher Fall es ist.
:::
  `,
};
