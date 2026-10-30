# QuizCulture — backend

Le guide racine [`README.md`](../README.md) décrit le lancement complet du site et les parcours utilisateur. Cette page donne les détails propres à l’API.

## Démarrage local

Prérequis : Java 17 ou supérieur, Node.js/npm et Docker Desktop.

Depuis `backendQuizz`, démarrez PostgreSQL puis Spring :

```powershell
docker compose up -d database
docker compose ps
.\mvnw.cmd spring-boot:run
```

Attendez que la base soit `healthy`. L'API écoute sur `http://localhost:8080`.

Dans un second terminal, démarrez Angular :

```powershell
cd ..\frontend
npm ci
npm start
```

Ouvrez l'URL indiquée par Angular (par défaut `http://localhost:4200`). Son proxy `/api` transmet les requêtes à Spring sur le port 8080. En production, le serveur qui héberge Angular doit aussi rediriger `/api` vers Spring.

Les valeurs locales par défaut sont définies dans Compose et `application.yaml`. Compose lit `.env` automatiquement ; Spring Boot lancé depuis le terminal ne le lit pas. Si vous modifiez les identifiants ou le port dans `.env`, exportez également `DATABASE_URL`, `DATABASE_USER` et `DATABASE_PASSWORD` dans le terminal backend avant de lancer l'API. N'utilisez pas les valeurs locales en production.

La base utilise un volume persistant. `schema.sql` crée les tables manquantes mais ne migre pas un ancien schéma. Sauvegardez et migrez les données avant de remplacer une base existante.

## API

Les routes de l'application sont sous `/api`: inscription, connexion, déconnexion, profil, thèmes/questions de quiz, résultats, répertoire des joueurs et classement, ainsi que contact. Le répertoire et les relations d’amitié nécessitent une session. Les anciens contrôleurs et modèles incompatibles avec le schéma actif ont été retirés.

Les thèmes et les fiches de révision sont initialisés depuis `src/main/resources/data.sql`, puis lus depuis PostgreSQL. Les questions ne renvoient jamais leur bonne réponse. `POST /api/quiz/grade` corrige une partie sans compte; `POST /api/quiz/results` corrige et enregistre la partie du compte authentifié. Le client transmet les choix par question et leur durée; le serveur vérifie les identifiants/choix, puis calcule le score, la série et la moyenne avant l'enregistrement. `GET /api/sheets` renvoie les fiches et leurs notions.

## Vérifications

```powershell
cd backendQuizz
.\mvnw.cmd test
cd ..\frontend
npm run build
```

Les tests backend utilisent H2 en mode PostgreSQL et ne nécessitent pas Docker.
