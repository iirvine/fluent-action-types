var ActionNamespace = require('./ActionNamespace');

function DSL(name, fn) {
  var typeMap = new ActionNamespace(name);

  var dsl = function() {};

  dsl.actions = function(...actions) {
    for (var action of actions) {
      typeMap.putAction(action);
    }
  }

  dsl.namespace = function(name, fn) {
    typeMap.putNamespace(DSL(name, fn));
  }

  fn.call(dsl);
  return typeMap.build();
}

module.exports = DSL;