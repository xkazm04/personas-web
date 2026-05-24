export const content: Record<string, string> = {
  "common-error-messages": `
## Messages d'erreur courants

Les messages d'erreur peuvent sembler effrayants, mais la plupart ont des solutions simples. Ce guide traduit les erreurs les plus fréquentes en langage clair et vous dit exactement quoi faire. Vous n'avez pas besoin de comprendre les détails techniques — faites simplement correspondre l'erreur à la solution.

La plupart des erreurs tombent dans quelques catégories : problèmes d'identifiants, problèmes de timeout et inadéquations de format d'entrée. Une fois que vous connaissez les modèles, le dépannage devient une seconde nature.

### Liste de vérification de diagnostic rapide

:::checklist
- Vérifiez si l'API du fournisseur d'IA est en ligne et que votre compte est actif
- Vérifiez la santé de l'identifiant dans le panneau Identifiants (cherchez les indicateurs rouges/jaunes)
- Examinez les limites de taux — attendez une minute si vous avez envoyé trop de requêtes
- Essayez une exécution manuelle avec une entrée de test simple pour isoler le problème
- Vérifiez le format d'entrée si les données viennent d'un déclencheur ou d'un pipeline
:::

### Erreurs les plus courantes

- **"Authentication failed"** — votre identifiant a expiré ou a été saisi incorrectement. Allez dans \`Identifiants\` et rafraîchissez-le ou ressaisissez-le.
- **"Request timed out"** — le fournisseur d'IA a pris trop de temps à répondre. Essayez de réexécuter, ou augmentez le timeout dans les paramètres de l'agent.
- **"Rate limit exceeded"** — vous avez fait trop de requêtes trop rapidement. Attendez une minute et réessayez, ou mettez à niveau votre plan fournisseur.
- **"Invalid input format"** — les données envoyées à votre agent n'étaient pas au format attendu. Vérifiez le déclencheur ou le pipeline qui alimente cet agent.

### Comment ça marche

Quand une erreur se produit, elle apparaît dans le journal d'exécution avec un code et une description. Cliquez sur l'erreur pour voir une explication détaillée et une solution suggérée. De nombreuses erreurs incluent un bouton \`Corriger maintenant\` qui vous emmène directement au paramètre qui nécessite attention.

:::tip
Ne paniquez pas quand vous voyez une erreur. Lisez le message attentivement — il vous dit presque toujours ce qui ne va pas et vous oriente vers la solution.
:::
  `,

  "agent-not-responding": `
## Agent qui ne répond pas

Si votre agent semble figé, bloqué ou ne produit tout simplement pas de résultats, ne vous inquiétez pas — c'est généralement une solution simple. Les causes les plus courantes sont une connexion au fournisseur d'IA qui a expiré, un problème d'identifiant, ou l'agent atteignant sa limite maximale de tours. Suivez cette liste de vérification pour revenir sur la bonne voie.

La plupart des problèmes d'agent non réactif se résolvent quand vous identifiez et corrigez la cause sous-jacente, qui n'est presque jamais un problème permanent.

### Liste de vérification de diagnostic

:::steps
1. **Vérifiez le journal d'exécution** — cherchez les messages d'erreur ou avertissements qui expliquent l'arrêt
2. **Vérifiez votre fournisseur d'IA** — assurez-vous que l'API de votre fournisseur est en ligne et que votre compte est actif
3. **Vérifiez les identifiants** — assurez-vous que les identifiants de l'agent n'ont pas expiré
4. **Examinez les limites** — l'agent peut avoir atteint son timeout ou son paramètre de tours maximum
5. **Essayez une exécution manuelle** — exécutez l'agent avec une entrée de test simple pour isoler le problème
:::

### Comment ça marche

Ouvrez l'agent et vérifiez son dernier journal d'exécution. S'il affiche une erreur, suivez la solution pour cette erreur spécifique. Si le journal montre que l'agent s'exécute toujours, il peut être en train de traiter une tâche particulièrement complexe. Vérifiez le paramètre de timeout — s'il est trop court, l'agent peut s'arrêter avant de terminer.

:::tip
Si un agent est vraiment bloqué (aucun progrès pendant plusieurs minutes), cliquez sur \`Arrêter\` puis essayez une exécution manuelle avec une entrée plus simple. Cela vous aide à déterminer si le problème vient de l'entrée ou de l'agent lui-même.
:::
  `,

  "credential-errors": `
## Erreurs d'identifiants

Quand un agent ne peut pas se connecter à un service, c'est généralement parce qu'un identifiant a expiré, un mot de passe a été changé, ou une permission a été révoquée. Ce sont les problèmes les plus courants dans tout système d'automatisation, et ils sont presque toujours rapides à corriger.

La clé est d'identifier quel identifiant cause le problème, puis de le rafraîchir ou de le remplacer.

### Causes courantes

- **Jeton expiré** — les jetons OAuth expirent périodiquement et doivent être rafraîchis
- **Mot de passe changé** — si vous avez changé un mot de passe ailleurs, mettez-le à jour dans Personas aussi
- **Permissions révoquées** — le service peut avoir révoqué l'accès que vous aviez initialement accordé
- **Mauvais identifiant attribué** — l'agent peut utiliser le mauvais identifiant pour le service

### Comment ça marche

Vérifiez le message d'erreur dans le journal d'exécution — il mentionnera quel service a échoué. Allez dans \`Identifiants\` et trouvez l'identifiant pour ce service. Vérifiez son statut de santé. S'il est rouge ou jaune, cliquez dessus pour voir ce qui ne va pas et suivez la solution suggérée — généralement rafraîchir le jeton ou ressaisir le mot de passe.

:::tip
Configurez les vérifications de santé des identifiants pour s'exécuter automatiquement. Elles attraperont les identifiants expirants avant qu'ils ne causent des échecs d'agent, transformant une crise potentielle en tâche de maintenance de routine.
:::
  `,

  "trigger-not-firing": `
## Déclencheur qui ne se déclenche pas

Un déclencheur qui ne se déclenche pas est frustrant, mais la cause est généralement quelque chose de petit — une faute de frappe de configuration, un problème de timing ou une permission manquante. Ce guide vous présente les coupables les plus courants pour que vous puissiez remettre vos automatisations en marche.

Le journal de déclencheur est votre meilleur ami ici. Il enregistre chaque tentative d'activation, y compris celles qui ont été filtrées ou ont échoué silencieusement.

### Étapes de diagnostic

:::steps
1. **Vérifiez le journal de déclencheur** — ouvrez les paramètres de déclencheur de l'agent et cliquez sur l'onglet \`Journal\` pour voir chaque tentative, y compris les échecs
2. **Vérifiez que le déclencheur est activé** — cherchez l'interrupteur ; les déclencheurs désactivés ne se déclenchent pas
3. **Vérifiez les filtres** — examinez vos conditions de filtre, qui pourraient être trop strictes et bloquer tous les événements
4. **Testez manuellement** — utilisez le testeur de déclencheur pour simuler un événement et vérifier la configuration
5. **Vérifiez les permissions** — confirmez que les surveillances de fichiers ont accès au dossier et que les webhooks ont accès au réseau
:::

### Comment ça marche

Ouvrez les paramètres de déclencheur de l'agent et cliquez sur l'onglet \`Journal\`. Chaque tentative de déclencheur est listée avec un statut : déclenché, filtré ou échoué. Cliquez sur n'importe quelle entrée pour voir pourquoi elle ne s'est pas déclenchée. La découverte la plus courante est un filtre légèrement trop strict — l'ajuster résout généralement le problème immédiatement.

:::tip
Quand vous configurez un nouveau déclencheur, commencez sans aucun filtre. Une fois que vous avez confirmé qu'il se déclenche correctement, ajoutez les filtres un par un. De cette façon, vous savez que chaque filtre fonctionne comme prévu.
:::
  `,

  "self-healing-explained": `
## Auto-réparation expliquée

Quand quelque chose ne va pas pendant une exécution d'agent, le système d'auto-réparation tente de résoudre le problème et de réessayer automatiquement. C'est comme avoir un filet de sécurité qui attrape la plupart des erreurs avant même que vous ne les remarquiez. Les problèmes courants comme les défaillances réseau temporaires, les brèves pannes d'API ou les limites de taux sont gérés sans votre intervention.

L'auto-réparation ne signifie pas que votre agent n'échoue jamais — cela signifie qu'il récupère des types de petits problèmes temporaires qui vous obligeraient autrement à le redémarrer manuellement.

### Points clés

- **Réessai automatique** — les erreurs transitoires sont réessayées avec un timing de retrait intelligent
- **Classification d'erreur** — le système distingue entre les erreurs corrigibles et incorrigibles
- **Rafraîchissement d'identifiants** — les jetons expirés sont rafraîchis automatiquement quand c'est possible
- **Transparent** — chaque action d'auto-réparation est journalisée pour que vous puissiez voir ce qui s'est passé

### Comment ça marche

Quand une erreur se produit, le système d'auto-réparation l'évalue. Les erreurs transitoires (timeouts réseau, limites de taux, pannes temporaires) déclenchent un réessai automatique après une courte attente. Les expirations d'identifiants déclenchent une tentative de rafraîchissement automatique. Les erreurs permanentes (configuration invalide, permissions manquantes) vous sont signalées immédiatement parce qu'elles nécessitent votre attention.

:::success
Quand l'auto-réparation réussit, l'agent continue comme si rien ne s'était passé. Le journal d'exécution marque l'erreur récupérée avec un badge vert "guéri" pour que vous puissiez voir ce qui a été attrapé et résolu automatiquement.
:::

:::tip
Vérifiez occasionnellement le journal d'auto-réparation pour voir ce qui est attrapé. Si la même erreur continue d'être guérie, cela pourrait indiquer un problème sous-jacent qui mérite d'être corrigé de manière permanente.
:::
  `,

  "checking-system-health": `
## Vérifier la santé du système

La vérification de santé intégrée scanne toute votre installation Personas et signale tout problème — composants obsolètes, fichiers manquants, problèmes de configuration ou problèmes de connectivité. Exécutez-la chaque fois que quelque chose semble anormal pour une évaluation rapide du statut global de votre système.

Pensez-y comme à une visite chez le médecin pour votre configuration Personas. Un rapide bilan peut détecter de petits problèmes avant qu'ils ne deviennent de gros problèmes.

### Ce qu'elle vérifie

- **Version de l'application** — si vous exécutez la dernière version
- **Intégrité de la base de données** — vos fichiers de données locaux sont intacts et sains
- **Statut des identifiants** — tous les identifiants stockés sont valides et fonctionnent
- **Connectivité des fournisseurs** — vos fournisseurs d'IA sont joignables et répondent
- **Connexion cloud** — votre connexion à l'orchestrateur est active (si configurée)

### Comment ça marche

Allez dans \`Paramètres > Santé du système\` et cliquez sur \`Exécuter la vérification de santé\`. Le scan prend quelques secondes et produit un rapport. Les éléments verts sont sains, les éléments jaunes nécessitent attention bientôt, et les éléments rouges nécessitent une correction immédiate. Chaque élément inclut une description du problème et une solution suggérée.

:::tip
Exécutez une vérification de santé après l'installation de mises à jour, après des problèmes de connectivité, ou avant de déployer un agent critique. Cela ne prend que quelques secondes et vous donne la tranquillité d'esprit.
:::
  `,

  "log-files-and-debugging": `
## Fichiers journaux et débogage

Les fichiers journaux sont comme une boîte noire pour votre installation Personas. Ils capturent tout ce qui s'est passé — exécutions d'agents, événements système, erreurs, et plus — dans un ordre chronologique détaillé. Quand quelque chose ne va pas et que le journal d'exécution ne suffit pas, ces fichiers contiennent l'histoire complète.

Vous n'avez pas besoin de lire les journaux régulièrement, mais savoir où ils sont et comment les utiliser est inestimable lors du dépannage d'un problème délicat.

### Points clés

- **Journalisation automatique** — tout est enregistré sans que vous activiez quoi que ce soit
- **Organisé par date** — les événements de chaque jour sont dans un fichier séparé pour une navigation facile
- **Consultable** — trouvez des événements spécifiques par mot-clé, date ou niveau de sévérité
- **Partageable** — si vous contactez le support, vous pouvez partager des extraits de journaux pertinents

### Comment ça marche

Les fichiers journaux sont stockés localement sur votre ordinateur. Accédez-y depuis \`Paramètres > Journaux\` ou naviguez directement vers le dossier des journaux. Chaque fichier couvre une journée et contient des entrées horodatées. Utilisez la visionneuse de journaux intégrée pour rechercher, filtrer et parcourir. Pour les demandes de support, le bouton \`Exporter le journal\` crée un extrait partageable.

:::tip
Lorsque vous contactez le support à propos d'un problème, incluez l'extrait de journal pertinent. Cela accélère considérablement le processus de dépannage car l'équipe de support peut voir exactement ce qui s'est passé.
:::
  `,

  "resetting-to-defaults": `
## Réinitialiser aux valeurs par défaut

Si vous avez changé un paramètre et n'arrivez pas à déterminer ce qui cause un problème, la réinitialisation aux valeurs par défaut vous donne un point de départ propre. Cela ne réinitialise que vos préférences et paramètres de configuration — vos agents, identifiants, mémoires et données sont tous préservés. Rien d'important n'est perdu.

Pensez-y comme à la restauration d'une pièce à sa disposition d'origine. Toutes vos affaires (agents et données) restent, mais les meubles (paramètres) reviennent à leur position de départ.

:::warning
La réinitialisation efface toutes les préférences personnalisées en une seule action. Cela inclut votre thème, modèle par défaut, paramètres de notification et raccourcis clavier. Vos agents, identifiants, mémoires et données ne sont pas affectés — mais toutes les préférences soigneusement réglées devront être reconfigurées manuellement après.
:::

### Ce qui est réinitialisé

- **Préférences d'affichage** — thème, mise en page, largeur de la barre latérale et paramètres visuels
- **Modèle par défaut** — revient à la valeur par défaut recommandée
- **Paramètres de notification** — réinitialisés au comportement de notification standard
- **Raccourcis clavier** — restaurés aux combinaisons de touches d'origine

### Ce qui reste en sécurité

- Tous vos **agents** et leurs prompts, historiques et configurations
- Tous vos **identifiants** dans le coffre
- Toutes vos **mémoires**, résultats de tests et journaux d'exécution
- Tous vos **pipelines** et configurations d'équipe

### Comment ça marche

Allez dans \`Paramètres > Avancé > Réinitialiser aux valeurs par défaut\`. Examinez ce qui sera réinitialisé, puis cliquez sur \`Confirmer\`. Vos paramètres reviennent à leurs valeurs d'usine pendant que tout votre travail est préservé. Vous pouvez ensuite reconfigurer les paramètres un par un pour identifier quel changement causait le problème.

:::tip
Avant de réinitialiser, notez tous les paramètres que vous avez personnalisés intentionnellement. De cette façon, vous pouvez rapidement restaurer ceux que vous voulez après que la réinitialisation ait résolu votre problème.
:::
  `,
};
