"use strict";

var _slice = Array.prototype.slice;
var ActionNamespace = require("./ActionNamespace");

function DSL(name, fn) {
  var namespace = new ActionNamespace({ name: name });

  var dsl = function () {};

  dsl.actions = function () {
    var actions = _slice.call(arguments);

    for (var _iterator = actions[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      var action = _step.value;
      namespace = namespace.addAction(action);
    }
  };

  dsl.namespace = function (name, fn) {
    namespace = namespace.addNamespace(DSL(name, fn));
  };

  fn.call(dsl);
  return namespace;
}

module.exports = DSL;