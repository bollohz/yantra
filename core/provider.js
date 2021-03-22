const fs = require('fs');

class Provider {
  constructor(providerName) {
    this.resources = [];
    try{
      const providers = JSON.parse(fs.readFileSync(process.cwd() + "/providers/providers-config.json"))['providers'];
      const found = providers.find(el => el.paths.DSL === providerName);
      if(!found){
        throw Error("Provider name does not exist")
      }
      this.DSL = found.paths.DSL;
      this.structs = {};
      this.factory = {};
      const structsDir = found.paths.structs;
      found.structs.forEach((struct) => {
        this.structs[struct.name] = require(process.cwd() + "/providers/" + structsDir + "/" + struct.reference);
        if(struct.new === true) this.structs[struct.name]
      });
      const foundFactory = require(process.cwd() + "/providers/" + found.paths.factory + "/factory.js");
      this.factory = new foundFactory(this.structs);
      this.init = require(process.cwd() + "/providers/" + found.paths.init + "/init.js");
      return this;
    } catch (e) {
      console.log("Error > " + e.message);
      throw Error("Providers configuiration file is missing or malformed")
    }
  }
  
  addResource(resource){
    this.resources.push(resource);
    return this;
  }
  
  retrieveResources(){
    return this.resources;
  }
  
  static exist(providerKey){
    const providersList = JSON.parse(fs.readFileSync(process.cwd() + "/providers/providers-config.json"))['registeredProviders'];
    return providersList.includes(providerKey);
  }
}

module.exports = Provider;
