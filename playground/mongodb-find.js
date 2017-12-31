const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server:', err.message);
	}
	console.log('Connected to MongoDB server');

	var db = client.db('TodoApp');

	db.collection('Todos').find({ _id: new ObjectID('5a48626c455c36445bed84e5') }).toArray().then(docs => {
		console.log('Todos');
		console.log(JSON.stringify(docs, undefined, 2));
		client.close();
	}, err => {
		console.log('Unable to fetch todos', err.message);
		client.close();
	});

	//client.close();
});