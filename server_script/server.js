var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets\

// mongo db link should be used in connect method

mongo.connect('', function (err, db) {
	if(err) throw err;

	client.on('connection', function(socket){


		//custom collection name muse be used below

		var col = db.collection('');
		
		var sendStatus = function(s) {
			socket.emit('status', s);
		};

		//emit all messages
		col.find().limit(100).sort({_id: 1}).toArray(function(err,res){
			if(err) throw err;
			socket.emit('output', res);
		});

		//input
		socket.on('input', function(data){

			var name = data.name,
				message = data.message,
				whitespacePattern = /^\s*$/;

			if(whitespacePattern.test(name) || whitespacePattern.test(message)){
				sendStatus("Name and Message required");
			} else {
				col.insert({name: name, message: message}, function(){

					//emit latest message to all clients
					client.emit('output', [data]);

					sendStatus({
						message: "Message Sent",
						clear: true
					});
				});
			}

		});
	});
});