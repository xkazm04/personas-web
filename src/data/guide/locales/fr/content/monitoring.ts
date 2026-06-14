export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## Le tableau de bord de surveillance

La page Vue d'ensemble est votre centre de commande pour tout ce qui se passe à travers vos agents. L'onglet Tableau de bord s'ouvre par défaut et affiche une grille de KpiTile — une tuile par métrique (taux de réussite, total des exécutions, coût total, durée moyenne, agents actifs, échecs du jour, etc.). Chaque tuile a trois modes de densité (compact / standard / détail) que vous basculez en cliquant sur la tuile ; utile quand vous voulez un nombre rapide vs quand vous voulez le graphique de tendance et la ventilation.

Sous les KpiTile, la Vue d'ensemble fait apparaître l'activité en direct, les échecs récents et les notifications auxquelles vous vous êtes abonné. Tout sur cette page est filtrable par agent, par groupe et par plage de temps — le même ensemble de filtres s'applique à chaque panneau pour que vous puissiez limiter tout le tableau de bord à "cette semaine, juste mes agents Marketing" en un clic.

| Panneau | Ce qu'il montre |
|---------|--------------|
| **KpiTile** | Taux de réussite, exécutions, coût, durée, nombre d'échecs, agents actifs — chacun à trois niveaux de densité |
| **Flux d'activité** | Flux en direct des exécutions à travers tous les agents, défilable, consultable, cliquez pour le détail |
| **Notifications** | Alertes auxquelles vous êtes abonné (échecs, plafonds budgétaires, revue manuelle, anomalies) avec clic vers l'exécution incriminée |
| **Aperçu de santé** | Récapitulatif de santé par agent — scan rapide pour tout ce qui est jaune ou rouge |

### Comment ça marche

La page Vue d'ensemble lit depuis le même magasin d'exécution et d'événements que le reste de l'application utilise, donc ce que vous voyez est toujours l'état en direct. Les filtres et préférences de densité persistent entre les sessions ; vous les définissez une fois et le tableau de bord s'en souvient. Cliquez sur n'importe quelle KpiTile pour explorer une ventilation par agent, cliquez sur n'importe quelle ligne d'activité pour ouvrir le modal de détail d'exécution.

:::tip
La cloche de notification de la barre de titre est un raccourci en un clic depuis n'importe où dans l'application vers le détail d'exécution le plus frais. Vous n'avez pas besoin de naviguer manuellement vers Vue d'ensemble pour les vérifications de routine "que vient-il de se passer ?".
:::
  `,

  "execution-logs": `
## Journaux d'exécution

Chaque exécution d'agent produit un journal d'exécution : charge utile du déclencheur, prompt rendu envoyé au modèle, réponse du modèle, chaque appel d'outil (avec arguments et résultat), sortie finale, durée, coût et toutes les erreurs. Les journaux sont immuables — ils sont écrits une fois et préservés indéfiniment. L'onglet Activité (par agent sur l'éditeur, ou global sur Vue d'ensemble) est le point d'entrée.

Chaque entrée de journal est un résumé d'une ligne dans la liste ; cliquer ouvre le modal de détail complet avec tous les champs ci-dessus. À partir de là, vous pouvez copier n'importe quel champ, rejouer l'exécution avec la même entrée, ou sauter à la vue de trace associée pour le débogage étape par étape.

### Points clés

- **Capture complète** — entrée, prompt, réponse, appels d'outils (avec paramètres et résultats), sortie, durée, coût, erreurs
- **Historique immuable** — les journaux ne changent jamais après la fin de l'exécution ; si le prompt de l'agent est édité plus tard, les anciennes exécutions montrent toujours ce qui a été envoyé à l'époque
- **Rejeu depuis n'importe quelle exécution** — réexécute l'agent avec l'entrée originale ; utile pour vérifier une correction sur une charge utile précédemment défaillante
- **Étiquetage par déclencheur** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, etc., pour que vous puissiez filtrer l'activité par source
- **Marqueur de revue manuelle** — les exécutions que l'agent lui-même a signalées pour revue (via la directive \`manual_review\`) obtiennent un badge pour que vous puissiez les trouver rapidement

### Comment ça marche

Le magasin d'exécution est SQLite local, écrit transactionnellement à mesure que l'exécution progresse. L'onglet trace à l'intérieur du modal de détail développe chaque étape en ses sous-événements (flux de tokens du modèle, appel d'outil envoyé, résultat d'outil reçu, branche de décision prise). Filtrez par plage de dates, agent, type de déclencheur, statut, business_outcome, ou texte intégral sur l'entrée/sortie.

:::tip
Quand un agent produit une sortie inattendue, l'onglet trace — pas la sortie — est l'endroit où vit la réponse. Cherchez l'appel d'outil qui a renvoyé des données erronées, ou la décision du modèle qui s'est branchée du mauvais côté. La sortie est le symptôme ; la trace est la cause.
:::
  `,

  "real-time-activity-feed": `
