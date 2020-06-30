var app   = require('express')();
var http  = require('http').createServer(app);
var io    = require('socket.io')(http);

const activeUsers = []; 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.get('/background.css', (req, res) => {
    res.sendFile(__dirname + '/client/background.css');
});

app.get('/sound.mp3', (req, res) => {
    res.sendFile(__dirname + '/client/sound.mp3');
});


io.on("connection", function (socket) {
  console.log("Made socket connection");
  var defaultUser = `user${Math.floor(Math.random() * 9999)}`; // generating a random username

  socket.on("new user", function (data) { // listening for new users
    socket.userId = data;
    if(socket.userId){
      activeUsers.push(data); // if the user have a name, add the new user to activeUsers variable
    } else {
      activeUsers.push(defaultUser); // if the users doesn't have a name, add the defaultUser to activeUsers variable
    }

    console.log(`Users: ${activeUsers.map(x => `${x}`)}`); // printing all active users
    console.log((socket.userId) ? `${socket.userId} connected` : `${defaultUser} connected`); // printing connected user

    (socket.userId)
     ? io.emit("chat message", `${socket.userId} connected!`) // sending connected user to client 
      : 
        io.emit("chat message", `${defaultUser} connected!`); // sending connected user to client
 
  });

  socket.on("disconnect", () => { // listening for disconnected users
    console.log("disconnected: " + socket.userId);
    
    socket.userId
     ? (io.emit("chat message", `${socket.userId} disconnected!`), // sending disconnected user to client 
         activeUsers.pop() // removing one user from active users
       ) : (
         io.emit("chat message", `${defaultUser} lost connection!`),  // sending disconnected user to client 
           activeUsers.pop() // removing one user from active users	
        )

  });
  
  socket.on('chat message', (msg) => { // listening for received messages and sending to client
  
    (socket.userId)
     ?  io.emit('chat message', `${socket.userId} : ${msg}`) // sending messages to client
      :
        io.emit('chat message', `${defaultUser} : ${msg}`); // sending messages to client

  });

  socket.on('active users', (msg) => { // listening for client request to know active users count
 
    io.emit('active users', activeUsers.length); // sending to client active users count
 
  });

});


http.listen(3000, () => { 
  console.log('listening on *:3000');
});
