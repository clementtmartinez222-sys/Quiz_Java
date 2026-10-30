INSERT INTO quiz (slug, title, category)
SELECT seed.slug, seed.title, seed.category
FROM (VALUES
    ('java', 'Java & Spring Boot', 'Développement'),
    ('angular', 'Angular & TypeScript', 'Développement'),
    ('general', 'Culture Générale Web', 'Web & culture numérique'),
    ('histoire', 'Repères historiques', 'Histoire'),
    ('espace', 'À la découverte de l’espace', 'Sciences'),
    ('cinema', 'Cinéma et grands classiques', 'Culture')
) AS seed(slug, title, category)
WHERE NOT EXISTS (SELECT 1 FROM quiz existing WHERE existing.slug = seed.slug);

INSERT INTO question (quiz_id, statement)
SELECT q.id, seed.statement
FROM (VALUES
    ('java', 'Quel mot-clé Java permet de définir une classe ne pouvant pas être instanciée directement ?'),
    ('java', 'Quelle annotation Spring expose une méthode comme endpoint HTTP ?'),
    ('java', 'Quelle collection garantit l’unicité de ses éléments ?'),
    ('angular', 'Quelle propriété indique qu’un composant Angular est autonome ?'),
    ('angular', 'Quelle directive permet de parcourir une liste dans un template Angular récent ?'),
    ('angular', 'Quel type représente une valeur qui peut arriver au fil du temps en RxJS ?'),
    ('general', 'Quel protocole sécurise les échanges web avec TLS ?'),
    ('general', 'Quel code HTTP indique généralement une ressource introuvable ?'),
    ('general', 'Quel format est couramment utilisé pour échanger des données avec une API web ?'),
    ('histoire', 'En quelle année débute la Révolution française ?'),
    ('histoire', 'Quel mur tombe en 1989, symbole de la fin de la guerre froide ?'),
    ('histoire', 'Quelle civilisation a construit le Machu Picchu ?'),
    ('histoire', 'Qui fut le premier empereur romain ?'),
    ('espace', 'Quelle est la plus grande planète du système solaire ?'),
    ('espace', 'Quelle planète est surnommée la planète rouge ?'),
    ('espace', 'Comment s’appelle notre galaxie ?'),
    ('espace', 'Quel astre est au centre de notre système planétaire ?'),
    ('cinema', 'Qui a réalisé le film Titanic sorti en 1997 ?'),
    ('cinema', 'Quel acteur incarne Forrest Gump dans le film de 1994 ?'),
    ('cinema', 'Dans quelle saga trouve-t-on le personnage de Dark Vador ?'),
    ('cinema', 'Quel studio japonais a produit Mon voisin Totoro ?')
) AS seed(slug, statement)
JOIN quiz q ON q.slug = seed.slug
WHERE NOT EXISTS (
    SELECT 1 FROM question existing
    WHERE existing.quiz_id = q.id AND existing.statement = seed.statement
);

