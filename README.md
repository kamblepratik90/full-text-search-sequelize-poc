# full-text-search-sequelize-poc

https://stackoverflow.com/a/67032034/925215

https://www.postgresql.org/docs/current/textsearch-controls.html

https://www.postgresql.org/docs/14/textsearch-tables.html

search

```
SELECT "id", "title", "content", "myVector" FROM "posts" AS "posts" WHERE "posts"."myVector" @@ plainto_tsquery('english', 'new year');
```

https://www.crunchydata.com/blog/postgres-full-text-search-a-search-engine-in-a-database

https://www.freecodecamp.org/news/fuzzy-string-matching-with-postgresql/
https://www.crunchydata.com/blog/fuzzy-name-matching-in-postgresql

////////////////////
useful ref queries:
SELECT \* FROM "posts_2" AS "posts" WHERE "posts"."myVector" @@ plainto_tsquery('english', 'friend');

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX gin_trgm_idx ON posts_2 USING gin ((title || ' ' || content) gin_trgm_ops);

CREATE INDEX post_search_idx ON posts_2 USING gin(("posts_2"."myVector") gin_trgm_ops);

CREATE INDEX pgweb_idx ON posts_2 USING GIN (to_tsvector('english', title || ' ' || content));

EXPLAIN ANALYZE SELECT
content, SIMILARITY(content,'year')
FROM posts_2
WHERE SIMILARITY(content,'year') > 0.0001 LIMIT 5;

SELECT count(\*)
FROM posts_2
WHERE soundex(content) = soundex('year');

SELECT \* FROM posts_2 WHERE soundex(content) = soundex('Year');

SELECT \* FROM posts_2 WHERE difference(posts_2.content, 'Year') > 2;

SELECT soundex('hello world!');
SELECT soundex('Anne'), soundex('Ann'), difference('Anne', 'Ann');

///////////////////////

pagination... - Done
nested search --- nft properties
