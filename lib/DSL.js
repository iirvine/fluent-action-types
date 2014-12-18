var ActionNamespace = require('./ActionNamespace');

function DSL(name, fn) {
  var typeMap = new ActionNamespace({name: name});

  var dsl = function() {};

  dsl.actions = function(...actions) {
    for (var action of actions) {
      typeMap = typeMap.addAction(action);
    }
  }

  dsl.namespace = function(name, fn) {
     typeMap = typeMap.addNamespace(DSL(name, fn));
  }

  fn.call(dsl);
  return typeMap;
}

module.exports = DSL;