INSERT INTO answer (question_id, option_key, answer_text, is_correct)
SELECT question.id, seed.option_key, seed.answer_text, seed.is_correct
FROM (VALUES
    ('java', 'Quel mot-clé Java permet de définir une classe ne pouvant pas être instanciée directement ?', 'static', 'static', FALSE),
    ('java', 'Quel mot-clé Java permet de définir une classe ne pouvant pas être instanciée directement ?', 'abstract', 'abstract', TRUE),
    ('java', 'Quel mot-clé Java permet de définir une classe ne pouvant pas être instanciée directement ?', 'final', 'final', FALSE),
    ('java', 'Quel mot-clé Java permet de définir une classe ne pouvant pas être instanciée directement ?', 'private', 'private', FALSE),
    ('java', 'Quelle annotation Spring expose une méthode comme endpoint HTTP ?', 'autowired', '@Autowired', FALSE),
    ('java', 'Quelle annotation Spring expose une méthode comme endpoint HTTP ?', 'entity', '@Entity', FALSE),
    ('java', 'Quelle annotation Spring expose une méthode comme endpoint HTTP ?', 'request-mapping', '@RequestMapping', TRUE),
    ('java', 'Quelle annotation Spring expose une méthode comme endpoint HTTP ?', 'bean', '@Bean', FALSE),
    ('java', 'Quelle collection garantit l’unicité de ses éléments ?', 'list', 'List', FALSE),
    ('java', 'Quelle collection garantit l’unicité de ses éléments ?', 'set', 'Set', TRUE),
    ('java', 'Quelle collection garantit l’unicité de ses éléments ?', 'queue', 'Queue', FALSE),
    ('java', 'Quelle collection garantit l’unicité de ses éléments ?', 'array-list', 'ArrayList', FALSE),
    ('angular', 'Quelle propriété indique qu’un composant Angular est autonome ?', 'standalone-decorator', '@Standalone(true)', FALSE),
    ('angular', 'Quelle propriété indique qu’un composant Angular est autonome ?', 'standalone-component', 'standalone: true dans @Component', TRUE),
    ('angular', 'Quelle propriété indique qu’un composant Angular est autonome ?', 'injectable', '@Injectable(true)', FALSE),
    ('angular', 'Quelle propriété indique qu’un composant Angular est autonome ?', 'automatic', 'C’est automatique', FALSE),
    ('angular', 'Quelle directive permet de parcourir une liste dans un template Angular récent ?', 'for', '@for', TRUE),
    ('angular', 'Quelle directive permet de parcourir une liste dans un template Angular récent ?', 'each', '@each', FALSE),
    ('angular', 'Quelle directive permet de parcourir une liste dans un template Angular récent ?', 'ng-repeat', '*ng-repeat', FALSE),
    ('angular', 'Quelle directive permet de parcourir une liste dans un template Angular récent ?', 'loop', '@loop', FALSE),
    ('angular', 'Quel type représente une valeur qui peut arriver au fil du temps en RxJS ?', 'promise', 'Promise', FALSE),
    ('angular', 'Quel type représente une valeur qui peut arriver au fil du temps en RxJS ?', 'observable', 'Observable', TRUE),
    ('angular', 'Quel type représente une valeur qui peut arriver au fil du temps en RxJS ?', 'iterable', 'Iterable', FALSE),
    ('angular', 'Quel type représente une valeur qui peut arriver au fil du temps en RxJS ?', 'generator-function', 'GeneratorFunction', FALSE),
    ('general', 'Quel protocole sécurise les échanges web avec TLS ?', 'http', 'HTTP', FALSE),
    ('general', 'Quel protocole sécurise les échanges web avec TLS ?', 'https', 'HTTPS', TRUE),
    ('general', 'Quel protocole sécurise les échanges web avec TLS ?', 'ftp', 'FTP', FALSE),
    ('general', 'Quel protocole sécurise les échanges web avec TLS ?', 'smtp', 'SMTP', FALSE),
    ('general', 'Quel code HTTP indique généralement une ressource introuvable ?', '200', '200', FALSE),
    ('general', 'Quel code HTTP indique généralement une ressource introuvable ?', '301', '301', FALSE),
    ('general', 'Quel code HTTP indique généralement une ressource introuvable ?', '404', '404', TRUE),
    ('general', 'Quel code HTTP indique généralement une ressource introuvable ?', '500', '500', FALSE),
    ('general', 'Quel format est couramment utilisé pour échanger des données avec une API web ?', 'json', 'JSON', TRUE),
    ('general', 'Quel format est couramment utilisé pour échanger des données avec une API web ?', 'mp3', 'MP3', FALSE),
    ('general', 'Quel format est couramment utilisé pour échanger des données avec une API web ?', 'png', 'PNG', FALSE),
    ('general', 'Quel format est couramment utilisé pour échanger des données avec une API web ?', 'zip', 'ZIP', FALSE)
    ,('histoire', 'En quelle année débute la Révolution française ?', '1789', '1789', TRUE)
    ,('histoire', 'En quelle année débute la Révolution française ?', '1715', '1715', FALSE)
    ,('histoire', 'En quelle année débute la Révolution française ?', '1815', '1815', FALSE)
    ,('histoire', 'En quelle année débute la Révolution française ?', '1848', '1848', FALSE)
    ,('histoire', 'Quel mur tombe en 1989, symbole de la fin de la guerre froide ?', 'berlin', 'Le mur de Berlin', TRUE)
    ,('histoire', 'Quel mur tombe en 1989, symbole de la fin de la guerre froide ?', 'hadrian', 'Le mur d’Hadrien', FALSE)
    ,('histoire', 'Quel mur tombe en 1989, symbole de la fin de la guerre froide ?', 'great-wall', 'La Grande Muraille', FALSE)
    ,('histoire', 'Quel mur tombe en 1989, symbole de la fin de la guerre froide ?', 'wailing-wall', 'Le mur des Lamentations', FALSE)
    ,('histoire', 'Quelle civilisation a construit le Machu Picchu ?', 'inca', 'Les Incas', TRUE)
    ,('histoire', 'Quelle civilisation a construit le Machu Picchu ?', 'maya', 'Les Mayas', FALSE)
    ,('histoire', 'Quelle civilisation a construit le Machu Picchu ?', 'aztec', 'Les Aztèques', FALSE)
    ,('histoire', 'Quelle civilisation a construit le Machu Picchu ?', 'roman', 'Les Romains', FALSE)
    ,('histoire', 'Qui fut le premier empereur romain ?', 'augustus', 'Auguste', TRUE)
    ,('histoire', 'Qui fut le premier empereur romain ?', 'julius-caesar', 'Jules César', FALSE)
    ,('histoire', 'Qui fut le premier empereur romain ?', 'nero', 'Néron', FALSE)
    ,('histoire', 'Qui fut le premier empereur romain ?', 'constantine', 'Constantin', FALSE)
    ,('espace', 'Quelle est la plus grande planète du système solaire ?', 'jupiter', 'Jupiter', TRUE)
    ,('espace', 'Quelle est la plus grande planète du système solaire ?', 'saturn', 'Saturne', FALSE)
    ,('espace', 'Quelle est la plus grande planète du système solaire ?', 'neptune', 'Neptune', FALSE)
    ,('espace', 'Quelle est la plus grande planète du système solaire ?', 'earth', 'La Terre', FALSE)
    ,('espace', 'Quelle planète est surnommée la planète rouge ?', 'mars', 'Mars', TRUE)
    ,('espace', 'Quelle planète est surnommée la planète rouge ?', 'venus', 'Vénus', FALSE)
    ,('espace', 'Quelle planète est surnommée la planète rouge ?', 'mercury', 'Mercure', FALSE)
    ,('espace', 'Quelle planète est surnommée la planète rouge ?', 'uranus', 'Uranus', FALSE)
    ,('espace', 'Comment s’appelle notre galaxie ?', 'milky-way', 'La Voie lactée', TRUE)
    ,('espace', 'Comment s’appelle notre galaxie ?', 'andromeda', 'Andromède', FALSE)
    ,('espace', 'Comment s’appelle notre galaxie ?', 'whirlpool', 'La galaxie du Tourbillon', FALSE)
    ,('espace', 'Comment s’appelle notre galaxie ?', 'sombrero', 'La galaxie du Sombrero', FALSE)
    ,('espace', 'Quel astre est au centre de notre système planétaire ?', 'sun', 'Le Soleil', TRUE)
    ,('espace', 'Quel astre est au centre de notre système planétaire ?', 'earth', 'La Terre', FALSE)
    ,('espace', 'Quel astre est au centre de notre système planétaire ?', 'jupiter', 'Jupiter', FALSE)
    ,('espace', 'Quel astre est au centre de notre système planétaire ?', 'moon', 'La Lune', FALSE)
    ,('cinema', 'Qui a réalisé le film Titanic sorti en 1997 ?', 'cameron', 'James Cameron', TRUE)
    ,('cinema', 'Qui a réalisé le film Titanic sorti en 1997 ?', 'spielberg', 'Steven Spielberg', FALSE)
    ,('cinema', 'Qui a réalisé le film Titanic sorti en 1997 ?', 'scorsese', 'Martin Scorsese', FALSE)
    ,('cinema', 'Qui a réalisé le film Titanic sorti en 1997 ?', 'nolan', 'Christopher Nolan', FALSE)
    ,('cinema', 'Quel acteur incarne Forrest Gump dans le film de 1994 ?', 'hanks', 'Tom Hanks', TRUE)
    ,('cinema', 'Quel acteur incarne Forrest Gump dans le film de 1994 ?', 'robin-williams', 'Robin Williams', FALSE)
    ,('cinema', 'Quel acteur incarne Forrest Gump dans le film de 1994 ?', 'travolta', 'John Travolta', FALSE)
    ,('cinema', 'Quel acteur incarne Forrest Gump dans le film de 1994 ?', 'cruise', 'Tom Cruise', FALSE)
    ,('cinema', 'Dans quelle saga trouve-t-on le personnage de Dark Vador ?', 'star-wars', 'Star Wars', TRUE)
    ,('cinema', 'Dans quelle saga trouve-t-on le personnage de Dark Vador ?', 'star-trek', 'Star Trek', FALSE)
    ,('cinema', 'Dans quelle saga trouve-t-on le personnage de Dark Vador ?', 'dune', 'Dune', FALSE)
    ,('cinema', 'Dans quelle saga trouve-t-on le personnage de Dark Vador ?', 'terminator', 'Terminator', FALSE)
    ,('cinema', 'Quel studio japonais a produit Mon voisin Totoro ?', 'ghibli', 'Studio Ghibli', TRUE)
    ,('cinema', 'Quel studio japonais a produit Mon voisin Totoro ?', 'madhouse', 'Madhouse', FALSE)
    ,('cinema', 'Quel studio japonais a produit Mon voisin Totoro ?', 'bones', 'Bones', FALSE)
    ,('cinema', 'Quel studio japonais a produit Mon voisin Totoro ?', 'toei', 'Toei Animation', FALSE)
) AS seed(slug, statement, option_key, answer_text, is_correct)
JOIN quiz q ON q.slug = seed.slug
JOIN question ON question.quiz_id = q.id AND question.statement = seed.statement
WHERE NOT EXISTS (
    SELECT 1 FROM answer existing
    WHERE existing.question_id = question.id AND existing.option_key = seed.option_key
);

