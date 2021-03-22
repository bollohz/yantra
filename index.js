const cdk = require('@aws-cdk/core');
const utils = require("./core/utils");
const symbols = require('./core/syntax/symbols');
const Provider = require("./core/provider");
const Pool = require("./core/pool");
const providerResourceArray = [];

async function init() {
  const resources = utils.getStackResoruces();
  resources.forEach((resource) => {
    if(!resource.hasOwnProperty("type")){
      throw Error("Type is a mandatory field")
    }
    if (!resource.type.toString().includes(symbols.OBJECT)) {
      return;
    }
    const classArray = resource.type.split(symbols.OBJECT);
    let providerKey = classArray.shift();
    if (!Provider.exist(providerKey)) {
      if (!Provider.exist(utils.getGeneralProvider())) {
        throw Error("Provided PROVIDERS does not exist or is not registered!")
      }
      providerKey = utils.getGeneralProvider()
    }
    let provider = Pool.releaseProvider(providerKey);
    if(provider === false){
     provider = new Provider(providerKey);
     Pool.acquireProvider(providerKey, provider);
    }
    provider.addResource(resource);
  });
  Pool.releaseAllProvider().forEach(provider => {
    const initializer = new provider.instance.init;
    const result =initializer.execute();
    console.log(result);
  });
}

init().then(r => console.log("Result provided...")).catch(err => console.log(err));
