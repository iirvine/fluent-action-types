var ActionTypes = require('../index');

describe('ActionTypes', () => {
  it('builds simple objects', () => {
    var MyActionTypes = ActionTypes('test', function() {
      this.actions('one', 'two');
    });

    expect(MyActionTypes).to.deep.equal({
      __namespace__: 'test',
      one: 'test:one',
      two: 'test:two'
    });
  })

  it('builds namespaced objects', () => {
    var MyActionTypes = ActionTypes('test', function() {
      this.actions('one')
      this.namespace('ns', function() {
        this.actions('two');
      })
    });

    expect(MyActionTypes).to.deep.equal({
      __namespace__: 'test',
      one: 'test:one',
      ns: {
        __namespace__: 'ns',
        two: 'test:ns:two'
      }
    });
  });

  it('throws on action name collisions', () => {
    expect(function() {
      ActionTypes('test', function() {
        this.actions('one');
        this.actions('one');
      })
    }).to.throw(Error);
  });

  it('throws on namespace collisions', () => {
    expect(function() {
      ActionTypes('test', function() {
        this.namespace('ns', function(){});
        this.namespace('ns', function(){});
      })
    }).to.throw(Error);
  })
})