INSERT INTO revision_sheet (slug,title,description,category,reading_minutes,color)
SELECT seed.slug,seed.title,seed.description,seed.category,seed.minutes,seed.color FROM (VALUES
 ('java-bases','Les bases de Java','Variables, types, conditions et boucles : les notions essentielles pour écrire un premier programme.','Programmation',8,'violet'),
 ('java-poo','Programmation orientée objet','Comprends comment classes, objets, interfaces et composition structurent une application.','Programmation',12,'blue'),
 ('java-collections','Collections Java','Choisis entre List, Set et Map selon la manière dont tu dois organiser tes données.','Programmation',10,'orange'),
 ('histoire-periodes','Les grandes périodes historiques','Quelques repères pour situer les civilisations et les événements majeurs.','Histoire',7,'green'),
 ('capitales-europe','Capitales d’Europe','Mémorise quelques capitales européennes et les pays auxquels elles correspondent.','Géographie',6,'pink'),
 ('systeme-solaire','Le système solaire','Les planètes, leurs caractéristiques et les astres qui les entourent.','Sciences',6,'yellow')
) AS seed(slug,title,description,category,minutes,color)
WHERE NOT EXISTS (SELECT 1 FROM revision_sheet existing WHERE existing.slug=seed.slug);

INSERT INTO revision_notion (sheet_id,position,content)
SELECT sheet.id, seed.position, seed.content FROM (VALUES
 ('java-bases',1,'Une variable associe un nom à une valeur typée.'),('java-bases',2,'Les types primitifs incluent int, double, boolean et char.'),('java-bases',3,'if / else choisit un bloc selon une condition.'),('java-bases',4,'for et while répètent un bloc tant qu’une condition est vraie.'),('java-bases',5,'Une méthode regroupe une action réutilisable.'),
 ('java-poo',1,'Une classe décrit l’état et les comportements d’un type d’objet.'),('java-poo',2,'Un objet est une instance créée à partir d’une classe.'),('java-poo',3,'L’encapsulation protège l’état derrière des méthodes.'),('java-poo',4,'Une interface définit un contrat que plusieurs classes peuvent implémenter.'),('java-poo',5,'La composition construit un objet à partir d’autres objets.'),
 ('java-collections',1,'List conserve l’ordre et autorise les doublons.'),('java-collections',2,'Set garantit l’unicité des éléments.'),('java-collections',3,'Map associe une clé à une valeur.'),('java-collections',4,'ArrayList convient aux accès fréquents par index.'),
 ('histoire-periodes',1,'L’Antiquité précède le Moyen Âge.'),('histoire-periodes',2,'La Renaissance se développe en Europe à partir du XVe siècle.'),('histoire-periodes',3,'La Révolution française débute en 1789.'),('histoire-periodes',4,'La chute du mur de Berlin en 1989 marque un tournant de la guerre froide.'),
 ('capitales-europe',1,'La capitale de l’Espagne est Madrid.'),('capitales-europe',2,'La capitale de l’Italie est Rome.'),('capitales-europe',3,'La capitale du Portugal est Lisbonne.'),('capitales-europe',4,'La capitale de la Pologne est Varsovie.'),('capitales-europe',5,'La capitale de la Suède est Stockholm.'),
 ('systeme-solaire',1,'Le Soleil est l’étoile au centre du système solaire.'),('systeme-solaire',2,'Jupiter est la plus grande planète.'),('systeme-solaire',3,'Mars est surnommée la planète rouge.'),('systeme-solaire',4,'La Terre est la seule planète connue où la vie existe.'),('systeme-solaire',5,'La Lune est le satellite naturel de la Terre.')
) AS seed(slug,position,content) JOIN revision_sheet sheet ON sheet.slug=seed.slug
WHERE NOT EXISTS (SELECT 1 FROM revision_notion existing WHERE existing.sheet_id=sheet.id AND existing.position=seed.position);

