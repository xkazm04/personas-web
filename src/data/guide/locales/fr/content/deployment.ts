export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Exécution locale vs cloud

Les agents Personas s'exécutent à deux endroits : sur votre machine locale (le propre moteur de l'application de bureau) ou sur un orchestrateur distant (géré dans le cloud par nous, ou BYOI sur votre propre infrastructure). Local est la valeur par défaut et fonctionne dès la sortie de la boîte ; cloud est opt-in (niveau Team / Builder) et permet une disponibilité 24/7 sans que votre machine soit allumée. Le même prompt, outils et identifiants d'agent fonctionnent dans l'un ou l'autre environnement — basculer est une décision de déploiement, pas une refonte.

Les facteurs déterminants sont typiquement les exigences de disponibilité et d'observabilité. Local fonctionne très bien pour le développement, les tests, les agents exploratoires et tout ce où vous êtes là pour regarder le travail. Cloud est le bon choix pour les exécutions planifiées nocturnes, les agents webhook qui doivent être joignables pendant que vous dormez, et toute automatisation de qualité production où "mon ordinateur portable était fermé" ne peut pas être un mode d'échec.

:::compare
**Exécution locale** [default]
S'exécute dans le moteur de l'application de bureau. Disponible pendant que l'application est ouverte. Aucune configuration. Les données et identifiants ne quittent jamais votre machine. Observabilité en direct complète dans la même UI avec laquelle vous construisez. Idéal pour le développement, les tests, le travail supervisé et tout ce qui est sensible à la confidentialité.
---
**Exécution cloud**
S'exécute sur l'orchestrateur (cloud géré ou BYOI). Disponible 24/7 indépendamment de votre machine locale. Configuration unique. Les données et identifiants sont chiffrés en transit vers l'orchestrateur et au repos sur celui-ci. Les résultats se synchronisent vers votre bureau. Idéal pour les plannings, webhooks et travail sans surveillance de qualité production.
:::

### Comment ça marche

Les agents locaux sont envoyés par le moteur d'exécution intégré à l'application — même chemin que tout le reste dans l'application utilise. Les agents cloud sont déployés : la configuration complète de l'agent (prompt, outils, identifiants par référence, déclencheurs) est envoyée à l'orchestrateur, qui exécute un processus d'agent à longue durée qui gère les déclencheurs côté serveur. Les résultats sont diffusés vers l'application de bureau et apparaissent dans les mêmes vues de surveillance que les exécutions locales.

:::tip
Développez et testez localement, puis déployez ce qui fonctionne dans le cloud. Le moteur local a la boucle d'édition-test la plus rapide ; le cloud est où vous mettez les agents dont le planning ou la disponibilité comptent. Vous n'avez pas à choisir l'un ou l'autre globalement — les configurations typiques ont la plupart des agents locaux et une poignée d'agents de production dans le cloud.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Se connecter à l'orchestrateur cloud

Ouvrez Déploiement → Cloud Deploy pour vous connecter à un orchestrateur. Deux chemins : l'**orchestrateur géré** (nous l'hébergeons ; vous vous authentifiez avec votre compte et c'est fini en 30 secondes) ou **BYOI** (vous hébergez l'orchestrateur sur votre propre infrastructure ; vous pointez l'application de bureau vers votre point de terminaison et fournissez une clé d'authentification). Dans les deux cas, la connexion est unique par machine et persiste à travers les redémarrages de l'application.

Une fois connecté, l'onglet Paramètres de chaque agent gagne une option "Déployer vers le cloud". Déclencher le déploiement envoie la configuration de l'agent à l'orchestrateur et démarre un processus à longue durée côté serveur pour lui. Les agents cloud apparaissent dans les mêmes vues de surveillance que les locaux, étiquetés avec une petite icône cloud.

