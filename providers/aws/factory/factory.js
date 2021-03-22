const AbstractFactory = require('../../../core/abstractFactory');
const coreCdk = require("@aws-cdk/core");
const CONSTRUCT_STRUCT = "Constructs";
const symbols = require('../../../core/syntax/symbols');
const Pool = require("../../../core/pool");
const utils = require("../../../core/utils");

class Factory extends AbstractFactory{
  constructor(structs) {
    super(structs);
  }
  
  /**
   *
   * @param struct
   * @param className
   * @param args => Param for use NEW and create object
   */
  
  create(struct, className, ...args) {
    if(!this.structs.hasOwnProperty(struct)){
      throw Error("Struct not exist")
    }
    let isConstruct = true;
    if(struct !== CONSTRUCT_STRUCT){
      //Some object can be created withoud stack and id (for example SnsEmailSubscription or EventResources
      //this part manage this particular object so in the "type" field I can call directly Classes and not Constructor
      //es. AWS->Classes->SqsEventResource => new SqsEventResources(queueObject) => NOT {queue: queueObject}
      args = args.slice(2); // remove stackObject and ID
      isConstruct = false;
      const paramsConstructor = [];
      args.forEach((arg) => {
        if(utils.isDict(arg)){
          Object.keys(arg).forEach((objectKey) => {
            arg = arg[objectKey]
          })
        }
        paramsConstructor.push(arg);
      });
      args = paramsConstructor;
    }
    const instance = new this.structs[struct][className](...args);
    if(instance.node !== undefined && isConstruct === true){
      if(instance.node.findChild("Resource").hasOwnProperty("logicalId")){
        const logicalId = instance.node.findChild("Resource").logicalId;
        new coreCdk.CfnOutput(args[0], args[1] + "output", {
          value: logicalId
        });
      }
    }
    return instance;
  }
  
  /**
   * Questo metodo serve per gestire le constructProps. Recupera l'oggetto assocciato andandolo ad interpretare con la libreria corretta
   *
   * @param prop
   * @param providerKey
   * @returns ConstructPropsObject
   */
  getConstructorProperty(prop, providerKey){
    const propArray = prop.split(symbols.OBJECT);
    const propProviderKey = propArray.shift();
    if(propProviderKey !== providerKey){
      // Se il Construct ha provider diverso dal provider della Classes butto errore
      // se chiamo AWS->Constructs->LambdaFunction, non posso avere come constructProps Azure->ciccio->caio ma sempre un AWS->qualcosa
      // ho comunque inserito la logica per la gestione di provider diversi nelle structs.. vedere se ha senso (basta inserire nel pool di provider
      // il nuovo provider
      throw Error("You can't provide different providers for constructor params!")
    }
    const propProvider = Pool.releaseProvider(propProviderKey);
    const propStruct = propArray.shift();
    let propClass = propArray.pop();
    if(!propClass.includes(symbols.METHOD)){
      throw Error("You can provide only static method in constructProps!")
    }
    let propClassArray = propClass.split(symbols.METHOD);
    propClass = propClassArray.shift();
    let propMethod = propClassArray.pop();
    let propMethodArray = propMethod.split(symbols.PARAM);
    propMethod = propMethodArray.shift();
    let propMethodArgs = [];
    if(propMethodArray.length > 0) {
      propMethodArgs = propMethodArray.pop().split(symbols.PARAM_DIVISOR);
      return propProvider.factory.createFromStaticMethod(propStruct, propClass, propMethod, ...propMethodArgs) // STATIC METHOD CASE
    }
    return propProvider.factory.createFromStaticMethod(propStruct, propClass, propMethod) // ENUM CASE
  }
  
  createFromStaticMethod(propStruct, propClass, propMethod, ...propMethodArgs){
    if(propMethodArgs.length === 0){
      //Here you probably call class properties, such as Enums ad other stuff
      return this.structs[propStruct][propClass][propMethod]
    }
    return this.structs[propStruct][propClass][propMethod](...propMethodArgs)
  }
  
  retrieveProps() {
    super.retrieveProps();
  }
}

module.exports = Factory;
