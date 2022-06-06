# full-text-search-sequelize-poc

https://stackoverflow.com/a/67032034/925215

https://www.postgresql.org/docs/current/textsearch-controls.html

https://www.postgresql.org/docs/14/textsearch-tables.html

search

```
SELECT "id", "title", "content", "myVector" FROM "posts" AS "posts" WHERE "posts"."myVector" @@ plainto_tsquery('english', 'new year');
```
