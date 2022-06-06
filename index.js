const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('./config/db.config');

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
                // [Op.match]: sequelize.fn(`plainto_tsquery`, query)
                // to_tsquery
                [Op.match]: sequelize.fn(`plainto_tsquery`, query)

            }
        }
    });
}

async function start() {

    try {
        await POSTS.sync();
    } catch (error) {
        console.error(`error db model sync.. posts `, error);
        return;
    }

    // create a post
    // const time = Date.now();
    // const res = await createPost('Well Done!' + time, 'Happy New Year!, I am so happy. friends friendly nature' + time);
    // console.log('res', res);

    // get all posts
    // const posts = await getPosts();
    // console.log('posts', posts);

    // get posts by query
    // const query = await getQuery('friend');
    // console.log('query', query.length);

}

start().then(() => {
    console.log('done');
    process.exit(0);
}
).catch(err => {
    console.log('err', err);
    process.exit(1);
});