var ESMap = require('es6-map');
var ESSet = require('es6-set');
var merge = require('object.assign');
var invariant = require('invariant');

class ActionNamespace {
  constructor(name, parent) {
    this.name = name;
    this._parent = parent;
    this._actions = new Set();
    this._namespaces = new Map();
  }

  tryPutAction(action) {
    invariant(
      !this._actions.has(action),
      `Action ${action} already exists in namespace ${this.name}`
    );

    this._actions.add(action);
  }

  tryPutNamespace(namespace, hash) {
    invariant(
      !this._namespaces.has(namespace),
      `Namespace '${namespace}' already exists in parent namespace '${this.name}'.`
    )

    this._namespaces.set(namespace, new ActionNamespace(namespace, this));
    
    var ns = this._namespaces.get(namespace);
    for (var key in hash) {
      if (typeof hash[key] === 'string') 
        ns.tryPutAction(key);
      else
        ns.tryPutNamespace(key, hash[key]);
    }
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
    return merge(
      this._buildActions(),
      this._buildNamespaces()
    )
  }
}

module.exports = ActionNamespace;