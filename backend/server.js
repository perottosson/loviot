let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('COM3', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));
// Read the port data
port.on("open", () => {
  console.log('serial port open ');
});

io.sockets.on('connection', (socket) => {
  parser.on('data', data => {
    let remaped = data / 1;
    socket.emit("encoder", remaped);
    // console.log("Encoderval", remaped)
  });
});

http.listen(3000, () => {
  console.log('Listening on port *: 3000');
});