var ActionNamespace = require('./ActionNamespace');

function DSL(name, fn) {
  var namespace = new ActionNamespace({name: name});

  var dsl = function() {};

  dsl.actions = function(...actions) {
    for (var action of actions) {
      namespace = namespace.addAction(action);
    }
  }

  dsl.namespace = function(name, fn) {
     namespace = namespace.addNamespace(DSL(name, fn));
  }

  fn.call(dsl);
  return namespace;
}

module.exports = DSL;