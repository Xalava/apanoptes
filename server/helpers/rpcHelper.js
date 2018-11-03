const requestify = require('requestify');

class RpcHelper {
  constructor() {
  }

  async checkStatus({ip, port}) {
    try{
      return await this.makeRpcRequest({
        ip,port, method: "net_listening"
      })
    }catch (e) {
      console.log(e)
      throw e;
    }

  }

  async makeRpcRequest({ip, port, method, params = []}) {
    try{
      if(!ip || !port) throw {error: true, message: "BAD_DATA", code: 400};
      let response = await requestify.request(`http://${ip}:${port}`, {
        method: "POST",
        body:{
          "jsonrpc":"2.0","method":method,"params":params, "id": "1"
        },
        dataType: 'json'
      });
      return {status: 'success',ip, port};
    }catch (e) {
      console.log('error', e);
      return {
        status: 'error',ip,port
      }
    }
  }
};

module.exports = RpcHelper;