-- Additional quiz themes are paired with the revision sheets sharing their quiz_slug.
INSERT INTO quiz (slug,title,category)
SELECT seed.slug,seed.title,seed.category FROM (VALUES
 ('java-fondamentaux','Les fondamentaux de Java','Programmation'),
 ('java-poo','Programmation orientée objet','Programmation'),
 ('java-collections','Collections Java','Programmation'),
 ('geographie','Capitales et géographie européenne','Géographie')
) AS seed(slug,title,category)
WHERE NOT EXISTS (SELECT 1 FROM quiz current WHERE current.slug=seed.slug);

INSERT INTO revision_sheet (slug,title,description,category,reading_minutes,color,quiz_slug)
SELECT seed.slug,seed.title,seed.description,seed.category,seed.minutes,seed.color,seed.quiz_slug FROM (VALUES
 ('java-spring','Java & Spring Boot','Repères sur le langage Java et la création d’API avec Spring Boot.','Programmation',9,'violet','java'),
 ('angular-typescript','Angular et TypeScript','Composants, templates et programmation réactive pour créer des interfaces web.','Programmation',10,'blue','angular'),
 ('culture-numerique','Culture générale du web','Les protocoles, formats et notions qui font fonctionner le web.','Culture numérique',7,'orange','general'),
 ('cinema-classics','Cinéma et grands classiques','Quelques repères sur les films, les réalisateurs et les studios incontournables.','Culture',7,'pink','cinema')
) AS seed(slug,title,description,category,minutes,color,quiz_slug)
WHERE NOT EXISTS (SELECT 1 FROM revision_sheet current WHERE current.slug=seed.slug);

UPDATE revision_sheet SET quiz_slug='java-fondamentaux' WHERE slug='java-bases' AND quiz_slug IS NULL;
UPDATE revision_sheet SET quiz_slug='java-poo' WHERE slug='java-poo' AND quiz_slug IS NULL;
UPDATE revision_sheet SET quiz_slug='java-collections' WHERE slug='java-collections' AND quiz_slug IS NULL;
UPDATE revision_sheet SET quiz_slug='histoire' WHERE slug='histoire-periodes' AND quiz_slug IS NULL;
UPDATE revision_sheet SET quiz_slug='geographie' WHERE slug='capitales-europe' AND quiz_slug IS NULL;
UPDATE revision_sheet SET quiz_slug='espace' WHERE slug='systeme-solaire' AND quiz_slug IS NULL;

INSERT INTO revision_notion (sheet_id,position,content)
SELECT sheet.id,seed.position,seed.content FROM (VALUES
 ('java-spring',1,'Java est un langage à typage statique exécuté sur la JVM.'),('java-spring',2,'Une classe regroupe des données et des comportements.'),('java-spring',3,'Spring Boot simplifie la configuration d’applications Spring.'),('java-spring',4,'Une API REST expose des ressources au moyen de routes HTTP.'),
 ('angular-typescript',1,'TypeScript ajoute des types statiques à JavaScript.'),('angular-typescript',2,'Un composant associe une classe, un template et des styles.'),('angular-typescript',3,'Les directives structurelles contrôlent l’affichage des listes et conditions.'),('angular-typescript',4,'RxJS Observable représente un flux de valeurs asynchrones.'),
 ('culture-numerique',1,'HTTPS protège les échanges web avec le chiffrement TLS.'),('culture-numerique',2,'JSON est un format courant d’échange entre une API et son client.'),('culture-numerique',3,'Le code HTTP 404 signale une ressource introuvable.'),('culture-numerique',4,'Un navigateur envoie des requêtes HTTP aux serveurs web.'),
 ('cinema-classics',1,'James Cameron a réalisé Titanic, sorti en 1997.'),('cinema-classics',2,'Tom Hanks incarne Forrest Gump dans le film de 1994.'),('cinema-classics',3,'Dark Vador est un personnage de la saga Star Wars.'),('cinema-classics',4,'Mon voisin Totoro est un film du Studio Ghibli.')
) AS seed(slug,position,content) JOIN revision_sheet sheet ON sheet.slug=seed.slug
WHERE NOT EXISTS (SELECT 1 FROM revision_notion current WHERE current.sheet_id=sheet.id AND current.position=seed.position);

