var DSL = require('./lib/DSL');

module.exports = function ActionTypes(namespace, fn) {
  return new DSL(namespace, fn).generate();
}

module.exports.ActionNamespace = require('./lib/ActionNamespace');