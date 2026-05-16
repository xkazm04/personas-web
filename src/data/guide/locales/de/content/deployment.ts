export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Lokale vs. Cloud-Ausführung

Personas-Agenten laufen an zwei Orten: auf deiner lokalen Maschine (der eigenen Engine der Desktop-App) oder auf einem Remote-Orchestrator (von uns cloud-verwaltet oder BYOI auf deiner eigenen Infrastruktur). Lokal ist der Standard und funktioniert out of the box; Cloud ist Opt-in (Team-/Builder-Tier) und ermöglicht 24/7-Verfügbarkeit, ohne dass deine Maschine an sein muss. Derselbe Agenten-Prompt, dieselben Tools und Zugangsdaten funktionieren in beiden Umgebungen — das Wechseln ist eine Deployment-Entscheidung, kein Redesign.

Die entscheidenden Faktoren sind typischerweise Uptime- und Observability-Anforderungen. Lokal funktioniert großartig für Entwicklung, Tests, explorative Agenten und alles, wo du da bist, um die Arbeit zu beobachten. Cloud ist die richtige Wahl für geplante Übernacht-Läufe, Webhook-Agenten, die erreichbar sein müssen, während du schläfst, und jede produktionsreife Automatisierung, bei der "mein Laptop war geschlossen" kein Fehlermodus sein darf.

:::compare
**Lokale Ausführung** [default]
Läuft in der Engine der Desktop-App. Verfügbar, während die App offen ist. Null Setup. Daten und Zugangsdaten verlassen deine Maschine nie. Volle Live-Observability in derselben UI, mit der du baust. Am besten für Entwicklung, Tests, überwachte Arbeit und alles Datenschutz-Sensible.
---
**Cloud-Ausführung**
Läuft auf dem Orchestrator (verwaltete Cloud oder BYOI). 24/7 verfügbar, unabhängig von deiner lokalen Maschine. Setup ist einmalig. Daten und Zugangsdaten werden während der Übertragung zum Orchestrator und im Ruhezustand auf ihm verschlüsselt. Ergebnisse synchronisieren zu deinem Desktop. Am besten für Zeitpläne, Webhooks und produktionsreife unbeaufsichtigte Arbeit.
:::

### So funktioniert es

Lokale Agenten werden von der In-App-Ausführungs-Engine versendet — selber Pfad, den alles andere in der App nutzt. Cloud-Agenten werden deployt: die vollständige Konfiguration des Agenten (Prompt, Tools, Zugangsdaten-Referenzen, Trigger) wird an den Orchestrator gesendet, der einen langlebigen Agentenprozess betreibt, der Trigger serverseitig handhabt. Ergebnisse strömen zurück zur Desktop-App und erscheinen in denselben Monitoring-Ansichten wie lokale Läufe.

:::tip
Entwickle und teste lokal, deploye dann, was funktioniert, in die Cloud. Die lokale Engine hat die schnellste Bearbeiten-Test-Schleife; die Cloud ist, wo du Agenten hinstellst, deren Zeitplan oder Verfügbarkeit wichtig ist. Du musst nicht das eine oder andere global wählen — typische Setups haben die meisten Agenten lokal und eine Handvoll Produktiver in der Cloud.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Mit dem Cloud-Orchestrator verbinden

Öffne Deployment → Cloud Deploy, um dich mit einem Orchestrator zu verbinden. Zwei Wege: der **verwaltete Orchestrator** (wir hosten ihn; du authentifizierst dich mit deinem Konto und bist in 30 Sekunden fertig) oder **BYOI** (du hostest den Orchestrator auf deiner eigenen Infrastruktur; du zeigst die Desktop-App auf deinen Endpunkt und gibst einen Auth-Schlüssel an). In jedem Fall ist die Verbindung pro Maschine einmalig und persistiert über App-Neustarts.

Einmal verbunden, bekommt der Settings-Tab jedes Agenten eine "Deploy to cloud"-Option. Das Triggern des Deployments lädt die Konfiguration des Agenten zum Orchestrator hoch und startet einen langlebigen serverseitigen Prozess dafür. Cloud-Agenten erscheinen in denselben Monitoring-Ansichten wie lokale, mit einem kleinen Cloud-Symbol getaggt.

