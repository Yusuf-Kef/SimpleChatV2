var express = require('express'),
	app = express(),
	server = app.listen(3000),
	io = require('socket.io').listen(server),
	users = {};


app.get('/', function(req, res){
	res.sendFile(__dirname+'/index.html');
});

io.sockets.on('connection', function(socket){
	
	socket.on('new_user_server', function(data, callback){
		if(data.trim() !== ''){
			if(data in users){
				callback(false);
			}else{
				callback(true);
				socket.user = data;
				users[socket.user] = socket;
				updateUserList();
			}
		}else{
			callback('empty');
		}
		
	});
	
	socket.on('data_to_server', function(data, callback){
		var msg = data.trim();
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var FirstSpaceIndex = msg.indexOf(' '); // For Find Username
			if(FirstSpaceIndex !== -1){
				var name = msg.substring(0,FirstSpaceIndex);
				var msg = msg.substring(FirstSpaceIndex + 1);
				if(name in users){
					users[name].emit('whisper', {msg:msg, user:socket.user});
				}else{
					callback('Error! Enter of a valid user <br>');
				}
			}else{
				callback('Error! Please enter a message for your whisper');
			}
		}else{
			io.sockets.emit('data_to_client', {msg:msg, user:socket.user});
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.user) return;
		delete users[socket.user];
		updateUserList();
	});

	function updateUserList(){
		io.sockets.emit('UserList', Object.keys(users));
	}
	
});