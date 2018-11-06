const AdminServer = "localhost:3005"
const RPCServer = "http://127.0.0.1:8545"
const REFRESHRATE = 4000;
const serverSocket = io('ws://' + AdminServer)

// Chart Utilities
let peersCount = [0]
let peersHistory = {id :[], connection: [], bodies:[], headers:[]}
var peersChart
var peersMetricsChart

const date = new Date()
const initialTimestamp = date.getTime()
const chartOptions = {}
let logLevel = "OFF" // DEBUG or OFF
let logs = []

$(function () {
  var web3 = new Web3(Web3.givenProvider || RPCServer)
  console.log("Web3 is provided by ", web3.currentProvider.host)

  function getNetworkData() {
    web3.eth.net.getId()
      .then(
        (res) => {
          $("#netid").html(res)
        }
      )

    web3.eth.getBlockNumber()
      .then(
        (res) => {
          $("#lastblock").html(res)
        }
      )

    $.ajax({
      url: RPCServer,
      data: '{"jsonrpc":"2.0","method":"admin_peers","params":[],"id":99}',
      error: function () {
        console.log("Get Admin Peers Failed")
        $("#connection").addClass("hidden")

      },
      processData: false,
      success: function (data) {
        $("#connection").removeClass("hidden")
        // console.log(data)
        // Return
        // caps: ["eth/63"]
        // id: "0xe731e22173dda8f432fabba68365aa2e11d656ad9e64d0fafdbbcbadc566f477acc6ef5ae24be8ed481e09774651a7cbd87b7bfed61ab22c15b8c9d712e85369"
        // name: "Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10"
        // network:
        // localAddress: "10.2.22.100:43542"
        // remoteAddress: "172.104.181.138:30303"
        // __proto__: Object
        // port: "0x0"
        // version: "0x5"
   
        $('#adminpeers').html("")
        for (let i = 0; i < data.result.length; i++) {
          const peer = data.result[i]
          $('#adminpeers')
            .append('<li class="list-group-item">' +
              '<p>' + peer.id.substr(0, 40) + '...  <span class="badge badge-secondary pull-right">' + peer.caps[0] + '<i> ' + peer.name + '</i>' +'</span></p>' +
              '<small> Network : ← ' + peer.network.localAddress + ' - ↑ ' + peer.network.remoteAddress + '</small>' +
              '</li>')
          let idx = peersHistory.id.findIndex(fruit => fruit === peer.id)
          if (idx == -1) {
            peersHistory.id.push(peer.id)
            peersHistory.connection.push(1)
            peersHistory.bodies.push(0)
            peersHistory.headers.push(0)


          } else {
            peersHistory.connection[idx] += (1 * REFRESHRATE/1000)
          }
          updatePeersMetricsChart()

        }
      },
      type: 'POST'
    });

    $.ajax({
      url: RPCServer,
      data: '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":101}',
      error: function () {
        console.log("RPC failed", this.data)
      },
      processData: false,
      success: function (data) {
        $('#netlistening').html(data.result)
      },
      type: 'POST'
    })

    $.ajax({
      url: RPCServer,
      data: '{"jsonrpc":"2.0","method":"net_version","params":[],"id":102}',
      error: function () {
        console.log("RPC failed", this.data)
      },
      processData: false,
      success: function (data) {
        $('#chainid').html(data.result)
      },
      type: 'POST'
    })

    $.ajax({
      url: RPCServer,
      data: '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":103}',
      error: function () {
        console.log("RPC failed", this.data)
      },
      processData: false,
      success: function (data) {
        $('#clientversion').html(data.result)
      },
      type: 'POST'
    })


    $.ajax({
      url: RPCServer,
      data: '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":104}',
      error: function () {
        console.log("RPC failed", this.data)
      },
      processData: false,
      success: function (data) {

        var nb = parseInt(data.result, 16);


        peersCount.push(nb)
        // console.log(peersCount)
        peersChart.update({
          labels: [],
          series: [
            peersCount
          ]
        })

      },
      type: 'POST'
    })

    web3.eth.getGasPrice()
      .then(
        (res) => {
          $("#gasprice").html(res)
        }
      )
  }

  var networkDataLoop = setInterval(getNetworkData, REFRESHRATE)
  //SOCKET interface
  serverSocket.emit('tail', {
    test:"123",
    service: "1233",
    logLevel: "debug"
  })

  serverSocket.on('newLine', function (msg) {
    // console.log("New Line", msg)
    // line
    // parsed: Array(5)
      // 0: "2018-11-04 10:31:49.517+00:00"
      // 1: "vert.x-worker-thread-18"
      // 2: "DEBUG"
      // 3: "JsonRpcHttpService"
      // 4: "JSON-RPC request -> net_peerCount"
      if (msg.parsed[1]) {
        logs.push(msg.parsed)

        let idxBodies = msg.parsed[4].search("bodies from peer ")
        //WARNING : Log implementation dependant
        if (idxBodies > 0 ){
          let downloadedFrom = msg.parsed[4].substring(idxBodies+17, idxBodies+37)
          console.log("Bodies downloaded from", "*"+downloadedFrom+"*")
          let matchingIdx = peersHistory.id.findIndex( id => { return id.substring(0,20) == downloadedFrom})
          if (matchingIdx > -1){
            let numberOfBodies = parseInt(msg.parsed[4].substring(11, 13).replace(/ /g, ''))
            // .replace(/ /g, '');
            console.log("Bodies Match",matchingIdx, '*'+msg.parsed[4].substring(11, 13)+'*')
            peersHistory.bodies[matchingIdx] += numberOfBodies
          }
        }
        // GetBodiesFromPeerTask | Requesting 20 bodies from peer 0xc32a56d31c9bcb6c9f
        // GetHeadersFromPeerByHashTask | Requesting 20 headers from peer 0x8e83e76bf5e97e684f

        let idxHeaders = msg.parsed[4].search("headers from peer ")
        //WARNING : Log implementation dependant
        if (idxHeaders > 0 ){
          let downloadedFrom = msg.parsed[4].substring(idxHeaders+18, idxHeaders+38)
          let matchingIdx = peersHistory.id.findIndex( id => { return id.substring(0,20) == downloadedFrom})
          if (matchingIdx > -1){
            let numberOfHeaders = parseInt(msg.parsed[4].substring(11, 13).replace(/ /g, ''))
            console.log("Headers Match",matchingIdx, '*'+msg.parsed[4].substring(11, 13)+'*')

            peersHistory.headers[matchingIdx] += numberOfHeaders
          }
        }

        var currentDate = Math.floor(( Date.parse(msg.parsed[0])- initialTimestamp )/1000)
  
        var publishLine =  '<td>' + currentDate + '</td> '+ '<td>'+ msg.parsed[1]+ '</td> <td>' + msg.parsed[3]+ ' ' + msg.parsed[4] + '</td>'
        if (msg.parsed[2] == "DEBUG" ) {
          if (logLevel == "DEBUG")
            $('#consoleLogs').append($('<tr>').html(publishLine).addClass('warning'))
        } else if (msg.parsed[2] == "INFO")
          $('#consoleLogs').append($('<tr>').html(publishLine).addClass('info'))
        else
          $('#consoleLogs').append($('<tr>').html(publishLine).addClass(''))


         if($("#auto-scroll").prop('checked') )
          $('#consoleLogs').parent().animate({scrollTop: $('#consoleLogs').prop("scrollHeight")}, 0);

      }




    // $('#consoleLogs').append($('<tr>').text(msg.line));
  })

  serverSocket.emit('info', {}, function (data) {
    // Return
    // arch: "x64"
    // cpus: Array(4) .model .speed
    // freemem: 1410928640
    // hostname: "k"
    // loadavg: (3) [0.3271484375, 0.3291015625, 0.4013671875]
    // platform: "linux"
    // totalmem: 6964310016
    // uptime: 6112
    $('#infoArch').html(data.arch)
    $('#infoCPU').html(data.cpus.length + " cores ( " + data.cpus[0].model + " )")
    $('#infoHostname').html(data.hostname)
    $('#infoLoadavg').html(data.loadavg[2])
    $('#infoPlatform').html(data.platform)
    $('#infoUptime').html(data.uptime)
    var mempercent = (data.totalmem - data.freemem) / data.freemem
    $('#infoMemory').css('width', mempercent + '%').attr('aria-valuenow', mempercent)

    console.log('Retrieved System Info', data)
  })


  peersChart = new Chartist.Line('#peersNumber', {
    labels: [],
    series: [
      peersCount
    ]
  }, chartOptions)

  peersMetricsChart = new Chartist.Bar('#peersMetrics', {
    labels: [0],
    series: [
      [0], 
      [0],
      [0]
    ]
    },  {
      seriesBarDistance: 10,
      // reverseData: true,
      horizontalBars: true,
      axisY: {
        offset: 70  
      },
    //   plugins: [
    //     Chartist.plugins.legend()
    // ]
    }
  )

  function updatePeersMetricsChart (){
    peersMetricsChart.update({
      labels: peersHistory.id,
      series: [
        peersHistory.connection,
        peersHistory.headers,
        peersHistory.bodies
      ]
      })
  }

  $('#peerDataModal').on('shown.bs.modal', function (e) {
    updatePeersMetricsChart()
  })
  

})





$('#logs-debug').click(function() {
  logLevel = "DEBUG"
  $(this).toggleClass('active')
  $('#logs-off').toggleClass('active')
  console.log("LOG LEVEL DEBUG")
})

$('#logs-off').click(function() {
  logLevel = "OFF"
  $(this).toggleClass('active')
  $('#logs-debug').toggleClass('active')
  console.log("LOG LEVEL OFF")

})



$('#restartNode').click(function() {
  serverSocket.emit('tail', {
    test:"123",
    service: "1233",
    logLevel: "debug"
  })
  console.log("LOG LEVEL DEBUG")
})

$('#stopNode').click(function() {
  serverSocket.emit('tail_stop', {
    test:"123",
    service: "1233",
  })
 
  console.log("LOG LEVEL OFF")

})
