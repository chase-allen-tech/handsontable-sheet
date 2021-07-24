const micro = require('micro');
const { json } = require('micro');
const cors = require('micro-cors')();
const Pusher = require('pusher');
const url = require('url');
const qs = require('querystring');
const redis = require('redis');

const port = process.env.PORT || 8080
const pusher = new Pusher({
    appId: '1232937',
    key: '523fec7e4c07da8aefc7',
    secret: '630c933b23ee628e049c',
    cluster: 'ap1',
    useTLS: true,
});

const REDIS_HOST = 'gusc1-easy-alpaca-30091.upstash.io';
const REDIS_PORT = '30091';
const REDIS_PWD = 'e5acc2e0e528498ab0f0ca59f74a0e26';
const redisClient = redis.createClient({
    port: REDIS_PORT, host: REDIS_HOST, socket_keepalive: true, socket_initial_delay: 1000000, tls: {}
});
redisClient.auth(REDIS_PWD, () => {
    console.log('authentidated');
});
redisClient.on('error', err => {
    console.log('[REDIS ERROR]', err);
})
redisClient.get('foo', (err, res) => {
    if(err) {
        console.log('[redis error]', err);
    } else {
        console.log('[redis res]', res);
    }
});
redisClient.on('connect', () => {
    console.log('[redis connected]');
})

const handler = async (req, res) => {
    try{
        let payload = await json(req);
        switch(req.url) {
            case '/pusher':
                
                pusher.trigger('table', 'table-event', payload);
                return 'success';
            case '/redis':
                console.log('[redis enter]');
                redisClient.set('foo', 'bar');
                return 'success';
            default: return 'error';
        }
    } catch(err) {
        return 'error';
    }
}

const server = micro(cors(handler));

server.listen(port);