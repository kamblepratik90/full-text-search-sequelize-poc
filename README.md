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
