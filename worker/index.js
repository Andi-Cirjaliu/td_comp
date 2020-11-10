const redis = require('redis');
const keys = require('./keys');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

const fib = (index) => {
  if (index <= 1) return 1;

  return fib(index - 1) + fib(index - 2);
};


//handle inserted new indexes
sub.on("message", (channel, message) => {
    console.log('Redis insert event - message ', message);
    const index = parseInt(message)
    const value = fib(index);
    console.log('save in Redis - index ', index, ', value ', value);
    redisClient.hset('values', message, value);
});
//watch for insert events 
sub.subscribe('insert');