:::steps
1. **Öffne Deployment → Cloud Deploy** — Seitenleiste → Deployment → Cloud Deploy
2. **Wähle Umgebung** — Managed Cloud (Ein-Klick-Anmeldung) oder BYOI (gib deine Orchestrator-URL + Auth-Schlüssel ein)
3. **Für BYOI**: füge die Orchestrator-URL und das Auth-Token ein; der Assistent führt einen Verbindungstest aus und verifiziert die Orchestrator-Versions-Kompatibilität
4. **Für Managed**: klicke "Sign in"; der OAuth-Flow öffnet sich, um sich mit deinem Personas-Konto zu authentifizieren
5. **Speichern** — die Verbindung persistiert; Agenten zeigen jetzt eine "Deploy to cloud"-Option in ihrem Settings-Tab
:::

:::warning
Behandle das BYOI-Auth-Token wie jede andere Zugangsdaten: speichere es im Tresor (Connections → Credentials → Custom), füge es nicht in Chats ein oder committe es in die Versionskontrolle. Wer das Token hält, kann jeden Agenten auf dem Orchestrator deployen und undeployen.
:::

### So funktioniert es

Der Orchestrator ist ein langlaufender Serverprozess (einer pro Umgebung), der deployte Agentenkonfigurationen hält und sie nach Zeitplan, auf Webhook-Ereignis oder auf Anfrage ausführt. Die Kommunikation zwischen Desktop-App und Orchestrator erfolgt über TLS mit gegenseitiger Auth. Zugangsdaten deployter Agenten werden zur Deploy-Zeit mit dem mandantenspezifischen Schlüssel des Orchestrators verschlüsselt und nur innerhalb des Orchestrator-Prozesses zur Laufzeit entschlüsselt.

:::tip
Teste die Verbindung, bevor du etwas deployst. Der Verbindungstest des Assistenten verifiziert Versionskompatibilität und Erreichbarkeit — wenn er fehlschlägt, ist der Fehler jetzt viel leichter zu diagnostizieren als nachdem du versucht hast, drei Agenten zu deployen.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Einen Agenten in die Cloud deployen

Mit einem verbundenen Orchestrator ist das Deployen jedes Agenten ein Knopfdruck auf seinem Settings-Tab. Die Deploy-Aktion verpackt die vollständige Konfiguration des Agenten (Prompt, Tools, Zugangsdaten-Referenzen, Trigger-Definitionen, Einstellungen) und sendet sie über TLS an den Orchestrator. Der Orchestrator validiert, richtet den Agenten ein und beginnt, seine Trigger serverseitig zu handhaben. Der erste Lauf passiert typischerweise innerhalb von Sekunden.

Lokale und Cloud-Kopien desselben Agenten bleiben über dasselbe Auto-Sync-System synchron, das alle Desktop ↔ Cloud-Koordination handhabt. Du kannst weiter lokal am Agenten iterieren und neu deployen, wenn du bereit bist; du musst nicht zwischen den beiden Umgebungen wählen.

:::steps
1. **Verifiziere die Orchestrator-Verbindung** — Deployment → Cloud Deploy sollte "Connected" anzeigen
2. **Öffne den Agenten** — Agents-Seite → den, den du deployen willst
3. **Settings-Tab → Deploy to Cloud** — Knopf im Deployment-Bereich
4. **Überprüfe die Deployment-Zusammenfassung** — gelieferte Zugangsdaten, scharfgemachte Trigger, Modellauswahl, Failover-Einstellungen; alles sollte mit dem übereinstimmen, was du lokal getestet hast
5. **Bestätige Deploy** — der Orchestrator empfängt die Konfiguration, validiert, richtet den Agenten ein; der Status wechselt in Sekunden auf "Deployed"
6. **Verifiziere im Dashboard** — Overview → Activity zeigt den Agenten mit einem Cloud-Symbol; das nächste geplante / Webhook-Ereignis wird zur Cloud-Instanz geroutet
:::