INSERT INTO question (quiz_id,statement)
SELECT quiz.id,seed.statement FROM (VALUES
 ('java-fondamentaux','Quel type primitif représente une valeur vraie ou fausse ?'),('java-fondamentaux','Quel mot-clé déclare une constante en Java ?'),('java-fondamentaux','À partir de quel index commence un tableau Java ?'),
 ('java-poo','Quel mot-clé déclare une classe en Java ?'),('java-poo','Comment appelle-t-on une instance créée à partir d’une classe ?'),('java-poo','Quel principe protège l’état interne d’un objet ?'),
 ('java-collections','Quelle interface conserve l’ordre et autorise les doublons ?'),('java-collections','Quelle collection garantit l’unicité des éléments ?'),('java-collections','Quelle structure associe des clés à des valeurs ?'),
 ('geographie','Quelle est la capitale de l’Espagne ?'),('geographie','Quelle est la capitale du Portugal ?'),('geographie','Quelle est la capitale de la Pologne ?')
) AS seed(slug,statement) JOIN quiz ON quiz.slug=seed.slug
WHERE NOT EXISTS (SELECT 1 FROM question current WHERE current.quiz_id=quiz.id AND current.statement=seed.statement);

INSERT INTO answer (question_id,option_key,answer_text,is_correct)
SELECT question.id,seed.option_key,seed.answer_text,seed.is_correct FROM (VALUES
 ('java-fondamentaux','Quel type primitif représente une valeur vraie ou fausse ?','boolean','boolean',TRUE),('java-fondamentaux','Quel type primitif représente une valeur vraie ou fausse ?','int','int',FALSE),('java-fondamentaux','Quel type primitif représente une valeur vraie ou fausse ?','char','char',FALSE),('java-fondamentaux','Quel type primitif représente une valeur vraie ou fausse ?','double','double',FALSE),
 ('java-fondamentaux','Quel mot-clé déclare une constante en Java ?','final','final',TRUE),('java-fondamentaux','Quel mot-clé déclare une constante en Java ?','static','static',FALSE),('java-fondamentaux','Quel mot-clé déclare une constante en Java ?','fixed','fixed',FALSE),('java-fondamentaux','Quel mot-clé déclare une constante en Java ?','const','const',FALSE),
 ('java-fondamentaux','À partir de quel index commence un tableau Java ?','zero','0',TRUE),('java-fondamentaux','À partir de quel index commence un tableau Java ?','one','1',FALSE),('java-fondamentaux','À partir de quel index commence un tableau Java ?','minus-one','-1',FALSE),('java-fondamentaux','À partir de quel index commence un tableau Java ?','depends','Cela dépend du type',FALSE),
 ('java-poo','Quel mot-clé déclare une classe en Java ?','class','class',TRUE),('java-poo','Quel mot-clé déclare une classe en Java ?','object','object',FALSE),('java-poo','Quel mot-clé déclare une classe en Java ?','struct','struct',FALSE),('java-poo','Quel mot-clé déclare une classe en Java ?','type','type',FALSE),
 ('java-poo','Comment appelle-t-on une instance créée à partir d’une classe ?','object','Un objet',TRUE),('java-poo','Comment appelle-t-on une instance créée à partir d’une classe ?','package','Un package',FALSE),('java-poo','Comment appelle-t-on une instance créée à partir d’une classe ?','method','Une méthode',FALSE),('java-poo','Comment appelle-t-on une instance créée à partir d’une classe ?','module','Un module',FALSE),
 ('java-poo','Quel principe protège l’état interne d’un objet ?','encapsulation','L’encapsulation',TRUE),('java-poo','Quel principe protège l’état interne d’un objet ?','iteration','L’itération',FALSE),('java-poo','Quel principe protège l’état interne d’un objet ?','compilation','La compilation',FALSE),('java-poo','Quel principe protège l’état interne d’un objet ?','serialization','La sérialisation',FALSE),
 ('java-collections','Quelle interface conserve l’ordre et autorise les doublons ?','list','List',TRUE),('java-collections','Quelle interface conserve l’ordre et autorise les doublons ?','set','Set',FALSE),('java-collections','Quelle interface conserve l’ordre et autorise les doublons ?','map','Map',FALSE),('java-collections','Quelle interface conserve l’ordre et autorise les doublons ?','queue-only','Queue',FALSE),
 ('java-collections','Quelle collection garantit l’unicité des éléments ?','set','Set',TRUE),('java-collections','Quelle collection garantit l’unicité des éléments ?','list','List',FALSE),('java-collections','Quelle collection garantit l’unicité des éléments ?','array','Array',FALSE),('java-collections','Quelle collection garantit l’unicité des éléments ?','map','Map',FALSE),
 ('java-collections','Quelle structure associe des clés à des valeurs ?','map','Map',TRUE),('java-collections','Quelle structure associe des clés à des valeurs ?','list','List',FALSE),('java-collections','Quelle structure associe des clés à des valeurs ?','set','Set',FALSE),('java-collections','Quelle structure associe des clés à des valeurs ?','stack','Stack',FALSE),
 ('geographie','Quelle est la capitale de l’Espagne ?','madrid','Madrid',TRUE),('geographie','Quelle est la capitale de l’Espagne ?','barcelona','Barcelone',FALSE),('geographie','Quelle est la capitale de l’Espagne ?','seville','Séville',FALSE),('geographie','Quelle est la capitale de l’Espagne ?','valencia','Valence',FALSE),
 ('geographie','Quelle est la capitale du Portugal ?','lisbon','Lisbonne',TRUE),('geographie','Quelle est la capitale du Portugal ?','porto','Porto',FALSE),('geographie','Quelle est la capitale du Portugal ?','braga','Braga',FALSE),('geographie','Quelle est la capitale du Portugal ?','faro','Faro',FALSE),
 ('geographie','Quelle est la capitale de la Pologne ?','warsaw','Varsovie',TRUE),('geographie','Quelle est la capitale de la Pologne ?','krakow','Cracovie',FALSE),('geographie','Quelle est la capitale de la Pologne ?','gdansk','Gdansk',FALSE),('geographie','Quelle est la capitale de la Pologne ?','wroclaw','Wroclaw',FALSE)
) AS seed(slug,statement,option_key,answer_text,is_correct)
JOIN quiz ON quiz.slug=seed.slug
JOIN question ON question.quiz_id=quiz.id AND question.statement=seed.statement
WHERE NOT EXISTS (SELECT 1 FROM answer current WHERE current.question_id=question.id AND current.option_key=seed.option_key);

