const express = require("express");
const cors = require('cors');
const keys = require('./keys');

//express setup
const app = express();

app.use(express.json());
app.use(cors());

//Postgres client setup
const {Pool} = require('pg');

const pgClient = new Pool({
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
  user: keys.pgUser,
  password: keys.pgPassword,
});

pgClient.on("error", () => console.log('Lost PG connection'));

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch( err => console.log(err));

//Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

//Express route handler
app.get('/', (req, res,next) => {
    console.log('Root handler');
    res.send("Hi");
});

//get all the requested Fibonnaci indexes
app.get('/values/all', async (req, res, next) => {
    console.log('/values/all handler');
    const values = await pgClient.query('SELECT number FROM values');
    console.log('all - values: ', values.rows);
    res.send(values.rows);
});

//get all the requested Fibonnaci indexes and the values for them
app.get('/values/current', async (req, res, next) => {
    console.log('/values/current handler');
    redisClient.hgetall("values", (err, values) => {
      console.log('current - values: ', values);
      res.send(values);
    });
});

//get all the requested Fibonnaci indexes and the values for them
app.post('/values', async (req, res, next) => {
    const index = req.body.index;

    console.log('Index to be added : ', index);

    if ( parseInt(index) > 40 ) {
        return res.status(422).send('Index too high');
    }

    //save the index in redis with value 'Nothing yet'
    redisClient.hset('values', index, 'Nothing yet');

    //publish the index (the worker will receive the event)
    redisPublisher.publish('insert', index);

    //save the index in Postgres
    pgClient.query('INSERT INTO values(number) values($1)', [index]);

    res.send({working: true});
});


app.listen(5000, (err) => {
    console.log('Listening on port 5000...');
})