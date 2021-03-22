
class AbstractFactory {
  constructor(structs) {
    this.structs = structs;
  }
  create(){}
  retrieveProps(){}
}

module.exports = AbstractFactory;