:::steps
1. **Ouvrez Déploiement → Cloud Deploy** — barre latérale → Déploiement → Cloud Deploy
2. **Choisissez l'environnement** — Cloud géré (connexion en un clic) ou BYOI (entrez votre URL d'orchestrateur + clé d'authentification)
3. **Pour BYOI** : collez l'URL de l'orchestrateur et le jeton d'authentification ; l'assistant exécute un test de connexion et vérifie la compatibilité de version de l'orchestrateur
4. **Pour Géré** : cliquez sur "Se connecter" ; le flux OAuth s'ouvre pour s'authentifier contre votre compte Personas
5. **Enregistrez** — la connexion persiste ; les agents affichent maintenant une option "Déployer vers le cloud" dans leur onglet Paramètres
:::

:::warning
Traitez le jeton d'authentification BYOI comme tout autre identifiant : stockez-le dans le coffre (Connexions → Identifiants → Personnalisé), ne le collez pas dans un chat et ne le validez pas dans le contrôle de version. Quiconque détient le jeton peut déployer et annuler le déploiement de n'importe quel agent sur l'orchestrateur.
:::

### Comment ça marche

L'orchestrateur est un processus serveur à longue durée (un par environnement) qui détient les configurations d'agents déployés et les exécute sur planning, sur événement webhook ou à la demande. La communication entre l'application de bureau et l'orchestrateur se fait via TLS avec authentification mutuelle. Les identifiants des agents déployés sont chiffrés au moment du déploiement en utilisant la clé par locataire de l'orchestrateur et déchiffrés uniquement à l'intérieur du processus orchestrateur à l'exécution.

:::tip
Testez la connexion avant de déployer quoi que ce soit. Le test de connexion de l'assistant vérifie la compatibilité de version et l'accessibilité — s'il échoue, l'échec est beaucoup plus facile à diagnostiquer maintenant qu'après avoir essayé de déployer trois agents.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Déployer un agent vers le cloud

Avec un orchestrateur connecté, déployer n'importe quel agent est un bouton sur son onglet Paramètres. L'action de déploiement empaquette la configuration complète de l'agent (prompt, outils, références d'identifiants, définitions de déclencheurs, paramètres) et l'envoie à l'orchestrateur via TLS. L'orchestrateur valide, met en place l'agent et commence à gérer ses déclencheurs côté serveur. La première exécution a généralement lieu en quelques secondes.

Les copies locales et cloud du même agent restent synchronisées via le même système d'auto-synchronisation qui gère toute la coordination bureau ↔ cloud. Vous pouvez continuer à itérer sur l'agent localement et redéployer quand vous êtes prêt ; vous n'avez pas à choisir entre les deux environnements.

:::steps
1. **Vérifiez la connexion de l'orchestrateur** — Déploiement → Cloud Deploy devrait afficher "Connecté"
2. **Ouvrez l'agent** — page Agents → celui que vous voulez déployer
3. **Onglet Paramètres → Déployer vers le cloud** — bouton dans la section déploiement
4. **Examinez le résumé du déploiement** — identifiants en cours d'envoi, déclencheurs en cours d'armement, sélection de modèle, paramètres de basculement ; tout devrait correspondre à ce que vous avez testé localement
5. **Confirmez Déployer** — l'orchestrateur reçoit la configuration, valide, met en place l'agent ; le statut bascule à "Déployé" en quelques secondes
6. **Vérifiez dans le tableau de bord** — Vue d'ensemble → Activité affiche l'agent avec une icône cloud ; le prochain événement planifié / webhook acheminera vers l'instance cloud
:::

:::warning
Les agents cloud utilisent les identifiants du coffre côté cloud, pas votre coffre local directement. L'action de déploiement envoie les *références* d'identifiants (chiffrées) et l'orchestrateur les résout côté serveur. Si un identifiant est local uniquement ou n'a pas été répliqué, le déploiement fera apparaître un avertissement "identifiant non disponible dans le cloud" et vous demandera soit de répliquer soit de choisir un substitut avant de terminer.
:::

### Comment ça marche

Le déploiement est atomique : soit l'orchestrateur accepte la configuration entière et l'agent passe en direct, soit il rejette (avec une raison spécifique) et rien ne change côté serveur. Une fois déployé, l'orchestrateur possède l'évaluation des déclencheurs — votre application locale ne déclenche plus les plannings / webhooks pour cet agent (sinon vous obtiendriez des doublons). Les exécutions manuelles depuis l'application de bureau sont acheminées vers l'instance cloud via la même connexion.

