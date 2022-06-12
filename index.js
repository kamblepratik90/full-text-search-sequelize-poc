const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('./config/db.config');
const profilator = require("profilator")(); // if you intend to use only one

// 1. Add a TSVector as a column on the relevant model
// 2. Add a text search index using the vector that was just created
// 3. Update the vector whenever the model is changed
// 4. Add a 'search' method to our model


// Define models
const POSTS = sequelize.define(
    "posts",
    {
        title: {
            type: DataTypes.STRING
        },
        content: {
            type: DataTypes.STRING
        },
        tags: {
            type: DataTypes.JSONB
        },
        properties: {
            type: DataTypes.JSONB
        },
        // add tsvector column
        myVector: {
            type: DataTypes.TSVECTOR
        }
    },
    {
        // Other model options go here
        freezeTableName: true, // Enforcing the table name to be equal to the model name
        // or

        // don't forget to enable timestamps!
        timestamps: false,

        // I don't want createdAt
        createdAt: false,
        // indexes: [
        //     // Creates a gin index on the tsvector column
        //     // {
        //     //     fields: ['myVector'],
        //     //     using: 'gin',
        //     // },
        //     // Creates a gin trgm index on the 'title', 'content', 'tags', 'properties' columns
        //     {
        //         fields: ['title', 'content'],
        //         using: 'gin',
        //         operator: 'gin_trgm_ops'
        //     }
        // ]
    }
);

async function createPost(title, content, tags, properties) {
    return POSTS.create({
        title,
        content,
        tags,
        properties,
        // populate the tsvector column
        myVector: sequelize.fn('to_tsvector', title + ' ' + content + ' ' + JSON.stringify(tags) + ' ' + JSON.stringify(properties)),
    });
}

async function getPosts() {
    return POSTS.findAll();
}

async function getQuery(query, offset = 0, limit = 5) {
    return POSTS.findAndCountAll({
        where:
        {
            myVector: { [Op.match]: sequelize.fn(`to_tsquery`, query) }
        }, offset: offset, limit: limit
    });

    // return POSTS.findAll({
    //     where: {
    //         myVector: {
    //             // https://www.postgresql.org/docs/current/textsearch-controls.html
    //             // [Op.match]: sequelize.fn(`plainto_tsquery`, query)
    //             // <-> FOLLOWED BY operators check lexeme order not just the presence of all the lexemes
    //             [Op.match]: sequelize.fn(`to_tsquery`, query)
    //             // to_tsquery
    //             // [Op.match]: sequelize.fn(`plainto_tsquery`, query)
    //             // [Op.substring]: sequelize.fn(`to_tsquery`, query)

    //         }
    //     }
    // });
}

// SELECT "id", "title", "content", "myVector" FROM "posts_2" AS "posts_2" WHERE "posts_2"."myVector" @@ to_tsquery('frie');

async function getQuery2(query, offset = 0, limit = 5) {
    // return POSTS.findAll({
    //     where: {

    //         content: {
    //             // [Op.like]: '%' + query + '%'
    //             //     [Op.substring]: 'hat'
    //             [Op.iLike]: '%' + query + '%'
    //         }
    //         // [Op.or]: [
    //         //     {
    //         //         title: {
    //         //             // [Op.like]: '%' + query + '%'
    //         //             [Op.substring]: query
    //         //         }
    //         //     },
    //         //     {
    //         //         content: {
    //         //             // [Op.like]: '%' + query + '%'
    //         //             [Op.substring]: query
    //         //         }
    //         //     }
    //         // ]
    //     }
    // });
    return POSTS.findAndCountAll({
        where:
        {
            [Op.or]: [
                {
                    title: {
                        // [Op.like]: '%' + query + '%'
                        [Op.substring]: query
                    }
                },
                {
                    content: {
                        // [Op.like]: '%' + query + '%'
                        [Op.substring]: query
                    }
                }
            ]
        }, offset: offset, limit: limit
    });
}

async function start() {

    let [results, metadata] = await sequelize.query("CREATE EXTENSION IF NOT EXISTS pg_trgm;");

    console.log('results', results);
    console.log('metadata', metadata);
    profilator.start("sync");
    try {
        await POSTS.sync();
    } catch (error) {
        console.error(`error db model sync.. posts `, error);
        return;
    }
    profilator.stop("sync");

    [results, metadata] = await sequelize.query("CREATE INDEX gin_trgm_idx ON posts USING gin ((title || ' ' || content || ' ' || tags || ' ' || properties) gin_trgm_ops);");

    console.log('results', results);
    console.log('metadata', metadata);

    // // create a post
    // profilator.start("createPost");
    for (let index = 0; index < 5; index++) {
        const time = Date.now();
        const tags = [
            "Cartoon",
            "Organ",
            "Happy",
            "Organism",
            "Gesture",
            "Pink",
            "Art",
            "Font",
            "Magenta",
            "Handwriting"
        ];
        const properties = {
            "Coffee": "Black"
        };
        const res = await createPost('Well Done!' + time, 'Happy New Year!, I am so happy. friends friendly nature' + time, tags, properties);
        profilator.stop("createPost");
        //     // console.log('res', res);
    }

    // // get all posts
    // profilator.start("findAll");
    // const posts = await getPosts();
    // profilator.stop("findAll");
    // console.log('all posts', posts.length);

    // // get posts by query
    // const search = 'fri';
    // profilator.start("fts");
    // let query = await getQuery(search, 0, 2);
    // profilator.stop("fts");
    // console.log('query0: ', query);

    // if (query.rows.length == 0) {
    //     profilator.start("textSearch");
    //     query = await getQuery2(search, 1, 2);
    //     profilator.stop("textSearch");
    //     console.log('query1: ', query);
    // }

    const resultsReport = profilator.buildResultsReport();
    console.log(resultsReport);
}

start().then(() => {
    console.log('done');
    process.exit(0);
}
).catch(err => {
    console.log('err', err);
    process.exit(1);
});