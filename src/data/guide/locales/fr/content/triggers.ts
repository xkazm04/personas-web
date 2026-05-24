export const content: Record<string, string> = {
  "how-triggers-work": `
## Comment fonctionnent les déclencheurs

Les déclencheurs sont le "quand" de votre agent. Le prompt et les outils définissent *ce que* fait l'agent ; le déclencheur définit *quand* et *avec quelle entrée*. Personas livre sept types de déclencheurs : **manuel** (clic sur un bouton), **planifié** (style cron), **webhook** (HTTP entrant), **presse-papiers** (correspondance d'événement de copie), **surveillance de fichiers** (événements de système de fichiers), **chaîne** (sortie d'un autre agent), et **basé sur les événements** (événements internes émis par d'autres agents, plugins ou le moteur lui-même).

Chaque agent peut avoir un nombre quelconque de déclencheurs, mélangés entre types. Un seul agent peut s'exécuter sur un planning quotidien, réagir à un webhook de Stripe, se déclencher quand vous copiez une adresse e-mail, et être chaînable depuis des agents en amont — tout à la fois.

### Types de déclencheurs

:::compare
**Manual**
Clic sur un bouton dans l'éditeur ou depuis l'exécution rapide de la barre de titre. Chaque agent obtient cela par défaut. Idéal pour les tests et les invocations ad hoc.
---
**Schedule**
Basé sur cron. Toutes les heures, tous les jours, toutes les semaines, ou expression cron complète avec fuseau horaire. Idéal pour le travail de routine qui s'exécute sans entrée — résumés quotidiens, rapports hebdomadaires.
---
**Webhook**
Une URL entrante unique sur laquelle l'agent écoute. Les services externes y POSTent pour démarrer l'agent. Idéal pour "réagir à un événement d'un service tiers".
---
**Clipboard**
Se déclenche quand le texte copié correspond à un modèle configuré (regex, type de contenu ou mot-clé). Idéal pour les raccourcis utilisateur avancé — copiez un e-mail, un agent le recherche.
---
**File Watcher**
Événements de système de fichiers sur un dossier surveillé (créer / modifier / supprimer). Idéal pour les flux de zone de dépôt où les fichiers arrivent à des moments imprévisibles.
---
**Chain**
La sortie de l'agent A devient l'entrée de l'agent B. Idéal pour les pipelines multi-étapes composés d'agents ciblés.
---
**Event-Based**
S'abonne aux événements internes de Personas (un identifiant a expiré, un plugin a émis un événement, une exécution s'est terminée avec manual_review). Idéal pour les automatisations réactives au sein de votre propre configuration.
:::

### Points clés

- **Plusieurs déclencheurs par agent** — pas de limite supérieure ; combinez les types librement
- **Déclenchement indépendant** — chaque déclencheur s'évalue seul ; un déclencheur planifié ne sait ni ne se soucie d'un déclencheur webhook sur le même agent
- **Filtrage par déclencheur** — chaque déclencheur peut avoir ses propres conditions de filtrage (par ex. déclencheur webhook ne se déclenche que sur \`event_type=charge.succeeded\`)
- **Lignée du déclencheur** — le canevas Lignée (Événements → Flux en direct → Lignée) montre quels déclencheurs, quels agents et quels événements sont connectés, de bout en bout dans toute votre configuration
- **Mise en pause individuelle** — désactivez un seul déclencheur sans toucher au reste de l'agent

### Comment ça marche

Les déclencheurs sont configurés dans l'onglet Paramètres de l'agent ou en les ajoutant depuis la liste des déclencheurs sur la page Événements. Le moteur d'exécution évalue les conditions de déclenchement indépendamment et envoie une exécution à l'agent chaque fois qu'un déclencheur correspond. L'exécution porte la charge utile du déclencheur (corps webhook, chemin de fichier, texte copié, sortie en amont, données d'événement) dans l'agent comme entrée.

:::tip
Commencez chaque agent avec juste un déclencheur manuel. Une fois que vous faites confiance à son comportement, ajoutez des déclencheurs automatiques un par un pour pouvoir isoler lequel introduit un problème si quelque chose tourne mal.
:::
  `,

  "manual-triggers": `
## Déclencheurs manuels

Les déclencheurs manuels sont la valeur par défaut pour chaque agent. Cliquez sur \`Exécuter\` dans l'éditeur et l'agent démarre immédiatement, ou utilisez le raccourci d'exécution rapide de la barre de titre (\`Ctrl+Enter\` sur l'agent focalisé). Les exécutions manuelles sont la façon dont vous développez et testez — elles sont l'équivalent d'exécuter un script directement pour voir ce qu'il fait avant d'ajouter une entrée cron.

Vous pouvez passer une entrée personnalisée à chaque fois. L'éditeur d'agent affiche un petit champ d'entrée à côté du bouton Exécuter quand l'agent déclare qu'il accepte une entrée ; tout ce que vous tapez passe comme charge utile du déclencheur.

### Points clés

- **Aucune configuration** — les déclencheurs manuels sont toujours disponibles
- **Entrée optionnelle** — tapez l'entrée directement, collez du JSON structuré, ou exécutez sans entrée pour les agents qui n'en ont pas besoin
- **Exécutions de diagnostic** — les exécutions manuelles sont marquées \`manual\` dans la trace pour que vous puissiez les filtrer hors des rapports de coût / métriques si vous voulez voir uniquement l'activité automatique
- **Conscient de la concurrence** — les exécutions manuelles respectent la limite de concurrence de l'agent ; si la limite est atteinte, le clic est rejeté avec un message clair

### Comment ça marche

Les déclencheurs manuels existent implicitement sur chaque agent — il n'y a pas de bascule pour les désactiver (utilisez \`Désactiver\` sur tout l'agent si vous voulez le verrouiller). Le moteur traite une exécution manuelle de manière identique à une exécution automatisée : même chemin d'exécution, même capture de trace, même comptabilité de coûts. La seule différence est l'étiquette du déclencheur.

:::tip
Utilisez les exécutions manuelles pendant l'itération sur le prompt. Sauvegardez le prompt, exécutez, regardez la trace, modifiez. L'arène du Lab est pour la comparaison systématique ; le manuel est pour des retours rapides dans l'éditeur.
:::
  `,

  "schedule-triggers": `
## Déclencheurs planifiés

Les déclencheurs planifiés exécutent un agent sur une cadence récurrente — toutes les heures, tous les jours de semaine à 8h, le premier lundi du mois, ou toute expression cron que vous pouvez écrire. L'UI de planification vous donne des raccourcis prédéfinis (toutes les heures, tous les jours, toutes les semaines) pour les cas courants, et un champ cron brut pour tout le reste.

Les plannings respectent un fuseau horaire configurable. Par défaut, l'agent utilise le fuseau horaire de votre système, mais vous pouvez le remplacer par déclencheur — utile pour les agents qui doivent s'exécuter "à 9h Eastern" indépendamment d'où vous êtes assis.

### Points clés

- **Préréglages et cron** — choisissez parmi les cadences courantes ou écrivez l'expression cron complète
- **Fuseau horaire par déclencheur** — noms de fuseau horaire IANA (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`) ; l'heure d'été est gérée automatiquement
- **Aperçu de la prochaine exécution** — le déclencheur affiche les trois prochaines heures planifiées pour que vous puissiez vérifier votre expression cron
- **Mettre en pause sans perdre** — désactiver un déclencheur planifié ne le supprime pas ; réactivez pour reprendre

