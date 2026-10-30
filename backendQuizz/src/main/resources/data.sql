INSERT INTO quiz (slug, title, category)
SELECT seed.slug, seed.title, seed.category
FROM (VALUES
    ('java', 'Java & Spring Boot', 'Développement'),
    ('angular', 'Angular & TypeScript', 'Développement'),
    ('general', 'Culture Générale Web', 'Web & culture numérique')
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
    ('general', 'Quel format est couramment utilisé pour échanger des données avec une API web ?')
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
) AS seed(slug, statement, option_key, answer_text, is_correct)
JOIN quiz q ON q.slug = seed.slug
JOIN question ON question.quiz_id = q.id AND question.statement = seed.statement
WHERE NOT EXISTS (
    SELECT 1 FROM answer existing
    WHERE existing.question_id = question.id AND existing.option_key = seed.option_key
);