-- Keep two active development themes and distribute the catalogue evenly by category.
UPDATE quiz SET category='Programmation' WHERE slug IN ('java','angular');
UPDATE revision_sheet SET category='Programmation' WHERE quiz_slug IN ('java','angular');
UPDATE quiz SET is_active=false WHERE slug IN ('java-fondamentaux','java-poo','java-collections');
UPDATE revision_sheet SET is_active=false WHERE quiz_slug IN ('java-fondamentaux','java-poo','java-collections');
UPDATE revision_sheet SET category='Web & culture numérique' WHERE quiz_slug='general';
UPDATE revision_sheet SET category='Géographie' WHERE quiz_slug='geographie';

INSERT INTO quiz (slug,title,category)
SELECT seed.slug,seed.title,seed.category FROM (VALUES
 ('cybersecurite','Les bons réflexes numériques','Web & culture numérique'),
 ('civilisations','Civilisations antiques','Histoire'),
 ('biodiversite','Le vivant et la biodiversité','Sciences'),
 ('litterature','Littérature et grands auteurs','Culture'),
 ('monuments-europe','Monuments européens','Géographie'),
 ('musique-instruments','Instruments et familles musicales','Musique'),
 ('musique-culture','Culture musicale','Musique'),
 ('jeux-video-histoire','Histoire du jeu vidéo','Jeux vidéo'),
 ('jeux-video-culture','Culture et création vidéoludiques','Jeux vidéo'),
 ('sport-disciplines','Règles et disciplines sportives','Sport'),
 ('sport-evenements','Grands événements sportifs','Sport')
) AS seed(slug,title,category)
WHERE NOT EXISTS (SELECT 1 FROM quiz current WHERE current.slug=seed.slug);

INSERT INTO revision_sheet (slug,title,description,category,reading_minutes,color,quiz_slug)
SELECT seed.slug,seed.title,seed.description,seed.category,seed.minutes,seed.color,seed.quiz_slug FROM (VALUES
 ('cybersecurite','Les bons réflexes numériques','Reconnaître les pièges courants et protéger ses comptes au quotidien.','Web & culture numérique',7,'blue','cybersecurite'),
 ('civilisations-antiques','Civilisations antiques','Quelques repères sur les sociétés grecque, romaine et égyptienne.','Histoire',8,'orange','civilisations'),
 ('biodiversite','Le vivant et la biodiversité','Les bases pour comprendre les organismes et leurs écosystèmes.','Sciences',8,'green','biodiversite'),
 ('litterature','Littérature et grands auteurs','Des œuvres et des auteurs qui ont marqué la littérature.','Culture',7,'pink','litterature'),
 ('monuments-europe','Monuments européens','Repère quelques monuments emblématiques et les villes qui les abritent.','Géographie',6,'yellow','monuments-europe'),
 ('musique-instruments','Instruments et familles musicales','Cordes, vents et percussions : reconnais les grandes familles d’instruments.','Musique',7,'violet','musique-instruments'),
 ('musique-culture','Les repères de la musique','Rythme, tempo et orchestre : découvre quelques notions musicales essentielles.','Musique',7,'blue','musique-culture'),
 ('jeux-video-histoire','Les grandes étapes du jeu vidéo','De l’arcade aux mondes ouverts, retrouve quelques jalons de cette histoire.','Jeux vidéo',8,'orange','jeux-video-histoire'),
 ('jeux-video-culture','Créer un jeu vidéo','Boucle de jeu, moteur et tutoriel : découvre les bases de la création vidéoludique.','Jeux vidéo',7,'green','jeux-video-culture'),
 ('sport-disciplines','Les règles de quelques sports','Quelques chiffres et règles pour mieux comprendre les disciplines populaires.','Sport',7,'pink','sport-disciplines'),
 ('sport-evenements','Les grands rendez-vous sportifs','Les compétitions internationales et leur calendrier.','Sport',7,'yellow','sport-evenements')
) AS seed(slug,title,description,category,minutes,color,quiz_slug)
WHERE NOT EXISTS (SELECT 1 FROM revision_sheet current WHERE current.slug=seed.slug);

