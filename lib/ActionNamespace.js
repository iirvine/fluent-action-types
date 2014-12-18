"use strict";

var _slice = Array.prototype.slice;
var _classProps = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _extends = function (child, parent) {
  child.prototype = Object.create(parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  child.__proto__ = parent;
};

var invariant = require("invariant");
var assign = require("object.assign");
var _ref = require("immutable");

var Record = _ref.Record;
var Map = _ref.Map;
var Set = _ref.Set;


var Namespace = Record({
  name: "",
  parent: null,
  namespaces: Map(),
  actions: Set()
});

var ActionNamespace = (function (Namespace) {
  var ActionNamespace = function ActionNamespace() {
    Namespace.apply(this, arguments);
  };

  _extends(ActionNamespace, Namespace);

  ActionNamespace.prototype.addAction = function (action) {
    invariant(!this.namespaces.has(action), "Key collision: Namespace " + this.get("name") + " contains child namespace with desired action key " + action + ".");

    return this.set("actions", this.actions.add(action));
  };

  ActionNamespace.prototype.addNamespace = function (namespace) {
    invariant(!this.namespaces.has(namespace.get("name")), "Namespace " + namespace.get("name") + " already exists in parent namespace " + this.get("name"));

    invariant(!this.actions.has(namespace), "Key collision: Namespace " + this.get("name") + " contains action with desired namespace key " + namespace.get("name"));

    namespace = namespace.set("parent", this);

    if (namespace.get("namespaces").size) {
      namespace = reparentChildren(namespace);
    }

    return this.set("namespaces", this.namespaces.set(namespace.get("name"), namespace));
  };

  ActionNamespace.prototype.getNamespace = function (name) {
    invariant(this.namespaces.has(name), "Namespace " + name + " does not exist in parent namespace " + this.get("name"));

    return this.namespaces.get(name);
  };

  ActionNamespace.prototype.isTopLevel = function () {
    return !this.hasParent();
  };

  ActionNamespace.prototype.hasParent = function () {
    return this.get("parent") !== null;
  };

  ActionNamespace.prototype.build = function () {
    return mergeAll(buildActions(this.get("actions"), this.prefix), buildNamespaces(this.get("namespaces")));
  };

  _classProps(ActionNamespace, null, {
    prefix: {
      get: function () {
        if (this.hasParent() && this.get("parent").isTopLevel()) {
          return this.get("name");
        }

        if (this.hasParent()) {
          return "" + this.get("parent").prefix + ":" + this.get("name");
        }

        // prefix travels up to but does not include the top-level namespace
        return null;
      }
    }
  });

  return ActionNamespace;
})(Namespace);

function reparentChildren(namespace) {
  return namespace.update("namespaces", function (namespaces) {
    return namespaces.map(function (child) {
      return child.set("parent", namespace);
    });
  });
}

function buildActions(actions, prefix) {
  return actions.reduce(function (reduction, value) {
    reduction[value] = prefix ? "" + prefix + ":" + value : value;
    return reduction;
  }, {});
}

function buildNamespaces(namespaces) {
  return namespaces.reduce(function (reduction, namespace) {
    reduction[namespace.get("name")] = namespace.build();
    return reduction;
  }, {});
}

function mergeAll() {
  var objects = _slice.call(arguments);

  var result = {};
  for (var _iterator = objects[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
    var obj = _step.value;
    result = assign(result, obj);
  }

  return result;
}

module.exports = ActionNamespace;