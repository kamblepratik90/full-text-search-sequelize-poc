const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('./config/db.config');
const profilator = require("profilator")(); // if you intend to use only one

// 1. Add a TSVector as a column on the relevant model
// 2. Add a text search index using the vector that was just created
// 3. Update the vector whenever the model is changed
// 4. Add a 'search' method to our model


// Define models
const POSTS = sequelize.define(
    "posts_2",
    {
        title: {
            type: DataTypes.STRING
        },
        content: {
            type: DataTypes.STRING
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
        indexes: [
            // Creates a gin index on the tsvector column
            {
                fields: ['myVector'],
                using: 'gin',
            }
        ]
    }
);

async function createPost(title, content) {
    return POSTS.create({
        title,
        content,
        // populate the tsvector column
        myVector: sequelize.fn('to_tsvector', title + ' ' + content),
    });
}

async function getPosts() {
    return POSTS.findAll();
}

async function getQuery(query) {
    return POSTS.findAll({
        where: {
            myVector: {
                // https://www.postgresql.org/docs/current/textsearch-controls.html
                // [Op.match]: sequelize.fn(`plainto_tsquery`, query)
                // <-> FOLLOWED BY operators check lexeme order not just the presence of all the lexemes
                [Op.match]: sequelize.fn(`to_tsquery`, query)
                // to_tsquery
                // [Op.match]: sequelize.fn(`plainto_tsquery`, query)
                // [Op.substring]: sequelize.fn(`to_tsquery`, query)

            }
        }
    });
}

// SELECT "id", "title", "content", "myVector" FROM "posts_2" AS "posts_2" WHERE "posts_2"."myVector" @@ to_tsquery('frie');

async function getQuery2(query) {
    return POSTS.findAll({
        where: {

            content: {
                // [Op.like]: '%' + query + '%'
                //     [Op.substring]: 'hat'
                [Op.iLike]: '%' + query + '%'
            }
            // [Op.or]: [
            //     {
            //         title: {
            //             // [Op.like]: '%' + query + '%'
            //             [Op.substring]: query
            //         }
            //     },
            //     {
            //         content: {
            //             // [Op.like]: '%' + query + '%'
            //             [Op.substring]: query
            //         }
            //     }
            // ]
        }
    });
}

async function start() {

    profilator.start("sync");
    try {
        await POSTS.sync();
    } catch (error) {
        console.error(`error db model sync.. posts `, error);
        return;
    }
    profilator.stop("sync");

    // // create a post
    // profilator.start("createPost");
    // for (let index = 0; index < 500; index++) {
    //     const time = Date.now();
    //     const res = await createPost('Well Done!' + time, 'Happy New Year!, I am so happy. friends friendly nature' + time);
    //     profilator.stop("createPost");
    //     //     // console.log('res', res);
    // }

    // // get all posts
    // profilator.start("findAll");
    // const posts = await getPosts();
    // profilator.stop("findAll");
    // console.log('all posts', posts.length);

    // get posts by query
    const search = 'frie';
    profilator.start("fts");
    let query = await getQuery(search);
    profilator.stop("fts");
    console.log('query0: ', query.length);

    if (query.length == 0) {
        profilator.start("textSearch");
        query = await getQuery2(search);
        profilator.stop("textSearch");
        console.log('query1: ', query.length);
    }

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