:::tip
Déployez d'abord les agents planifiés quand vous commencez avec le cloud. Ils bénéficient le plus de la disponibilité 24/7, et ils sont les plus faciles à vérifier (vous verrez l'exécution arriver sur son planning attendu, que votre ordinateur portable soit ouvert ou non).
:::
  `,

  "cloud-execution-monitoring": `
## Surveillance de l'exécution cloud

Les agents cloud sont visibles depuis les mêmes pages Vue d'ensemble que les agents locaux — même flux d'activité, même onglet Santé, mêmes ventilations Utilisation. Une petite icône cloud distingue les agents cloud des locaux. Cliquez dans n'importe quelle exécution cloud et vous obtenez la trace complète comme pour une exécution locale : prompt rendu, appel de modèle, appels d'outils, sortie, coût.

L'application de bureau sonde l'orchestrateur en permanence pendant qu'elle est ouverte et s'abonne aux flux d'événements en direct pendant la connexion, donc ce que vous voyez est l'état en direct avec un délai mesuré en secondes, pas en minutes. Quand l'application est fermée, l'orchestrateur continue tout par lui-même ; ouvrir l'application plus tard rattrape l'état local à partir du magasin faisant autorité de l'orchestrateur.

### Points clés

- **Surface de surveillance unifiée** — les agents locaux et cloud partagent les mêmes vues Activité / Santé / Utilisation
- **Streaming d'événements en direct** pendant que le bureau est connecté ; la persistance côté orchestrateur garantit que rien n'est perdu quand vous êtes hors ligne
- **Icône cloud** distingue les agents résidant dans le cloud
- **Attribution de coût au cloud** — les graphiques d'utilisation incluent les dépenses locales et cloud, ventilées par environnement
- **Rattrapage à la reconnexion** — ouvrir l'application après un temps prolongé hors ligne synchronise tous les événements manqués depuis l'orchestrateur

### Comment ça marche

Les agents cloud émettent les mêmes enregistrements d'exécution et d'événements que les locaux ; l'orchestrateur les stocke côté serveur et les réplique à l'application de bureau à la connexion. Le flux d'activité fusionne les flux d'événements locaux et cloud dans l'ordre chronologique, donc une configuration mixte local + cloud ressemble à une vue unifiée plutôt qu'à deux parallèles.

:::tip
Définissez des plafonds budgétaires par jour sur les agents cloud dès le premier jour. Les agents cloud n'ont pas de vérification implicite "je regarde cela se produire" que les exécutions manuelles locales ont ; le plafond par jour est votre filet de sécurité contre un prompt incontrôlé pendant la nuit.
:::
  `,

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

  "byoi-bring-your-own-infrastructure": `
## BYOI — Apportez votre propre infrastructure

BYOI (niveau Builder) signifie que vous exécutez l'orchestrateur vous-même au lieu d'utiliser notre cloud géré. Vous installez le logiciel orchestrateur (fourni comme image Docker et chart Kubernetes Helm) sur votre propre infrastructure, le configurez à vos préférences (authentification, stockage, réseau), et pointez l'application de bureau vers votre URL d'orchestrateur. À partir de ce point, déployer des agents fonctionne de manière identique au cloud géré — ils s'exécutent juste sur votre matériel.

BYOI est le bon choix quand la souveraineté des données compte (environnements réglementaires, isolation des données client, réseaux isolés), quand vous avez une infrastructure existante que vous voulez exploiter (plutôt que de payer pour l'hébergement géré en plus), ou quand vous voulez un contrôle total sur l'environnement d'exécution (réseau personnalisé, garanties de disponibilité spécifiques, intégration avec votre stack d'observabilité existant).

### Points clés

