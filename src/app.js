const express = require('express');
const app = express();
const cors = require('cors');
const config = require('./config');
const bodyParser = require('body-parser');
const download = require('./download');
const tools = require('./tools');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/', function(req, res) {
    res.send('...');
});

const queue = [];
const uuidToDownloadResponse = new Map();
let currentDownloadPromise;
const processQueue = () => {

    if (!queue.length) {
        return;
    }

    const {url, folder, name, referer, userAgent, tries, timeout, compression, uuid} = queue.shift();

    uuidToDownloadResponse.set(uuid, {
        status: 'downloading'
    });

    currentDownloadPromise = download(url, folder, name, referer, userAgent, tries, timeout, compression).then(output => {

        uuidToDownloadResponse.set(uuid, {

            status: 'completed',
            output

        });

    }).catch(err => {

        const serializedError = JSON.stringify(err, ['name', 'message', 'stack']);

        uuidToDownloadResponse.set(uuid, {

            status: 'error',
            error: serializedError

        });

    }).finally(() => {

        currentDownloadPromise = null;
        processQueue();

    });

};

app.get('/check/:uuid', function(req, res) {

    const uuid = req.params.uuid;
    if (uuidToDownloadResponse.has(uuid)) {

        const payload = tools.clone(uuidToDownloadResponse.get(uuid));
        payload.found = true;
        res.json(payload);

    } else {

        res.status(404).json({
            found: false,
            message: `There is no download with provided uuid : ${uuid}`
        });

    }

});

app.post('/download', function(req, res) {

    if (!req.body.url) {
        res.status(400).json({
            error: true,
            message: 'required url parameter is missing'
        });
    }

    const uuid = tools.uuid();
    const downloadParams = tools.clone(req.body);
    downloadParams.uuid = uuid;

    queue.push(downloadParams);
    uuidToDownloadResponse.set(uuid, {
        status: 'queued'
    });

    if (!currentDownloadPromise) {
        processQueue();
    }

    res.json({
        uuid,
        status: uuidToDownloadResponse.get(uuid)
    });

});

app.listen(config.port, 'localhost', function(err) {

    if (err) {
        console.error(`Failed to listen to port ${config.port}: %s`, err);
        return;
    }

    console.log(`App listening on http://localhost:${config.port}/`);

});