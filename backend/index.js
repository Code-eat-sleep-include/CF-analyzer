const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const { cacheAllData, getProblems } = require('./utils/utils');
const NodeRSA = require('node-rsa');
const scrapeUserSubmissions = require('./utils/puppeteer/utils');
var cron = require('node-cron');
const config = require('./config');

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

let publicKey;
let privateKey;
let key;

app.post('/scrape', async (req, res) => {

    const handle = req.body.user
    const password = key.decrypt(req.body.password, 'utf8');

    const problems = await scrapeUserSubmissions(handle, password);

    if (problems === "Error") {
        res.send("Error");
    } else {
        const obj = await getProblems(problems);

        let cleanedData = []
        for (i of obj) {
            if (i) {
                cleanedData.push(JSON.parse(i))
            }
        }

        res.send(cleanedData);
    }
})

app.get('/getPublicKey', async (req, res) => {
    res.send(publicKey);
})

app.get('/cache_data', (req, res) => {
    cacheAllData();
    res.redirect('/')
})

app.get('/', async (req, res) => {
    res.send('Caching and Scraping Server')
})

const port = config.SERVER_PORT;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
    key = new NodeRSA({ b: 512 });
    publicKey = key.exportKey('public');
    privateKey = key.exportKey('private');
    cacheAllData();
})

cron.schedule('0 0 * * *', () => {
    cacheAllData();
    console.log('automatically caching data');
});