## Flux d'activité en temps réel

Le flux d'activité vous montre ce qui se passe en ce moment à travers tous vos agents. À mesure que chaque agent traite sa tâche, les mises à jour apparaissent en temps réel — c'est comme regarder un tableau de scores en direct. Vous voyez les résultats au moment où ils se produisent sans rafraîchir ou vérifier les agents individuels.

C'est particulièrement utile quand vous avez de nombreux agents qui s'exécutent simultanément ou quand vous voulez regarder une automatisation critique pendant qu'elle s'exécute.

### Points clés

- **Mises à jour en direct** — voyez l'activité de l'agent au fur et à mesure qu'elle se produit, pas besoin de rafraîchir
- **Tous les agents** — un flux couvre chaque agent en cours d'exécution dans votre configuration
- **Entrées horodatées** — chaque mise à jour montre exactement quand elle s'est produite
- **Changements de statut** — voyez quand les agents démarrent, terminent, réussissent ou échouent en temps réel

### Comment ça marche

Ouvrez le flux d'activité depuis le tableau de bord de surveillance ou la barre latérale. Les mises à jour arrivent automatiquement en streaming pendant que vos agents travaillent. Chaque entrée montre le nom de l'agent, l'action, l'horodatage et le résultat. Cliquez sur n'importe quelle entrée — ou sur la cloche de notification dans la barre de titre — pour ouvrir le modal de détail d'exécution complet directement sur l'onglet Vue d'ensemble › Activité, où vous pouvez voir la trace, le prompt rendu, l'entrée, la sortie et toutes les erreurs. Le flux lui-même est défilable et consultable.

:::tip
Gardez le flux d'activité ouvert dans un panneau latéral pendant que vous testez de nouveaux agents. Regarder la sortie en direct vous aide à repérer les problèmes immédiatement et à itérer plus vite. Pour l'usage quotidien, la cloche de notification de la barre de titre est le chemin le plus rapide — elle ouvre toujours le détail d'exécution le plus frais sans que vous ayez à naviguer.
:::
  `,

  "cost-tracking-per-agent": `
## Suivi des coûts par agent

Chaque fournisseur d'IA facture par token, et Personas marque chaque exécution avec le nombre exact de tokens, le modèle et le fournisseur, donc le coût par agent est toujours connu. Vue d'ensemble → Utilisation montre une liste triable de chaque agent avec son coût sur la fenêtre de temps sélectionnée — jour, semaine, mois ou plage personnalisée — plus des flèches de tendance pour que vous puissiez voir d'un coup d'œil quels coûts d'agents grimpent.

Explorez n'importe quelle ligne pour une ventilation : distribution coût-par-exécution (médiane vs p95), coût par modèle quand l'agent a un basculement configuré, total des tokens (entrée vs sortie), et un graphique de tendance dans le temps. Si le coût d'un agent dérive à la hausse, c'est le premier endroit qui le fait apparaître.

### Points clés

- **Ventilation par agent** — chaque exécution est attribuée à son agent
- **Fenêtres de temps filtrables** — aujourd'hui, cette semaine, ce mois, tous les temps, ou plage personnalisée
- **Distribution coût-par-exécution** — médiane, p95, max ; révèle si une valeur aberrante coûteuse domine le total
- **Ventilation des tokens** — tokens d'entrée vs sortie pour que vous puissiez dire si l'agent lit beaucoup ou produit beaucoup
- **Flèches de tendance** — changement semaine sur semaine affiché à côté de chaque agent, pour que les régressions de coût apparaissent immédiatement

### Comment ça marche

Le compteur de coût coche en direct pendant une exécution à mesure que les tokens arrivent en streaming. Quand l'exécution se termine, le coût final est finalisé et persisté à côté du journal d'exécution. La vue Utilisation agrège depuis ce magasin, donc changer le filtre de plage de temps interroge simplement les mêmes données — aucun travail de "comptabilité de coût" séparé n'est en cours.

