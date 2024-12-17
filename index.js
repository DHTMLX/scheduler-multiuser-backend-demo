const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const sanitize = require("./sanitize");
const WebSocketManager = require('./websocket');
const CRUDManager = require('./crud');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

const server = app.listen(port, () => {
	console.log(`Open http://localhost:${port} in your browser`);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

const wsManager = new WebSocketManager(server);
const crud = new CRUDManager();

app.get('/api/v1', (req, res) => {
	res.json({ api: {}, data: {}, websocket: true });
});

app.get('/events', (req, res) => {
	res.json(sanitize(crud.load(req.query.from, req.query.to)));
});

app.post('/events', (req, res) => {
	const bodyPayload = sanitize(req.body);
	const result = crud.insert(bodyPayload);

	wsManager.broadcast('event', { name: 'events', value: { type: 'add-event', event: result.item } });

	res.status(200).json(result);
});

app.put('/events/:id', (req, res) => {
	const id = req.params.id;
	const event = sanitize(req.body);

	const result = crud.update(id, event);

	wsManager.broadcast('event', { name: 'events', value: { type: 'update-event', event: result.item } });

	res.status(200).send(result);
});

app.delete('/events/:id', (req, res) => {
	const id = req.params.id;
	const result = crud.delete(id);

	wsManager.broadcast('event', { name: 'events', value: { type: 'delete-event', event: {id} } });

	res.status(200).send();
});