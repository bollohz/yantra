class Pool {
  constructor() {
    this.pool = [];
    this.providers = [];
    this.poolOutputId = [];
  }
  
  acquire(resourceId, instance){
    this.pool.push({
      id: resourceId,
      instance: instance
    });
    return this;
  }
  
  contains(resourceId){
    return this.pool.some((resource) => resource.id === resourceId);
  }
  
  release(resourceId){
    return this.pool.find((resource) => resource.id === resourceId).instance;
  }
  
  acquireProvider(providerId, providerInstance){
    const proviousProvider = this.providers.find((provider) => provider.id === providerId);
    if(proviousProvider){
      this.providers[providerId] = providerInstance;
      return this;
    }
    this.providers.push({
      id: providerId,
      instance: providerInstance
    });
    return this;
  }
  
  releaseProvider(providerId){
    const provider = this.providers.find((provider) => provider.id === providerId);
    if(provider === undefined || provider === false){
      return false;
    }
    return provider.instance;
  }
  
  releaseAllProvider(){
    return this.providers;
  }
}

module.exports = new Pool();
