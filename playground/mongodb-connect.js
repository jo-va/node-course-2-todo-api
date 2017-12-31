const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server:', err.message);
	}
	console.log('Connected to MongoDB server');

	var db = client.db('TodoApp');

	db.collection('Todos').insertOne({
		text: 'Something to do',
		completed: false
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert todo:', err.message);
		}
		console.log(JSON.stringify(result.ops, undefined, 2));
	});

	db.collection('Users').insertOne({
		name: 'Jonathan',
		age: 29,
		location: 'Sherbrooke'
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert user:', err.message);
		}
		console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
	});

	client.close();
});