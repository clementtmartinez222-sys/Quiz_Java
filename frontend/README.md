# QuizCulture — frontend

Pour lancer l’application complète et comprendre les parcours d’inscription, de quiz, d’amis, de classement et de fiches, commencer par le [`README.md` racine](../README.md).

Application Angular standalone pour jouer à des quiz, créer un compte, se connecter et envoyer un message de contact. Les thèmes, questions, résultats de quiz et données du profil sont chargés ou enregistrés via l'API backend. Un backend démarré est nécessaire pour utiliser ces parcours ; les tests Angular simulent les réponses HTTP.

## Prérequis et commandes

Installer les dépendances depuis ce dossier :

```bash
npm ci
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

Les pages sont chargées à la demande par le routeur. `QuizQuestionsService` charge les thèmes et questions depuis l'API et valide leur structure avant de les transmettre au quiz.

## API et intégration backend

En développement, l'URL de base est `/api` et `proxy.conf.json` relaie les requêtes vers `http://localhost:8080`, en conservant le préfixe. Le backend expose les routes sous `/api` ; les contrats sont implémentés dans `backendQuizz`.

En production, l'URL de base est également `/api` : l'hébergement devra router ce chemin vers le backend. La durée maximale d'attente HTTP frontend est configurable dans les fichiers `src/environments/` et vaut actuellement 10 secondes.

Routes implémentées : `POST /login` et `POST /register`, `POST /logout`, `GET /profile`, `GET /quiz/themes`, `GET /quiz/themes/{themeId}/questions`, `POST /quiz/grade`, `POST /quiz/results`, `GET /sheets` et `POST /contact`. L'inscription et la connexion renvoient une session; le frontend connecte donc immédiatement le nouveau compte. Les routes profil, résultats et déconnexion requièrent un bearer token. Les mots de passe sont hachés côté serveur et les sessions expirent après 24 heures.

Le contrat des thèmes est `{ id, name, category }`; celui des questions est `{ id, questionText, options: [{ id, text }] }`, sans réponse correcte exposée. La correction reçoit `{ themeId, answers: [{ questionId, selectedOptionId, responseTimeSeconds }] }`; le serveur renvoie le score, la série maximale, la moyenne et les bonnes réponses. Les invités utilisent `/quiz/grade`; seuls les comptes connectés peuvent utiliser `/quiz/results` pour enregistrer la partie. `GET /sheets` fournit les notions ainsi que le `quizId` associé à chaque fiche.

Le navigateur transmet les réponses et la durée par question; le serveur calcule le score et la série, puis enregistre le résultat authentifié. La durée de réponse reste une mesure fournie par le navigateur.