INSERT INTO revision_notion (sheet_id,position,content)
SELECT sheet.id,seed.position,seed.content FROM (VALUES
 ('cybersecurite',1,'Un message de phishing imite un organisme pour voler des informations.'),('cybersecurite',2,'L’authentification à deux facteurs ajoute une vérification au mot de passe.'),('cybersecurite',3,'Un gestionnaire aide à créer et conserver des mots de passe uniques.'),
 ('civilisations-antiques',1,'La démocratie athénienne se développe dans la Grèce antique.'),('civilisations-antiques',2,'Le latin est la langue de la Rome antique.'),('civilisations-antiques',3,'Les pyramides de Gizeh ont été bâties dans l’Égypte antique.'),
 ('biodiversite',1,'La photosynthèse permet aux plantes d’utiliser l’énergie lumineuse.'),('biodiversite',2,'L’ADN porte une grande partie de l’information héréditaire.'),('biodiversite',3,'Un écosystème réunit des êtres vivants et leur milieu.'),
 ('litterature',1,'Victor Hugo a écrit Les Misérables.'),('litterature',2,'Le Petit Prince est une œuvre d’Antoine de Saint-Exupéry.'),('litterature',3,'Hamlet est une tragédie de William Shakespeare.'),
 ('monuments-europe',1,'La tour Eiffel est un monument emblématique de Paris.'),('monuments-europe',2,'Le Colisée se trouve à Rome.'),('monuments-europe',3,'L’Acropole domine le centre historique d’Athènes.'),
 ('musique-instruments',1,'Le violon appartient à la famille des instruments à cordes.'),('musique-instruments',2,'La batterie et le tambour sont des instruments à percussion.'),('musique-instruments',3,'La trompette est un instrument de la famille des cuivres.'),
 ('musique-culture',1,'Une octave correspond à un intervalle de douze demi-tons dans le tempérament courant.'),('musique-culture',2,'Le tempo indique la vitesse de la pulsation musicale.'),('musique-culture',3,'Le chef d’orchestre coordonne l’interprétation de l’ensemble.'),
 ('jeux-video-histoire',1,'Pong est un jeu d’arcade publié par Atari en 1972.'),('jeux-video-histoire',2,'Mario est l’un des personnages emblématiques de Nintendo.'),('jeux-video-histoire',3,'Minecraft a d’abord été développé par le studio Mojang.'),
 ('jeux-video-culture',1,'La boucle de jeu décrit les actions principales répétées par le joueur.'),('jeux-video-culture',2,'Un moteur de jeu fournit des outils communs pour créer un jeu.'),('jeux-video-culture',3,'Un tutoriel apprend progressivement les commandes et les règles.'),
 ('sport-disciplines',1,'Une équipe de football aligne onze joueurs sur le terrain.'),('sport-disciplines',2,'Une équipe de basketball compte cinq joueurs sur le terrain.'),('sport-disciplines',3,'Au tennis, le score nul se dit « love » en anglais.'),
 ('sport-evenements',1,'Les Jeux olympiques d’été ont lieu tous les quatre ans.'),('sport-evenements',2,'Le Tour de France est une course cycliste par étapes.'),('sport-evenements',3,'La Coupe du monde de rugby se tient généralement tous les quatre ans.')
) AS seed(slug,position,content) JOIN revision_sheet sheet ON sheet.slug=seed.slug
WHERE NOT EXISTS (SELECT 1 FROM revision_notion current WHERE current.sheet_id=sheet.id AND current.position=seed.position);

INSERT INTO question (quiz_id,statement)
SELECT quiz.id,seed.statement FROM (VALUES
 ('cybersecurite','Comment appelle-t-on un message frauduleux qui cherche à voler des identifiants ?'),('cybersecurite','À quoi sert l’authentification à deux facteurs ?'),('cybersecurite','Quelle pratique renforce la sécurité des mots de passe ?'),
 ('civilisations','Dans quelle cité grecque la démocratie antique est-elle née ?'),('civilisations','Quelle langue était parlée dans la Rome antique ?'),('civilisations','Dans quel pays se trouvent les pyramides de Gizeh ?'),
 ('biodiversite','Quel processus permet aux plantes d’utiliser la lumière pour produire leur matière ?'),('biodiversite','Quelle molécule porte une grande partie de l’information héréditaire ?'),('biodiversite','Que réunit un écosystème ?'),
 ('litterature','Qui a écrit Les Misérables ?'),('litterature','Qui est l’auteur du Petit Prince ?'),('litterature','Qui a écrit la pièce Hamlet ?'),
 ('monuments-europe','Dans quelle ville se trouve la tour Eiffel ?'),('monuments-europe','Dans quelle ville peut-on visiter le Colisée ?'),('monuments-europe','Dans quelle ville se trouve l’Acropole ?'),
 ('musique-instruments','À quelle famille appartient le violon ?'),('musique-instruments','Le tambour appartient à quelle famille ?'),('musique-instruments','À quelle famille appartient la trompette ?'),
 ('musique-culture','Combien de demi-tons compte une octave dans le tempérament courant ?'),('musique-culture','Que décrit le tempo ?'),('musique-culture','Quel est le rôle principal du chef d’orchestre ?'),
 ('jeux-video-histoire','Quel studio a publié Pong en 1972 ?'),('jeux-video-histoire','À quelle entreprise associe-t-on le personnage de Mario ?'),('jeux-video-histoire','Quel studio a créé Minecraft à ses débuts ?'),
 ('jeux-video-culture','Que désigne la boucle de jeu ?'),('jeux-video-culture','À quoi sert un moteur de jeu ?'),('jeux-video-culture','Quel est le rôle d’un tutoriel dans un jeu ?'),
 ('sport-disciplines','Combien de joueurs de football une équipe aligne-t-elle sur le terrain ?'),('sport-disciplines','Combien de joueurs de basketball une équipe aligne-t-elle sur le terrain ?'),('sport-disciplines','Comment dit-on « zéro » au tennis en anglais ?'),
 ('sport-evenements','À quelle fréquence ont lieu les Jeux olympiques d’été ?'),('sport-evenements','Dans quelle discipline se dispute le Tour de France ?'),('sport-evenements','À quelle fréquence a lieu la Coupe du monde de rugby ?')
) AS seed(slug,statement) JOIN quiz ON quiz.slug=seed.slug
WHERE NOT EXISTS (SELECT 1 FROM question current WHERE current.quiz_id=quiz.id AND current.statement=seed.statement);

