var WebSocketServer = require('websocket').server;
var http = require('http'),
    url = require("url"),
    path = require("path"),
    fs = require("fs");
    // amqp = require("amqp");

var connections = [];
// var users = [];

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

// TBD: connect to RabbitMQ

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept('echo-protocol', request.origin);
  connections.push(connection);
  console.log((new Date()) + ' Connection from origin ' + request.origin + ' accepted.');

  connection.on('message', function(event) {
    if (event.type == "utf8") {
      var json = JSON.parse(event.utf8Data);
      console.log((new Date()) + ' Received Message from ' + json.from_user);

      if (json.type == "login") {
        var user = json.from_user;
        sendto(user + " join room", "system");
      } else {
        sendto(json.message, json.from_user);
      }
    }
  });

  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' client ' + connection.remoteAddress + ' disconnected, reason: ' + reasonCode);
    // sendto(user + " left room", "system");

    // remove connection from connections array
    var index = connections.indexOf(connection);
    if (index > -1) {
        connections.splice(index, 1);
    }
  });

  function sendto(message, from, to) {
    to = typeof to !== 'undefined' ? to : "all";

    var json = {
      message: message,
      from_user: from,
      to_user: to
    };

    if (to == "all") {
      for (var i in connections) {
        connections[i].sendUTF(JSON.stringify(json));
      }
    } else {
      // TODO
      // to.sendUTF(JSON.stringify(json));
    }
  }
});
