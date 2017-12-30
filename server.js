var app = require('http').createServer(handler)
var socket = require('socket.io');
var fs = require('fs');
var dateFormat = require('dateformat');

var now = new Date();

let unames = [];
let active_users = {};

let io = socket.listen(app);
app.listen(process.env.PORT || 5000);


function handler (req, res) {
  fs.readFile(__dirname + '/index.html', (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

function chatHtml() {
  let html = fs.readFileSync("chat.html");
  return html.toString();
}

function activeUsers(users) {
  let online = "";

  for (let user in users) {
      online = online + " " + users[user];
  }
  return online;
}


io.on('connection', function (socket) {
    io.set("log level", 1);

    socket.on('set_name', function (data) {
      if (unames.indexOf(data.toLowerCase().trim()) > -1) {
          console.log(unames)
          io.sockets.emit("name_already_set", `User name ${data} already in use.`);
      } else {
        if (data !== ""  && data.trim().length > 0) {
          unames.push(data.toLowerCase().trim());
          active_users[socket.id] = data;

          socket.emit("name_set", chatHtml());

          io.sockets.emit("online", [activeUsers(active_users), data]);
        }
      }

      socket.on("message", msg => {
        console.log(msg);
        let sent_by = active_users[socket.id];
        let date = dateFormat(now, "yyyy, mmm d");
        msg = msg.replace(/\n/g, "<br />");

        if (msg.length > 0) {
          io.sockets.emit("message_recive", msg, sent_by, date);
        } else {
          io.sockets.emit("message_empty_error", "Message should not be empty");
        }
    });

  });
});