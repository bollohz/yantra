const cdk = require('@aws-cdk/core');
const { GaeaStack } = require('./lib/gaea-stack');

class InitAws {
  
  constructor() {}
  
  execute () {
    const app = new cdk.App();
    new GaeaStack(app, 'GaeaStack');
    // console.log(cdk.stringToCloudFormation(app.synth().getStackByName("GaeaStack").template));
    return cdk.stringToCloudFormation(app.synth().getStackByName("GaeaStack").template);
  }
}

module.exports = InitAws ;
