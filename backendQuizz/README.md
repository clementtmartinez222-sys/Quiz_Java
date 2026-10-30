# Backend Quiz

## Démarrage local

Prérequis : Java 17 ou supérieur et Docker Desktop.

Depuis `backendQuizz`, démarrez PostgreSQL puis l'application Spring :

```powershell
docker compose up -d database
.\mvnw.cmd spring-boot:run
```

Le serveur écoute sur `http://localhost:8080`. Au démarrage, `schema.sql` crée les tables et `data.sql` insère les thèmes/questions de démonstration. La base utilise un volume Docker persistant. Les valeurs par défaut de Compose et Spring sont alignées. Pour personnaliser Compose, copiez `.env.example` en `.env`; pour personnaliser aussi l'application Spring lancée dans le terminal, définissez `DATABASE_USER`, `DATABASE_PASSWORD` et `DATABASE_URL` dans son environnement.

Les identifiants par défaut du Compose sont réservés au développement local. En production, configurez des secrets distincts, HTTPS et une URL de base de données non locale.

## Contrat HTTP

Toutes les routes sont préfixées par `/api`.

| Méthode et route | Accès | Corps / réponse |
|---|---|---|
| `POST /register` | Public | `{ username, password }`, réponse `201`; nom unique, mot de passe de 8 à 72 caractères (72 octets UTF-8 maximum) |
| `POST /login` | Public | `{ username, password }` → `{ token }`; session bearer valide 24 h |
| `POST /logout` | Bearer | Révoque la session courante, réponse `204` |
| `GET /profile` | Bearer | Nom, date d'inscription, statistiques et cinq résultats récents |
| `GET /quiz/themes` | Public | Tableau `{ id, name, category }` |
| `GET /quiz/themes/{themeId}/questions` | Public | Tableau de questions avec options et identifiant de la réponse correcte |
| `POST /quiz/results` | Bearer | `themeId`, score, meilleure série, temps moyen et nombre de questions; réponse `204` |
| `POST /contact` | Public | `{ name, email, message }`, réponse texte |

Les résultats sont calculés par le navigateur et restent modifiables par un client. Ils ne sont donc pas une preuve suffisante pour attribuer des récompenses ou établir un classement fiable. Les pages Amis, Classement et Fiches ne disposent pas encore de contrat API ni de fonctionnalité backend.

## Tests

```powershell
.\mvnw.cmd test
```

Les tests d'intégration utilisent H2 en mode PostgreSQL et couvrent les routes sans nécessiter Docker.
