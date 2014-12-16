var ActionNamespace = require('./ActionNamespace');

class DSL {
  constructor(namespace, fn) {
    this._namespace = namespace;
    this.typeMap = new ActionNamespace(namespace);
    this.fn = fn;
  }

  actions(...actions) {
    for (var i = 0; i < actions.length; i++) {
      this.typeMap.tryPutAction(actions[i]);
    }
  }

  namespace(namespace, fn) {
    this.typeMap
      .tryPutNamespace(
        namespace, 
        new DSL(namespace, fn).generate());
  }

  generate() {
    this.fn.call(this);
    return this.typeMap.build();
  }
}

module.exports = DSL;