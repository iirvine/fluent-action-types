fluent-action-types
===================

Declarative API for building namespaced "ActionType" objects for flux applications.

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

This produces an object that looks like this:
```js
{
	FETCH_USER: 'users:FETCH_USER',
	FETCH_ALL_USERS: 'users:FETCH_ALL_USERS',
	server: {
		RECEIVE_USER: 'users:server:RECEIVE_USER'
		RECEIVE_ALL_USERS: 'users:server:RECEIVE_ALL_USERS'
	}
}
```

...which you can then use with your favorite flux library's stores and action creators - say, perhaps, [fluent-flux](https://github.com/iirvine/fluent-flux)?

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

Larger apps might want for something a little more robust. This package provides a simple DSL to build dictionaries of namespaced strings to represent different action types in your application.

These objects can be passed around your app and safely merged together, since the datastructures used behind the scenes guard against collisions. This allows you to split that single application wide constants file across module boundaries, and then merge each module's ActionTypes together into a single datastructure, without having to worry about different modules clobbering each other's action types or namespaces:

*app/TypeMap.js*
```js
//A centralized, singleton namespace representing all of your application's action types
var {ActionNamespace} = require('fluent-action-types');

module.exports = new ActionNamespace('MyApp');
```

*users/ActionTypes.js*
```js
var ActionTypes = require('fluent-action-types');
var TypeMap = require('../app/TypeMap')

module.exports = TypeMap.putNamespace(
	ActionTypes('users', function() {
		this.actions(
			'SOME_ACTION',
			'SOME_OTHER_ACTION',
			'YET_ANOTHER_ACTION'
		);
	})
);

/*
returns object:
	{
		SOME_ACTION: 'MyApp:users:SOME_ACTION',
		SOME_OTHER_ACTION: 'MyApp:users:SOME_OTHER_ACTION'
	}
*/

```

*api/ActionTypes.js*
```js
var ActionTypes = require('fluent-action-types');
var TypeMap = require('../app/TypeMap');

module.exports = TypeMap.putNamespace(
	ActionTypes('api', function() {
		this.actions(
			'SOME_ACTION',
			'SOME_OTHER_ACTION'
		);
	})
);

/*
returns object:
	{
		SOME_ACTION: 'MyApp:api:SOME_ACTION',
		SOME_OTHER_ACTION: 'MyApp:api:SOME_OTHER_ACTION'
	}
*/
```

##API

*ActionTypes(name, callback)*: the main export of this package is a function you can call with a namespace string and a callback function. Inside the callback, you can call `this.actions(...actionStrings)` to declare a set of action types in the current namespace. All action strings within the same namespace must be unique.
