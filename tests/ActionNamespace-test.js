var ActionNamespace = require('../src/ActionNamespace');
var ActionTypes = require('../src/index');

describe('ActionNamespace', () => {
  var Namespace;
  beforeEach(() => {
    Namespace = new ActionNamespace({name: 'MyApp'});
  })

  it('can add actions', () => {
    Namespace = Namespace.addAction('test');
    
    expect(Namespace.build())
      .to.deep.equal({
        test: 'test'
      });
  })

  it('works with ActionTypes', () => {
    Namespace = Namespace.addNamespace(
      ActionTypes('ns', function() {
        this.actions('test')
      })
    );

    expect(Namespace.getNamespace('ns').build())
      .to.deep.eql({
        test: 'ns:test'
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
        test: 'ns:test'
      },
      otherns: {
        test: 'otherns:test'
      }
    });
  })

  it('throws on namespace collisions', () => {
    Namespace = Namespace.addNamespace(
      ActionTypes('ns', function() {
        this.actions('ACTION');
      })
    )

    expect(() => {
      Namespace.addNamespace(
        ActionTypes('ns', function() {
          this.actions('OTHER_ACTION')
        })
      )
    }).to.throw(Error);
  })

  it('throws if trying to access a nonexistant namespace', () => {
    expect(() => {
      Namespace.getNamespace('not_there')
    }).to.throw(Error);
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
        testOne: 'nsOne:testOne',
        moduleOne: {
          testTwo: 'nsOne:moduleOne:testTwo'
        }
      },

      nsTwo: {
        testOne: 'nsTwo:testOne',
        moduleTwo: {
          testTwo: 'nsTwo:moduleTwo:testTwo'
        }
      }
    });

    expect(Namespace.getNamespace('nsOne').build()).to.deep.eql({
      testOne: 'nsOne:testOne',
      moduleOne: {
        testTwo: 'nsOne:moduleOne:testTwo'
      }
    });

    expect(Namespace.getNamespace('nsTwo').build()).to.deep.eql({
      testOne: 'nsTwo:testOne',
      moduleTwo: {
        testTwo: 'nsTwo:moduleTwo:testTwo'
      }
    });
    
  })

})