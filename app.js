var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var serialPort = require("serialport");


if (process.argv.length != 3) {
    console.log("usage: \"node app.js <serial_port>\"");
    process.exit(0);
}

//setup expressjs to serve static files from the static directory and redirect root to index.html
app.use("/", express.static(__dirname + "/static"));
app.get("/", function (req, res) {
    res.redirect('/index.html');
});

//start express
http.listen(3000, function () {
    console.log('go to http://127.0.0.1:3000');
});

//initialize socketui connections
io.on('connection', function(socket){
    //relay socket.io writes to the serial port
    socket.on('data', function(data){
        serialConnection.write(data);
    });
});

//initialize serial connection with a single byte parser
const ByteLength = serialPort.parsers.ByteLength;
var serialConnection = new serialPort('/dev/tty.usbmodem1411', {
    baudRate: 9600
});
const parser = serialConnection.pipe(new ByteLength({length: 8}));
//parser.on('data', console.log);

//on data callback broadcast to the default socketio connection
/*serialConnection.open(function () {
    serialConnection.on('data', function (data) {
        io.emit('data', data[0]);
        parser.on('data', console.log);
    });
});
*/

serialConnection.open(function () {
  console.log('open');

  serialConnection.on('data', function(data) {
    console.log('data received: ' + data[0]);
    io.emit('data', data[0]);
    //io.emit('data', data);
    //data.render('data received: ' + data);
  });
});

//error handling
serialConnection.on("error", function () {
    console.error("Can't establish serial connection with " + process.argv[2]);
    process.exit(1);
});