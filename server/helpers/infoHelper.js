const os = require('os');

class InfoHelper {
  constructor() {

  }

  async getMachineInfo() {
    try {
      let arch = os.arch();
      let cpus = os.cpus();
      let hostname = os.hostname();
      let uptime = os.uptime();
      let platform = os.platform();
      let totalmem = os.totalmem();
      let freemem = os.freemem();
      let loadavg = os.loadavg();

      return {arch,cpus,hostname,uptime,platform,totalmem, freemem, loadavg}
    } catch (e) {
      throw e;
    }

  }
}

module.exports = InfoHelper;