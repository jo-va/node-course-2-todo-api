require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

var { authenticate } = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, async (req, res) => {
	let todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	try {
		const doc = await todo.save();
		res.send(doc);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get('/todos', authenticate, async (req, res) => {
	try {
		const todos = await Todo.find({ _creator: req.user._id });
		res.send({ todos });
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get('/todos/:id', authenticate, async (req, res) => {
	const id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	try {
		const todo = await Todo.findOne({ _id: id, _creator: req.user._id });
	
		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });
	} catch (e) {
		res.status(400).send();
	}
});

app.delete('/todos/:id', authenticate, async (req, res) => {
	const id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	try {
		const todo = await Todo.findOneAndRemove({ _id: id, _creator: req.user._id });
	
		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });
	} catch(e) {
		res.status(400).send();
	};
});

app.patch('/todos/:id', authenticate, async (req, res) => {
	const id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	const body = _.pick(req.body, ['text', 'completed']);

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	try {
		const todo = await Todo.findOneAndUpdate({ _id: id, _creator: req.user._id },
			{ $set: body }, { new: true });

		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });

	} catch(e) {
		res.status(400).send();
	}
});

app.post('/users', async (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	try {
		let user = await new User(body).save();
		const token = await user.generateAuthToken();
		res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.delete('/users/me', authenticate, async (req, res) => {
	try {
		await req.user.removeToken(req.token);
		res.status(200).send();
	} catch (e) {
		res.status(400).send();
	}
});

app.post('/users/login', async (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);

	try {
		const user = await User.findByCredentials(body.email, body.password);
		const token = await user.generateAuthToken();
		res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send();
	}
});

app.listen(process.env.PORT, () => {
	console.log(`Started up at port ${process.env.PORT}`);
});

module.exports = { app };