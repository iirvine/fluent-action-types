var invariant = require('invariant');
var assign = require('object.assign');
var {Record, Map, Set} = require('immutable');

var Namespace = Record({
  name: '',
  parent: null,
  namespaces: Map(),
  actions: Set()
});

class ActionNamespace extends Namespace {
  addAction(action) {
    invariant(
      !this.namespaces.has(action),
      `Key collision: Namespace ${this.get('name')} contains child namespace with desired action key ${action}.`);
    
    return this.set('actions', this.actions.add(action));
  }

  addNamespace(namespace) {
    invariant(
      !this.namespaces.has(namespace.get('name')),
      `Namespace ${namespace.get('name')} already exists in parent namespace ${this.get('name')}`);

    invariant(
      !this.actions.has(namespace),
      `Key collision: Namespace ${this.get('name')} contains action with desired namespace key ${namespace.get('name')}`);
 
    namespace = namespace.set('parent', this);
    
    if (namespace.get('namespaces').size) {
      namespace = reparentChildren(namespace);
    }

    return this.set('namespaces', 
      this.namespaces.set(
        namespace.get('name'), 
        namespace)
      );
  }

  getNamespace(name) {
    invariant(
      this.namespaces.has(name),
      `Namespace ${name} does not exist in parent namespace ${this.get('name')}`);
    
    return this.namespaces.get(name);
  }

  get prefix() {
    if (this.hasParent() && this.get('parent').isTopLevel()) {
      return this.get('name');
    } 

    if (this.hasParent()) {
      return `${this.get('parent').prefix}:${this.get('name')}`;
    }

    // prefix travels up to but does not include the top-level namespace
    return null;
  }

  isTopLevel() {
    return !this.hasParent();
  }

  hasParent() {
    return this.get('parent') !== null;
  }

  build() {
    return assign(
      buildActions(this.get('actions'), this.prefix),
      buildNamespaces(this.get('namespaces'))
    );
  }
}

function reparentChildren(namespace) {
  return namespace.update('namespaces', (namespaces) => {    
    return namespaces.map((child) => {
      return child.set('parent', namespace)
    });
  });
}

function buildActions(actions, prefix) {
  return actions.reduce((reduction, value) => {
    reduction[value] = prefix ? `${prefix}:${value}` : value
    return reduction;
  }, {})
}

function buildNamespaces(namespaces) {
  return namespaces.reduce((reduction, namespace) => {
    reduction[namespace.get('name')] = namespace.build();
    return reduction;
  }, {})
}

module.exports = ActionNamespace