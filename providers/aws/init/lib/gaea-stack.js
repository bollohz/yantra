const cdk = require('@aws-cdk/core');
const utils = require("../../../../core/utils");
const symbols = require('../../../../core/syntax/symbols');
const Provider = require("../../../../core/provider");
const Pool = require("../../../../core/pool");

class GaeaStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    const resources = utils.getStackResoruces();
    resources.forEach((resource) => {
      //Factorize
      if(!resource.hasOwnProperty("type")){
        throw Error("Type is a mandatory field")
      }
      if(resource.type.toString().includes(symbols.OBJECT)){
        const classArray = resource.type.split(symbols.OBJECT);
        const providerKey = classArray.shift();
        const provider = new Provider(providerKey);
        Pool.acquireProvider(providerKey, provider);
        props = {};
        if(resource.hasOwnProperty("constructProps")){
          if(resource.hasOwnProperty("optionalProps")){
            //retrive optionalProps -> se ci sono optionalProps, le inserisco come proprerty del costruttore cosi da riutilizzare la stessa logica!
            Object.keys(resource.optionalProps).forEach((optionaPropKey) => {
              resource.constructProps[optionaPropKey] = resource.optionalProps[optionaPropKey];
            })
          }
          Object.keys(resource.constructProps).forEach((propKey) => {
            props[propKey] = resource.constructProps[propKey];
            if(typeof resource.constructProps[propKey] === "string" && resource.constructProps[propKey].includes(symbols.OBJECT)){
              //"AWS->Classes->lambdaCode=>fromInline::'()=>{}'",
              props[propKey] = provider.factory.getConstructorProperty(resource.constructProps[propKey], providerKey);
            } else if (typeof resource.constructProps[propKey] === "string" && Pool.contains(resource.constructProps[propKey])){
              // retrive object from objectPool if is directly a string
              props[propKey] = Pool.release(resource.constructProps[propKey]);
            } else if (Array.isArray(resource.constructProps[propKey])){
              // case when a parameter is an array / array of object
              resource.constructProps[propKey].forEach((val, key) => {
                if(Pool.contains(val)){
                  resource.constructProps[propKey][key] = Pool.release(val);
                } else if (resource.constructProps[propKey][key].includes(symbols.OBJECT)){
                  resource.constructProps[propKey][key] = provider.factory.getConstructorProperty(resource.constructProps[propKey][key], providerKey);
                }
              });
            }
          });
        }
        const struct = classArray.shift().toString();
        const className = classArray.pop().toString();
        const instance = provider.factory.create(struct, className, this, resource.id, props);
        Pool.acquire(resource.id, instance);
      }
      //END FACTORIZE
      // Method apply
    });
  }
}

module.exports = { GaeaStack };
