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
  }
};

module.exports = utils;
