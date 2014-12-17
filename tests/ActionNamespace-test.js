var ActionNamespace = require('../lib/ActionNamespace');
var ActionTypes = require('../index');

describe('ActionNamespace', () => {
  var TypeMap;
  beforeEach(() => {
    TypeMap = ActionNamespace('MyApp');
  })

  it('can add actions', () => {
    TypeMap.putAction('test');
    
    expect(TypeMap.toJS()).to.deep.equal({
      __namespace__: 'MyApp',
      test: 'MyApp:test'
    });
  })

  it('can add namespace hashes', () => {
    var ns = TypeMap.putNamespace({
      __namespace__: 'ns',
      test: 'ns:test'
    });

    expect(ns).to.deep.eql({
      __namespace__: 'ns',
      test: 'MyApp:ns:test'
    });
  })

  it('throws on action name collisions', () => {
    TypeMap.putAction('action');
    expect(function() {
      TypeMap.putAction('action')
    }).to.throw(Error);
  })

  it('throws on namespace collisions', () => {
    TypeMap.putNamespace({action: 'some_action'}, 'ns');
    expect(function() {
      TypeMap.putNamespace({action: 'some_other_action'}, 'ns');
    }).to.throw(Error)
  })

  it('works with ActionTypes', () => {
    var ns = TypeMap.putNamespace(
      ActionTypes('ns', function() {
        this.actions('test')
      })
    );

    expect(ns).to.deep.eql({
      __namespace__: 'ns',
      test: 'MyApp:ns:test'
    });
  })

  it('can add multiple namespaces', () => {
    TypeMap.putNamespace(
      ActionTypes('ns', function() {
        this.actions('test')
      })
    );

    TypeMap.putNamespace(
      ActionTypes('otherns', function() {
        this.actions('test')
      })
    );

    expect(TypeMap.toJS()).to.deep.eql({
      __namespace__: 'MyApp',
      ns: {
        __namespace__: 'ns',
        test: 'MyApp:ns:test'
      },
      otherns: {
        __namespace__: 'otherns',
        test: 'MyApp:otherns:test'
      }
    });
  })

  it('can add nested namespaces', () => {
    TypeMap.putNamespace(
      ActionTypes('nsOne', function() {
        this.actions('testOne')
        this.namespace('moduleOne', function() {
          this.actions('testTwo')
        })
      })
    );

    TypeMap.putNamespace(
      ActionTypes('nsTwo', function() {
        this.actions('testOne')
        this.namespace('moduleTwo', function() {
          this.actions('testTwo')
        })
      })
    );

    expect(TypeMap.toJS()).to.deep.eql({
      __namespace__: 'MyApp',
      nsOne: {
        __namespace__: 'nsOne',
        testOne: 'MyApp:nsOne:testOne',
        moduleOne: {
          __namespace__: 'moduleOne',
          testTwo: 'MyApp:nsOne:moduleOne:testTwo'
        }
      },

      nsTwo: {
        __namespace__: 'nsTwo',
        testOne: 'MyApp:nsTwo:testOne',
        moduleTwo: {
          __namespace__: 'moduleTwo',
          testTwo: 'MyApp:nsTwo:moduleTwo:testTwo'
        }
      }
    })
  })
})