- **Orchestrateur auto-hébergé** — image Docker + chart Helm publiés par version
- **Souveraineté des données** — données d'exécution, identifiants et traces ne quittent jamais votre infrastructure
- **Mêmes sémantiques d'agent** — les agents déployés sur un orchestrateur BYOI se comportent de manière identique au cloud géré
- **Votre authentification, votre stockage, votre réseau** — l'orchestrateur s'intègre avec votre fournisseur d'identité, base de données et politiques réseau existants
- **Fonctionnalité de niveau Builder** — nécessite un abonnement Builder pour la licence du logiciel orchestrateur

### Comment ça marche

L'orchestrateur s'exécute comme un processus serveur à longue durée. L'image Docker est autonome pour les déploiements à nœud unique ; le chart Helm prend en charge les configurations multi-nœuds HA avec stockage partagé. L'authentification s'intègre avec les fournisseurs OIDC pour que vous puissiez utiliser votre SSO existant ; le stockage utilise Postgres (géré ou auto-hébergé) ; les clés de chiffrement du coffre d'identifiants vivent dans votre KMS de choix (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Déployer un agent sur un orchestrateur BYOI est identique au cloud géré du point de vue de l'application de bureau — même UI, même flux, même observabilité. Le point de terminaison de l'orchestrateur est juste configuré pour pointer vers votre installation au lieu de la nôtre.

:::info
BYOI est vraiment du travail d'infrastructure. Le logiciel orchestrateur est bien documenté et le chart Helm gère la plupart de la configuration, mais vous aurez toujours besoin de quelqu'un à l'aise avec l'exécution de logiciels serveur de production. Pour les équipes sans cette capacité, le cloud géré est le meilleur point de départ — basculez vers BYOI plus tard si les exigences changent.
:::

:::tip
Exécutez BYOI dans un environnement de staging d'abord si vous êtes nouveau. Le guide de configuration inclut une "stack locale minimale" Docker Compose qui exécute l'orchestrateur + Postgres + Vault sur une seule machine — parfait pour faire fonctionner les pièces mobiles avant de déployer du matériel de production.
:::
  `,

  "syncing-desktop-and-cloud": `
## Synchroniser bureau et cloud

Quand vous avez des agents déployés sur un orchestrateur cloud, l'application de bureau garde l'état synchronisé entre les deux automatiquement. Les modifications locales à un agent déployé (changement de prompt, ajustement de paramètres, rotation d'identifiants) sont envoyées à l'orchestrateur à l'enregistrement. Les événements côté cloud (résultats d'exécution, déclenchements, changements de santé) se synchronisent vers le bureau et apparaissent dans les vues de surveillance.

La synchronisation s'exécute en arrière-plan en continu pendant que le bureau est connecté. Quand l'application est hors ligne, les modifications locales sont mises en file d'attente et envoyées à la reconnexion ; les événements cloud s'accumulent côté serveur et descendent en streaming à la reconnexion. La barre de statut affiche l'état de synchronisation avec un petit indicateur (vert = entièrement synchronisé, ambre = synchronisation en cours / modifications en file d'attente, rouge = erreur de synchronisation nécessite attention).

### Points clés

- **Bidirectionnel, automatique** — les modifications locales sont envoyées à l'enregistrement ; les événements cloud descendent en streaming en continu
- **Tolérant aux déconnexions** — les modifications locales sont mises en file d'attente hors ligne et envoyées à la reconnexion ; le cloud préserve les événements pour le rattrapage
- **Détection de conflits** — si le même agent est édité localement et à distance (par ex. par un coéquipier utilisant le même orchestrateur), le bureau demande de résoudre avant de valider
- **Indicateur de statut** — élément de la barre du bas montre l'état de synchronisation en direct
- **Synchronisation manuelle** — cliquez sur l'indicateur pour un déclencheur de synchronisation explicite ; utile juste avant la déconnexion

### Comment ça marche

