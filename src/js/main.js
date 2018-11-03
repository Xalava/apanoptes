var web3 = new Web3(Web3.givenProvider || "https://localhost:8545");


web3.eth.net.getId()
.then(console.log);


web3.eth.getBlockNumber()
.then(console.log);


var socket = io();
socket.emit('tail', {test: "1233"});
socket.on('newLine', function(msg){
  $('#messages').append($('<li>').text(msg.line));
});