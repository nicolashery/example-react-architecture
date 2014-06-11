var _ = window._;

var createActions = function(app) {
  var actions = {
    _updateRoute: function(route) {
      var path = route.path;

      if (path === '/404') {
        console.log('route not found');
        app.setState({route: route});
        return;
      }

      if (!app.derivedState.isAuthenticated() && path !== '/login') {
        console.log('not authenticated, redirecting to login');
        actions.navigateTo('/login');
        return;
      }

      if (app.derivedState.isAuthenticated() &&
          (path === '/' || path === '/login')) {
        console.log('authenticated, redirecting to home');
        actions.navigateTo(app.defaultRoute);
        return;
      }

      var routeWasHandled = app.utils.firstTruthy(app.routeHandlers, route);
      if (routeWasHandled) {
        return;
      }

      app.setState({route: route});
    },

    navigateTo: function(pattern, options) {
      var uri = app.router.buildUri(pattern, options);
      var route = app.router.getRouteForUri(uri);
      app.router.updateBrowserUri(uri);
      actions._updateRoute(route);
    },

    login: function() {
      app.setState({isAuthenticating: true});
      app.api.login(function(err, authToken) {
        app.setState({
          isAuthenticating: false,
          authToken: authToken
        });
        actions.navigateTo('/dashboard');
      });
    },

    logout: function() {
      app.setState({isAuthenticating: true});
      app.api.logout(function() {
        app.setState({
          isAuthenticating: false,
          authToken: null
        });
        actions.navigateTo('/login');
      });
    },

    handleResourceError: function(resourceKey, err) {
      var resource = _.clone(app.state[resourceKey]);
      var stateUpdate = {};
      stateUpdate[resourceKey] = _.assign(resource, {
        status: 'error',
        data: err
      });
      app.setState(stateUpdate);
    },

    getItems: function(options) {
      app.api.getItems(options, function(err, items) {
        if (err) {
          return actions.handleResourceError('itemsResource', err);
        }

        app.setState({
          itemsResource: {status: 'success', data: items}
        });
      });
    }
  };

  return actions;
};

module.exports = createActions;