La synchronisation utilise un vecteur de version par ressource. Chaque agent, identifiant, déclencheur et enregistrement d'exécution porte une version qui s'incrémente au changement. La synchronisation est "envoyer mes versions, recevoir toutes les plus récentes" — efficace, consciente des conflits. Les conflits (rares, mais possibles dans les configurations d'orchestrateur partagé) apparaissent comme une invite de résolution ; vous choisissez quelle version gagne ou fusionnez manuellement.

:::tip
Jetez un œil à l'indicateur de synchronisation après des modifications significatives. Le vert signifie qu'il est sûr de fermer l'application et de faire confiance que le cloud a les dernières. L'ambre signifie que les modifications sont en vol — attendez quelques secondes avant de vous déconnecter si vous voulez être sûr.
:::
  `,

  "cloud-troubleshooting": `
## Dépannage cloud

La plupart des problèmes cloud tombent dans un petit ensemble : orchestrateur injoignable (réseau / pare-feu / orchestrateur hors service), inadéquation d'identifiants (un identifiant que l'agent utilise n'est pas répliqué côté orchestrateur), inadéquation de version (orchestrateur sur une version plus ancienne que le bureau, fonctionnalités manquantes), ou configuration désynchronisée (le local a des modifications non enregistrées qui n'ont pas été envoyées). La page de statut Déploiement → Cloud Deploy est la meilleure surface de diagnostic unique — elle affiche la santé de l'orchestrateur, l'état de synchronisation et le statut de déploiement par agent avec des raisons d'échec spécifiques.

Pour les problèmes au niveau agent (agent déployé mais ne s'exécutant pas, exécutions échouant dans le cloud mais réussissant localement), l'onglet Santé de l'agent affiche les mêmes diagnostics pour le cloud que pour le local — statut des identifiants, raisons d'échec récentes, complétude de la configuration. La trace d'exécution affiche également si une exécution s'est exécutée sur le cloud ou en local, pour que vous puissiez isoler rapidement les problèmes "uniquement cloud".

### Problèmes courants et solutions

| Symptôme | Cause probable | Solution |
|---|---|---|
| L'agent ne s'exécute pas sur planning | Orchestrateur injoignable, ou déclencheur désactivé côté cloud | Vérifiez le statut de déploiement ; redéployez si l'état du déclencheur est obsolète |
| Erreur d'identifiant lors de la première exécution cloud | Identifiant non répliqué vers l'orchestrateur | Déploiement → Cloud Deploy → "Synchroniser les identifiants" ; vérifiez l'onglet Connecteurs de l'agent |
| Résultats n'apparaissant pas sur le bureau | Synchronisation en pause ou application hors ligne quand l'exécution s'est produite | Cliquez sur l'indicateur de synchronisation ; les événements descendent en streaming à la reconnexion |
| Agent cloud plus lent que local | Modèle / fournisseur différent configuré au déploiement ; ou latence réseau de l'agent au fournisseur d'IA | Vérifiez la config effective de l'agent dans la vue détail Cloud Deploy |
| Erreur "Inadéquation de version" au déploiement | Orchestrateur sur une version plus ancienne | Mettez à niveau l'orchestrateur (BYOI) ou attendez le déploiement du cloud géré |

### Comment ça marche

La page de statut Déploiement sonde l'orchestrateur en continu pendant que le bureau est connecté et rend le résultat comme un tableau de bord unique. Chaque agent déployé a un statut par ressource (sain / dégradé / injoignable) avec le problème spécifique nommé. La plupart des problèmes ont une résolution en un clic offerte directement depuis la ligne de statut.

:::warning
"Redéployer" est la solution la plus facile pour de nombreux problèmes cloud, mais elle envoie *l'état local actuel* à l'orchestrateur. Si vous avez des modifications locales que vous n'avez pas examinées (ou, sur un orchestrateur partagé, le cloud a des modifications qui n'ont pas atteint le local), le redéploiement peut les écraser. Vérifiez toujours l'état de synchronisation d'abord — s'il est ambre, résolvez la synchronisation avant de redéployer.
:::

:::tip
Le problème cloud le plus courant de loin est "j'ai oublié de répliquer un identifiant vers le coffre cloud". Avant de déployer tout agent, l'assistant de déploiement pré-vérifie la disponibilité des identifiants et avertit ; faites attention à cet avertissement plutôt que de l'ignorer, et la plupart des erreurs d'identifiants côté cloud disparaissent.
:::
  `,
};