:::warning
Cloud-Agenten nutzen Zugangsdaten aus dem Cloud-seitigen Tresor, nicht direkt aus deinem lokalen Tresor. Die Deploy-Aktion liefert *Zugangsdaten-Referenzen* (verschlüsselt), und der Orchestrator löst sie serverseitig auf. Wenn eine Zugangsdaten nur lokal ist oder nicht repliziert wurde, zeigt das Deployment eine "credential not available in cloud"-Warnung an und bittet dich, entweder zu replizieren oder einen Ersatz zu wählen, bevor abgeschlossen wird.
:::

### So funktioniert es

Das Deployment ist atomar: entweder akzeptiert der Orchestrator die gesamte Konfiguration und der Agent geht live, oder er lehnt ab (mit einem spezifischen Grund) und nichts ändert sich serverseitig. Einmal deployt, besitzt der Orchestrator die Trigger-Auswertung — deine lokale App feuert keine Zeitpläne / Webhooks mehr für diesen Agenten (du bekämst sonst Duplikate). Manuelle Läufe von der Desktop-App werden über dieselbe Verbindung an die Cloud-Instanz geroutet.

:::tip
Deploye zuerst geplante Agenten, wenn du mit Cloud beginnst. Sie profitieren am meisten von 24/7-Uptime, und sie sind am einfachsten zu verifizieren (du siehst den Lauf zu seinem erwarteten Zeitplan landen, egal ob dein Laptop offen ist oder nicht).
:::
  `,

  "cloud-execution-monitoring": `
## Cloud-Ausführungs-Monitoring

Cloud-Agenten sind über dieselben Overview-Seiten wie lokale Agenten sichtbar — derselbe Activity-Feed, derselbe Health-Tab, dieselben Usage-Aufschlüsselungen. Ein kleines Cloud-Symbol unterscheidet Cloud-Agenten von lokalen. Klicke in eine beliebige Cloud-Ausführung, und du bekommst den vollständigen Trace wie bei einem lokalen Lauf: gerenderter Prompt, Modellaufruf, Tool-Aufrufe, Ausgabe, Kosten.

Die Desktop-App pollt kontinuierlich beim Orchestrator, während sie offen ist, und abonniert Live-Ereignisströme, während sie verbunden ist, sodass was du siehst der Live-Zustand mit einer Verzögerung im Sekunden-Bereich ist, nicht in Minuten. Wenn die App geschlossen ist, hält der Orchestrator alles eigenständig am Laufen; das spätere Öffnen der App holt den lokalen Zustand aus dem autoritativen Store des Orchestrators nach.

### Wichtige Punkte

- **Vereinheitlichte Monitoring-Oberfläche** — lokale und Cloud-Agenten teilen dieselben Activity-/Health-/Usage-Ansichten
- **Live-Event-Streaming** während der Desktop verbunden ist; Orchestrator-seitige Persistenz garantiert, dass nichts verloren geht, wenn du offline bist
- **Cloud-Symbol** unterscheidet Cloud-residente Agenten
- **Kostenzuordnung zur Cloud** — Usage-Charts enthalten sowohl lokale als auch Cloud-Ausgaben, aufgeschlüsselt nach Umgebung
- **Nachholen bei Wiederverbindung** — das Öffnen der App nach längerer Offline-Zeit synchronisiert alle verpassten Ereignisse vom Orchestrator

### So funktioniert es

Cloud-Agenten emittieren dieselben Ausführungs- und Ereignis-Datensätze wie lokale; der Orchestrator speichert sie serverseitig und repliziert sie bei Verbindung zur Desktop-App. Der Activity-Feed führt lokale und Cloud-Event-Streams in chronologischer Reihenfolge zusammen, sodass ein gemischtes Lokal-+-Cloud-Setup wie eine vereinheitlichte Ansicht aussieht, nicht wie zwei parallele.

