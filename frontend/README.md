# Quiz — frontend

Application Angular standalone pour jouer à des quiz, créer un compte, se connecter et envoyer un message de contact. Les questions de quiz sont actuellement des données locales de démonstration ; aucun backend réel n'est nécessaire pour parcourir le quiz.

## Prérequis et commandes

Installer les dépendances depuis ce dossier :

```bash
npm install
```

Démarrer le serveur de développement :

```bash
npm start
```

L'application est disponible sur `http://localhost:4200`.

Compiler l'application :

```bash
npm run build
npx ng build --configuration production
```

Exécuter les tests unitaires Vitest :

```bash
npm test -- --watch=false
```

Aucun outil ni script de test end-to-end n'est configuré pour le moment.

## Organisation

- `src/app/pages/` contient les pages et leurs tests.
- `src/app/services/` contient les accès aux données locales ou HTTP.
- `src/app/shared/` contient les helpers réutilisés, notamment les validateurs.
- `src/environments/` configure l'URL de base de l'API et l'activation de l'envoi des résultats.

Les pages sont chargées à la demande par le routeur. `QuizQuestionsService` sert les questions codées en dur et constitue le point d'entrée à remplacer ou adapter lorsque les questions seront fournies par l'API.

## API et intégration backend

Les services utilisent actuellement les routes `/login`, `/register`, `/contact` et `/quiz/results` sous l'URL de base. En développement, l'URL de base est `/api` et `proxy.conf.json` relaie les requêtes vers `http://localhost:8080`, en conservant le préfixe `/api`. Cela évite d'avoir à configurer CORS pour le serveur de développement Angular. Le backend doit être lancé sur ce port et exposer les routes sous `/api` ; ce préfixe est une hypothèse frontend à confirmer.

En production, l'URL de base est également `/api` : l'hébergement devra router ce chemin vers le backend. La durée maximale d'attente HTTP frontend est configurable dans les fichiers `src/environments/` et vaut actuellement 10 secondes.

Avant l'intégration, convenir avec l'équipe backend des chemins, méthodes, corps et réponses de succès, des statuts d'erreur, de l'authentification, des limites de champs et des délais de requête. Les tests HTTP du frontend vérifient les hypothèses actuelles et ne remplacent pas une validation contre le backend réel.

Les thèmes et questions de quiz restent locaux jusqu'à ce que les routes et formats de réponse soient définis. `QuizQuestionsService.getThemes()` alimente la sélection; la page regroupe ensuite la liste reçue par `category`, trie les catégories et répartit automatiquement les teintes sur tous les thèmes. Le contrat normalisé attendu pour un thème est `{ id, name, category }`. À l'intégration, il faudra remplacer la source locale dans le service par la route convenue et adapter le parseur si le format backend diffère. Le service valide aussi les questions avant de les transmettre au quiz.

L'envoi des résultats de quiz est désactivé dans les deux environnements. Les scores calculés dans le navigateur sont destinés à l'affichage et à la démonstration ; le backend ne doit pas les considérer comme une source fiable pour des classements ou récompenses.
