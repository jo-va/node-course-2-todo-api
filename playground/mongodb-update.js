const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server:', err.message);
	}
	console.log('Connected to MongoDB server');

	var db = client.db('TodoApp');

	db.collection('Todos').findOneAndUpdate({
		text: 'Eat lunch'
	}, {
		$set: {
			completed: true
		}
	}, {
		returnOriginal: false
	}).then(result => {
		console.log(result);
		client.close();
	});

	//client.close();
});