:::tip
Setze Tagesbudget-Limits für Cloud-Agenten ab Tag eins. Cloud-Agenten haben keine implizite "ich beobachte das gerade"-Prüfung, die lokale manuelle Läufe haben; das Tagesbudget ist dein Sicherheitsnetz gegen einen außer Kontrolle geratenen Prompt über Nacht.
:::
  `,

  "github-actions-integration": `
## GitHub Actions-Integration

Agenten können GitHub Actions-Workflows über das GitHub-Tool in ihrem Connectors-Tab triggern, und GitHub Actions können Agenten über den Standard-Webhook-Trigger triggern. Die zwei Muster kombinieren sich gut: ein GitHub-Ereignis (PR geöffnet, Push zu main, Release getaggt) feuert einen Webhook, der einen Personas-Agenten startet, der Agent macht seine Sache, und (falls nötig) triggert der Agent als Teil seiner Ausgabe einen Workflow.

Der GitHub-Konnektor ist im Katalog (Connections → Catalog → Developer Tools → GitHub). Auth ist OAuth oder ein feingranulares PAT — OAuth ist bevorzugt, wenn der Agent nur Lesezugriff braucht; PATs funktionieren gut für Schreiboperationen wie das Versenden von Workflows.

### Wichtige Punkte

- **GitHub → Personas über eingehenden Webhook** — Standard-Webhook-Trigger; konfiguriere GitHub, an die URL des Agenten zu POSTen
- **Personas → GitHub über das GitHub-Tool** — der Agent kann Workflows versenden, auf PRs kommentieren, Issues öffnen, alles was die GitHub-API bereitstellt
- **Eingeschränkter Auth** — OAuth für hauptsächlich lesende Agenten, feingranulares PAT für Schreiboperationen; minimale Scopes pro Agent
- **Live-Status-Sync** — Agenten-Traces zeigen die workflow_dispatch-Anfrage und GitHubs Antwort; der Agent kann auf den Abschluss des Workflows warten, falls nötig

### So funktioniert es

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

Das GitHub-Tool umhüllt die GitHub-REST/GraphQL-APIs und stellt dem Agenten hochrangige Aktionen bereit: "dispatch workflow", "comment on PR", "open issue", "merge PR" usw. Der Prompt des Agenten nennt die Aktion, die er basierend auf dem Trigger ausführen soll; das Tool handhabt Auth, Nutzlast-Konstruktion und Antwortverarbeitung.

:::warning
Verwende feingranulare PATs gegenüber klassischen PATs, wann immer dein GitHub-Plan sie unterstützt. Klassische PATs gewähren breite organisationsweite Berechtigungen; feingranulare PATs beschränken auf spezifische Repositories und spezifische Berechtigungs-Scopes, was den Blast-Radius dramatisch reduziert, falls das Token jemals leakt.
:::

:::tip
Beginne mit einem Workflow mit geringem Einsatz als Ziel — wie einem "notify Slack"-Workflow, der einfach eine Nachricht postet. Sobald die Agent → GitHub Actions-Übergabe bewiesen ist, wechsle zu Zielen mit höherem Einsatz (Deploy, Release-Cut usw.).
:::
  `,

  "gitlab-ci-cd-integration": `
## GitLab CI/CD-Integration

Personas integriert sich auf zwei Wegen mit GitLab: ein direktes GitLab-Plugin, das Agenten API-Ebenen-Zugriff gibt (Pipeline-Status, MR-Kommentare, Issue-Management), und ein GitLab CI YAML-Export, der Personas-Agenten als Schritte innerhalb deiner bestehenden Pipelines laufen lässt. Beide werden ausgeliefert; wähle das, was zur Form deines Team-Workflows passt.