INSERT INTO answer (question_id,option_key,answer_text,is_correct)
SELECT question.id,choices.option_key,
       CASE choices.option_key WHEN 'a' THEN seed.correct_text WHEN 'b' THEN seed.wrong_one WHEN 'c' THEN seed.wrong_two END,
       choices.option_key='a'
FROM (VALUES
 ('cybersecurite','Comment appelle-t-on un message frauduleux qui cherche à voler des identifiants ?','Phishing','Spam publicitaire','Mise à jour logicielle'),('cybersecurite','À quoi sert l’authentification à deux facteurs ?','Ajouter une seconde vérification','Remplacer le nom de compte','Accélérer la connexion'),('cybersecurite','Quelle pratique renforce la sécurité des mots de passe ?','Utiliser un mot de passe unique par compte','Réutiliser le même mot de passe','Le partager avec ses proches'),
 ('civilisations','Dans quelle cité grecque la démocratie antique est-elle née ?','Athènes','Sparte','Corinthe'),('civilisations','Quelle langue était parlée dans la Rome antique ?','Le latin','Le grec ancien','Le phénicien'),('civilisations','Dans quel pays se trouvent les pyramides de Gizeh ?','Égypte','Grèce','Italie'),
 ('biodiversite','Quel processus permet aux plantes d’utiliser la lumière pour produire leur matière ?','La photosynthèse','La fermentation','La digestion'),('biodiversite','Quelle molécule porte une grande partie de l’information héréditaire ?','ADN','Amidon','Oxygène'),('biodiversite','Que réunit un écosystème ?','Des êtres vivants et leur milieu','Des roches uniquement','Des animaux d’une seule espèce'),
 ('litterature','Qui a écrit Les Misérables ?','Victor Hugo','Émile Zola','Molière'),('litterature','Qui est l’auteur du Petit Prince ?','Antoine de Saint-Exupéry','Jules Verne','Albert Camus'),('litterature','Qui a écrit la pièce Hamlet ?','William Shakespeare','Charles Dickens','Oscar Wilde'),
 ('monuments-europe','Dans quelle ville se trouve la tour Eiffel ?','Paris','Bruxelles','Lyon'),('monuments-europe','Dans quelle ville peut-on visiter le Colisée ?','Rome','Athènes','Madrid'),('monuments-europe','Dans quelle ville se trouve l’Acropole ?','Athènes','Lisbonne','Vienne'),
 ('musique-instruments','À quelle famille appartient le violon ?','Les cordes','Les cuivres','Les percussions'),('musique-instruments','Le tambour appartient à quelle famille ?','Les percussions','Les bois','Les cordes'),('musique-instruments','À quelle famille appartient la trompette ?','Les cuivres','Les cordes','Les claviers'),
 ('musique-culture','Combien de demi-tons compte une octave dans le tempérament courant ?','Douze','Huit','Dix'),('musique-culture','Que décrit le tempo ?','La vitesse de la pulsation','Le volume maximal','Le nombre de musiciens'),('musique-culture','Quel est le rôle principal du chef d’orchestre ?','Coordonner les musiciens','Écrire toutes les partitions','Accorder le public'),
 ('jeux-video-histoire','Quel studio a publié Pong en 1972 ?','Atari','Nintendo','Sega'),('jeux-video-histoire','À quelle entreprise associe-t-on le personnage de Mario ?','Nintendo','Atari','Sony'),('jeux-video-histoire','Quel studio a créé Minecraft à ses débuts ?','Mojang','Valve','Ubisoft'),
 ('jeux-video-culture','Que désigne la boucle de jeu ?','Les actions principales répétées par le joueur','Le générique de fin','Le câble de la manette'),('jeux-video-culture','À quoi sert un moteur de jeu ?','Fournir des outils pour créer un jeu','Vendre des consoles','Compresser les sauvegardes uniquement'),('jeux-video-culture','Quel est le rôle d’un tutoriel dans un jeu ?','Présenter progressivement les règles et commandes','Remplacer les niveaux','Afficher le classement mondial'),
 ('sport-disciplines','Combien de joueurs de football une équipe aligne-t-elle sur le terrain ?','Onze','Cinq','Sept'),('sport-disciplines','Combien de joueurs de basketball une équipe aligne-t-elle sur le terrain ?','Cinq','Onze','Dix'),('sport-disciplines','Comment dit-on « zéro » au tennis en anglais ?','Love','Nil','Blank'),
 ('sport-evenements','À quelle fréquence ont lieu les Jeux olympiques d’été ?','Tous les quatre ans','Tous les ans','Tous les deux ans'),('sport-evenements','Dans quelle discipline se dispute le Tour de France ?','Cyclisme','Athlétisme','Voile'),('sport-evenements','À quelle fréquence a lieu la Coupe du monde de rugby ?','Généralement tous les quatre ans','Tous les ans','Tous les deux ans')
) AS seed(slug,statement,correct_text,wrong_one,wrong_two)
JOIN quiz ON quiz.slug=seed.slug
JOIN question ON question.quiz_id=quiz.id AND question.statement=seed.statement
CROSS JOIN (VALUES ('a'),('b'),('c')) AS choices(option_key)
WHERE NOT EXISTS (SELECT 1 FROM answer current WHERE current.question_id=question.id AND current.option_key=choices.option_key);
