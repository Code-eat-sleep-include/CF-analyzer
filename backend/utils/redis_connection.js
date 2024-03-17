const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL,
    legacyMode: true
});

client.connect();

client.on('connect', ()=>{
    console.log(`Redis cache connected`)
})

module.exports = client;
