export const content: Record<string, string> = {
  "how-agent-memory-works": `
## Wie das Agenten-Gedächtnis funktioniert

Deine Agenten können sich an vergangene Aufgaben erinnern und aus Erfahrung lernen. Jedes Mal, wenn ein Agent läuft, kann er nützliche Informationen speichern — Fakten, Entscheidungen, Muster und gelernte Lektionen. Stell es dir wie ein Notizbuch vor, das dein Agent von Aufgabe zu Aufgabe trägt und im Laufe der Zeit Wissen aufbaut.

Das bedeutet, dass deine Agenten klüger werden, je mehr du sie nutzt. Ein Agent, der hunderte Kundenanfragen bearbeitet hat, wird Kontext über häufige Probleme, bevorzugte Lösungen und vergangene Entscheidungen haben, den ein brandneuer Agent nicht kennen würde.

### Wichtige Punkte

- Agenten **lernen automatisch** aus jeder abgeschlossenen Aufgabe
- Memories bleiben **zwischen Läufen** erhalten — dein Agent erinnert sich an vorherige Arbeit
- Jede Memory wird **kategorisiert und nach Wichtigkeit eingestuft**
- Du kannst jede Memory jederzeit **überprüfen, bearbeiten oder löschen**

### So funktioniert es

Während eines Laufs erstellt der Agent, wenn er auf etwas Erinnerungswürdiges stößt — einen nützlichen Fakt, eine wichtige Entscheidung oder eine gelernte Lektion —, einen Memory-Eintrag. Beim nächsten Mal, wenn der Agent läuft, kann er relevante Memories abrufen, um bessere Entscheidungen zu treffen. Du hast die volle Kontrolle, um zu überprüfen und zu verwalten, woran sich dein Agent erinnert.

:::tip
Memory funktioniert am besten, wenn Agenten konsistente, fokussierte Aufgaben haben. Ein Agent, der immer Spesenabrechnungen bearbeitet, baut nützlichere Memories auf als einer, der jedes Mal eine andere Aufgabe macht.
:::
  `,

  "memory-categories": `
## Memory-Kategorien

Memories sind in fünf Kategorien organisiert, jede mit einem anderen Zweck. Diese Struktur hilft deinem Agenten, die richtige Art von Wissen zur richtigen Zeit abzurufen — wie Kapitel in einem Nachschlagewerk.

Diese Kategorien zu verstehen hilft dir, das Wissen deines Agenten effektiver zu überprüfen und zu verwalten. Jede Kategorie sagt dir nicht nur *was* der Agent weiß, sondern *welche Art* von Wissen es ist.

### Die fünf Kategorien

:::compare
**Fact**
Konkrete Information, die aus Aufgaben gelernt wurde. Beispiel: "Der Kunde bevorzugt formelle Sprache." Geradlinige Wissensteile, die dein Agent aufnimmt.
---
**Decision**
Getroffene Entscheidungen und die Begründung dahinter. Beispiel: "Express-Versand gewählt, weil die Bestellung dringend war." Hält das Warum fest, nicht nur das Was.
---
**Insight**
Über mehrere Läufe entdeckte Muster. Beispiel: "Support-Tickets steigen jeden Montagmorgen sprunghaft an." Wird mit der Zeit klüger.
---
**Learning**
Lektionen aus Fehlern oder Erfolgen. Beispiel: "Kürzere Betreffzeilen haben höhere Öffnungsraten." Kontinuierliche Verbesserung in Aktion.
---
**Warning**
Fallstricke, auf die du achten musst. Beispiel: "Versende nie Rechnungen vor der Unterzeichnung des Vertrags." Verhindert, dass dein Agent vergangene Fehler wiederholt.
:::

### So funktioniert es

Wenn ein Agent eine Memory erstellt, kategorisiert er sie automatisch basierend auf dem Inhalt. Fakten sind geradlinige Informationsteile. Entscheidungen halten Wahlen mit Begründung fest. Insights erfassen Muster. Learnings kommen aus dem Reflektieren über Ergebnisse. Warnungen kennzeichnen Dinge zum Vermeiden.

:::tip
Achte während deiner Reviews besonders auf die Warnungen-Kategorie. Diese Memories helfen deinem Agenten, vergangene Fehler nicht zu wiederholen — sie sind oft die wertvollsten.
:::
  `,

  "importance-levels": `
## Wichtigkeitsstufen

Jede Memory hat einen Wichtigkeitswert von 1 bis 5. Ein Wert von 1 bedeutet, es ist Routine-Information, während 5 kritisch bedeutet. Wichtige Memories werden öfter abgerufen, bleiben länger erhalten und bekommen mehr Gewicht, wenn der Agent Entscheidungen trifft — genau wie du dich an große Lebensereignisse besser erinnerst als an das, was du letzten Dienstag zum Mittag hattest.

Dieses Ranking-System hält deinen Agenten auf das Wichtigste fokussiert, statt in trivialen Details zu ertrinken.

### Die Skala

| Stufe | Label | Abruf-Priorität | Beschreibung |
|-------|-------|-----------------|-------------|
| 1 | Routine | Niedrig | Kleinere Details, die gelegentlich nützlich sein könnten |
| 2 | Useful | Moderat | Hilfreicher Kontext, der das Verständnis bereichert |
| 3 | Important | Standard | Wissen, das regelmäßig Entscheidungen beeinflusst |
| 4 | Very Important | Hoch | Schlüsselinformationen, die der Agent fast immer berücksichtigen sollte |
| 5 | Critical | Immer | Essenzielles Wissen, das nie vergessen oder ignoriert werden darf |

### So funktioniert es

Die Wichtigkeit wird automatisch beim Erstellen einer Memory zugewiesen, basierend auf Faktoren wie der Häufigkeit, mit der die Information referenziert wird, und dem Einfluss auf Ergebnisse. Du kannst Wichtigkeitsstufen auch manuell anpassen, wenn du mit der automatischen Zuweisung nicht einverstanden bist.

:::tip
Wenn ein Agent immer wieder denselben Fehler macht, prüfe, ob die relevante Memory existiert und ob ihre Wichtigkeitsstufe hoch genug ist. Sie auf 4 oder 5 anzuheben, stellt sicher, dass der Agent ihr Aufmerksamkeit schenkt.
:::
  `,

  "searching-agent-memories": `
## Agenten-Memories durchsuchen

Während deine Agenten Wissen anhäufen, wird die Möglichkeit, ihre Memories zu durchsuchen, essenziell. Tippe ein Stichwort oder eine Phrase und siehe sofort jede verwandte Memory über alle deine Agenten hinweg. Wie das Durchsuchen deiner E-Mails — schnell, einfach, und du kannst nach Kategorie, Wichtigkeit oder Datum filtern.

Suchen hilft dir zu verstehen, was deine Agenten wissen, zu verifizieren, dass sie richtig gelernt haben, und spezifische Informationen schnell zu finden.

### Wichtige Punkte

- **Volltextsuche** — finde Memories nach jedem Stichwort oder jeder Phrase, die sie enthalten
- **Nach Kategorie filtern** — schränke Ergebnisse auf Fakten, Entscheidungen, Insights, Learnings oder Warnungen ein
- **Nach Wichtigkeit filtern** — zeige nur Memories mit hoher oder niedriger Priorität
- **Agentenübergreifende Suche** — suche über alle deine Agenten gleichzeitig oder konzentriere dich auf einen

### So funktioniert es

Öffne den \`Memories\`-Bereich und tippe deine Suchanfrage in die Suchleiste. Ergebnisse erscheinen sofort mit hervorgehobenem passendem Text. Verwende die Filter-Knöpfe, um nach Kategorie, Wichtigkeitsstufe, Datumsbereich oder spezifischem Agenten einzugrenzen. Klicke auf jedes Ergebnis, um die vollständige Memory mit ihrem ganzen Kontext zu sehen.

:::tip
Suche nach einem Thema, bevor du eine manuelle Memory erstellst. Dein Agent weiß vielleicht schon, was du ihm gerade beibringen willst — in diesem Fall kannst du einfach die bestehende Memory aktualisieren.
:::
  `,

  "creating-memories-manually": `
## Memories manuell erstellen

Manchmal willst du, dass dein Agent etwas weiß, bevor er es selbst lernt — wie das Einweisen eines neuen Mitarbeiters am ersten Tag. Manuelle Memories lassen dich deinen Agenten spezifische Fakten, Präferenzen oder Regeln direkt beibringen, was ihnen einen Vorsprung beim Wissen verschafft, das sie sonst durch Erfahrung entdecken müssten.

Das ist besonders nützlich für firmenspezifische Informationen, persönliche Präferenzen oder kritische Regeln, die niemals durch Versuch und Irrtum gelernt werden sollten.

:::steps
1. **Öffne den Memories-Bereich** — klicke \`Memories\` in der Seitenleiste und dann \`Add Memory\`
2. **Wähle die Kategorie** — wähle Fact, Decision, Insight, Learning oder Warning
3. **Schreibe den Memory-Inhalt** — beschreibe das Wissen in klarer Sprache
4. **Setze die Wichtigkeitsstufe** — vergib einen Wert von 1 (Routine) bis 5 (Kritisch)
5. **Weise einem Agenten zu** — wähle einen bestimmten Agenten oder mache die Memory für alle Agenten verfügbar
:::

### So funktioniert es

Die Memory, die du erstellst, wird der Wissensbasis des Agenten hinzugefügt, genau wie eine automatisch gelernte Memory. Beim nächsten Mal, wenn der Agent läuft, kann er auf diese Information neben allem zugreifen, was er selbst gelernt hat. Manuelle Memories sind mit einem kleinen Symbol markiert, sodass du sie von automatischen unterscheiden kannst.

:::tip
Erstelle ein paar "Warning"-Memories für deine kritischsten Regeln, bevor ein Agent live geht. Zum Beispiel: "Teile niemals Preisinformationen ohne Manager-Genehmigung."
:::
  `,

  "memory-tiers-explained": `
## Memory-Tiers erklärt

Nicht alle Memories sind gleich, und nicht alle müssen sofort zugänglich sein. Personas organisiert Memories in vier Tiers basierend darauf, wie häufig sie verwendet werden und wie wichtig sie sind. Stell es dir wie ein Ablagesystem vor: die am meisten genutzten Gegenstände liegen auf deinem Schreibtisch, weniger genutzte gehen in eine Schublade, und selten benötigte werden in einem Schrank abgelegt.

Dieses gestufte System hält deinen Agenten schnell und effizient. Er ruft die relevantesten Memories sofort ab, hat aber bei Bedarf weiterhin Zugriff auf älteres Wissen.

### Die vier Tiers

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
Immer geladen. Permanente kritische Regeln und Fakten. Manuell angeheftet und nie herabgestuft. Das wichtigste Wissen deines Agenten.
---
**Active**
Bei Abruf geladen. Häufig zugegriffene jüngste Memories. Automatisch durch Nutzungshäufigkeit heraufgestuft. Die "Schreibtischschublade" des nützlichen Kontexts.
---
**Working**
Sitzungsbezogen. Memories aus der aktuellen Aufgabe oder jüngsten Sitzungen. Während der Ausführung erstellt und altert mit der Zeit in Active.
---
**Archive**
Nur auf Abruf. Ältere Memories, die kürzlich nicht zugegriffen wurden. Nach Inaktivität automatisch herabgestuft, aber unbegrenzt bewahrt. Nichts geht je verloren.
:::

### So funktioniert es

Memories bewegen sich automatisch zwischen den Tiers basierend auf Nutzungsmustern. Eine häufig abgerufene Memory wird in einen höheren Tier heraufgestuft; eine, die eine Weile nicht zugegriffen wurde, bewegt sich allmählich Richtung Archive. Du kannst Memories auch manuell an den Core-Tier anheften, um sicherzustellen, dass sie für deinen Agenten immer top-of-mind sind.

:::tip
Hefte deine wichtigsten Regeln und Fakten an den Core-Tier. Das garantiert, dass dein Agent sie immer berücksichtigt, unabhängig davon, wie alt sie sind.
:::
  `,

  "memory-and-execution": `
## Memory und Ausführung

Wenn dein Agent eine neue Aufgabe beginnt, startet er nicht mit einem leeren Blatt. Er ruft automatisch relevante Memories aus früheren Läufen ab und bringt Kontext, Präferenzen und gelernte Lektionen in die aktuelle Ausführung ein. Das macht jeden Lauf informierter als den letzten.

Der Abrufprozess ist intelligent — er wirft nicht alle Memories auf einmal aus. Stattdessen wählt er die für die aktuelle Aufgabe relevantesten aus, ähnlich wie du dich natürlich an verwandte Erfahrungen erinnerst, wenn du einer vertrauten Situation gegenüberstehst.

### Wichtige Punkte

- **Automatischer Abruf** — relevante Memories werden vor jeder Ausführung geladen
- **Kontextbewusst** — nur Memories, die mit der aktuellen Aufgabe zusammenhängen, werden abgerufen
- **Nach Wichtigkeit gewichtet** — Memories höherer Wichtigkeit werden eher abgerufen
- **Memory-Erstellung** — neue Memories können während der Ausführung basierend auf Ergebnissen erstellt werden

### So funktioniert es

Bevor dein Agent seine Aufgabe verarbeitet, scannt das Memory-System nach relevanten Einträgen basierend auf dem Inhalt und Kontext der Aufgabe. Diese Memories werden dem KI-Modell neben deinen Anweisungen bereitgestellt. Nach Abschluss der Aufgabe bewertet der Agent, ob etwas Neues gelernt wurde, und erstellt entsprechend Memories.

:::tip
Wenn ein Agent seine Memories nicht effektiv nutzt, prüfe, ob die Memories korrekt kategorisiert und bewertet sind. Gut organisierte Memories werden zuverlässiger abgerufen.
:::
  `,

  "reviewing-and-cleaning-memories": `
## Memories prüfen und aufräumen

Mit der Zeit werden manche Memories veraltet, falsch oder redundant. Regelmäßige Reviews halten die Wissensbasis deines Agenten genau und aktuell. Stell es dir wie Frühjahrsputz für das Gehirn deines Agenten vor — alte Informationen ausräumen, sodass dein Agent Entscheidungen auf Basis aktueller, korrekter Daten trifft.

Eine saubere Memory-Basis führt zu besserer Agenten-Performance. Ein Agent, der sich auf veraltete Informationen verlässt, kann schlechte Entscheidungen treffen, ohne zu merken warum.

### Wichtige Punkte

- **Alle Memories durchstöbern** mit Sortier- und Filteroptionen
- **Bearbeite** jede Memory, um Ungenauigkeiten zu korrigieren oder veraltete Informationen zu aktualisieren
- **Lösche** Memories, die nicht mehr relevant sind
- **Führe** doppelte oder ähnliche Memories zu einem klaren Eintrag **zusammen**

### So funktioniert es

Öffne den \`Memories\`-Bereich und durchstöbere die Memory-Liste deines Agenten. Sortiere nach Datum, Wichtigkeit oder Kategorie, um deinen Review zu fokussieren. Klicke auf jede Memory, um ihren Inhalt zu bearbeiten, ihre Wichtigkeitsstufe zu ändern oder sie zu löschen. Das System schlägt auch potenzielle Duplikate vor, die zusammengeführt werden könnten.

:::tip
Plane einen monatlichen Review der Memories deiner aktivsten Agenten. Selbst 15 Minuten Aufräumen können die Entscheidungsqualität eines Agenten merklich verbessern.
:::
  `,

  "exporting-and-importing-memories": `
## Memories exportieren und importieren

Du kannst die gesamte Memory-Basis deines Agenten in eine Datei exportieren — perfekt für Backups, das Teilen von Wissen zwischen Agenten oder den Umzug auf einen neuen Computer. Der Import lädt eine zuvor exportierte Datei und fügt diese Memories der Wissensbasis des Ziel-Agenten hinzu.

Dieses Feature ist auch großartig, um einem neuen Agenten den Vorteil der Erfahrung eines anderen zu geben. Exportiere von deinem erfahrenen Agenten, importiere in den neuen, und er startet mit einer Fülle von Wissen statt einem leeren Blatt.

### Wichtige Punkte

- **In Datei exportieren** — speichere alle Memories als portable Datei, die du speichern oder teilen kannst
- **Aus Datei importieren** — lade Memories in jeden Agenten auf jedem Gerät
- **Selektiver Export** — wähle spezifische Kategorien oder Wichtigkeitsstufen zum Exportieren
- **Konfliktbehandlung** — Duplikate werden während des Imports erkannt und zusammengeführt

### So funktioniert es

Öffne die Memory-Einstellungen eines Agenten und klicke \`Export\`. Wähle, welche Memories einzubeziehen sind (alle oder gefiltert nach Kategorie/Wichtigkeit) und speichere die Datei. Zum Importieren öffne die Memory-Einstellungen des Ziel-Agenten, klicke \`Import\` und wähle deine Datei. Personas erkennt Duplikate und lässt dich entscheiden, wie sie behandelt werden sollen.

:::tip
Vor einer größeren Änderung am Prompt eines Agenten exportiere seine Memories als Backup. Wenn der neue Prompt Verwirrung stiftet, kannst du die ursprünglichen Memories wiederherstellen.
:::
  `,

  "memory-best-practices": `
## Memory-Best-Practices

Das Meiste aus dem Agenten-Gedächtnis herauszuholen, läuft auf ein paar wichtige Gewohnheiten hinaus. Wie gute Lerngewohnheiten für einen Studenten macht die Art, wie du Memories strukturierst und pflegst, einen großen Unterschied darin, wie effektiv deine Agenten lernen und Informationen abrufen.

Folge diesen Leitlinien, um Agenten zu bauen, die sich mit der Zeit wirklich verbessern, statt Unordnung anzuhäufen.

### Best Practices

- **Halte Agenten fokussiert** — ein Agent mit einer konsistenten Aufgabe baut nützlichere Memories auf als ein Generalist
- **Regelmäßig überprüfen** — prüfe Memories monatlich und entferne veraltete oder falsche Einträge
- **Nutze manuelle Memories für kritische Regeln** — warte nicht, bis der Agent etwas auf die harte Tour lernt
- **Setze angemessene Wichtigkeitsstufen** — nicht alles ist kritisch, und das ist okay
- **Hefte essenzielles Wissen** an den Core-Tier, damit es immer verfügbar ist

### So funktioniert es

Gute Memory-Verwaltung ist eine fortlaufende Praxis, keine einmalige Einrichtung. Beginne damit, ein paar manuelle Memories für deine wichtigsten Regeln zu erstellen. Lasse den Agenten natürlich aus seinen Läufen lernen. Überprüfe regelmäßig, um Fehler zu korrigieren und veraltete Informationen zu entfernen. Passe Wichtigkeitsstufen an, wenn sich dein Verständnis dafür entwickelt, was zählt.

:::tip
Denke an Memory-Verwaltung wie an das Pflegen eines Gartens. Regelmäßige kleine Bemühungen — Beschneiden, Gießen, Umpflanzen — bringen viel bessere Ergebnisse als gelegentliche große Überholungen.
:::
  `,
};
