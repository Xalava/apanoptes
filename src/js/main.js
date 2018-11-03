var web3 = new Web3(Web3.givenProvider || "https://localhost:8545");
const RPCServer = '127.0.0.1'
const LogsServer = new WebSocket("ws://SERVER.com/socketserver", "protocolOne")

web3.eth.net.getId()
.then(console.log);


web3.eth.getBlockNumber()
.then(console.log);


var socket = io();
  socket.emit('tail', {test: "1233"});
  socket.on('newLine', function(msg){
    $('#messages').append($('<li>').text(msg.line));
});


$.get( "ajax/test.html", function( data ) {
  $( ".result" ).html( data );
  alert( "Load was performed." );
});