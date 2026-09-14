export const content: Record<string, string> = {
  "github-actions-integration": `
## Intégration GitHub Actions

Les agents peuvent déclencher des workflows GitHub Actions via l'outil GitHub sur leur onglet Connecteurs, et GitHub Actions peut déclencher des agents via le déclencheur webhook standard. Les deux modèles se combinent bien : un événement GitHub (PR ouverte, push vers main, version étiquetée) déclenche un webhook qui démarre un agent Personas, l'agent fait sa chose, et (si nécessaire) l'agent déclenche un workflow dans le cadre de sa sortie.

Le connecteur GitHub est livré dans le Catalogue (Connexions → Catalogue → Outils de développement → GitHub). L'authentification est OAuth ou un PAT à granularité fine — OAuth est préféré quand l'agent a besoin uniquement d'un accès en lecture ; les PAT fonctionnent bien pour les opérations d'écriture comme l'envoi de workflows.

### Points clés

- **GitHub → Personas via webhook entrant** — déclencheur webhook standard ; configurez GitHub pour POSTer à l'URL de l'agent
- **Personas → GitHub via l'outil GitHub** — l'agent peut envoyer des workflows, commenter sur les PR, ouvrir des issues, tout ce que l'API GitHub expose
- **Authentification scopée** — OAuth pour les agents principalement en lecture, PAT à granularité fine pour les opérations d'écriture ; scopes minimums par agent
- **Synchronisation de statut en direct** — les traces d'agent affichent la requête workflow_dispatch et la réponse de GitHub ; l'agent peut attendre la fin du workflow si nécessaire

### Comment ça marche

:::diagram
[Événement GitHub] --> [Webhook entrant] --> [L'agent décide] --> [L'outil GitHub envoie le workflow] --> [Résultat du workflow dans la trace]
:::

L'outil GitHub enveloppe les API REST/GraphQL de GitHub et expose des actions de haut niveau à l'agent : "envoyer un workflow", "commenter sur une PR", "ouvrir une issue", "fusionner une PR", etc. Le prompt de l'agent nomme l'action qu'il doit prendre en fonction du déclencheur ; l'outil gère l'authentification, la construction de la charge utile et la gestion de la réponse.

:::warning
Utilisez les PAT à granularité fine plutôt que les PAT classiques chaque fois que votre plan GitHub les prend en charge. Les PAT classiques accordent de larges permissions au niveau organisation ; les PAT à granularité fine restreignent à des dépôts spécifiques et à des scopes de permission spécifiques, ce qui resserre considérablement le rayon d'explosion si le jeton fuit un jour.
:::

:::tip
Commencez avec un workflow à faible enjeu comme cible — comme un workflow "notifier Slack" qui publie juste un message. Une fois que la passation agent → GitHub Actions est prouvée, passez à des cibles à plus haut enjeu (déploiement, coupe de version, etc.).
:::
  `,

  "gitlab-ci-cd-integration": `
## Intégration GitLab CI/CD

Personas s'intègre à GitLab de deux manières : un plugin GitLab direct qui donne aux agents un accès au niveau API (statut de pipeline, commentaires de MR, gestion d'issues), et un export YAML CI GitLab qui exécute les agents Personas comme étapes à l'intérieur de vos pipelines existants. Les deux sont livrés ; choisissez celui qui correspond à la forme du flux de travail de votre équipe.

Le plugin (Plugins → GitLab) gère l'intégration côté API : installez, authentifiez, et vos agents obtiennent une surface d'outils \`gitlab\` avec les actions de haut niveau (démarrer un pipeline, commenter sur une MR, gérer les issues). L'export YAML CI va dans l'autre direction — vos agents deviennent des étapes dans vos pipelines GitLab CI, exécutés par les runners GitLab, avec les résultats passés aux étapes suivantes.

### Points clés

- **Plugin GitLab** — intégration au niveau API ; l'agent utilise GitLab comme outil depuis son onglet Connecteurs
- **Export YAML CI** — l'agent devient une étape dans votre pipeline GitLab ; s'exécute sur vos runners GitLab
- **Bidirectionnel** — les événements GitLab peuvent déclencher des agents (webhook), et les agents peuvent déclencher des pipelines GitLab (plugin)
- **Scopes de jetons** — utilisez des jetons d'accès de projet ou des jetons d'accès de groupe scopés aux permissions minimales nécessaires
- **Événements de pipeline comme déclencheurs** — \`Pipeline réussi\`, \`Pipeline échoué\`, \`MR fusionnée\` sont tous consommables via déclencheur webhook

### Comment ça marche

Le plugin utilise des jetons API GitLab stockés dans le coffre d'identifiants. Quand un agent invoque une action d'outil GitLab, le moteur envoie l'appel API, capture la réponse, et la renvoie comme résultat d'outil pour le prochain tour du modèle.

Pour l'export CI : ouvrez l'onglet Paramètres de l'agent → Exporter → YAML CI GitLab. L'assistant génère une définition de job qui enveloppe l'agent dans une forme exécutable en CI (typiquement une image Docker avec la CLI Personas plus la référence de l'agent). Validez le YAML généré dans le \`.gitlab-ci.yml\` de votre dépôt ; l'agent s'exécute dans le cadre de votre pipeline aux côtés de tout autre job CI.

:::warning
Le YAML CI exporté référence des variables d'identifiants pour des choses comme les clés de fournisseur d'IA. Définissez-les comme variables CI/CD GitLab **masquées, protégées** dans les paramètres de votre projet — ne codez jamais en dur les secrets dans le fichier YAML lui-même, puisque le YAML de pipeline vit dans votre dépôt et est visible par quiconque a accès en lecture.
:::

:::tip
Le plugin est l'option la plus légère pour la plupart des équipes. L'export YAML CI est le plus utile quand l'agent doit s'exécuter dans un runner GitLab de toute façon (isolation réseau, ressources réseau interne, infrastructure mandatée par la conformité) — sinon le plugin vous permet de garder l'agent dans Personas où son observabilité et son débogage sont les plus riches.
:::
  `,

  "n8n-workflow-integration": `
## Intégration des workflows n8n

n8n est un outil populaire d'automatisation de workflow open source, et Personas s'y intègre de manière bidirectionnelle. Vous pouvez importer des workflows n8n existants dans Personas comme modèles (Modèles → Import n8n) — l'assistant d'importation analyse le JSON du workflow et mappe les nœuds n8n vers les agents, connecteurs et déclencheurs Personas équivalents. Vous pouvez également appeler des agents Personas *depuis* n8n en utilisant les nœuds HTTP/webhook pour invoquer l'URL webhook entrant d'un agent.

L'importation n8n est à sens unique et unique : elle apporte la *forme* du workflow dans Personas, mais elle ne garde pas l'original n8n synchronisé. Après l'importation, le pipeline importé vous appartient pour être édité indépendamment.

### Points clés

- **Import n8n → Personas** — Modèles → Import n8n ; analyse le JSON de workflow, mappe les nœuds vers les équivalents Personas
- **Déclencheur Personas → n8n** — les nœuds HTTP/webhook de n8n peuvent POSTer à l'URL de déclencheur webhook d'un agent
- **Déclencheur n8n → Personas** — n8n peut appeler un webhook d'agent Personas dans le cadre d'un workflow n8n ; la réponse de l'agent (configurable) revient à n8n
- **Non synchronisé** — les pipelines importés divergent de leur source n8n ; traitez l'importation comme un point de départ unique
- **Couverture des nœuds mappés** — l'importateur gère les nœuds courants (HTTP, function, IF, switch) ; les nœuds exotiques / communautaires peuvent être importés comme placeholders pour complétion manuelle

### Comment ça marche

L'assistant d'importation lit le JSON du workflow n8n (exportez depuis n8n → "Télécharger" sur le workflow), mappe chaque nœud à son équivalent Personas le plus proche (nœuds HTTP → outils, nœuds function → agents, IF/switch → routage conditionnel, etc.), et met en attente le résultat comme un pipeline que vous prévisualisez avant d'accepter. Le mappage est au mieux : tout ce que l'importateur ne peut pas mapper en toute confiance devient un placeholder avec une note pour que vous le remplissiez.

Pour la direction inverse, l'URL webhook de l'agent Personas est juste une URL — n'importe quel nœud HTTP n8n peut l'appeler. Passez l'entrée comme corps de requête ; l'agent traite et (optionnellement) répond de manière synchrone avec sa sortie.

:::tip
n8n excelle dans la plomberie "déplacer des données entre services" ; Personas excelle dans la "réflexion" — analyser, décider, écrire. Les workflows combinés les plus forts utilisent n8n pour l'orchestration plus les agents Personas pour les points de décision alimentés par l'IA, plutôt que d'essayer de tout faire dans l'un ou dans l'autre.
:::
  `,

};
