var _ = window._;

var AppModules = {
  initialState: function(modules) {
    return this.mergeObjectsFromAttribute('initialAppState', modules);
  },

  derivedState: function(modules) {
    return this.mergeObjectsFromAttribute('derivedAppState', modules);
  },

  actions: function(modules) {
    return this.mergeObjectsFromAttribute('actions', modules);
  },

  routes: function(modules) {
    return this.mergeObjectsFromAttribute('routes', modules);
  },

  routeHandlers: function(modules) {
    return this.collectValuesFromAttribute('onRouteChange', modules);
  },

  renderers: function(modules) {
    var self = this;
    return {
      title: self.collectValuesFromAttribute('renderTitle', modules),
      navLinks: self.collectValuesFromAttribute('renderNavLinks', modules),
      content: self.collectValuesFromAttribute('renderContent', modules)
    };
  },

  mergeObjectsFromAttribute: function(attribute, modules) {
    return _.reduce(modules, function(acc, mod) {
      var obj = mod[attribute] || {};
      if (_.isFunction(obj)) {
        obj = obj();
      }
      return _.assign(acc, obj);
    }, {});
  },

  collectValuesFromAttribute: function(attribute, modules) {
    return _.reduce(modules, function(acc, mod) {
      var value = mod[attribute];
      if (typeof value === 'function') {
        value = value.bind(mod);
      }
      if (value) {
        acc.push(value);
      }
      return acc;
    }, []);
  }
};

module.exports = AppModules;
