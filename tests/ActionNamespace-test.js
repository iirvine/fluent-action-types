var ActionNamespace = require('../lib/ActionNamespace');
var ActionTypes = require('../index');

describe('ActionNamespace', () => {
  var Namespace;
  beforeEach(() => {
    Namespace = new ActionNamespace({name: 'MyApp'});
  })

  it('can add actions', () => {
    Namespace = Namespace.addAction('test');
    
    expect(Namespace.build())
      .to.deep.equal({
        test: 'MyApp:test'
      });
  })

  it('throws on action name collisions', () => {
    Namespace = Namespace.addAction('action');
    expect(function() {
      Namespace.addAction('action')
    }).to.throw(Error);
  })

  // it('can add namespace hashes', () => {
  //   var ns = ActionTypes.putNamespace({
  //     test: 'ns:test'
  //   });

  //   expect(ns.build()).to.deep.eql({
  //     test: 'MyApp:ns:test'
  //   });
  // })

  // it('throws on namespace collisions', () => {
  //   ActionTypes = ActionTypes.putNamespace({action: 'some_action'}, 'ns');
  //   expect(function() {
  //     TypeMap.putNamespace({action: 'some_other_action'}, 'ns');
  //   }).to.throw(Error)
  // })

  it('works with ActionTypes', () => {
    Namespace = Namespace.addNamespace(
      ActionTypes('ns', function() {
        this.actions('test')
      })
    );

    expect(Namespace.getNamespace('ns').build())
      .to.deep.eql({
        test: 'MyApp:ns:test'
    });
  })

  it('can add multiple namespaces', () => {
    Namespace = Namespace.addNamespace(
      ActionTypes('ns', function() {
        this.actions('test')
      })
    );

    Namespace = Namespace.addNamespace(
      ActionTypes('otherns', function() {
        this.actions('test')
      })
    );

    expect(Namespace.build()).to.deep.eql({
      ns: {
        test: 'MyApp:ns:test'
      },
      otherns: {
        test: 'MyApp:otherns:test'
      }
    });
  })

  it('can add nested namespaces', () => {
    Namespace = Namespace.addNamespace(
      ActionTypes('nsOne', function() {
        this.actions('testOne')
        this.namespace('moduleOne', function() {
          this.actions('testTwo')
        })
      })
    );

    Namespace = Namespace.addNamespace(
      ActionTypes('nsTwo', function() {
        this.actions('testOne')
        this.namespace('moduleTwo', function() {
          this.actions('testTwo')
        })
      })
    );

    expect(Namespace.build()).to.deep.eql({
      nsOne: {
        testOne: 'MyApp:nsOne:testOne',
        moduleOne: {
          testTwo: 'nsOne:moduleOne:testTwo'
        }
      },

      nsTwo: {
        testOne: 'MyApp:nsTwo:testOne',
        moduleTwo: {
          testTwo: 'nsTwo:moduleTwo:testTwo'
        }
      }
    })
  })

})