:::tip
Si un seul agent domine vos coûts, la distribution par exécution est plus utile que le total. Une médiane élevée signifie que le prompt est constamment coûteux (regardez la taille du prompt et le nombre d'appels d'outils). Une p95 élevée avec une médiane normale signifie des valeurs aberrantes rares (regardez les entrées inhabituelles dans l'historique de trace).
:::
  `,

  "cost-tracking-per-model": `
## Suivi des coûts par modèle

Différents modèles ont des points de prix très différents — Claude Haiku est ~30× moins cher qu'Opus par token, GPT-4o-mini est ~20× moins cher que GPT-4o, et les modèles locaux ne coûtent essentiellement rien par token (juste du calcul). La vue par modèle sur Vue d'ensemble → Utilisation décompose les dépenses par fournisseur et modèle pour que vous puissiez voir où va l'argent et si les dépenses correspondent à la valeur.

:::feature
**Conseils d'optimisation intelligents** color=#34d399
Le système marque les exécutions qui pourraient s'exécuter sur un modèle moins cher avec une qualité similaire. Quand un modèle à coût élevé est utilisé pour un schéma de tâche que le modèle moins cher gère bien ailleurs, le conseil apparaît à côté de la ligne de coût — vous pointant vers les agents candidats à tester en A-B dans le Lab.
:::

### Points clés

- **Par fournisseur et modèle** — coût ventilé par identifiant de modèle exact (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Appels, tokens, coût** — trois vues des mêmes données ; le coût est ce que vous payez, les tokens sont ce que vous dépensez, les appels sont la fréquence à laquelle vous appelez
- **Comparaison coût-par-appel** — même métrique entre modèles pour que vous puissiez comparer comme avec comme
- **Conseils d'optimisation** — fait apparaître les agents candidats qui pourraient être rétrogradés ; cliquez dans le Lab pour tester en A-B
- **Attribution par agent** — explorez une ligne de modèle pour voir quels agents l'utilisent le plus

### Comment ça marche

La vue Utilisation regroupe les mêmes enregistrements d'exécution que la vue par agent mais sur la dimension modèle à la place. La tarification est configurée par modèle dans Paramètres → Moteur, avec des valeurs par défaut correspondant à la tarification publique de chaque fournisseur ; vous pouvez surcharger si vous avez un tarif négocié ou utilisez BYOI sur un point de terminaison moins cher.

:::tip
Une fois par mois, scannez la vue par modèle triée par coût total. L'entrée du haut est votre plus grande opportunité d'économies — déposez-la dans l'arène du Lab contre le modèle moins cher suivant et voyez si la qualité tient. La plupart des agents tolèrent bien une rétrogradation de modèle ; ceux qui ne le font pas sont ceux qui méritent vraiment la dépense.
:::
  `,

  "success-rate-metrics": `
## Métriques de taux de réussite

Chaque exécution se termine avec un statut : succès, échec ou revue manuelle. Le taux de réussite est le pourcentage d'exécutions qui se sont terminées avec succès par rapport à un contexte de comportement attendu. L'onglet Vue d'ensemble → Santé et l'onglet Activité par agent font tous deux apparaître le taux de réussite avec un indicateur de tendance — changement semaine sur semaine — pour que vous puissiez voir d'un coup d'œil si la fiabilité tient.

La métrique va au-delà du pur succès/échec maintenant. Avec le suivi **business_outcome**, l'agent lui-même peut déclarer si une exécution réussie a produit le résultat que vous vouliez réellement (une vente, un document approuvé, un résumé utile) — un signal séparé de "l'exécution s'est-elle terminée sans erreurs". Le taux de réussite se divise en "terminé proprement" et "produit le résultat commercial souhaité" — le second est le nombre le plus utile pour la plupart des agents.

### Points clés

- **Taux de réussite par agent** avec flèche de tendance
- **Taux de résultat commercial** — séparé du taux de complétion propre ; suit si le travail de l'agent était réellement utile
- **Division par déclencheur** — le même agent peut réussir à 99 % sur les exécutions manuelles mais 70 % sur les planifiées ; la ventilation vous montre quelle source de déclencheur a des problèmes
- **Alertes de seuil** — définissez un seuil par agent ; vous êtes notifié quand le taux tombe en dessous
- **Classification de raison d'échec** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, etc., pour que vous puissiez voir *pourquoi* les exécutions échouent

### Comment ça marche

L'onglet Santé agrège les statuts d'exécution sur une fenêtre glissante par agent. Le suivi des résultats commerciaux nécessite que l'agent émette une directive \`business_outcome\` dans sa sortie (la plupart des modèles qui en ont besoin le font par défaut ; les agents personnalisés peuvent l'ajouter explicitement). Les alertes de seuil sont configurées par agent et se déclenchent via les mêmes canaux de notification avec lesquels l'agent est configuré.

:::tip
Définissez un seuil de 90 % sur chaque agent de production. L'alerte ne vous dira pas pourquoi un agent échoue, mais elle vous dira que quelque chose ne va pas. La classification de raison d'échec sur l'onglet Santé est où vous allez ensuite pour diagnostiquer.
:::
  `,

  "execution-tracing": `
## Traçage d'exécution

Le traçage est l'enregistrement étape par étape par exécution de ce que l'agent a fait. Ouvrez n'importe quelle exécution depuis le flux d'activité et cliquez sur l'onglet Trace : vous verrez chaque événement dans l'ordre chronologique — début et fin du streaming de tokens du modèle, chaque invocation d'outil avec arguments, chaque résultat d'outil, chaque branche de décision dans un agent chaîné, le prompt rendu, la sortie. Chaque étape est extensible pour un détail complet.

Pour les pipelines chaînés, la trace s'étend sur plusieurs agents — le canevas de lignée (Événements → Lignée) montre la vue inter-agents tandis que la trace par exécution montre le détail intra-agent. Ensemble, ils vous permettent de déboguer à la fois "où ce pipeline s'est-il cassé ?" et "qu'est-ce que l'agent a décidé étape par étape ?".

### Points clés

- **Chronologique** — chaque événement avec horodatage et durée
- **Extensible par étape** — cliquez sur n'importe quelle étape pour l'entrée/sortie complète de cette étape
- **Durée par étape** — voyez quelle étape est lente ; généralement un appel d'outil ou une longue réponse de modèle
- **Traces chaînées** — quand un agent est déclenché par une chaîne, la trace renvoie à l'agent en amont pour que vous puissiez naviguer dans le pipeline
- **Token par token** pour le modèle — utile pour les fournisseurs au streaming lent où l'utilisateur attend

### Comment ça marche

Chaque exécution écrit des événements dans le magasin de traces pendant qu'elle s'exécute ; l'onglet trace interroge ce magasin et rend la chronologie. Les événements au niveau token sont échantillonnés à un taux qui garde la trace utilisable même pour les longues réponses (une réponse de 10k tokens pourrait capturer 500 événements échantillonnés plutôt que 10k). Pour les boucles d'utilisation d'outils, chaque itération de l'aller-retour modèle/outil est capturée.

:::tip
Utilisez la trace pour confirmer ce que le modèle a *réellement* reçu. La plus grande source de bugs "l'agent a fait quelque chose de bizarre" est le modèle recevant une entrée différente de ce que vous attendiez — généralement à cause d'un résultat d'outil qui ne ressemblait pas à ce que le prompt de l'agent supposait.
:::
  `,

  "performance-trends": `
## Tendances de performance

Les tendances sont la vue à long terme du comportement de l'agent — taux de réussite, coût, durée, qualité de sortie (là où elle est mesurée) tracés dans le temps pour que vous puissiez voir l'impact des changements que vous faites. Vue d'ensemble → Tendances vous donne la vue graphique ; vous choisissez le(s) agent(s) et la (les) métrique(s) et la plage de dates, et les graphiques se rendent.

Le modèle le plus utile est "avant vs après" : vous avez changé le prompt d'un agent le 5 mars, les choses se sont-elles améliorées ou aggravées ? La vue des tendances y répond en quelques secondes — les lignes qui vous intéressent montent ou descendent à la date où vous avez fait le changement.

### Points clés

- **Plusieurs métriques sur un graphique** — superposez taux de réussite, coût, durée, taux de résultat commercial
- **Superposition multi-agents** — comparez la même métrique entre plusieurs agents sur un graphique
- **Plages de dates personnalisées** — zoomez de "cette heure" à "tous les temps"
- **Annotations** — les événements significatifs (sauvegardes de versions de prompt, changements de paramètres, rotations d'identifiants) sont épinglés à la chronologie pour que vous puissiez corréler
- **Export** — les données du graphique s'exportent au format CSV si vous voulez faire votre propre analyse

### Comment ça marche

Les tendances agrègent depuis le même magasin d'exécution et de trace que le reste des vues de surveillance — mêmes données, visualisation différente. Les annotations sont auto-générées à partir de l'historique des versions et de l'historique de configuration (qui sont également persistants) donc vous n'avez pas à marquer manuellement "j'ai fait un changement ici" ; le système le sait déjà.

:::tip
Après tout changement significatif à un agent (révision du prompt, échange de modèle, nouvel outil), vérifiez les tendances une semaine plus tard. La plupart des changements de prompt qui "semblaient meilleurs en test" produisent des métriques mesurablement différentes ; le graphique le confirme (ou invalide votre intuition).
:::
  `,

  "setting-budget-limits": `
## Définir des limites budgétaires

Les limites budgétaires plafonnent les dépenses d'IA au niveau de l'agent et au niveau global. Définissez un budget par exécution (cette seule exécution ne peut pas coûter plus de X$), un budget par jour (cet agent ne peut pas dépenser plus de Y$ par jour entre toutes les exécutions), ou un plafond global sur tous les agents. Quand une limite est atteinte, l'agent affecté se met en pause proprement — l'exécution partielle est capturée dans la trace, aucune charge ne persiste au-delà du plafond, et une notification se déclenche.

C'est l'une des fonctionnalités les plus sous-estimées pour les agents sans surveillance. Un agent déclenché par planning ou webhook sans plafond budgétaire pourrait accumuler des coûts inattendus pendant la nuit si un prompt ou une entrée fait quelque chose de pathologique. Les plafonds budgétaires signifient que le pire cas est borné par ce que vous avez décidé à l'avance, pas par ce qu'une exécution de modèle errante peut faire.

### Points clés

- **Plafond par exécution** — limite dure sur une seule exécution
- **Plafond par jour / par semaine / par mois** — limite de dépense fenêtrée par agent
- **Plafond global** — limite à travers tous les agents ; utile comme filet de sécurité même quand chaque agent a son propre plafond
- **Arrêt gracieux** — les agents s'arrêtent proprement au plafond ; la trace partielle est préservée
- **Notifications** — chaque atteinte de plafond vous notifie pour que vous puissiez décider d'augmenter le plafond ou de corriger le prompt sous-jacent
- **Avertissements doux** — seuils optionnels avant plafond (par ex. "avertir à 80 %") pour que vous sachiez qu'un agent se dirige vers un plafond

### Comment ça marche

Les plafonds sont configurés sur l'onglet Paramètres de l'agent (par exécution, par fenêtre) ou dans Paramètres → Moteur → Budget (global). Le moteur d'exécution suit le coût en direct pendant l'exécution ; quand le coût traverse le plafond, le moteur abandonne l'exécution via le même chemin qu'un timeout. L'état abandonné est préservé dans la trace avec la raison \`budget_exceeded\`.

:::warning
Définissez toujours au moins un plafond par jour pour tout agent déclenché automatiquement (planning, webhook, surveillance de fichiers, chaîne). Sans cela, une entrée pathologique ou une boucle de modèle pourrait dépenser un montant illimité avant que vous ne le remarquiez. Le plafond est votre filet de sécurité.
:::

:::tip
Commencez avec des plafonds environ 3x ce que vous attendez qu'une journée typique coûte. Assez serré pour attraper les emballements, assez lâche pour que la variance normale ne déclenche pas le plafond. Ajustez après une semaine de données réelles.
:::
  `,

  "the-director": `
## Le Director — Coaching automatique des agents

Le **Director** est un méta-agent intégré qui surveille vos autres agents et les coache pour qu'ils soient véritablement utiles. Au lieu de lire vous-même chaque exécution, le Director les examine à votre place et laisse un verdict.

Vous choisissez ce qu'il surveille en **étoilant** les agents (l'⭐ sur chaque ligne dans Tous les agents). Un agent étoilé est « dans le périmètre du Director » — le Director l'examine ; les agents non étoilés sont laissés de côté. Le Director lui-même est un agent système et ne peut pas être supprimé.

### Le centre de commande

Le Director se trouve sous **Vue d'ensemble › Director** — un écran dédié et focalisé :

- Un **tableau de bord de portefeuille** : quelle part du travail de votre flotte a réellement produit de la valeur, le score de verdict moyen, votre coût par exécution à valeur délivrée, et une distribution 0–5 montrant comment vos agents étoilés se comparent.
- Un **tableau de coaching** listant chaque agent dans le périmètre — score, sparkline de tendance (le coaching fait-il avancer les choses ?), taux de valeur, dernière révision, et **étiquettes d'attention** qui signalent exactement ce sur quoi agir (en attente d'une première révision, score faible, en déclin, obsolète). Filtrez pour n'afficher que les agents qui nécessitent attention. Cliquez sur n'importe quel agent pour ouvrir son **détail** — historique complet des verdicts avec le raisonnement et les suggestions concrètes derrière chaque score.
- Un en-tête fin avec **Réviser tous dans le périmètre**, un sélecteur **Ajouter au périmètre**, et le bouton de basculement de la **mémoire** à long terme.

