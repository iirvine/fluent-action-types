var ESMap = require('es6-map');
var ESSet = require('es6-set');
var merge = require('object.assign');
var invariant = require('invariant');

function mergeAll(...args) {
  var result = {};
  for (var obj of args) {
    result = merge(result, obj);
  }
  return result;
}

function buildActions(actions, nameFn) {
  var result = {};
  for (var action of actions) {
    result[action] = nameFn(action);
  }
  return result;
}

function buildNamespaces(namespaces) {
  var result = {};
  for (var namespace of namespaces.values()) {
    result[namespace.getName()] = namespace.toJS();
  }
  return result;
}

function ActionNamespace(name, parent) {
  var actions = new Set();
  var namespaces = new Map();

  class Namespace {
    static fromJS(name, parent, hash) {
      var ns = ActionNamespace(name, parent);
      
      for (var key in hash) {
        if (key === "__namespace__") { continue; }
        
        if (typeof hash[key] === 'string') {
          ns.putAction(key);
        }
        else {
          ns.putNamespace(hash[key], key);
        }
      }

      return ns;
    }

    getName() {
      return name;
    }

    putAction(action) {
      invariant(
        !actions.has(action),
        `Action ${action} already exists in namespace ${this.getName()}.`);

      actions.add(action);
    }

    putNamespace(hash, namespace) {
      // support adding namespace hashes with __namespace__ key
      if (!namespace) {
        invariant(
          hash['__namespace__'],
          'ActionNamespace.putNamespace(...): missing namespace identifier.' +
          'This function must either be called with a namespace string as the second argument, ' + 
          'or object supplied must have "__namespace__" key.');
        
        namespace = hash['__namespace__'];
      }

      invariant(
        !namespaces.has(namespace),
        `Namespace '${namespace}' already exists in parent namespace '${this.getName()}'.`
      )

      namespaces.set(
        namespace,
        Namespace.fromJS(namespace, this, hash)
      );

      return this.getNamespace(namespace).toJS();
    }

    getNamespace(namespace) {
      invariant(
        namespaces.has(namespace),
        `Namespace ${namespace} does not exist in parent namespace ${this.getName()}.`);

      return namespaces.get(namespace);
    }

    generateFullName(action) {
      return this.hasParent() ? 
        parent.generateFullName(`${this.getName()}:${action}`) :
        `${this.getName()}:${action}`
    }

    hasParent() {
      return parent !== undefined;
    }

    toJS() {
      return mergeAll(
        {__namespace__: this.getName() },
        buildActions(actions, this.generateFullName.bind(this)),
        buildNamespaces(namespaces)
      );
    }
  }

  return new Namespace();
}

module.exports = ActionNamespace;