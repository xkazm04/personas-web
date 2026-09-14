export const content: Record<string, string> = {
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

};
