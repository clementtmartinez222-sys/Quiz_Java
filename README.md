# QuizCulture

QuizCulture est une application web de quiz et de révision. Elle comprend un frontend Angular, une API Spring Boot et une base PostgreSQL. Le dépôt permet de lancer chaque partie localement; seul PostgreSQL est démarré avec Docker Compose.

## Prérequis

- Docker Desktop démarré avec son moteur Linux;
- Java 17 ou supérieur;
- Node.js 24 et npm.

## Lancer le projet en local

### 1. Démarrer la base et l’API

Dans un premier terminal, depuis la racine du dépôt :

```powershell
cd backendQuizz
Copy-Item .env.example .env  # facultatif : les valeurs locales par défaut fonctionnent aussi
docker compose up -d database
docker compose ps            # attendre l’état healthy
.\mvnw.cmd spring-boot:run
```

L’API écoute sur `http://localhost:8080`. Le premier démarrage crée les tables et initialise les quiz et les fiches depuis `schema.sql` et `data.sql`.

### 2. Démarrer le frontend

Dans un second terminal, depuis la racine du dépôt :

```powershell
cd frontend
npm ci
npm start
```

Ouvrir `http://localhost:4200`. Le proxy Angular transmet automatiquement les requêtes `/api` à l’API locale.

Sous macOS ou Linux, remplacer `Copy-Item .env.example .env` par `cp .env.example .env` et `.\mvnw.cmd` par `./mvnw`.

### Configuration locale

Les valeurs de développement sont définies dans `backendQuizz/.env.example`, `docker-compose.yml` et `application.yaml`. Le fichier `.env` est ignoré par Git et Compose le lit automatiquement. Spring Boot, lancé séparément, ne lit pas ce fichier automatiquement : les valeurs par défaut correspondent donc aux valeurs locales de Compose. Si vous changez le port PostgreSQL `5433`, modifiez `DATABASE_HOST_PORT` et `DATABASE_URL` dans `.env`, puis exportez aussi les paramètres pour le terminal backend avant de lancer Spring :

```powershell
$env:DATABASE_URL = "jdbc:postgresql://localhost:5434/quizz_db"
$env:DATABASE_USER = "quiz_user"
$env:DATABASE_PASSWORD = "quiz_local_dev"
```

Sous macOS/Linux, utilisez `export DATABASE_URL=...`, `export DATABASE_USER=...` et `export DATABASE_PASSWORD=...` dans le terminal backend.

La base utilise un volume Docker persistant. `docker compose down` arrête les services sans supprimer les données. `docker compose down -v` supprime aussi le volume et toutes les données locales.

## Utiliser le site

### Créer un compte, se connecter et consulter son profil

1. Ouvrir **Profil** dans la barre de navigation.
2. Choisir **Créer un compte**, saisir un nom d’utilisateur et un mot de passe d’au moins huit caractères.
3. Après l’inscription, le compte est connecté automatiquement et la page d’accueil s’ouvre.
4. Pour un compte existant, choisir **Se connecter** depuis la page Profil.
5. Une fois connecté, Profil affiche les statistiques personnelles et les dernières parties. Le bouton **Se déconnecter** met fin à la session.

Les sessions expirent après 24 heures. L’authentification et les mots de passe sont gérés par l’API; les mots de passe sont stockés sous forme hachée.

### Jouer à un quiz

1. Ouvrir **Jeu**, choisir une catégorie et un thème.
2. Répondre aux questions dans le délai de dix secondes par question.
3. Une partie peut être jouée sans compte. Son résultat est alors calculé par l’API pour afficher la correction, mais il n’est pas ajouté au classement.
4. Si la personne est connectée, l’API calcule le score et l’enregistre dans son profil et le classement.

Les bonnes réponses ne sont pas envoyées au navigateur pendant la partie. La durée de réponse est transmise par le navigateur; elle sert à la statistique de temps moyen, tandis que le score et la série sont calculés par le serveur.

Le catalogue actif contient **18 quiz répartis dans 9 catégories**, avec deux quiz par catégorie. Les fiches et les quiz correspondants sont reliés : un bouton sur chaque fiche ouvre directement son quiz.

### Fiches de révision

La page **Fiches** charge les contenus depuis PostgreSQL. On peut rechercher par texte, filtrer par catégorie, lire les notions et lancer le quiz associé à la fiche.

### Amis

La page **Amis** nécessite une connexion. Elle affiche les autres comptes inscrits, permet de les rechercher et d’ajouter ou retirer une relation d’amitié. L’ajout et le retrait sont réciproques.

### Classement

La page **Classement** présente les comptes inscrits et leurs résultats enregistrés : moyenne des bonnes réponses, nombre de réponses correctes et nombre de parties. Le tableau peut être recherché et trié.

### Contact

Le formulaire **Contact** valide le nom, l’adresse e-mail et le message, puis enregistre le message dans PostgreSQL. Il ne déclenche pas l’envoi d’un e-mail.

## Vérifications et tests

Backend, depuis `backendQuizz` :

```powershell
.\mvnw.cmd test
```

Les tests backend utilisent H2 en mode PostgreSQL et ne nécessitent pas Docker.

Frontend, depuis `frontend` :

```powershell
npm test -- --watch=false
npm run build
```

Les workflows GitHub Actions exécutent les tests backend et les tests ainsi que le build frontend lorsqu’un changement concerne leur partie du dépôt.

## Organisation du dépôt

- `backendQuizz/src/main/java/.../api/` : contrôleurs HTTP et validation des requêtes;
- `backendQuizz/src/main/java/.../service/` : logique métier pour les amis et le classement;
- `backendQuizz/src/main/resources/schema.sql` : schéma PostgreSQL;
- `backendQuizz/src/main/resources/data.sql` : données initiales des quiz et fiches;
- `backendQuizz/src/test/` : tests d’intégration de l’API;
- `frontend/src/app/pages/` : pages Angular;
- `frontend/src/app/services/` : clients HTTP, authentification et état de session;
- `.github/workflows/` : workflows de vérification continue.

## Notes de déploiement

`npm run build` produit les fichiers statiques Angular dans `frontend/dist/frontend`. Pour un déploiement, l’hébergement doit servir ces fichiers et router `/api` vers le backend Spring Boot. Les identifiants de développement de Compose ne doivent pas être utilisés en production. `schema.sql` initialise le schéma et ajoute les évolutions prévues par le projet; ce n’est pas un outil général de migration pour une base de production existante.
