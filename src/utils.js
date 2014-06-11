var _ = window._;

var slice = [].slice;

var utils = {
  firstTruthy: function(coll) {
    var args = slice.call(arguments, 1);

    return _.reduce(coll, function(result, val) {
      if (result) {
        return result;
      }
      if (typeof val === 'function') {
        val = val.apply(null, args);
      }
      if (!val) {
        return result;
      }
      return val;
    }, null);
  },

  flatMap: function(coll, func) {
    return _.reduce(coll, function(acc) {
      var args = slice.call(arguments, 1);
      return acc.concat(func.apply(null, args));
    }, []);
  },

  interpose: function(coll, f) {
    if (typeof f !== 'function') {
      f = _.identity.bind(null, f);
    }

    return _.reduce(coll, function(acc, item, index) {
      if (index !== 0) {
        acc.push(f(index - 1));
      }
      acc.push(item);
      return acc;
    }, []);
  }
};

module.exports = utils;
