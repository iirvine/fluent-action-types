var ActionTypes = require('../src/index');

describe('ActionTypes', () => {
  it('builds simple objects', () => {
    var MyActionTypes = ActionTypes('test', function() {
      this.actions('one', 'two');
    });

    expect(MyActionTypes.build())
      .to.deep.equal({
        one: 'one',
        two: 'two'
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
        ACTION: 'ACTION',
        ns: {
          OTHER_ACTION: 'ns:OTHER_ACTION'
        }
      });
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