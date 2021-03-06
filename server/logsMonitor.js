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

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Add a basic route – index page
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
})

/**
 * Get network status.
 * @param {string} ip - Node IP address
 * @param {string} port - Node port
 */
app.get('/:id/status', function (req, res) {
  const rpcHelper = new helpers.rpcHepler();
  rpcHelper
    .checkStatus(req.query)
    .then(response => {
      return res.status(200).json({response});
    })
    .catch(error => {
      return res.status(error.code || 500).json(error);
    })
});

/**
 * Get machine info endpoint.
 */
app.get('/info', function (req, res) {
  const infoHelper = new helpers.infoHepler();
  infoHelper
    .getMachineInfo()
    .then(response => {
      return res.status(200).json({response});
    })
    .catch(error => {
      return res.status(error.code || 500).json(error);
    });
});

let tails = {};

/**
 * Stop docker image.
 * @param {string} name - The docker image name.
 */
const stopImage = async (name) => {
  return new Promise((fulfill, reject) => {
    exec(`docker stop ${name}`, (err, stdout, stderr) => {
      if (err) {
        console.error('stop process error', err);
        return fulfill(err);
      }
      return fulfill();
    });

  });
};

/**
 * Remove docker image.
 * @param {string} name - The docker image name.
 */
const rmImage = async (name) => {
  return new Promise((fulfill, reject) => {
    exec(`docker rm ${name}`, (err, stdout, stderr) => {
      if (err) {
        console.error('stop process error', err);
        return fulfill(err);
      }
      return fulfill();
    });

  });
};

/**
 * Restart docker image(stop, remove).
 * @param {string} name - The docker image name.
 */
const restartImage = async ({port, host, name, logLevel}) => {
  try {
    if (!Object.keys(tails).length) return true;
    await stopImage(name);
    return await rmImage(name);
  } catch (e) {
    throw e;
  }
};

io.on('connection', (socket) => {
  console.log(`client connected ${socket.client.id}`);
  socket.on('tail', (data) => {
    console.log("Event tail. params:", data)
    socket.join(data.service);
    restartImage({name: data.service})
      .then(() => {
        tails[data.service] = spawn('docker', ['run', '--name', data.service, '-p', '8545:8545', '-p', '13001:30303', 'pegasyseng/pantheon:latest', '--rpc-enabled', '--rpc-cors-origins "all"',`--logging=${data.logLevel}`],
          {
            shell: true
          });
        let serviceName = data.service;
        tails[data.service].stdout.on('data', (data) => {
          console.log(`got new data ${data.toString()}`);

          io.to(serviceName).emit('newLine', {
            line: data.toString(),
            parsed: data.toString().split('|').map(str => str.trim())
          });
        });
      })
      .catch(err => {
        console.error('restart image error', err)
      });
  });

  /**
   * Stop docker image.
   * @param {string} service - The docker image name.
   */
  socket.on('tail_stop', (data) => {
    restartImage({name: data.service})
      .then(() => {
        console.log('logs stopped');
      })
      .catch(err => {
        console.error('restart image error', err)
      });
  });

  /**
   * Get machine info via WS.
   */
  socket.on('info', (data, cb) => {
    const infoHelper = new helpers.infoHepler();
    infoHelper
      .getMachineInfo()
      .then(response => {
        cb(response)
      })
      .catch(error => {
        cb(error)
      });
  });
});

// Bind to a port
server.listen(3005, () => {
  console.log('running on localhost:' + 3005);
});