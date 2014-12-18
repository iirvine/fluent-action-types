var ActionTypes = require('../index');

describe('ActionTypes', () => {
  it('builds simple objects', () => {
    var MyActionTypes = ActionTypes('test', function() {
      this.actions('one', 'two');
    });

    expect(MyActionTypes.build())
      .to.deep.equal({
        one: 'test:one',
        two: 'test:two'
    });
  })

  it('builds namespaced objects', () => {
    var MyActionTypes = ActionTypes('test', function() {
      this.actions('ACTION')
      this.namespace('ns', function() {
        this.actions('OTHER_ACTION');
      })
    });

    expect(MyActionTypes.build())
      .to.deep.equal({
        ACTION: 'test:ACTION',
        ns: {
          OTHER_ACTION: 'test:ns:OTHER_ACTION'
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