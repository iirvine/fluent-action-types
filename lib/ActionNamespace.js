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
      !this.actions.has(action),
      `Action ${action} already exists in namespace ${this.get('name')}.`);

    invariant(
      !this.namespaces.has(action),
      `Key collision: Namespace ${this.get('name')} contains child namespace with action key ${action}.`);
    
    return this.set('actions', this.actions.add(action));
  }

  addNamespace(namespace) {
    invariant(
      !this.namespaces.has(namespace.get('name')),
      `Namespace ${namespace.get('name')} already exists in parent namespace ${this.get('name')}`);

    return this.set('namespaces', 
      this.namespaces.set(
        namespace.get('name'), 
        namespace.set('parent', this))
      );
  }

  getNamespace(name) {
    return this.namespaces.get(name);
  }

  get prefix() {
    return this.hasParent() ?
      `${this.get('parent').prefix}:${this.get('name')}` :
      this.get('name');
  }

  hasParent() {
    return this.get('parent') !== null;
  }

  build() {
    return mergeAll(
      buildActions(this.get('actions'), this.prefix),
      buildNamespaces(this.get('namespaces'))
    )
  }
}

function buildActions(actions, prefix) {
  return actions.reduce((reduction, value) => {
    reduction[value] = `${prefix}:${value}`;
    return reduction;
  }, {})
}

function buildNamespaces(namespaces) {
  return namespaces.reduce((reduction, namespace) => {
    reduction[namespace.get('name')] = namespace.build();
    return reduction;
  }, {})
}

function mergeAll(...objects) {
  var result = {};
  for (var obj of objects) {
    result = assign(result, obj);
  }
  return result;
}

module.exports = ActionNamespace