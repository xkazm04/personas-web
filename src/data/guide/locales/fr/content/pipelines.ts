export const content: Record<string, string> = {
  "what-are-pipelines": `
## Qu'est-ce qu'un pipeline ?

Un pipeline est un groupe coordonné d'agents qui se passent du travail entre eux pour gérer une tâche multi-étapes. Au lieu d'un grand agent fait-tout, vous construisez de petits agents ciblés et les câblez ensemble — chacun se spécialise, le pipeline gère l'orchestration. La section Pipeline dans la barre latérale est où vivent les pipelines ; le Canevas d'équipe à l'intérieur est où vous les composez.

Les pipelines dans Personas sont de première classe — ils ont leur propre historique d'exécution, leurs propres surfaces d'observabilité, leur propre mémoire d'équipe (contexte partagé que tous les agents du pipeline peuvent lire), et ils peuvent être déclenchés comme un seul agent (planning, webhook, manuel, chaîne). La différence est qu'un déclencheur lance tout un pipeline plutôt qu'un agent.

:::compare
**Agent unique**
Un prompt, un ensemble d'outils, une sortie. Simple à configurer ; limité quand la tâche se décompose naturellement en étapes.
---
**Pipeline** [recommended for multi-stage work]
Plusieurs agents ciblés, câblés en un flux. Chaque agent est petit et facile à déboguer ; le pipeline les compose en une plus grande capacité. La mémoire d'équipe partagée laisse les agents passer un contexte structuré, pas juste du texte. Visible sur le canevas d'équipe de bout en bout.
:::

### Points clés

- **Flux multi-agents** — les agents passent la sortie aux entrées le long de connexions définies
- **Mémoire d'équipe** — un magasin de contexte partagé que tous les agents du pipeline peuvent lire et écrire, séparé de la mémoire par agent
- **Éditeur visuel** — le Canevas d'équipe ; placez les agents, dessinez les connexions, configurez le routage
- **Réutilisable** — le même pipeline s'exécute pour toute charge utile de déclencheur correspondante ; les pipelines sont également clonables
- **Observable** — historique d'exécution complet au niveau pipeline avec ventilation par agent

### Comment ça marche

Vous composez un pipeline sur le Canevas d'équipe : déposez les agents, dessinez les connexions, configurez les branches conditionnelles si nécessaire. Quand le pipeline s'exécute, les données circulent le long des connexions — la sortie de chaque agent devient l'entrée de l'agent en aval auquel le canevas l'a câblé. Le moteur suit l'exécution de bout en bout pour que vous voyiez une exécution de pipeline plutôt que N exécutions d'agents disjointes.

### En action

:::usecases
**Automatisation DevOps**
Une pull request s'ouvre sur GitHub
---
L'agent Réviseur de PR analyse le diff, l'Exécuteur de tests vérifie les builds, l'agent Notes de version rédige un changelog, le Notificateur Slack publie le résumé sur votre canal d'équipe — pipeline unique déclenché par le webhook GitHub.
===
**Flux de contenu**
Vous avez besoin d'un article de blog publié à partir d'un sujet
---
L'agent de recherche rassemble les sources, le Rédacteur rédige la pièce, l'Éditeur polit, le Publieur formate pour votre CMS — le pipeline gère les transferts et la mémoire d'équipe porte les conseils de style partagés.
===
**Tri du support client**
Un nouveau ticket arrive
---
Le Classificateur détermine l'urgence et la catégorie, l'agent Connaissances récupère les documents pertinents, le Rédacteur écrit une réponse candidate, le Routeur fait remonter à un humain si la confiance est faible.
:::

:::info
Pas de limite supérieure dure sur la taille du pipeline. Commencez avec deux agents pour valider le flux de données, grandissez en ajoutant un spécialiste à la fois. Les pipelines avec 10+ agents fonctionnent aussi fiablement que les petits ; le moteur gère l'orchestration de manière identique.
:::

:::tip
Traitez chaque agent dans le pipeline comme une fonction à but unique : une forme d'entrée spécifique, une forme de sortie spécifique. Plus chaque agent est petit et ciblé, plus le pipeline entier est facile à déboguer et plus les pièces individuelles sont réutilisables à travers les pipelines.
:::
  `,

  "the-team-canvas": `
## Le canevas d'équipe

Le Canevas d'équipe est l'éditeur visuel pour les pipelines. Ouvrez Pipeline → Canevas d'équipe et vous voyez votre pipeline comme un graphe : nœuds d'agents connectés par des arêtes dirigées. Déposez des agents depuis le panneau de bibliothèque à gauche, dessinez des connexions en faisant glisser depuis le port de sortie d'un agent vers le port d'entrée d'un autre agent, configurez les branches avec des nœuds conditionnels. Le canevas prend en charge le pan, le zoom, la sélection multiple, l'auto-mise en page et la navigation au clavier.

Le canevas n'est pas seulement de la visualisation — c'est l'éditeur. Chaque changement que vous faites sur le canevas (placer un agent, dessiner une connexion, ajouter un nœud conditionnel) met à jour immédiatement la définition du pipeline. Enregistrez pour valider ; le pipeline est sous contrôle de version de la même façon que les prompts d'agents.

### Points clés

- **Glisser-déposer** des agents de la bibliothèque sur le canevas
- **Dessin de connexion** — cliquez et faites glisser du port de sortie au port d'entrée ; les données circulent le long de la connexion à l'exécution
- **Nœuds conditionnels** — ajoutez un nœud de routage entre les agents pour brancher selon les données
- **Auto-mise en page** — un clic range le canevas en un flux de gauche à droite ou de haut en bas
- **Versionné** — les instantanés du canevas sont enregistrés avec le pipeline ; restaurez les mises en page et topologies antérieures

### Construire votre premier pipeline

:::steps
1. **Ouvrez Pipeline → Canevas d'équipe** — barre latérale → Pipeline → Nouveau pipeline (ou ouvrez un existant)
2. **Parcourez la bibliothèque d'agents** — panneau de gauche ; filtrez par groupe ou recherchez
3. **Faites glisser les agents sur le canevas** — placez-les approximativement dans l'ordre d'exécution
4. **Dessinez les connexions** — port de sortie (bord droit) au port d'entrée (bord gauche)
5. **Ajoutez des nœuds conditionnels si nécessaire** — barre d'outils → Conditionnel ; configurez les branches
6. **Enregistrez** — Ctrl+S ; le pipeline est validé et exécutable immédiatement
:::

:::tip
De gauche à droite, de haut en bas est la convention la plus lisible. Utilisez l'auto-mise en page (bouton de la barre d'outils) une fois la topologie définie ; elle produit un flux visuel propre qui aide quiconque lit le canevas — y compris vous-futur — à comprendre le pipeline d'un coup d'œil.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Ajouter des agents à un pipeline

Les agents sont ajoutés aux pipelines depuis le panneau de bibliothèque à gauche du Canevas d'équipe. Faites glisser n'importe quel agent sur le canevas pour le placer ; les paramètres par défaut de l'agent sont reportés (prompt, outils, modèle, identifiants), mais vous pouvez surcharger par pipeline si vous voulez que cet agent se comporte légèrement différemment ici qu'ailleurs.

Le même agent peut participer à plusieurs pipelines, chacun avec son propre ensemble de surcharges. Les changements à l'agent sous-jacent (par ex. une révision de prompt dans l'éditeur propre de l'agent) se propagent à tous les pipelines qui l'utilisent ; les surcharges par pipeline ne se propagent pas, elles vivent uniquement dans le pipeline.

### Points clés

- **Glisser depuis la bibliothèque** — tout agent que vous avez créé est disponible
- **Surcharges par pipeline** — mappage d'entrée, transformateur de sortie, préférence de modèle (si vous voulez que ce pipeline utilise un modèle moins cher pour cette étape), fournisseur de basculement
- **Réutilisation multi-pipelines** — un agent dans le pipeline A et le pipeline B a des ensembles de surcharges indépendants par pipeline
- **Les changements de l'agent sous-jacent se propagent** — modifications de prompt, changements d'outils, etc., circulent vers chaque pipeline utilisant l'agent (les surcharges par pipeline ne se propagent pas)
- **Remplacer un agent sur place** — clic droit → Remplacer ; le nouvel agent hérite des connexions de l'ancien si les formes entrée/sortie correspondent

### Comment ça marche

Placer un agent sur le canevas crée une *référence à portée de pipeline* à cet agent. La référence comprend l'ensemble de surcharges (toute personnalisation par pipeline) et la position sur le canevas. À l'exécution, le moteur résout la référence, applique les surcharges au-dessus de la configuration de base de l'agent, et envoie l'exécution.

:::tip
Résistez à la tentation d'incorporer de lourdes personnalisations par pipeline dans l'ensemble de surcharges. Si vous vous trouvez à surcharger beaucoup de choses dans un pipeline, il est généralement plus propre de cloner l'agent (en donnant au clone un nom clair comme "Rédacteur d'e-mails - Pipeline B") et d'utiliser le clone — garde les personnalisations par pipeline explicites au lieu de cachées dans les panneaux de surcharge.
:::
  `,

  "connecting-agents-with-data-flow": `
## Connecter les agents avec un flux de données

Les connexions sur le canevas sont des arêtes dirigées d'un port de sortie d'agent au port d'entrée d'un autre agent. Chaque connexion porte la sortie de l'agent en amont à l'agent en aval comme entrée — mot pour mot par défaut, ou transformée par un transformateur en ligne (une petite expression qui remodèle la sortie avant de la passer).

Les connexions sont configurables : vous pouvez ajouter des transformateurs, les étiqueter (utile dans les pipelines complexes), et les désactiver temporairement pour le débogage sans les supprimer. Plusieurs connexions peuvent se diffuser à partir d'une sortie (diffusion : les agents en aval reçoivent tous les mêmes données) ou converger vers une entrée (le moteur combine les entrées de plusieurs agents en amont en un objet d'entrée pour l'aval).

### Points clés

- **Cliquer-glisser** du port de sortie au port d'entrée pour créer une connexion
- **Transformateur optionnel** — expression en ligne qui remodèle les données pendant leur passage
- **Diffusion** — une sortie vers plusieurs entrées en aval (ramification parallèle)
- **Convergence** — plusieurs sorties en amont vers une entrée en aval (objet combiné)
- **Basculer activé/désactivé** — désactivez une connexion sans la supprimer (utile pour les déploiements par étapes)
- **Étiquetées** — nommez les connexions pour la clarté dans les pipelines complexes
- **Supprimer** — cliquez sur la connexion → touche Suppr

### Connecter deux agents

:::steps
1. **Trouvez le port de sortie** — petit cercle sur le bord droit de l'agent source
2. **Cliquez et faites glisser** vers le port d'entrée — petit cercle sur le bord gauche de la cible
3. **Déposez sur le port d'entrée** — ligne tracée ; connexion validée
4. **Ajoutez optionnellement un transformateur** — clic droit sur la connexion → Ajouter un transformateur ; écrivez une petite expression pour remodeler les données
5. **Testez en exécutant le pipeline** — cliquez sur n'importe quelle connexion pendant une exécution pour inspecter les données qui passent à travers
:::

:::tip
Utilisez généreusement les étiquettes de connexion et les transformateurs dans tout pipeline de plus de 3-4 agents. Les étiquettes rendent la topologie auto-documentée ; les transformateurs vous permettent de garder les agents réutilisables à travers les pipelines (un agent n'a pas besoin de savoir quel format un pipeline en amont différent pourrait produire — le transformateur l'adapte).
:::
  `,

  "pipeline-execution": `
## Exécution de pipeline

Exécuter un pipeline envoie la charge utile du déclencheur dans le premier agent (ou les agents, s'il y a plusieurs nœuds de départ), et chaque agent en aval s'exécute à mesure que ses entrées deviennent disponibles. Le canevas montre l'exécution en direct — les agents brillent quand ils s'exécutent, les connexions s'animent avec les données qui circulent, et les nœuds conditionnels montrent quelle branche a été prise.

Le moteur gère le parallélisme automatiquement : si deux agents n'ont pas de dépendance entre eux, ils s'exécutent en parallèle. Si un agent dépend des sorties de plusieurs agents en amont, il attend qu'ils soient tous terminés. Le temps total d'horloge est déterminé par le chemin critique à travers le graphe, pas la somme de toutes les durées d'agents.

### Points clés

- **Animation du canevas en direct** — voyez quels agents s'exécutent, quelles connexions circulent, quelles branches conditionnelles sont prises
- **Parallélisme automatique** — les agents indépendants s'exécutent simultanément ; les agents dépendants attendent les prérequis
- **Le chemin critique détermine le temps d'horloge** — durée du pipeline = chaîne de dépendance la plus longue, pas somme des agents
- **Arrêt au premier échec** — par défaut ; configurable par pipeline si vous voulez une exécution tolérante aux pannes
- **Réexécuter à partir de n'importe quelle étape** — reprenez après une correction sans réexécuter les étapes en amont réussies

### Comment ça marche

:::diagram
[Déclencheur] --> [Agent A] --> [Conditionnel] --> [Agent B ou Agent C] --> [Agent D] --> [Sortie]
:::

Cliquez sur \`Exécuter\` (ou attendez que le déclencheur se déclenche automatiquement). Le moteur construit un plan d'exécution à partir de la topologie du canevas, envoie les nœuds de départ, et traite le graphe par ordre topologique. À mesure que chaque agent se termine, les agents en aval deviennent éligibles et s'envoient automatiquement. L'échec met en pause le pipeline à l'étape défaillante avec l'erreur visible dans l'inspecteur ; corrigez le problème sous-jacent et cliquez sur \`Réessayer l'étape\` pour reprendre.

:::tip
L'agent le plus lent sur le chemin critique détermine la durée du pipeline. Si votre pipeline semble lent, exécutez-le une fois, regardez les durées par agent dans la trace, identifiez le chemin le plus long, et optimisez l'agent qui a la plus haute durée sur ce chemin. Les branches parallèles n'aident pas si votre chemin critique est lent.
:::
  `,

  "conditional-routing": `
## Routage conditionnel

Les nœuds de routage conditionnel laissent un pipeline brancher sur les données qu'il traite. Déposez un nœud conditionnel sur le canevas, définissez une ou plusieurs règles ("si montant > 1000", "si l'e-mail contient 'urgent'", "si sortie du classificateur = 'support'"), et câblez chaque branche à un chemin en aval différent. À l'exécution, le conditionnel s'évalue et achemine vers la branche correspondante — seule cette branche s'exécute.

Les règles sont basées sur des expressions : un petit DSL de comparaisons et d'opérateurs logiques évalué contre la sortie de l'agent en amont. Pas de code ; l'éditeur d'expressions a une autocomplétion pour la forme de sortie en amont pour que vous découvriez les champs disponibles à mesure que vous tapez.

:::feature
**Routage basé sur les expressions**
Les règles conditionnelles sont évaluées comme des expressions contre la sortie en amont. Comparez les champs, combinez avec AND/OR, retombez sur une branche par défaut quand rien ne correspond. Pas de code requis, mais expressivité complète quand vous en avez besoin.
:::

### Points clés

- **Plusieurs branches** — un nœud conditionnel, N branches définies par règles, plus un repli par défaut
- **La branche par défaut est obligatoire** — garantit que les données ne restent jamais coincées sur des conditions non correspondantes
- **DSL d'expressions** — comparaisons (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), opérateurs booléens (\`and\`, \`or\`, \`not\`)
- **Autocomplétion sur la forme amont** — l'éditeur d'expressions connaît le schéma de sortie de l'agent en amont
- **Évaluation en direct dans la trace** — voyez quelle branche a été prise sur chaque exécution de pipeline

### Comment ça marche

Déposez un nœud Conditionnel entre les agents. Configurez la règle de chaque branche dans l'éditeur de règles ; la branche par défaut n'a pas besoin de règle (c'est le repli). À l'exécution, le moteur évalue les règles dans l'ordre ; la première correspondance gagne ; si aucune règle ne correspond, la branche par défaut s'exécute. La branche qui s'exécute voit la sortie en amont comme entrée ; les autres restent inactives pour cette exécution.

:::warning
Définissez toujours une branche par défaut. Sans elle, une entrée non correspondante reste coincée à mi-pipeline et produit une exécution suspendue — ennuyeux à déboguer. La branche par défaut peut simplement acheminer vers un agent terminal "journaliser et arrêter" si vous voulez vraiment que les entrées non correspondantes échouent bruyamment, mais la branche doit exister.
:::
  `,

  "team-members-and-roles": `
## Membres d'équipe et rôles

Chaque agent dans un pipeline peut porter une étiquette de rôle — "Chercheur", "Rédacteur", "Éditeur", "Classificateur" — qui décrit sa fonction au sein du pipeline. Les rôles sont purement organisationnels ; le moteur ne les applique ni ne les utilise. Leur valeur est humaine : quand vous (ou quelqu'un d'autre) ouvrez le canevas un mois plus tard, les étiquettes de rôle rendent le pipeline auto-documenté.

Au-delà de l'étiquette, les rôles sont également utiles pour la substitution d'agent. Si vous avez plusieurs agents qui pourraient remplir le rôle "Éditeur" (avec différents styles de prompt ou spécialités), l'étiquette de rôle rend évident quel emplacement échanger quand vous changez d'avis. Le Canevas d'équipe prend en charge le glisser-remplacer sur un rôle : déposez un agent différent sur le rôle existant et le canevas demande s'il faut substituer, préservant les connexions.

### Points clés

- **Étiquettes de rôle en texte libre** — tout ce qui est lisible par l'humain ; les courantes obtiennent des suggestions d'autocomplétion
- **Visibles sur le canevas** — les étiquettes de rôle apparaissent au-dessus de chaque nœud d'agent pour que la structure de l'équipe soit d'un coup d'œil
- **Glisser-remplacer par rôle** — déposez un nouvel agent sur un emplacement de rôle pour substituer, préservant les connexions
- **Filtrer la bibliothèque par rôle** — quand vous avez de nombreux agents similaires, filtrez la bibliothèque par rôle pour trouver rapidement les candidats
- **Les modèles de pipeline utilisent les rôles** — le modèle définit les rôles à remplir, vous apportez les agents qui correspondent à chaque rôle

### Comment ça marche

Clic droit sur n'importe quel agent du canevas → Définir le rôle. L'étiquette apparaît au-dessus du nœud d'agent. Les rôles vivent dans la définition de pipeline à côté de la référence d'agent ; ils ne modifient pas l'agent lui-même. Les modèles de pipeline sont livrés avec des rôles prédéfinis ; instancier un modèle vous demande de choisir un agent pour chaque rôle.

:::tip
Nommez les rôles par responsabilité, pas par agent actuel. "Éditeur" est meilleur que "Éditeur Claude Sonnet" ; la description du rôle survit à l'agent spécifique qui le remplit actuellement. Si vous passez de Claude à GPT pour ce rôle, l'étiquette de rôle reste précise.
:::
  `,

  "pipeline-run-history": `
## Historique d'exécution des pipelines

Les exécutions de pipeline sont des exécutions de première classe dans le même magasin où vont les exécutions d'agents individuels. L'onglet Pipeline → Historique d'exécution montre chaque exécution avec son déclencheur, son entrée, son statut, sa durée totale, son coût total et sa ventilation par agent. Cliquez sur n'importe quelle exécution pour développer la trace complète : traces par agent, décisions conditionnelles, sorties de transformateur, résultat final.

L'historique d'exécution persiste indéfiniment (sous réserve des paramètres de rétention dans Paramètres → Données) et prend en charge le même filtrage et la même recherche que les vues d'activité par agent. Chaque exécution est immuable — une fois capturée, la trace est figée, utile pour les audits a posteriori.

### Points clés

- **Capture complète** — entrée, traces par agent (prompt, appels d'outils, réponse), décisions conditionnelles, sorties de transformateur, résultat final
- **Statut par agent** au sein de la trace du pipeline — succès / échec / sauté / en attente
- **Temps total + par agent** — voyez le chemin critique et identifiez les goulots d'étranglement
- **Coût total + par agent** — coût du pipeline = somme des coûts par agent
- **Consultable et filtrable** — par date, déclencheur, statut, coût, durée, agent
- **Comparaison de deux exécutions** — choisissez deux exécutions pour différencier les sorties par agent (utile pour "qu'est-ce qui a changé ?")

### Comment ça marche

Les exécutions de pipeline utilisent le même magasin d'exécution que les exécutions à agent unique mais avec un wrapper supplémentaire au niveau pipeline qui lie à toutes les exécutions d'agents enfants. La vue historique interroge ce magasin, joint aux enregistrements d'exécution d'agent pour les ventilations par agent, et rend l'arbre de trace.

:::tip
Après un changement de pipeline significatif (nouvelle règle conditionnelle, agent échangé, révision de prompt sur un agent membre), choisissez une exécution "avant" de l'historique et l'exécution "après" de la nouvelle exécution, puis utilisez Comparer pour voir exactement ce qui est différent. Le diff au niveau pipeline révèle souvent un impact que vous manqueriez en regardant un seul agent isolément.
:::
  `,

  "pipeline-templates": `
## Modèles de pipeline

Les modèles de pipeline sont des formes de pipeline préconstruites que vous pouvez adopter comme point de départ. Le modèle définit la topologie — quels rôles existent, quelles branches conditionnelles, quels transformateurs — mais ne lie pas d'agents spécifiques à chaque rôle. Quand vous instanciez un modèle, le canevas s'ouvre avec la topologie en place et vous demande de remplir chaque rôle depuis votre propre bibliothèque d'agents.

Les modèles couvrent les formes courantes : flux de contenu (recherche → rédaction → édition → publication), tri du support (classifier → router → répondre → faire remonter), traitement de données (ingérer → valider → transformer → stocker). La bibliothèque de modèles est dans Pipelines → Nouveau pipeline → Parcourir les modèles.

### Points clés

- **Topologie définie, rôle flexible** — le modèle connaît la forme ; vous apportez les agents
- **Règles conditionnelles et transformateurs préconfigurés** — la logique de routage de cas courant est intégrée
- **Personnalisable après l'instanciation** — une fois instancié, le canevas est à vous de modifier
- **Modèles de meilleures pratiques** — les modèles sont livrés avec gestion d'erreurs et branches de repli en standard
- **Bibliothèque croissante** — de nouveaux modèles sont ajoutés en fonction de la demande des utilisateurs ; vous pouvez également sauvegarder vos propres pipelines comme modèles pour réutilisation

### Comment ça marche

Un modèle est une définition de canevas avec des emplacements de rôle au lieu de références d'agents. L'instanciation crée un nouveau pipeline, copie le canevas du modèle, et vous demande de remplir chaque rôle depuis la bibliothèque d'agents. Une fois rempli, le pipeline est entièrement modifiable — il n'est pas lié au modèle, donc les mises à jour du modèle ne se propagent pas (et les modifications du pipeline n'affectent pas le modèle).

:::tip
Même quand aucun modèle ne correspond exactement, choisir le plus proche et le modifier est généralement plus rapide que de construire à partir de zéro. Les modèles pré-résolvent la forme d'orchestration (placement de conditionnel, emplacements de transformateur, topologie de fan-out/fan-in) ; le travail qui reste est la sélection d'agents et le réglage des prompts, ce qui est le travail sur lequel vous vouliez vous concentrer de toute façon.
:::
  `,

  "debugging-pipeline-issues": `
## Déboguer les problèmes de pipeline

Quand une exécution de pipeline échoue, le canevas marque l'agent défaillant avec un indicateur rouge et l'exécution se met en pause à cette étape. Ouvrez l'exécution défaillante depuis l'historique (ou cliquez sur l'indicateur sur le canevas en direct) et le panneau de débogage montre l'entrée de l'agent, l'erreur, la trace jusqu'à l'échec, et toute sortie partielle que l'agent a produite avant d'échouer. Depuis le même panneau, vous pouvez réessayer juste l'étape défaillante ou réexécuter tout le pipeline depuis le début.

Les échecs de pipeline les plus courants sont des inadéquations de forme de données — un agent en amont produit une sortie dans un format légèrement différent de ce que l'agent en aval attend. L'inspecteur de connexion (cliquez sur n'importe quelle connexion) montre les données qui passent à travers sur l'exécution la plus récente, ce qui est généralement suffisant pour repérer l'inadéquation.

### Points clés

- **Étape défaillante mise en évidence** — indicateur rouge sur le canevas, erreur complète dans le panneau de débogage
- **Inspecteur de connexion** — cliquez sur n'importe quelle connexion pour voir les données en direct ou de la dernière exécution qui passent à travers
- **Réessayer à partir de l'étape défaillante** — corrigez le problème et reprenez ; les étapes en amont réussies ne se réexécutent pas
- **Rejeu étape par étape** — réexécutez toute exécution de pipeline passée avec la même entrée pour reproduire un échec de manière déterministe
- **Validation de connexion** — le canevas peut pré-vérifier si les agents en amont et en aval ont des formes d'entrée/sortie compatibles (attrape les inadéquations avant l'exécution)

### Comment ça marche

Le moteur de pipeline émet des événements d'échec structurés quand une exécution d'agent échoue. Le panneau de débogage s'abonne à ces événements et rend la trace pertinente + l'inspecteur. Le réessai à partir d'une étape est pris en charge par le moteur : il renvoie l'agent défaillant avec le même contexte en amont, préservant le reste de l'exécution du pipeline.

:::tip
La plupart des échecs de pipeline sont des problèmes de connexion, pas des problèmes d'agent. Quand quelque chose se casse, inspectez d'abord les connexions alimentant l'agent défaillant — quelle forme a-t-il réellement reçue ? C'est beaucoup plus souvent "les données étaient fausses" que "l'agent était faux" ; l'inspecteur de connexion vous dit lequel des cas c'est en moins d'une minute.
:::
  `,
};
