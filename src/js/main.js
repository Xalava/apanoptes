const RPCServer = "http://127.0.0.1:8545"
const NodeServer = "";

$(function() {
  var web3 = new Web3(Web3.givenProvider || RPCServer );
  console.log("WEB3 is here ! : ",web3)
  const logs = new WebSocket("ws://SERVER.com/socketserver", "protocolOne")
  
  web3.eth.net.getId()
  .then( 
    (res)=> {
      $( "#netid" ).html( res );
    }
  );
  
  web3.eth.getBlockNumber()
  .then(
    (res)=> {
      $( "#lastblock" ).html( res );
    }
  );

    
  web3.eth.getGasPrice()
  .then(
    (res)=> {
      $( "#gasprice" ).html( res );
    }
  );

  if (NodeServer) {
    var socket = io(WSServer);
      socket.emit('tail', {test: "1233"});
      socket.on('newLine', function(msg){
        $('#messages').append($('<li>').text(msg.line));
    });
  } else {
    console.log("No logs Server")
  }

  
});  


// var socket = io();
//   socket.emit('tail', {test: "1233"});
//   socket.on('newLine', function(msg){
//     $('#messages').append($('<li>').text(msg.line));
// });


// $.get( "ajax/test.html", function( data ) {
//   $( ".result" ).html( data );
//   alert( "Load was performed." );
// });