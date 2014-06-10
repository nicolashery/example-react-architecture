var _ = window._;
var Aviator = window.Aviator;

var createRouter = function(app) {

  // Helper functions to translate an array of routes
  // ex: ['/items', '/items/:id']
  // to an Aviator routing table
  // ex: {'/items': {target: app.actions, '/': '_updateRoute', '/:id': '_updateRoute'}}
  function slugsFromRoute(route) {
    if (route === '/') {
      return [route];
    }

    var slugs = route.split('/');
    slugs = _.filter(slugs);
    slugs = _.map(slugs, function(slug) { return '/' + slug; });
    return slugs;
  }

  function addSlugsToRoutingTable(table, slugs) {
    var child = table;
    _.forEach(slugs, function(slug, index) {
      var existingChild = child[slug];

      if (index === 0 && !existingChild) {
        child = child[slug] = {
           target: app.actions,
           '/': '_updateRoute'
        };
        return;
      }

      if (index === slugs.length - 1) {
        child[slug] = '_updateRoute';
        return;
      }

      if (typeof existingChild === 'object') {
        child = child[slug];
        return;
      }

      child = child[slug] = {
        target: app.actions,
        '/': '_updateRoute'
      };
      return;
    });

    return table;
  }

  function routingTableFromRoutes(routes) {
    return _.reduce(routes, function(acc, route) {
      var slugs = slugsFromRoute(route);
        return addSlugsToRoutingTable(acc, slugs);
      }, {});
  }

  var router = {
    setRoutes: function(routes) {
      Aviator.pushStateEnabled = false;
      var routingTable = routingTableFromRoutes(routes);
      Aviator.setRoutes(routingTable);
    },

    start: function() {
      Aviator.dispatch();
    },

    buildUri: function(pattern, options) {
      var _navigator = Aviator._navigator;
      options = options || {};
      var uri = pattern;

      var namedParams = options.namedParams;
      var queryParams = options.queryParams;

      if (queryParams) {
        uri += _navigator.serializeQueryParams(queryParams);
      }

      if (namedParams) {
        for (var p in namedParams) {
          if (namedParams.hasOwnProperty(p)) {
            uri = uri.replace(':' + p, encodeURIComponent(namedParams[p]));
          }
        }
      }

      return uri;
    },

    getRouteForUri: function(uri) {
      var _navigator = Aviator._navigator;

      var queryString = uri.split('?')[1];
      if (queryString) {
        queryString = '?' + queryString;
        uri = uri.replace(queryString, '');
      }
      else {
        queryString = null;
      }

      var route = _navigator.createRouteForURI(uri);
      route = _navigator.createRequest(uri, queryString, route.matchedRoute);

      return route;
    },

    updateBrowserUri: function(uri) {
      Aviator.navigate(uri, {silent: true});
    },

    getUriForRoute: function(route) {
      var uri = router.buildUri(route.matchedRoute, {
        namedParams: route.namedParams,
        queryParams: route.queryParams
      });
      return uri;
    },

    updateRouteQueryParams: function(route, queryParams) {
      route = _.cloneDeep(route);
      route.queryParams = _.assign(route.queryParams, queryParams);
      var uri = router.getUriForRoute(route);
      var newRoute = router.getRouteForUri(uri);
      return newRoute;
    }
  };

  return router;
};

module.exports = createRouter;
