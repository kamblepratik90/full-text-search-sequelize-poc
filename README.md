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

CREATE INDEX gin_trgm_idx ON posts_2 USING gin ((title || ' ' || content || ' ' || tags || ' ' || properties) gin_trgm_ops);

CREATE INDEX post_search_idx ON posts_2 USING gin(("posts_2"."myVector") gin_trgm_ops);

CREATE INDEX pgweb_idx ON posts_2 USING GIN (to_tsvector('english', title || ' ' || content));

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch
CREATE INDEX names_surname_txt ON names (surname text_pattern_ops);

EXPLAIN ANALYZE

SELECT content, strict_word_similarity(content,'nea')
FROM posts_2
WHERE strict_word_similarity(content, 'nea') > 0.0001 LIMIT 5;

EXPLAIN ANALYZE
SELECT \*, similarity((title || content || tags || properties), 'wr')
FROM posts
WHERE similarity((title || content || tags || properties), 'wr') > 0.0001 LIMIT 5;

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

soundex - it works for whole columns and not for individual words

multiple column - index done.... query - ? pending (done for trigram)

bulk records - done

explain analyse - done

---

CREATE TABLE s (nm text, sn text);

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch
CREATE INDEX txt_idx ON s (nm text_pattern_ops);

CREATE INDEX txt_idx_2 ON s ((nm || '' || sn) text_pattern_ops);

INSERT INTO s VALUES ('john', 'john');
INSERT INTO s VALUES ('joan', 'moq');
INSERT INTO s VALUES ('Happy New Year!, I am so happy. friends friendly nature1654680192089 running', 'coffee');
INSERT INTO s VALUES ('jack', 'sparrow');

SELECT _ FROM s WHERE soundex(nm) = soundex('john');
SELECT _ FROM s WHERE soundex(sn) = soundex('coff');

SELECT _, soundex(nm) FROM s WHERE soundex(nm) = soundex('john');
SELECT _ FROM s WHERE (soundex(nm) || soundex(sn)) = soundex('john');

SELECT \* FROM s WHERE difference((s.nm || s.sn), 'john') > 2;

SELECT soundex('Happy New Year!, I am so happy. friends friendly nature1654680192089 running'); #H156
SELECT soundex('Happy'); #H100

select count(\*) from posts_2

CREATE INDEX "posts_title_content\_\_" ON "posts" USING gin ("title", "content", ('("tags")'))
