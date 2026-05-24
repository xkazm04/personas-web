export const content: Record<string, string> = {
  "how-agent-memory-works": `
## Comment fonctionne la mémoire de l'agent

Vos agents peuvent se souvenir des tâches passées et apprendre de l'expérience. Chaque fois qu'un agent s'exécute, il peut stocker des informations utiles — faits, décisions, modèles et leçons apprises. Pensez-y comme à un carnet que votre agent emporte de tâche en tâche, accumulant des connaissances au fil du temps.

Cela signifie que vos agents deviennent plus intelligents au fur et à mesure que vous les utilisez. Un agent qui a géré des centaines de demandes clients aura le contexte sur les problèmes courants, les solutions préférées et les décisions passées qu'un agent flambant neuf ne connaîtrait pas.

### Points clés

- Les agents **apprennent automatiquement** de chaque tâche qu'ils accomplissent
- Les mémoires persistent **entre les exécutions** — votre agent se souvient du travail précédent
- Chaque mémoire est **catégorisée et classée** par importance
- Vous pouvez **examiner, modifier ou supprimer** toute mémoire à tout moment

### Comment ça marche

Pendant une exécution, si l'agent rencontre quelque chose qui mérite d'être mémorisé — un fait utile, une décision importante, ou une leçon apprise — il crée une entrée de mémoire. La prochaine fois que l'agent s'exécute, il peut rappeler les mémoires pertinentes pour prendre de meilleures décisions. Vous avez le contrôle total pour examiner et gérer ce dont votre agent se souvient.

:::tip
La mémoire fonctionne mieux quand les agents ont des tâches cohérentes et ciblées. Un agent qui gère toujours des notes de frais construira des mémoires plus utiles qu'un qui fait une tâche différente à chaque fois.
:::
  `,

  "memory-categories": `
## Catégories de mémoire

Les mémoires sont organisées en cinq catégories, chacune servant un objectif différent. Cette structure aide votre agent à rappeler le bon type de connaissance au bon moment — comme des chapitres dans un livre de référence.

Comprendre ces catégories vous aide à examiner et gérer les connaissances de votre agent plus efficacement. Chaque catégorie vous dit non seulement *ce que* l'agent sait, mais *quel type* de connaissance c'est.

### Les cinq catégories

:::compare
**Fait**
Information concrète apprise des tâches. Exemple : "Le client préfère un langage formel." Pièces simples de connaissances que votre agent ramasse.
---
**Décision**
Choix faits et le raisonnement derrière. Exemple : "Choisi l'expédition Express parce que la commande était urgente." Enregistre le pourquoi, pas seulement le quoi.
---
**Insight**
Modèles découverts à travers plusieurs exécutions. Exemple : "Les tickets de support augmentent chaque lundi matin." Devient plus intelligent avec le temps.
---
**Apprentissage**
Leçons d'erreurs ou de succès. Exemple : "Les lignes d'objet plus courtes obtiennent des taux d'ouverture plus élevés." Amélioration continue en action.
---
**Avertissement**
Pièges à surveiller. Exemple : "Ne jamais envoyer de factures avant que le contrat ne soit signé." Empêche votre agent de répéter les erreurs passées.
:::

### Comment ça marche

Quand un agent crée une mémoire, il la catégorise automatiquement en fonction du contenu. Les faits sont des pièces simples d'information. Les décisions enregistrent les choix avec le raisonnement. Les insights capturent les modèles. Les apprentissages viennent de la réflexion sur les résultats. Les avertissements signalent des choses à éviter.

:::tip
Portez une attention particulière à la catégorie Avertissements pendant vos revues. Ces mémoires aident votre agent à éviter de répéter les erreurs passées — elles sont souvent les plus précieuses.
:::
  `,

  "importance-levels": `
## Niveaux d'importance

Chaque mémoire a un score d'importance de 1 à 5. Un score de 1 signifie qu'il s'agit d'informations de routine, tandis que 5 signifie que c'est critique. Les mémoires importantes sont rappelées plus souvent, restent plus longtemps et reçoivent plus de poids quand l'agent prend des décisions — tout comme vous vous souvenez mieux des grands événements de la vie que de ce que vous avez mangé pour le déjeuner mardi dernier.

Ce système de classement garde votre agent concentré sur ce qui compte le plus, plutôt que de se noyer dans des détails triviaux.

### L'échelle

| Niveau | Étiquette | Priorité de rappel | Description |
|-------|-------|-----------------|-------------|
| 1 | Routine | Faible | Détails mineurs qui pourraient être utiles occasionnellement |
| 2 | Utile | Modérée | Contexte utile qui enrichit la compréhension |
| 3 | Important | Standard | Connaissance qui influence régulièrement les décisions |
| 4 | Très important | Élevée | Information clé que l'agent devrait presque toujours considérer |
| 5 | Critique | Toujours | Connaissance essentielle qui ne doit jamais être oubliée ou ignorée |

### Comment ça marche

L'importance est attribuée automatiquement lors de la création d'une mémoire, en fonction de facteurs comme la fréquence à laquelle l'information est référencée et combien elle a affecté les résultats. Vous pouvez également ajuster les niveaux d'importance manuellement si vous êtes en désaccord avec l'attribution automatique.

:::tip
Si un agent continue de faire la même erreur, vérifiez si la mémoire pertinente existe et si son niveau d'importance est assez élevé. La faire monter à 4 ou 5 garantit que l'agent y prête attention.
:::
  `,

  "searching-agent-memories": `
## Rechercher dans les mémoires de l'agent

À mesure que vos agents accumulent des connaissances, pouvoir rechercher dans leurs mémoires devient essentiel. Tapez un mot-clé ou une phrase et voyez instantanément chaque mémoire liée à travers tous vos agents. C'est comme rechercher dans vos e-mails — rapide, simple, et vous pouvez filtrer par catégorie, importance ou date.

La recherche vous aide à comprendre ce que vos agents savent, à vérifier qu'ils ont appris correctement, et à trouver rapidement des informations spécifiques.

### Points clés

- **Recherche en texte intégral** — trouvez des mémoires par tout mot-clé ou phrase qu'elles contiennent
- **Filtrer par catégorie** — affinez les résultats aux faits, décisions, insights, apprentissages ou avertissements
- **Filtrer par importance** — affichez uniquement les mémoires à haute ou faible priorité
- **Recherche inter-agents** — recherchez à travers tous vos agents à la fois ou concentrez-vous sur un

### Comment ça marche

Ouvrez la section \`Mémoires\` et tapez votre requête de recherche dans la barre de recherche. Les résultats apparaissent instantanément avec le texte correspondant surligné. Utilisez les boutons de filtre pour affiner par catégorie, niveau d'importance, plage de dates ou agent spécifique. Cliquez sur n'importe quel résultat pour voir la mémoire complète avec tout son contexte.

:::tip
Recherchez un sujet avant de créer une mémoire manuelle. Votre agent pourrait déjà savoir ce que vous êtes sur le point de lui enseigner — dans ce cas, vous pouvez simplement mettre à jour la mémoire existante.
:::
  `,

  "creating-memories-manually": `
## Créer des mémoires manuellement

Parfois, vous voulez que votre agent sache quelque chose avant qu'il ne l'apprenne par lui-même — comme briefer un nouvel employé le premier jour. Les mémoires manuelles vous permettent d'enseigner à vos agents des faits, préférences ou règles spécifiques directement, leur donnant une longueur d'avance sur la connaissance qu'ils devraient autrement découvrir par expérience.

C'est particulièrement utile pour les informations spécifiques à l'entreprise, les préférences personnelles ou les règles critiques qui ne devraient jamais être apprises par essai et erreur.

:::steps
1. **Ouvrez la section Mémoires** — cliquez sur \`Mémoires\` dans la barre latérale puis sur \`Ajouter une mémoire\`
2. **Choisissez la catégorie** — sélectionnez fait, décision, insight, apprentissage ou avertissement
3. **Rédigez le contenu de la mémoire** — décrivez la connaissance en langage clair
4. **Définissez le niveau d'importance** — attribuez un score de 1 (routine) à 5 (critique)
5. **Attribuez à un agent** — choisissez un agent spécifique ou rendez la mémoire disponible pour tous les agents
:::

### Comment ça marche

La mémoire que vous créez est ajoutée à la base de connaissances de l'agent tout comme une mémoire apprise automatiquement. La prochaine fois que l'agent s'exécute, il peut accéder à cette information avec tout ce qu'il a appris par lui-même. Les mémoires manuelles sont marquées d'une petite icône pour que vous puissiez les distinguer des automatiques.

:::tip
Créez quelques mémoires "Avertissement" pour vos règles les plus critiques avant qu'un agent ne passe en direct. Par exemple : "Ne jamais partager d'informations de tarification sans l'approbation du manager."
:::
  `,

  "memory-tiers-explained": `
## Niveaux de mémoire expliqués

Toutes les mémoires ne sont pas créées égales, et toutes n'ont pas besoin d'être immédiatement accessibles. Personas organise les mémoires en quatre niveaux en fonction de la fréquence d'utilisation et de l'importance. Pensez-y comme à un système de classement : les éléments les plus utilisés restent sur votre bureau, ceux moins utilisés vont dans un tiroir, et ceux rarement nécessaires sont classés dans un classeur.

Ce système à niveaux garde votre agent rapide et efficace. Il rappelle les mémoires les plus pertinentes instantanément tout en ayant accès aux connaissances plus anciennes quand nécessaire.

### Les quatre niveaux

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
Toujours chargé. Règles et faits critiques permanents. Épinglé manuellement et jamais rétrogradé. La connaissance la plus importante de votre agent.
---
**Active**
Chargé au rappel. Mémoires récentes fréquemment consultées. Auto-promu par fréquence d'utilisation. Le "tiroir du bureau" du contexte utile.
---
**Working**
À portée de session. Mémoires de la tâche actuelle ou des sessions récentes. Créé pendant l'exécution et vieillit en Active au fil du temps.
---
**Archive**
À la demande uniquement. Mémoires plus anciennes non consultées récemment. Auto-rétrogradé après inactivité mais préservé indéfiniment. Rien n'est jamais perdu.
:::

### Comment ça marche

Les mémoires se déplacent entre les niveaux automatiquement en fonction des modèles d'utilisation. Une mémoire fréquemment rappelée est promue à un niveau supérieur ; une qui n'a pas été consultée depuis un moment se dirige progressivement vers l'archive. Vous pouvez également épingler manuellement les mémoires au niveau Core pour vous assurer qu'elles sont toujours au premier plan pour votre agent.

:::tip
Épinglez vos règles et faits les plus importants au niveau Core. Cela garantit que votre agent les considère toujours, quelle que soit leur ancienneté.
:::
  `,

  "memory-and-execution": `
## Mémoire et exécution

Quand votre agent commence une nouvelle tâche, il ne commence pas avec une page blanche. Il rappelle automatiquement les mémoires pertinentes des exécutions précédentes, apportant contexte, préférences et leçons apprises dans l'exécution actuelle. Cela rend chaque exécution plus informée que la précédente.

Le processus de rappel est intelligent — il ne vide pas toutes les mémoires à la fois. Au lieu de cela, il sélectionne celles les plus pertinentes pour la tâche actuelle, un peu comme vous rappelez naturellement des expériences liées face à une situation familière.

### Points clés

- **Rappel automatique** — les mémoires pertinentes sont chargées avant chaque exécution
- **Conscient du contexte** — seules les mémoires liées à la tâche actuelle sont rappelées
- **Pondéré par importance** — les mémoires à plus haute importance sont plus susceptibles d'être rappelées
- **Création de mémoires** — de nouvelles mémoires peuvent être créées pendant l'exécution en fonction des résultats

### Comment ça marche

Avant que votre agent ne traite sa tâche, le système de mémoire scanne les entrées pertinentes en fonction du contenu et du contexte de la tâche. Ces mémoires sont fournies au modèle d'IA avec vos instructions. Après que la tâche se termine, l'agent évalue si quelque chose de nouveau a été appris et crée des mémoires en conséquence.

:::tip
Si un agent n'utilise pas ses mémoires efficacement, vérifiez que les mémoires sont catégorisées et notées correctement. Les mémoires bien organisées sont rappelées de manière plus fiable.
:::
  `,

  "reviewing-and-cleaning-memories": `
## Examiner et nettoyer les mémoires

Avec le temps, certaines mémoires deviennent obsolètes, incorrectes ou redondantes. Des revues régulières gardent la base de connaissances de votre agent précise et à jour. Pensez-y comme un grand ménage de printemps pour le cerveau de votre agent — éliminer les vieilles informations pour que votre agent prenne des décisions basées sur des connaissances actuelles et correctes.

Une base de mémoire propre conduit à de meilleures performances de l'agent. Un agent qui s'appuie sur des informations obsolètes peut prendre de mauvaises décisions sans s'en rendre compte.

### Points clés

- **Parcourez toutes les mémoires** avec des options de tri et de filtrage
- **Modifiez** toute mémoire pour corriger des inexactitudes ou mettre à jour des informations obsolètes
- **Supprimez** les mémoires qui ne sont plus pertinentes
- **Fusionnez** les mémoires en double ou similaires en une entrée claire

### Comment ça marche

Ouvrez la section \`Mémoires\` et parcourez la liste de mémoires de votre agent. Triez par date, importance ou catégorie pour concentrer votre examen. Cliquez sur n'importe quelle mémoire pour modifier son contenu, changer son niveau d'importance, ou la supprimer. Le système suggère également des doublons potentiels qui pourraient être fusionnés.

:::tip
Planifiez un examen mensuel des mémoires de vos agents les plus actifs. Même 15 minutes de nettoyage peuvent améliorer sensiblement la qualité de prise de décision d'un agent.
:::
  `,

  "exporting-and-importing-memories": `
## Exporter et importer des mémoires

Vous pouvez exporter toute la base de mémoires de votre agent vers un fichier — parfait pour les sauvegardes, le partage de connaissances entre agents, ou le déplacement vers un nouvel ordinateur. L'importation charge un fichier précédemment exporté et ajoute ces mémoires à la base de connaissances de l'agent cible.

Cette fonctionnalité est également idéale pour donner à un nouvel agent le bénéfice de l'expérience d'un autre. Exportez depuis votre agent expérimenté, importez dans le nouveau, et il commence avec une richesse de connaissances au lieu d'une page blanche.

### Points clés

- **Exporter vers un fichier** — sauvegardez toutes les mémoires comme un fichier portable que vous pouvez stocker ou partager
- **Importer depuis un fichier** — chargez les mémoires dans tout agent sur tout appareil
- **Exportation sélective** — choisissez des catégories ou niveaux d'importance spécifiques à exporter
- **Gestion des conflits** — les doublons sont détectés et fusionnés pendant l'importation

### Comment ça marche

Ouvrez les paramètres de mémoire d'un agent et cliquez sur \`Exporter\`. Choisissez quelles mémoires inclure (toutes, ou filtrées par catégorie/importance) et enregistrez le fichier. Pour importer, ouvrez les paramètres de mémoire de l'agent cible, cliquez sur \`Importer\`, et sélectionnez votre fichier. Personas détecte les doublons et vous laisse décider comment les gérer.

:::tip
Avant un changement majeur au prompt d'un agent, exportez ses mémoires comme sauvegarde. Si le nouveau prompt crée de la confusion, vous pouvez restaurer les mémoires originales.
:::
  `,

  "memory-best-practices": `
## Bonnes pratiques de mémoire

Tirer le meilleur parti de la mémoire de l'agent se résume à quelques habitudes clés. Comme de bonnes habitudes d'étude pour un étudiant, la façon dont vous structurez et maintenez les mémoires fait une grande différence dans la façon dont vos agents apprennent et rappellent efficacement l'information.

Suivez ces directives pour construire des agents qui s'améliorent vraiment au fil du temps plutôt que d'accumuler de l'encombrement.

### Bonnes pratiques

- **Gardez les agents ciblés** — un agent avec une tâche cohérente construit des mémoires plus utiles qu'un généraliste
- **Examinez régulièrement** — vérifiez les mémoires mensuellement et supprimez les entrées obsolètes ou incorrectes
- **Utilisez des mémoires manuelles pour les règles critiques** — n'attendez pas que l'agent apprenne quelque chose à la dure
- **Définissez des niveaux d'importance appropriés** — tout n'est pas critique, et c'est très bien
- **Épinglez les connaissances essentielles** au niveau Core pour qu'elles soient toujours disponibles

### Comment ça marche

Une bonne gestion de la mémoire est une pratique continue, pas une configuration unique. Commencez par créer quelques mémoires manuelles pour vos règles les plus importantes. Laissez l'agent apprendre naturellement de ses exécutions. Examinez périodiquement pour corriger les erreurs et supprimer les informations obsolètes. Ajustez les niveaux d'importance à mesure que votre compréhension de ce qui compte évolue.

:::tip
Pensez à la gestion de la mémoire comme à l'entretien d'un jardin. Des petits efforts réguliers — tailler, arroser, replanter — produisent de bien meilleurs résultats que des grandes refontes occasionnelles.
:::
  `,
};
