const RPCServer = "http://127.0.0.1:8545"
const NodeServer = "";
const REFRESHRATE = 2000;




$(function() {
  var web3 = new Web3(Web3.givenProvider || RPCServer );
  console.log("WEB3 is here ! : ",web3)
  const logs = new WebSocket("ws://SERVER.com/socketserver", "protocolOne")
  
  function getNetworkData(){
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
    
    // $.get( RPCServer, {"jsonrpc":"2.0","method":"admin_peers","params":[],"id":53}, function( data ) {
    //   $( "#adminpeers" ).html( data );
    //   console.log(data)
    // });
      
    $.ajax({
      url: RPCServer,
      data: '{"jsonrpc":"2.0","method":"admin_peers","params":[],"id":53}',

      // data: {
      //    jsonrpc: '2.0',
      //    method: 'admin_peers',
      //    params: [],
      //    id:53

      // },
      error: function() {
        //  $('#info').html('<p>An error has occurred</p>');
        console.log("ERROR")
      },
      // dataType: 'jsonp',
      processData: false,

      success: function(data) {
        console.log(data)
        // caps: ["eth/63"]
        // id: "0xe731e22173dda8f432fabba68365aa2e11d656ad9e64d0fafdbbcbadc566f477acc6ef5ae24be8ed481e09774651a7cbd87b7bfed61ab22c15b8c9d712e85369"
        // name: "Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10"
        // network:
        // localAddress: "10.2.22.100:43542"
        // remoteAddress: "172.104.181.138:30303"
        // __proto__: Object
        // port: "0x0"
        // version: "0x5"
        // __proto__: Object

        
        for (let i = 0; i < data.result.length; i++) {
          const peer = data.result[i];
          $('#adminpeers').append('<li class="list-group-item">' + peer.id.substring(0, 10)+ '</li>')
        }
      },
      type: 'POST'
   });


    
    web3.eth.getGasPrice()
    .then(
      (res)=> {
        $( "#gasprice" ).html( res );
      }
    );
  }

  

  var networkDataLoop = setInterval(getNetworkData, REFRESHRATE);

 

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


