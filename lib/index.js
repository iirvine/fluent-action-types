"use strict";

var DSL = require("./DSL");

module.exports = function ActionTypes(namespace, fn) {
  return DSL(namespace, fn);
};

module.exports.ActionNamespace = require("./ActionNamespace");