const { exec, spawn } = require('child_process');
const fs = require('fs');

const LOGS_LEVEL = ['OFF', 'FATAL', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'ALL'];

const outL = fs.openSync('./out.log', 'a');
const errL = fs.openSync('./out.log', 'a');


const stopImage = async (name) => {
 return new Promise((fulfill, reject) => {
   exec(`docker stop ${name}`, (err, stdout, stderr) => {
     if (err) {
       console.error('stop process error',err);
       return reject(err);
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
        return reject(err);
      }
      return fulfill();
    });

  });
};

const startImage = async ({port, host, name, logLevel}) => {
  return new Promise((fulfill, reject) => {
    /*const subprocess = spawn(`sudo docker run --name "${name}" -p ${port}:${port} -p 13001:30303 pegasyseng/pantheon:latest --rpc-enabled --logging=${logLevel} `, [], {
      detached: true,
      stdio: [ 'ignore', outL, errL]
    });
  return subprocess;*/

    console.log(`sudo docker run --name "${name}" -p ${port}:${port} -p 13001:30303 pegasyseng/pantheon:latest --rpc-enabled --logging=${logLevel} `)
    exec(`sudo docker run --name "${name}" -p ${port}:${port} -p 13001:30303 pegasyseng/pantheon:latest --rpc-enabled --logging=${logLevel} `, (err, stdout, stderr) => {
      if (err) {
        console.error('stop process error',err);
        return reject(err);
      }
      return fulfill();
    });
  });
};

const restartImage = async ({port, host, name, logLevel}) => {
  try{
    await stopImage(name);
    await rmImage(name);
    return await startImage({host, port, name, LE});
  }catch (e) {
    throw e;
  }
};


/*startImage({
  port: 8545,
  host: '',
  name: 'pegasuseng',
  logLevel: LOGS_LEVEL[6]
})
  .then(console.log)
  .catch(console.error);*/

/*spawn(`docker run`, ['--name "test"', '-p 8545:8545', '-p 13001:30303', 'pegasyseng/pantheon:latest', '--rpc-enabled', '--logging=ALL'], {
  stdio: 'inherit'
});*/

//docker stop $(docker ps -a -q --filter ancestor=pegasyseng/pantheon:latest --format="{{.ID}}"\

/*
* docker rm $(docker stop $(docker ps -a -q --filter ancestor=pegasyseng/pantheon:latest --format="{{.ID}}"))
* */

//const { spawn } = require('child_process');
const ls = spawn('docker', ['run', '--name', 'test',  '-p', '8545:8545', '-p', '13001:30303', 'pegasyseng/pantheon:latest', '--rpc-enabled', '--logging=ALL' ]);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
