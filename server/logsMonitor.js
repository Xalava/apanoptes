const express = require('express'),
  app = express(),
  path = require('path'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  spawn = require('child_process').spawn,
  helpers = require('./helpers'),
  exec = require('child_process').exec;


// Fix body of requests
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Add a basic route – index page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/:id/status', function(req, res) {
  const rpcHelper = new helpers.rpcHepler();
  rpcHelper
    .checkStatus(req.query)
    .then(response => {
      return res.status(200).json({response});
    })
    .catch(error => {
      return res.status(error.code || 500).json(error);
    })

  //res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/info', function(req, res) {
  const infoHelper = new helpers.infoHepler();
  infoHelper
    .getMachineInfo()
    .then(response => {
      return res.status(200).json({response});
    })
    .catch(error => {
      return res.status(error.code || 500).json(error);
    })

  //res.sendFile(path.join(__dirname, 'index.html'));
});

var tails = {};

const stopImage = async (name) => {
  return new Promise((fulfill, reject) => {
    exec(`docker stop ${name}`, (err, stdout, stderr) => {
      if (err) {
        console.error('stop process error',err);
        return fulfill(err);
      }
      return fulfill();
    });

  });
};
const rmImage = async (name) => {
  return new Promise((fulfill, reject) => {
    exec(`docker rm ${name}`, (err, stdout, stderr) => {
      if (err) {
        console.error('stop process error',err);
        return fulfill(err);
      }
      return fulfill();
    });

  });
};

const restartImage = async ({port, host, name, logLevel}) => {
  try{
    if(!Object.keys(tails).length) return true;
    await stopImage(name);
    return await rmImage(name);
  }catch (e) {
    throw e;
  }
};

io.on('connection', (socket) => {
  console.log(`client connected ${socket.client.id}`);
  socket.on('tail', (data) => {
    socket.join(data.service);
    restartImage({name: data.service})
      .then(() => {
        //if (typeof tails[data.service] == "undefined") {
          tails[data.service] = spawn('docker', ['run', '--name', data.service,  '-p', '8545:8545', '-p', '13001:30303', 'pegasyseng/pantheon:latest', '--rpc-enabled', `--logging=${data.logLevel}` ],
            {
              shell: true
            });
          tails[data.service].stdout.on('data', (data) => {
            console.log(`got new data ${data.toString()}`);
            io.to(data.service).emit('newLine', {
              line: data.toString().replace(/\n/g, '<br />'),
              parsed: data.toString().replace(/\n/g, '<br />').split('|')
            });
          });
       // }
      })
      .catch(err => {
        console.error('errrrrr', err)
      })

  });
  socket.on('tail_stop', (data) => {
    restartImage({name: data.service})
      .then(() => {
        console.log('logs stopped');
      })
      .catch(err => {
        console.error('errrrrr', err)
      })

  });
  socket.on('info', (data, cb) => {
    const infoHelper = new helpers.infoHepler();
    infoHelper
      .getMachineInfo()
      .then(response => {
        cb(response)
      })
      .catch(error => {
        cb(error)
      })
  })

});


// Bind to a port
server.listen(3005, () => {
  console.log('running on localhost:' + 3005);
});