### Configurer un planning

:::steps
1. **Ouvrez les paramètres du déclencheur** — sur l'onglet Paramètres de l'agent, ou depuis la page Événements ; cliquez sur \`Ajouter un déclencheur\` et choisissez Planning
2. **Choisissez un préréglage ou écrivez un cron** — \`0 8 * * 1-5\` pour "8h en semaine", ou utilisez un préréglage pour les cas courants
3. **Définissez le fuseau horaire** — par défaut au système ; modifiez pour les agents liés à un calendrier d'affaires spécifique
4. **Confirmez l'aperçu de la prochaine exécution** — trois prochaines heures d'exécution sont affichées ; vérifiez qu'elles correspondent à ce que vous attendez
5. **Enregistrez** — le déclencheur s'arme immédiatement et apparaît dans la liste des déclencheurs de l'agent avec un compte à rebours "prochaine exécution"
:::

:::tip
Les déclencheurs planifiés ne rattrapent pas les exécutions manquées. Si l'application est fermée ou que la machine est en veille quand une heure planifiée passe, cette exécution est sautée. Pour le travail planifié critique, utilisez le déploiement cloud (niveau Builder) afin que l'orchestrateur gère la planification côté serveur.
:::
  `,

  "webhook-triggers": `
## Déclencheurs webhook

Les déclencheurs webhook exposent une URL entrante unique sur laquelle l'agent écoute. Quand un service externe POSTe à cette URL, le corps devient la charge utile du déclencheur et l'agent s'exécute. La plupart des services tiers qui prennent en charge les webhooks (Stripe, GitHub, Shopify, Linear, Twilio, API internes personnalisées) fonctionnent sans modification.

Le déclencheur prend en charge le filtrage sur le corps de la requête, les en-têtes et la méthode pour qu'un seul point de terminaison puisse être sélectif sur les événements qui démarrent réellement l'agent. Modèle courant : une URL webhook par agent, filtrée à des types d'événements spécifiques du service en amont.

### Points clés

- **URL unique par déclencheur** — générée automatiquement ; jamais partagée entre agents ou déclencheurs
- **Expressions de filtre** — les correspondances JSONPath / en-tête vous permettent d'accepter uniquement les événements qui vous intéressent
- **Point de terminaison de rejeu** — chaque webhook reçu est préservé et peut être rejoué manuellement depuis la page de détail du déclencheur
- **Envoyer un test** — bouton intégré qui POSTe des charges utiles d'échantillon contre votre point de terminaison local pour que vous puissiez valider les filtres et la réponse de l'agent sans le service externe
- **Entrant et sortant sont séparés** — voir ci-dessous

### Connecter un webhook

:::steps
1. **Ajoutez un déclencheur webhook** — page Événements → Ajouter un déclencheur → Webhook ; liez-le à l'agent
2. **Copiez l'URL générée** — unique à ce déclencheur ; n'expire jamais sauf si vous supprimez le déclencheur
3. **Configurez le service externe** — collez l'URL dans la configuration webhook du service (tableau de bord Stripe, paramètres de dépôt GitHub, etc.)
4. **Définissez les expressions de filtre** — restreignez à des types d'événements ou formes de charge utile spécifiques pour ne pas exécuter l'agent sur chaque événement que le service émet
5. **Testez** — utilisez Envoyer un test avec une charge utile d'échantillon (ou déclenchez un événement réel dans le service en amont) ; inspectez la trace et ajustez les filtres si nécessaire
:::

### Webhooks entrants vs sortants

Les webhooks viennent en deux saveurs et il vaut la peine de les garder distincts :

- **Webhooks entrants (ce sujet)** — un service externe *vous* appelle pour démarrer un agent. Stripe vous ping quand une charge réussit ; GitHub vous ping quand une PR s'ouvre.
- **Webhooks sortants (une fonctionnalité distincte)** — *votre* agent envoie son résultat à un canal après avoir terminé. Personas livre une livraison sortante de première classe vers Slack, Discord, Microsoft Teams et URLs webhook génériques, configurée par agent dans l'onglet Connecteurs. La sortie de l'agent est formatée de manière appropriée pour chaque canal (blocs Slack riches, embeds Discord, cartes Teams) et distribuée une fois l'exécution terminée.

La plupart des automatisations finissent par utiliser les deux : un webhook entrant démarre l'agent, l'agent fait son travail, et un canal sortant livre le résultat là où votre équipe regarde.

:::tip
Pour les webhooks de développement local ou de pré-production, utilisez le bouton \`Envoyer un test\` avec une charge utile d'échantillon plutôt que de configurer le vrai amont. Vous itérerez sur les filtres et les prompts beaucoup plus vite sans aller-retour avec le service tiers.
:::
  `,

  "clipboard-monitor": `
## Surveillance du presse-papiers

La surveillance du presse-papiers regarde votre presse-papiers système et déclenche l'agent quand le contenu copié correspond à vos règles. Copiez un numéro de commande — l'agent le recherche. Copiez une phrase en langue étrangère — l'agent la traduit. Copiez l'e-mail d'un client — l'agent récupère son compte.

La correspondance peut être sur des mots-clés simples, des modèles regex, ou des heuristiques de type de contenu (adresse e-mail, URL, numéro de téléphone, en forme de JSON, nombre, ID structuré). Le déclencheur évalue la règle à chaque changement de presse-papiers et ne se déclenche que quand une règle correspond, il reste donc silencieusement en arrière-plan jusqu'à ce que vous copiiez quelque chose d'intéressant.

### Points clés

- **Basé sur des règles** — définissez une ou plusieurs règles par déclencheur ; la première correspondance gagne
- **Modes de correspondance** — mot-clé, regex, ou heuristiques de type de contenu intégrées (e-mail/URL/téléphone/JSON/etc.)
- **Silencieux par défaut** — les copies non correspondantes ne déclenchent même pas un journal d'évaluation ; seules les correspondances créent de l'activité
- **Modes de sortie** — afficher comme notification de bureau, pousser vers la boîte de réception du Cockpit, ou rester silencieux et juste écrire dans le flux d'activité de l'agent
- **Confidentialité** — le contenu du presse-papiers reste local ; rien n'est téléchargé sauf vers le fournisseur d'IA que l'agent lui-même appelle

### Comment ça marche

Le déclencheur s'enregistre auprès du système de presse-papiers de l'OS au démarrage de l'application. Quand le presse-papiers change, le nouveau contenu est évalué par rapport à chaque règle sur ce déclencheur ; la première correspondance déclenche l'agent avec le contenu copié comme entrée. Les copies non correspondantes sont supprimées sans laisser de trace, donc le moniteur ne gonfle pas le journal d'activité.

:::tip
Soyez spécifique avec les règles. Une surveillance du presse-papiers correspondant à chaque symbole \`@\` se déclenchera sur des copies que vous n'aviez pas l'intention d'utiliser. Utilisez une regex d'e-mail complète, ou limitez à "copies qui ressemblent à un ID client" (correspondant à votre propre forme d'ID).
:::
  `,

  "file-watcher-triggers": `
## Déclencheurs de surveillance de fichiers

Les déclencheurs de surveillance de fichiers se déclenchent quand des fichiers apparaissent, changent ou disparaissent dans un dossier que vous avez désigné. Déposez un CSV dans un dossier et un agent le traite. Sauvegardez une image dans un répertoire "Traiter" et un agent OCR / classification agit dessus. Modifiez un fichier de configuration et un agent le compare à la version précédente.

Les dossiers surveillés peuvent être sur le système de fichiers local ou tout emplacement synchronisé (OneDrive, Dropbox, iCloud). Les filtres affinent les événements par type de fichier / modèle glob pour que vous n'exécutiez pas l'agent sur des changements non pertinents (comme les fichiers macOS \`.DS_Store\` ou les fichiers de swap temporaires de l'éditeur).

### Points clés

- **Surveiller n'importe quel dossier** — local ou stockage cloud synchronisé ; récursion de sous-dossier optionnelle
- **Types d'événements** — créer / modifier / supprimer ; abonnez-vous à un, deux ou tous les trois
- **Filtres glob** — \`*.csv\`, \`**/invoices/*.pdf\` ; prend en charge les modèles de négation
- **Débondage** — les modifications rapides successives se fusionnent en un seul événement de déclenchement (pas de double déclenchement pour les flux de sauvegarde-et-resauvegarde-immédiate)
- **Charge utile** — l'agent reçoit le chemin du fichier et (quand le fichier est assez petit) le contenu en ligne ; sinon un chemin que l'agent peut lire avec son outil d'accès aux fichiers

### Comment ça marche

Le déclencheur utilise les API de surveillance de fichiers natives de l'OS (FSEvents sur macOS, ReadDirectoryChangesW sur Windows, inotify sur Linux). Le surveillant s'exécute dans le processus moteur pendant que l'application est ouverte. Quand un événement correspond au filtre du déclencheur, le moteur envoie une exécution d'agent avec les métadonnées du fichier comme entrée. Le moteur achemine également les événements de surveillance de fichiers vers le **producteur ambiant** : tout agent abonné à l'événement ambiant pertinent peut réagir sans avoir besoin de son propre surveillant.

:::tip
Créez un dossier de zone de dépôt dédié pour chaque agent qui utilise une surveillance de fichiers. Mélanger les surveillants sur des dossiers partagés ("Téléchargements", "Bureau") conduit à des déclenchements surprises quand vous y sauvegardez des fichiers non liés.
:::
  `,

  "chain-triggers": `
## Déclencheurs en chaîne

Les déclencheurs en chaîne connectent les agents de bout en bout : quand l'agent A se termine avec succès, l'agent B démarre avec la sortie de A comme entrée. C'est ainsi que les automatisations multi-étapes sont construites — chaque agent est petit et ciblé, la chaîne les assemble en un pipeline.

Les chaînes peuvent se ramifier (la sortie d'un agent alimente plusieurs agents en aval) et converger (plusieurs agents en amont alimentent un en aval). Elles peuvent également être conditionnelles — le déclencheur peut avoir un filtre qui ne transmet la sortie que si elle correspond à une condition, donc vous n'exécutez l'agent en aval que dans les cas qui comptent.

:::diagram
[Agent de recherche] --> [Agent de rédaction] --> [Agent de formatage] --> [Sortie finale]
:::

### Points clés

- **Câblage sortie → entrée** — automatique ; le prompt de l'agent en aval voit la sortie en amont mot pour mot (ou transformée si vous configurez un transformateur)
- **Ramifier et converger** — les chaînes plusieurs à un et un à plusieurs sont prises en charge
- **Transfert conditionnel** — les expressions de filtre sur le déclencheur en chaîne vous permettent de transférer uniquement sur certaines conditions (la sortie contient "erreur", ou un champ dépasse un seuil)
- **L'échec arrête la chaîne** — si un agent en amont échoue, les agents en aval chaînés ne s'exécutent pas ; l'échec apparaît dans la vue de lignée pour que vous puissiez voir exactement où la chaîne s'est cassée
- **Visible de bout en bout** — le canevas Événements → Flux en direct → Lignée montre le graphe complet des agents chaînés et le flux d'exécution en direct

### Comment ça marche

Sur l'onglet Paramètres de l'agent en aval, ajoutez un déclencheur Chaîne et choisissez l'agent en amont. Le moteur abonne l'agent en aval à l'événement de complétion de l'amont ; quand l'amont émet "exécution terminée avec succès", le moteur transmet la sortie comme entrée à l'aval. Les filtres conditionnels sont évalués côté serveur avant que l'exécution en aval ne soit envoyée.

:::tip
Chaque agent dans une chaîne doit faire exactement une chose bien. Une chaîne de trois petits agents ciblés est beaucoup plus facile à déboguer qu'un grand agent fait-tout — vous pouvez voir dans la vue de lignée quelle étape a échoué, et vous pouvez échanger un agent pour une meilleure version sans toucher au reste de la chaîne.
:::
  `,

  "event-based-triggers": `
## Déclencheurs basés sur les événements

Les déclencheurs basés sur les événements abonnent un agent aux événements internes de Personas. Tout ce qui dans l'application émet un événement — un autre agent qui se termine, un identifiant qui expire, un plugin qui se déclenche (comme le plugin Drive émettant des événements \`drive.document.*\` quand les fichiers changent dans le Drive local), ou le moteur lui-même signalant un cas de revue manuelle — peut piloter un agent abonné.

C'est le type de déclencheur le plus flexible. Contrairement aux webhooks (qui viennent de systèmes externes) ou aux plannings (qui se déclenchent sur l'horloge), les événements viennent de l'intérieur de votre propre configuration Personas. Construisez des configurations pilotées par événements où un signal peut se diffuser à plusieurs agents sans câblage explicite.

### Points clés

- **S'abonner à n'importe quel événement** — événements de complétion d'agent, événements de plugin, événements de moteur, événements personnalisés émis par d'autres agents
- **Conscient de la charge utile** — chaque événement porte des données (la sortie de l'agent, le chemin du fichier, l'ID de l'identifiant) ; l'agent abonné les reçoit comme entrée
- **Un à plusieurs** — plusieurs agents peuvent s'abonner au même événement et tous s'exécutent en parallèle quand il se déclenche
- **Expressions de filtre** — restreignez par champs de charge utile (déclencher uniquement sur les événements où \`severity = critical\`)
- **Découvrable** — le registre d'événements est navigable sur la page Événements ; vous pouvez voir exactement quels événements sont disponibles et quels champs ils portent

### Comment ça marche

Ajoutez un déclencheur Événement à l'agent en aval et choisissez l'événement dans le registre. Le moteur abonne l'agent au démarrage et envoie une exécution avec la charge utile de l'événement chaque fois que l'événement correspondant se déclenche. Les événements émis par les plugins ressemblent identiquement à ceux émis par le moteur du point de vue de l'agent — ils circulent tous à travers le même bus.

:::tip
Les déclencheurs basés sur les événements sont la façon dont vous construisez des relations "si X alors aussi Y" sans changer X. Ajoutez un déclencheur d'événement sur un nouvel agent, pointez-le vers un événement qu'un autre agent émet, et le nouveau comportement se produit réactivement — l'agent existant ne sait ni ne se soucie.
:::
  `,

  "combining-multiple-triggers": `
## Combiner plusieurs déclencheurs

Un agent peut avoir un nombre quelconque de déclencheurs de n'importe quels types. La plupart des agents de production ont au moins deux : un déclencheur manuel (pour les tests et l'invocation ad hoc) plus un ou plusieurs déclencheurs automatiques (planning, webhook, chaîne, événement). Il est courant de voir un agent avec une combinaison planning + webhook + chaîne — le même agent peut s'exécuter dans le cadre d'un lot quotidien, en réponse à un webhook en temps réel, et comme étape dans un pipeline chaîné.

Plusieurs déclencheurs n'interfèrent pas. Chacun se déclenche sur son propre planning ou événement ; si deux se déclenchent au même instant, l'agent s'exécute deux fois (limite de concurrence le permettant). La trace de chaque exécution capture quel déclencheur l'a démarrée.

### Points clés

- **Pas de limite supérieure** — un agent peut avoir des dizaines de déclencheurs
- **Évaluation indépendante** — chaque déclencheur s'évalue et envoie indépendamment
- **Filtrage et configuration par déclencheur** — les plannings ont leur propre cron, les webhooks leur propre URL, etc.
- **Étiquette de déclencheur dans la trace** — chaque exécution est étiquetée avec le déclencheur qui l'a démarrée, pour que vous puissiez filtrer l'activité par source de déclencheur
- **Désactivation sélective** — désactivez un seul déclencheur sans toucher au reste

### Comment ça marche

L'onglet Paramètres → Déclencheurs de l'agent montre chaque déclencheur attaché, son statut (activé/désactivé) et son heure de dernier déclenchement. Ajoutez-en de nouveaux avec \`Ajouter un déclencheur\` ; le même sélecteur vous permet de créer n'importe lequel des sept types de déclencheurs. Les déclencheurs désactivés restent dans la liste pour que vous puissiez les réactiver plus tard sans reconfiguration.

:::tip
Un modèle utile : gardez un déclencheur manuel actif pour toujours (pour le débogage), et associez chaque déclencheur automatique "réel" à un déclencheur manuel frère qui prend la même forme d'entrée. De cette façon, vous pouvez rejouer manuellement n'importe quelle charge utile automatisée quand vous voulez enquêter.
:::
  `,

  "testing-and-debugging-triggers": `
## Tester et déboguer les déclencheurs

L'onglet Événements → Tests est le testeur de déclencheurs. Pour tout déclencheur, vous pouvez envoyer une charge utile d'échantillon (corps webhook, événement de fichier, chaîne de presse-papiers, données d'événement) et voir exactement ce que l'agent recevrait et comment il répondrait — sans le service externe ni l'attente du temps de déclenchement réel.

Pour les déclencheurs qui se sont déclenchés et que l'agent n'a pas exécutés comme prévu, le journal de déclencheur montre chaque évaluation : filtres correspondants, ceux rejetés, forme de charge utile, heure d'envoi. Le canevas de lignée (Événements → Flux en direct → Lignée) est l'équivalent visuel — il montre les évaluations et envois de déclencheurs en direct dans toute votre configuration.

### Points clés

- **Simuler n'importe quel déclencheur** — collez une charge utile et voyez la réponse de l'agent
- **Journal de déclencheur** — chaque tentative de déclenchement est enregistrée, y compris les rejets de filtre pour que vous puissiez voir ce qui ne correspondait pas
- **Canevas de lignée** — graphe visuel de déclencheurs, agents et événements avec des indicateurs de flux en direct quand les choses se déclenchent
- **Envoyer un test pour les webhooks** — bouton intégré qui POSTe un corps d'échantillon contre le point de terminaison local
- **Rejeu** — les déclenchements passés peuvent être rejoués avec la charge utile originale exacte, utile pour "que se passe-t-il si ce webhook Stripe atteint à nouveau l'agent"

### Déboguer un déclencheur étape par étape

:::steps
1. **Confirmez que le déclencheur est activé** — onglet Paramètres → Déclencheurs sur l'agent ; une icône en sourdine signifie que le déclencheur est désactivé
2. **Vérifiez le journal de déclencheur** — Événements → Tests → Journaux filtrés par votre déclencheur ; cherchez les évaluations qui n'ont pas été envoyées
3. **Inspectez les filtres par rapport à la charge utile** — si le déclencheur s'est évalué mais n'a pas envoyé, une expression de filtre le rejette ; copiez la charge utile et testez le filtre explicitement
4. **Vérifiez que l'envoi a atteint l'agent** — la trace d'exécution devrait montrer l'étiquette du déclencheur ; si aucune exécution n'est apparue, le déclencheur n'a jamais envoyé (problème de filtre, limite de concurrence ou agent désactivé)
5. **Utilisez le canevas de lignée** — pour les déclencheurs en chaîne ou par événement, ouvrez Lignée et tracez le chemin ; vous verrez où le flux est interrompu
:::

:::tip
"Mon déclencheur ne se déclenche pas" signifie presque toujours l'une des choses suivantes : le déclencheur est désactivé, un filtre est trop strict, l'agent est désactivé, ou le service externe n'envoie pas réellement ce que vous pensez qu'il envoie. Le journal de déclencheur distingue les quatre en moins d'une minute.
:::
  `,
};
