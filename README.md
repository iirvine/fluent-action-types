fluent-action-types
===================

Declarative API for building namespaced "action type" enumerations for flux applications.

[Flux](https://github.com/facebook/flux) applications use a central dispatcher to pump application events and new data to datastores. These actions are simply objects that have a 'type' property and some new data. 

```js
var AppConstants = require('./AppConstants');
var Dispatcher = require('./Dispatcher');

Dispatcher.dispatch({
	type: AppConstants.SOME_ACTION,
	data: "new data"
});
```

Managing the set of possible action types is fairly simple for basic applications - the original flux examples just use a single application-wide [constants file](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/constants/ChatConstants.js), something like this:

*constants/AppConstants.js*
```js
var keyMirror = require('keymirror');

module.exports = {
	users: keyMirror({
		'SOME_ACTION',
		'SOME_OTHER_ACTION',
		'YET_ANOTHER_ACTION'
	}),

	api: keyMirror({
		'SOME_API_ACTION',
		'ANOTHER_API_ACTION'
	})
}
```

Larger apps might want for something a little more robust. This package provides a simple DSL to build dictionaries of namespaced action type strings. These objects can be passed around your app and safely merged together, since the datastructures used behind the scenes guard against collisions. This allows you to split that single application wide constants file across module boundaries:

*App/TypeMap.js*
```js
var {ActionNamespace} = require('fluent-action-types');

module.exports = new ActionNamespace('MyApp');
```

*Users/ActionTypes.js*
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
produces object:
	{
		SOME_ACTION: 'MyApp:users:SOME_ACTION',
		SOME_OTHER_ACTION: 'MyApp:users:SOME_OTHER_ACTION'
	}
*/

```

*API/ActionTypes.js*
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
produces object:
	{
		SOME_ACTION: 'MyApp:api:SOME_ACTION',
		SOME_OTHER_ACTION: 'MyApp:api:SOME_OTHER_ACTION'
	}
*/
```