fluent-action-types
===================

Declarative API for building namespaced "ActionType" objects for flux applications.

*users/ActionTypes.js*
```js
var ActionTypes = require('fluent-action-types');

var UserActionTypes = ActionTypes('users', function() {
	this.actions(
		'FETCH_USER',
		'FETCH_ALL_USERS',
	);

	this.namespace('server', function() {
		this.actions(
			'RECEIVE_USER',
			'RECEIVE_ALL_USERS'
		);
	});
});
```

You can then serialize this object with `UserActionTypes.build()`. This produces an object that looks like this:
```js
{
	FETCH_USER: 'FETCH_USER',
	FETCH_ALL_USERS: 'FETCH_ALL_USERS',
	server: {
		RECEIVE_USER: 'server:RECEIVE_USER'
		RECEIVE_ALL_USERS: 'server:RECEIVE_ALL_USERS'
	}
}
```

ActionNamespaces are immutable and can be safely merged. When a child namespace is added to a parent, the `build()` operation will ensure action type strings are unique across the top level namespace.

```js
var {ActionNamespace} = require('fluent-action-types');
var Namespace = new ActionNamespace({name: 'MyApp'});

var UserActions = require('./users/ActionTypes');

Namespace = Namespace.addNamespace(UserActions);
UserActions = Namespace.getNamespace('users');
UserActions.build();
```

Produces: 

```js
{
	FETCH_USER: 'users:FETCH_USER',
	FETCH_ALL_USERS: 'users:FETCH_ALL_USERS',
	server: {
		RECEIVE_USER: 'users:server:RECEIVE_USER',
		RECEIVE_ALL_USERS: 'users:server:RECEIVE_ALL_USERS'
	}
}
```

...which you can then use with your favorite flux library's stores and action creators to represent your different action types - say, perhaps, [fluent-flux](https://github.com/iirvine/fluent-flux)?

##Why?

[Flux](https://github.com/facebook/flux) applications use a central dispatcher to pump application events and new data to datastores. Flux calls these events "actions" - an action is simply an object that has a 'type' property and some new data. 

```js
var {ActionTypes} = require('./AppConstants');
var Dispatcher = require('./Dispatcher');

Dispatcher.dispatch({
	type: ActionTypes.users.SOME_ACTION,
	data: "new data"
});
```

Managing the set of possible action types is fairly simple for basic applications - the original flux examples just use a single application-wide [constants file](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/constants/ChatConstants.js), something like this:

*constants/AppConstants.js*
```js
module.exports = {
	ActionTypes: {
		users: {
			'SOME_ACTION': 'SOME_ACTION'
			'SOME_OTHER_ACTION': 'SOME_OTHER_ACTION'
			'YET_ANOTHER_ACTION': 'YET_ANOTHER_ACTION'
		},

		api: {
			'SOME_API_ACTION': 'SOME_API_ACTION'
			'ANOTHER_API_ACTION': 'ANOTHER_API_ACTION'
		}
	}
}
```

Larger apps might want for something a little more robust. This package provides a simple DSL to build immutable maps of namespaced strings to represent different action types in your application.

These objects can be passed around your app and safely merged together, since the datastructures used behind the scenes guard against collisions. This allows you to split that single application wide constants file across module boundaries, and then merge each module's ActionTypes together into a single datastructure, without having to worry about different modules clobbering each other's action types or namespaces:

*app/TypeMap.js*
```js
//A centralized, singleton namespace representing all of your application's action types
var {ActionNamespace} = require('fluent-action-types');

class App {
	constructor() {
		this.actions = new ActionNamespace({name:'MyApp'})
	}

	addActions(namespace) {
		this.actions = this.actions.addNamespace(namespace);
		return this.actions.get(namespace.get('name'))
	}
} 

module.exports = new App();
```

*users/ActionTypes.js*
```js
var ActionTypes = require('fluent-action-types');
var App = require('../app')

module.exports = App.addActions(
	ActionTypes('users', function() {
		this.actions(
			'SOME_ACTION',
			'SOME_OTHER_ACTION',
			'YET_ANOTHER_ACTION'
		);
	})
);
```

*api/ActionTypes.js*
```js
var ActionTypes = require('fluent-action-types');
var App = require('../app');

module.exports = App.addActions(
	ActionTypes('api', function() {
		this.actions(
			'SOME_ACTION',
			'SOME_OTHER_ACTION'
		);
	})
);
```

##API

###`ActionTypes(name, callback)`: 

The main export of this package is a function you can call with a namespace string and a callback function. 

###`this.actions(...actionStrings)`:

Inside the callback to `ActionTypes`, you can call `this.actions(...actions)` to declare a set of action types in the current namespace. All action strings within the same namespace must be unique.

###`this.namespace(name, callback)`:

Creates a nested namespace within an `ActionTypes` callback. Namespace identifiers at the same hierarchy level must be unique.

###`ActionNamespace({name})`

An ActionNamespace represents a set of unique action types, and can optionally include child namespaces. It is immutable, meaning that operations that would alter the namespace return a new datastructure representing the new state.

###`Namespace#addAction(name)`

Adds an action of type `name` to the namespace. Returns a new `ActionNamespace`.

###`Namespace#addNamespace(namespace)`

Adds a namespace as a child of this namespace, if the parent namespace does not already contain a child of the same name. Returns a new `ActionNamespace`.

###`Namespace#build()`

Serializes the namespace to a JavaScript object.