Das Plugin (Plugins → GitLab) handhabt die API-seitige Integration: installiere, authentifiziere, und deine Agenten bekommen eine \`gitlab\`-Tool-Oberfläche mit den hochrangigen Aktionen (Pipeline starten, auf MR kommentieren, Issues verwalten). Der CI YAML-Export geht in die andere Richtung — deine Agenten werden Schritte in deinen GitLab CI-Pipelines, ausgeführt von GitLab-Runnern, mit Ergebnissen, die an nachfolgende Schritte weitergegeben werden.

### Wichtige Punkte

- **GitLab-Plugin** — API-Ebenen-Integration; der Agent nutzt GitLab als Tool aus seinem Connectors-Tab
- **CI YAML-Export** — der Agent wird ein Schritt in deiner GitLab-Pipeline; läuft auf deinen GitLab-Runnern
- **Bidirektional** — GitLab-Ereignisse können Agenten triggern (Webhook), und Agenten können GitLab-Pipelines triggern (Plugin)
- **Token-Scopes** — verwende Project Access Tokens oder Group Access Tokens, die auf die minimal benötigten Berechtigungen beschränkt sind
- **Pipeline-Ereignisse als Trigger** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` sind alle über Webhook-Trigger konsumierbar

### So funktioniert es

Das Plugin nutzt GitLab-API-Tokens, die im Zugangsdaten-Tresor gespeichert sind. Wenn ein Agent eine GitLab-Tool-Aktion aufruft, versendet die Engine den API-Aufruf, erfasst die Antwort und gibt sie als Tool-Ergebnis für den nächsten Zug des Modells zurück.

