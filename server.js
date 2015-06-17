var WebSocketServer = require('websocket').server;
var http = require('http'),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

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

  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd(), '/public' + uri);

  console.log((new Date()) + ' Resource Request at ' + filename);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
});

var port = process.env.PORT || 3000;    // port 3000 is for test purpose on local host
server.listen(port, function() {
  console.log((new Date()) + ' Server is listening on port ' + port);
});

// create WebSocket server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept('echo-protocol', request.origin);
  var index = users.push(connection) - 1;
  console.log((new Date()) + ' Connection from origin ' + request.origin + ' accepted.');

  // read history and send to the new connected user
  for (var i=0; i < messages.length; i++) {
    connection.sendUTF(messages[i]);
  }

  connection.on('message', function(event) {
    if (event.type == "utf8") {
      var json = JSON.parse(event.utf8Data);
      console.log((new Date()) + ' Received Message from ' + json.from_user + ': ' + json.message);

      // keep message history
      var obj = {
          time: (new Date()).getTime(),
          message: json.message,
          from_user: json.from_user
        };

      // broadcast message to all connected users
      for (var i=0; i < users.length; i++) {
          users[i].sendUTF(JSON.stringify(json));
      }

      // store message into queue
      messages.push(obj);
      messages = messages.slice(-100);
    }
  });

  connection.on('close', function(connection) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
