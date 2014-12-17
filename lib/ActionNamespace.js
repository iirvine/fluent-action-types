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

class ActionNamespace {
  constructor(name, parent) {
    this.name = name;
    this._parent = parent;
    this._actions = new Set();
    this._namespaces = new Map();
  }

  putAction(action) {
    invariant(
      !this._actions.has(action),
      `Action ${action} already exists in namespace ${this.name}`
    );

    this._actions.add(action);
  }

  putNamespace(hash, name) {
    // support adding namespace hashes with __namespace__ key
    if (!name) {
      invariant(
        hash['__namespace__'],
        'ActionNamespace.putNamespace(...): missing namespace identifier.' +
        'This function must either be called with a namespace string as the second argument, ' + 
        'or object supplied must have "__namespace__" key.'
      );
      name = hash['__namespace__'];
    }

    invariant(
      !this._namespaces.has(name),
      `Namespace '${name}' already exists in parent namespace '${this.name}'.`
    )

    this._namespaces.set(name, new ActionNamespace(name, this));
    
    var ns = this._namespaces.get(name);
    for (var key in hash) {
      if (key === "__namespace__") { continue; }
      
      if (typeof hash[key] === 'string') {
        ns.putAction(key);
      }
      else {
        ns.putNamespace(hash[key], key);
      }
    }

    return this.getNamespace(name).build();
  }

  getNamespace(namespace) {
    invariant(
      this._namespaces.has(namespace),
      `Namespace ${namespace} does not exist in parent namespace ${this.name}.`
    );

    return this._namespaces.get(namespace);
  }
  
  generateFullName(name) {
    return this.hasParent() ? 
      this._parent.generateFullName(`${this.name}:${name}`) :
      `${this.name}:${name}`
  }

  hasParent() {
    return this._parent !== undefined;
  }

  _buildActions() {
    var hash = {};
    this._actions.forEach((action) => {
      hash[action] = this.generateFullName(action);
    });
    return hash;
  }

  _buildNamespaces() {
    var hash = {};
    this._namespaces.forEach((namespace) => {
      hash[namespace.name] = namespace.build();
    });
    return hash;
  }

  build() {
    return mergeAll(
      {__namespace__: this.name},
      this._buildActions(),
      this._buildNamespaces()
    )
  }
}

module.exports = ActionNamespace;