Für den CI-Export: öffne den Settings-Tab des Agenten → Export → GitLab CI YAML. Der Assistent generiert eine Job-Definition, die den Agenten in eine CI-lauffähige Form verpackt (typischerweise ein Docker-Image mit der Personas-CLI plus der Referenz des Agenten). Committe das generierte YAML in die \`.gitlab-ci.yml\` deines Repositorys; der Agent läuft als Teil deiner Pipeline neben anderen CI-Jobs.

:::warning
Das exportierte CI YAML referenziert Zugangsdaten-Variablen für Dinge wie KI-Anbieter-Schlüssel. Definiere diese als **maskierte, geschützte** GitLab CI/CD-Variablen in deinen Projekt-Einstellungen — hartcodiere niemals Geheimnisse in der YAML-Datei selbst, da Pipeline-YAML in deinem Repo lebt und für jeden mit Lesezugriff sichtbar ist.
:::

:::tip
Das Plugin ist die leichtere Option für die meisten Teams. Der CI YAML-Export ist am nützlichsten, wenn der Agent ohnehin in einem GitLab-Runner laufen muss (Netzwerkisolation, Ressourcen im internen Netzwerk, compliance-vorgeschriebene Infrastruktur) — sonst lässt dich das Plugin den Agenten in Personas halten, wo seine Observability und sein Debugging am reichhaltigsten sind.
:::
  `,

  "n8n-workflow-integration": `
## n8n-Workflow-Integration

n8n ist ein beliebtes Open-Source-Workflow-Automatisierungstool, und Personas integriert sich bidirektional damit. Du kannst bestehende n8n-Workflows als Vorlagen in Personas importieren (Templates → n8n Import) — der Import-Assistent parst die Workflow-JSON und mappt n8n-Knoten auf äquivalente Personas-Agenten, -Konnektoren und -Trigger. Du kannst auch Personas-Agenten *aus* n8n aufrufen, indem du HTTP/Webhook-Knoten verwendest, um die eingehende Webhook-URL eines Agenten aufzurufen.

Der n8n-Import ist einseitig und einmalig: er bringt die *Form* des Workflows in Personas, aber er hält das n8n-Original nicht synchron. Nach dem Import gehört die importierte Pipeline dir, unabhängig zu bearbeiten.

### Wichtige Punkte

- **n8n → Personas-Import** — Templates → n8n Import; parst Workflow-JSON, mappt Knoten auf Personas-Äquivalente
- **Personas → n8n-Trigger** — n8ns HTTP/Webhook-Knoten können an die Webhook-Trigger-URL eines Agenten POSTen
- **n8n → Personas-Trigger** — n8n kann einen Personas-Agenten-Webhook als Teil eines n8n-Workflows aufrufen; die Antwort des Agenten (konfigurierbar) fließt zurück zu n8n
- **Nicht synchronisiert** — importierte Pipelines weichen von ihrer n8n-Quelle ab; behandle den Import als einmaligen Ausgangspunkt
- **Abdeckung gemappter Knoten** — der Importer handhabt gängige Knoten (HTTP, Function, IF, Switch); exotische / Community-Knoten können als Platzhalter für manuelle Vervollständigung importiert werden

### So funktioniert es

Der Import-Assistent liest die n8n-Workflow-JSON (Export aus n8n → "Download" auf dem Workflow), mappt jeden Knoten auf sein nächstgelegenes Personas-Äquivalent (HTTP-Knoten → Tools, Function-Knoten → Agenten, IF/Switch → bedingtes Routing usw.) und staget das Ergebnis als Pipeline, die du vor der Annahme in der Vorschau siehst. Das Mapping ist Best-Effort: alles, was der Importer nicht zuverlässig mappen kann, wird zu einem Platzhalter mit einer Notiz für dich zum Ausfüllen.

Für die umgekehrte Richtung ist die Webhook-URL des Personas-Agenten einfach eine URL — jeder n8n-HTTP-Knoten kann sie aufrufen. Übergib die Eingabe als Request-Body; der Agent verarbeitet und antwortet (optional) synchron mit seiner Ausgabe.

:::tip
n8n glänzt beim "Daten zwischen Diensten bewegen"-Klempnern; Personas glänzt beim "Denken" — Analysieren, Entscheiden, Schreiben. Die stärksten kombinierten Workflows nutzen n8n für die Orchestrierung plus Personas-Agenten für KI-gestützte Entscheidungspunkte, statt zu versuchen, alles vom einen im anderen zu machen.
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

BYOI (Builder-Tier) bedeutet, dass du den Orchestrator selbst betreibst, statt unsere verwaltete Cloud zu nutzen. Du installierst die Orchestrator-Software (bereitgestellt als Docker-Image und Kubernetes Helm-Chart) auf deiner eigenen Infrastruktur, konfigurierst sie nach deinen Präferenzen (Auth, Speicher, Netzwerk) und zeigst die Desktop-App auf deine Orchestrator-URL. Ab diesem Punkt funktioniert das Deployen von Agenten identisch zu verwalteter Cloud — sie laufen einfach auf deiner Hardware.

BYOI ist die richtige Wahl, wenn Datensouveränität wichtig ist (regulierte Umgebungen, Kundendaten-Isolation, Air-Gap-Netzwerke), wenn du bestehende Infrastruktur hast, die du nutzen willst (statt zusätzlich zu verwaltetem Hosting zu zahlen), oder wenn du volle Kontrolle über die Laufzeitumgebung willst (benutzerdefiniertes Netzwerk, spezifische Verfügbarkeitsgarantien, Integration mit deinem bestehenden Observability-Stack).

### Wichtige Punkte

- **Selbstgehosteter Orchestrator** — Docker-Image + Helm-Chart pro Release veröffentlicht
- **Datensouveränität** — Ausführungsdaten, Zugangsdaten und Traces verlassen deine Infrastruktur nie
- **Gleiche Agent-Semantik** — Agenten, die zu einem BYOI-Orchestrator deployt werden, verhalten sich identisch zu verwalteter Cloud
- **Dein Auth, dein Speicher, dein Netzwerk** — der Orchestrator integriert sich mit deinem bestehenden Identity-Provider, deiner Datenbank und deinen Netzwerkrichtlinien
- **Builder-Tier-Feature** — erfordert Builder-Abo für die Orchestrator-Software-Lizenz

### So funktioniert es

Der Orchestrator läuft als langlebiger Serverprozess. Das Docker-Image ist eigenständig für Single-Node-Deployments; der Helm-Chart unterstützt HA-Multi-Node-Setups mit geteiltem Speicher. Auth integriert sich mit OIDC-Anbietern, sodass du dein bestehendes SSO verwenden kannst; der Speicher nutzt Postgres (verwaltet oder selbst gehostet); die Verschlüsselungsschlüssel des Zugangsdaten-Tresors leben in deinem KMS deiner Wahl (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Das Deployen eines Agenten zu einem BYOI-Orchestrator ist aus der Perspektive der Desktop-App identisch zu verwalteter Cloud — gleiche UI, gleicher Flow, gleiche Observability. Der Orchestrator-Endpunkt ist einfach so konfiguriert, dass er auf deine Installation statt unserer zeigt.

:::info
BYOI ist echte Infrastrukturarbeit. Die Orchestrator-Software ist gut dokumentiert, und der Helm-Chart handhabt das meiste Setup, aber du brauchst immer noch jemanden, der mit dem Betrieb von Produktionsserver-Software vertraut ist. Für Teams ohne diese Kapazität ist verwaltete Cloud der bessere Ausgangspunkt — wechsle später zu BYOI, wenn sich die Anforderungen ändern.
:::

:::tip
Lasse BYOI zuerst in einer Staging-Umgebung laufen, wenn du neu darin bist. Das Setup-Handbuch enthält einen "minimal local stack" Docker Compose, der den Orchestrator + Postgres + Vault auf einer einzelnen Maschine ausführt — perfekt, um die beweglichen Teile zum Laufen zu bringen, bevor du Produktionshardware bereitstellst.
:::
  `,

  "syncing-desktop-and-cloud": `
## Desktop und Cloud synchronisieren

Wenn du Agenten zu einem Cloud-Orchestrator deployt hast, hält die Desktop-App den Zustand zwischen beiden automatisch synchron. Lokale Bearbeitungen an einem deployten Agenten (Prompt-Änderung, Einstellungs-Anpassung, Zugangsdaten-Rotation) pushen beim Speichern zum Orchestrator. Cloud-seitige Ereignisse (Ausführungsergebnisse, Trigger-Auslösungen, Health-Änderungen) synchronisieren zurück zum Desktop und erscheinen in Monitoring-Ansichten.

Die Synchronisation läuft kontinuierlich im Hintergrund, während der Desktop verbunden ist. Wenn die App offline ist, queuen lokale Änderungen und pushen bei Wiederverbindung; Cloud-Ereignisse sammeln sich serverseitig und strömen bei Wiederverbindung herunter. Die Statusleiste zeigt den Sync-Zustand mit einem kleinen Indikator (grün = vollständig synchron, gelb = Sync in Gang / gequeute Änderungen, rot = Sync-Fehler braucht Aufmerksamkeit).

### Wichtige Punkte

- **Bidirektional, automatisch** — lokale Änderungen pushen beim Speichern; Cloud-Ereignisse strömen kontinuierlich herunter
- **Offline-tolerant** — lokale Änderungen queuen offline und pushen bei Wiederverbindung; die Cloud bewahrt Ereignisse zum Nachholen
- **Konflikterkennung** — wenn derselbe Agent lokal und remote bearbeitet wird (z. B. von einem Teammitglied, das denselben Orchestrator nutzt), fordert der Desktop zur Auflösung vor dem Commit auf
- **Statusindikator** — Element in der unteren Leiste zeigt den Live-Sync-Zustand
- **Manuelle Synchronisation** — klicke auf den Indikator für expliziten Sync-Trigger; nützlich direkt vor dem Trennen

### So funktioniert es

Sync nutzt einen Versionsvektor pro Ressource. Jeder Agent, jede Zugangsdaten, jeder Trigger und jeder Ausführungsdatensatz trägt eine Version, die sich bei Änderung erhöht. Sync ist "send my versions, receive any newer ones" — effizient, konfliktbewusst. Konflikte (selten, aber möglich in Setups mit geteiltem Orchestrator) erscheinen als Auflösungsaufforderung; du wählst, welche Version gewinnt, oder mergst manuell.

:::tip
Wirf einen Blick auf den Sync-Indikator nach bedeutsamen Änderungen. Grün bedeutet, es ist sicher, die App zu schließen und der Cloud zu vertrauen, dass sie das Neueste hat. Gelb bedeutet, Änderungen sind unterwegs — warte ein paar Sekunden vor dem Trennen, wenn du sicher sein willst.
:::
  `,

  "cloud-troubleshooting": `
## Cloud-Fehlerbehebung

Die meisten Cloud-Probleme fallen in eine kleine Menge: Orchestrator unerreichbar (Netzwerk / Firewall / Orchestrator down), Zugangsdaten-Inkompatibilität (eine Zugangsdaten, die der Agent nutzt, ist nicht auf die Orchestrator-Seite repliziert), Versions-Inkompatibilität (Orchestrator auf älterem Release als der Desktop, fehlende Features) oder out-of-sync-Konfiguration (lokal hat ungespeicherte Änderungen, die nicht gepusht wurden). Die Deployment → Cloud Deploy-Statusseite ist die einzig beste Diagnose-Oberfläche — sie zeigt Orchestrator-Gesundheit, Sync-Zustand und Pro-Agent-Deployment-Status mit spezifischen Fehlergründen.

Für agent-spezifische Probleme (Agent deployt, aber läuft nicht; Läufe schlagen in der Cloud fehl, aber erfolgreich lokal), zeigt der Health-Tab des Agenten dieselben Diagnosen für Cloud wie für lokal — Zugangsdaten-Status, jüngste Fehlergründe, Konfigurationsvollständigkeit. Der Ausführungs-Trace zeigt auch, ob ein Lauf auf Cloud oder lokal ausgeführt wurde, sodass du "Cloud-only"-Probleme schnell isolieren kannst.

### Häufige Probleme und Behebungen

| Symptom | Wahrscheinliche Ursache | Behebung |
|---|---|---|
| Agent läuft nicht nach Zeitplan | Orchestrator unerreichbar oder Trigger Cloud-seitig deaktiviert | Prüfe Deployment-Status; deploye erneut, wenn der Trigger-Zustand veraltet ist |
| Zugangsdaten-Fehler beim ersten Cloud-Lauf | Zugangsdaten nicht zum Orchestrator repliziert | Deployment → Cloud Deploy → "Sync credentials"; verifiziere den Connectors-Tab des Agenten |
| Ergebnisse erscheinen nicht auf dem Desktop | Sync pausiert oder App offline, als der Lauf passierte | Klicke auf den Sync-Indikator; Ereignisse strömen bei Wiederverbindung herunter |
| Cloud-Agent langsamer als lokal | Anderes Modell / Anbieter beim Deployen konfiguriert; oder Netzwerklatenz vom Agenten zum KI-Anbieter | Prüfe die effektive Konfiguration des Agenten in der Cloud Deploy-Detailansicht |
| "Version mismatch"-Fehler beim Deploy | Orchestrator auf älterem Release | Aktualisiere den Orchestrator (BYOI) oder warte auf den Managed-Cloud-Rollout |

### So funktioniert es

Die Deployment-Statusseite pollt den Orchestrator kontinuierlich, während der Desktop verbunden ist, und rendert das Ergebnis als einzelnes Dashboard. Jeder deployte Agent hat einen Pro-Ressource-Status (healthy / degraded / unreachable) mit benanntem spezifischem Problem. Die meisten Probleme haben eine Ein-Klick-Auflösung direkt aus der Statuszeile angeboten.

:::warning
"Redeploy" ist die einfachste Behebung für viele Cloud-Probleme, aber es pusht den *aktuellen lokalen Zustand* zum Orchestrator. Wenn du lokale Änderungen hast, die du nicht überprüft hast (oder, auf einem geteilten Orchestrator, die Cloud Änderungen hat, die nicht lokal angekommen sind), kann das Erneut-Deployen sie überschreiben. Prüfe immer zuerst den Sync-Zustand — wenn gelb, löse Sync vor dem erneuten Deployen.
:::

:::tip
Das mit Abstand häufigste Cloud-Problem ist "ich habe vergessen, eine Zugangsdaten zum Cloud-Tresor zu replizieren". Vor dem Deployen jedes Agenten prüft der Deploy-Assistent die Zugangsdaten-Verfügbarkeit vorab und warnt; achte auf diese Warnung, statt sie zu verwerfen, und die meisten Cloud-seitigen Zugangsdaten-Fehler verschwinden.
:::
  `,
};