La page Tous les agents conserve un bandeau Director discret qui renvoie directement ici.

### À quoi ressemble un verdict

Chaque révision produit un **score global de 0 à 5** plus des notes de coaching facultatives :

- La colonne **Verdict** dans la liste d'Activité affiche le score sous forme d'étoiles, juste à côté de l'agent — un coup d'œil vous dit quelles exécutions ont mérité leur coût.
- L'onglet **Director** sur n'importe quelle exécution ouvre l'évaluation complète en markdown lisible : le score, un résumé en une ligne, et des suggestions précises (un ajustement de prompt, un garde-fou, un changement de niveau de modèle, un outil manquant).
- Les notes actionnables atterrissent également dans votre file de révision, où les approuver ou les rejeter enseigne au Director vos préférences au fil du temps.

Un agent sain obtient un score élevé avec peu ou pas de coaching — le Director reste silencieux quand il n'y a rien à améliorer.

### Mémoire à long terme (facultatif)

Si vous utilisez l'**Obsidian Brain**, vous pouvez activer la mémoire à long terme du Director. Il lit alors ses propres notes passées sur un agent avant chaque révision (pour que les conseils s'accumulent au lieu de se répéter) et écrit chaque nouveau verdict dans un dossier \`Director/\` de votre vault — un historique de coaching durable et lisible par un humain.

### Pourquoi c'est important

Les compteurs bruts (exécutions, coût, taux de réussite) vous disent *ce qui* s'est passé, pas *si ça en valait la peine*. Le Director ajoute la couche de jugement manquante — une lecture honnête et fondée sur des preuves de la valeur et de l'efficacité de chaque agent — pour qu'une flotte d'agents reste utile sans que vous ayez à auditer chaque exécution à la main.
  `,

  "anomaly-detection": `
## Détection d'anomalies

La détection d'anomalies compare chaque nouvelle exécution au référentiel récent de l'agent et signale les exécutions qui semblent inhabituelles. Le référentiel est construit par agent : durée typique, coût typique, longueur typique de sortie, nombre typique d'appels d'outils. Une nouvelle exécution qui dévie significativement sur l'une de ces dimensions est signalée avec une raison — "durée 5× normale", "pic de coût", "nombre d'appels d'outils anormal", "sortie inhabituellement courte".

Cela attrape une classe de problèmes que les métriques pures de succès/échec manquent : l'exécution s'est terminée, mais quelque chose n'allait pas. L'agent a pris cinq minutes alors qu'il prend habituellement trente secondes. La sortie est trois phrases alors qu'elle est habituellement trois paragraphes. Le coût a doublé sans changement d'entrée. Ce sont des signaux qui valent la peine d'être vus avant qu'ils ne deviennent des tendances.

### Points clés

- **Référentiel multi-signaux** — durée, coût, taille de sortie, nombre d'appels d'outils, taux d'échec
- **Référentiels par agent** — chaque agent a sa propre normalité ; ce qui est anormal pour l'un est normal pour un autre
- **Alertes étiquetées par raison** — l'alerte nomme quel signal a dévié et de combien
- **Faible bruit** — calibré pour faire apparaître les vraies valeurs aberrantes, pas la variance normale
- **S'intègre aux notifications** — les anomalies se déclenchent via les canaux de notification avec lesquels l'agent est configuré

### Comment ça marche

Le référentiel est une fenêtre glissante d'exécutions récentes (configurable ; par défaut 50). Chaque nouvelle exécution est scorée sur chaque signal ; si un signal traverse le seuil configuré (par défaut 3 écarts-types de la moyenne glissante), l'exécution est signalée et un événement d'anomalie est émis. Les événements d'anomalie apparaissent dans Vue d'ensemble → Notifications et dans l'onglet Santé pour cet agent.

:::tip
Les anomalies que vous enquêtez et résolvez doivent être effacées (marquez-les "enquêtées"). Le référentiel exclut les anomalies enquêtées de sa fenêtre glissante, pour que le système ne dérive pas vers considérer l'exécution anormale comme "normale".
:::
  `,

  "tracking-goals": `
## Suivre les objectifs

Les objectifs sont la couche de résultats au-dessus des exécutions individuelles. Plutôt que d'observer les exécutions défiler une par une, vous définissez ce que vous essayez d'accomplir — et laissez la progression remonter automatiquement à partir du travail que font votre équipe et vos agents.

Un objectif a un titre, une date cible facultative, un statut et un pourcentage de progression. Le statut suit un modèle simple à quatre valeurs : **ouvert** (pas commencé), **en cours** (en travail), **bloqué** (en attente de quelque chose) et **terminé**. La progression est hybride : le système calcule une suggestion à partir des éléments de liste de contrôle de l'objectif, des sous-objectifs et des étapes d'attribution d'équipe liées — et vous la présente sous la forme d'un nudge **Accepter / modifier**. Vous décidez ; un remplacement manuel l'emporte toujours.

### Trois vues

Les objectifs se trouvent dans la section Équipes et proposent trois surfaces, accessibles via la barre latérale :

- **Tableau** — un kanban organisé par statut. Les cartes affichent le titre complet de l'objectif et une liste de contrôle intégrée (les premières tâches sous forme de cases à cocher activables, le reste derrière un lien « +N autres »). Quand un objectif a des tâches, les compléter fait avancer la progression — la barre avance à mesure que les éléments sont cochés.
- **Carte** — un canevas panoramique et zoomable montrant comment les objectifs se rapportent les uns aux autres. Les arêtes de dépendance (bloque, suit) connectent les objectifs en un graphe orienté. La mise en évidence **Maintenant** (un anneau ambré pulsant) marque les objectifs actuellement en cours ; la mise en évidence **Suivant** (un anneau bleu) marque les objectifs dont tous les bloqueurs sont terminés et qui sont prêts à démarrer. Dézoomez pour voir la constellation ; zoomez pour les métadonnées complètes de chaque nœud.
- **Chronologie** — les objectifs sur un rail de date d'échéance vertical, regroupés par urgence : En retard, Cette semaine, Ce mois, Plus tard, Pas de date.

### Le geste clé : confier à votre équipe IA

Le tiroir de détail pour tout objectif dispose d'un contrôle **Confier à votre équipe IA**. Le presser transforme l'objectif en une attribution d'équipe active liée à l'objectif. L'équipe décompose l'objectif en étapes (ou reprend les tâches existantes telles quelles), les travaille une par une, et coche la progression automatiquement à mesure que chaque étape se termine. L'objectif passe d'ouvert à en cours à terminé tout seul — et ne remonte dans votre file de révision que quand une étape nécessite réellement une décision humaine.

:::tip
Vous n'avez pas à confier un objectif à votre équipe immédiatement. Utilisez le Tableau pour élaborer la liste de contrôle manuellement d'abord — l'équipe reprend ensuite chaque tâche dans l'ordre, ce qui vous donne un contrôle fin sur ce qui est travaillé et dans quelle séquence.
:::
  `,

  "measuring-outcomes-with-kpis": `
## Mesurer les résultats avec des KPI

Les KPI sont la couche numérique au-dessus des objectifs. Là où un objectif décrit un résultat que vous voulez atteindre, un KPI suit si vous y parvenez réellement — une valeur actuelle, une cible et une lecture de rythme qui vous indique si vous êtes sur la bonne voie.

Chaque KPI affiche sa valeur actuelle par rapport à sa cible avec un statut de **rythme** : **sur la bonne voie**, **hors de la voie**, **atteint** ou **non mesuré** (quand une mesure n'a pas encore été prise). Une barre de progression et un indicateur de fraîcheur de mesure complètent la carte d'un coup d'œil.

### Quatre types de mesure

Les KPI ne sont pas tous mesurés de la même façon. Personas prend en charge quatre types de mesure, chacun adapté à une source de données différente :

:::info
- **Base de code** — exécute une commande sur votre dépôt et analyse le résultat. Utile pour des éléments comme le pourcentage de couverture de tests ou le nombre d'erreurs de lint qui vivent entièrement dans le code.
- **Dérivé** — lit les données propres de l'orchestrateur : comptages d'exécutions, taux de résultats, tendances de coûts et métriques opérationnelles similaires que Personas suit déjà.
- **Connecteur** — tire une valeur d'un service externe connecté (analytiques, trafic, suivi d'erreurs). Si le connecteur nécessaire n'est pas encore dans votre vault, la carte KPI affiche une invite « Connecter \<service\> » qui renvoie directement au catalogue d'identifiants.
- **Manuel** — vous entrez la valeur vous-même. Utile pour les chiffres métier qui ne vivent dans aucun système que vous avez connecté, ou pour les KPI que vous souhaitez suivre de manière informelle avant d'automatiser la mesure.
:::

### Où vivent les KPI

**Équipes › KPI** dispose de deux vues derrière un interrupteur segmenté. La vue **Tableau de bord** affiche tous les KPI actifs sous forme de cartes — cliquez sur n'importe quelle carte pour ouvrir le tiroir de détail avec l'historique complet des mesures, un sparkline et un champ de saisie manuelle de valeur. La vue **Propositions** est une file de révision : cliquer sur « Scanner les KPI » effectue une passe d'analyse sans interface sur la carte de contexte de votre projet et les KPI existants, et fait remonter des KPI proposés avec une justification en une ligne et la procédure de mesure exacte qu'il utiliserait. Vous acceptez (en ajustant éventuellement la cible d'abord) ou rejetez. Les propositions rejetées sont archivées et réinjectées dans les scans futurs comme exemples négatifs pour que la même suggestion ne revienne pas.

:::tip
Laissez le scan proposer des KPI avant de les rédiger manuellement. Il lit la carte de contexte de votre projet, vos objectifs existants et le roster de connecteurs de votre vault — et tend à suggérer des mesures réellement automatisables avec ce que vous avez déjà connecté.
:::
  `,

  "director-verdicts-and-categories": `
## Verdicts et catégories du Director

Chaque révision du Director produit un verdict structuré — pas seulement un succès/échec, mais une évaluation en couches qui vous indique ce qu'un agent fait bien, ce qui nécessite du coaching, et comment classer ce coaching pour qu'il porte vraiment ses fruits.

La pièce obligatoire est un **score global de 0 à 5** avec un résumé en une ligne. Ce score atterrit sur l'enregistrement d'exécution et apparaît sous forme d'étoiles dans la liste d'Activité — un scan rapide des exécutions récentes d'un agent vous indique lesquelles ont mérité leur coût. Le score alimente également le sparkline de tendance dans le tableau des agents : une courte barre d'historique colorée selon la dernière note.

### Ce qui fonctionne bien

La révision ne commence pas par la critique. Avant toute note de coaching, le Director souligne ce que l'agent fait vraiment bien — ce que les docs appellent les **réussites**. Elles apparaissent en haut du markdown complet de l'évaluation dans une section « Ce qui fonctionne ». Un agent qui performe bien n'obtient que des réussites ; le Director reste silencieux quand il n'y a rien à améliorer.

### Notes de coaching et catégories

Après les réussites viennent les notes de coaching : des suggestions spécifiques et actionnables classées sous l'une des six **catégories** :

- **Prompt** — les instructions ou le cadrage de l'agent nécessitent un ajustement
- **Santé** — problèmes de fiabilité ou de gestion des erreurs
- **Déclencheurs** — comment et quand l'agent se déclenche (planning, webhook, configuration de chaîne)
- **Identifiants** — lacunes de vault ou de permission bloquant l'agent
- **Mémoire** — ce que l'agent stocke et rappelle (ou ne parvient pas à faire)
- **Utilité** — si la sortie de l'agent est réellement précieuse pour son objectif déclaré

Les notes de coaching atterrissent dans votre **file de révision** sous forme d'éléments que vous approuvez ou rejetez. Ce n'est pas juste de l'administration : approuver ou rejeter des notes enseigne au Director vos préférences. La prochaine révision relit quelles notes vous avez acceptées et lesquelles vous avez rejetées, de sorte que la boucle de retour se compose — le Director s'améliore pour savoir ce qui vous importe pour chaque agent, et cesse de suggérer des choses que vous avez déjà écartées.

Le centre de commande du Director inclut un récapitulatif **Problèmes par catégorie** qui comptabilise les notes de coaching sur toute votre flotte, pour que vous puissiez voir au niveau du portefeuille si les lacunes d'identifiants sont votre problème le plus courant ou si la qualité du prompt est là où la plupart des agents ont besoin d'attention.

:::tip
Les agents sains obtiennent des scores élevés et génèrent peu ou pas de notes de coaching. Si un agent gagne systématiquement un 4–5 sans éléments de révision en attente, c'est le signal de le laisser tranquille et de concentrer l'attention sur ceux qui ont des tendances déclinantes ou des scores faibles.
:::
  `,

  "director-momentum-and-stale-sweep": `
## Élan du Director et balayage des obsolètes

Au-delà des verdicts individuels, le Director construit une image de portefeuille de la tendance de toute votre flotte. C'est la vue longitudinale — pas « qu'a fait cet agent lors de sa dernière exécution » mais « le coaching fait-il vraiment avancer les choses à travers vos agents dans le temps ? »

### Le tableau de bord

Le centre de commande du Director s'ouvre avec un **tableau de bord** qui répond à quatre questions d'un coup d'œil : quelle fraction du travail de votre flotte a délivré de la valeur (le **taux de valeur délivrée**), quel est le score de verdict moyen à travers tous les agents dans le périmètre, quel est le **coût par exécution utile**, et combien d'agents sont actuellement dans le périmètre. Sous les KPI de titre, une barre de **décomposition de valeur** décompose le taux de valeur délivrée dans la taxonomie complète des résultats — délivré, partiel, bloqué, sans entrée, non évalué — pour que vous puissiez voir où la valeur fuit, pas seulement si elle fuit.

Un graphique de **distribution des scores 0–5** montre comment vos agents étoilés se répartissent sur l'échelle de notation complète, avec une ligne en pointillé marquant la moyenne du portefeuille. Un sélecteur de période de révision (7 / 30 / 90 jours) limite l'ensemble du tableau de bord.

### Élan

La bande **d'élan** répond à la question la plus importante du portefeuille : les choses s'améliorent-elles ? Elle comptabilise combien d'agents se sont **améliorés**, ont **tenu le même niveau** ou ont **régressé** par rapport à leur révision précédente. Une flotte qui s'améliore signifie que le coaching fonctionne ; une flotte qui régresse signifie que quelque chose de systémique nécessite attention — changements de modèle, dérive des identifiants, dégradation des prompts.

### Étiquettes d'attention et triage

Le tableau de coaching signale chaque agent dans le périmètre avec des **étiquettes d'attention** basées sur des règles dérivées du client : en attente d'une première révision (jamais évalué), score faible (≤ 2), tendance déclinante ou révision obsolète (pas coaché depuis plus de 14 jours). Une barre de triage d'attention en haut du tableau récapitule ces indicateurs — N nouveaux, N faibles, N en déclin, N obsolètes — pour que vous voyiez l'ampleur du problème avant de commencer à le traiter.

Cliquer sur un chip de triage filtre le tableau selon cet indicateur. Une fois filtré, une action **Réviser ces N** exécute le Director séquentiellement sur exactement ces agents — le triage débouche directement sur l'action.

### Le balayage des obsolètes

Le bouton **Balayage des obsolètes** re-révise tous les agents étoilés qui n'ont pas été coachés depuis plus de 14 jours, en un seul clic. Il n'apparaît que quand des agents obsolètes existent. C'est la passe de maintenance de routine : lancez-la une fois par mois et le Director attrape tout agent qui a dérivé depuis sa dernière évaluation.

### Mémoire à long terme

Avec l'**Obsidian Brain** activé, le Director lit ses propres notes passées sur un agent avant chaque révision et écrit le nouveau verdict dans un dossier \`Director/\` de votre vault. Le coaching se compose au lieu de se répéter — le Director ne re-suggère pas des choses qu'il a déjà couvertes, et il s'appuie sur ce que vous avez approuvé et rejeté au fil du temps.

:::tip
Le balayage des obsolètes et la barre de triage d'attention sont les deux moyens les plus rapides de maintenir une grande flotte en bonne santé sans passer du temps sur des agents qui fonctionnent déjà bien. Utilisez la barre de triage pour trouver les agents qui nécessitent réellement de l'attention ; utilisez le balayage des obsolètes pour vous assurer que rien ne glisse silencieusement sans révision.
:::
  `,
};
