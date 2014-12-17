var DSL = require('./lib/DSL');

module.exports = function ActionTypes(namespace, fn) {
  return DSL(namespace, fn);
}

module.exports.ActionNamespace = require('./lib/ActionNamespace');