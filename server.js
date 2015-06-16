var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
// var index = fs.readFileSync("index.html", "utf8");

var messages = [ ];    // store message hitory in array, this will be replaced by Redis or RabbitMQ
var users = [ ];

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// sort colors in random order
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
colors.sort(function(a,b) { return Math.random() > 0.5; } );

// create HTTP server
var server = http.createServer(function(request, response) {
  // response.writeHead(200, { 'Content-Type': 'text/html' });
  // response.write(index);
  // response.end();
});

var port = process.env.PORT;
server.listen(port, function() {
  console.log((new Date()) + ' Server is listening on port ' + port);
});

// create WebSocket server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  var index = users.push(connection) - 1;
  console.log((new Date()) + ' Connection from origin ' + request.origin + 'accepted.');


  connection.on('message', function(message) {
    var json = JSON.parse(message);
    console.log((new Date()) + ' Received Message from ' + json.from_user + ': ' + json.message);

    // keep message history
    var obj = {
        time: (new Date()).getTime(),
        message: json.message,
        from_user: json.from_user
      };

    messages.push(obj);
    messages = messages.slice(-100);

    // broadcast message to all connected clients
    for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF(json);
    }
  });

  connection.on('close', function(connection) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
