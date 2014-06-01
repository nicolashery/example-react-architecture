/** @jsx React.DOM */

var React = window.React;
var _ = window._;
var Aviator = window.Aviator;
var hljs = window.hljs;

// Shallow difference of two objects
// Returns all attributes and their values in `destination`
// that have different values from `source`
function objectDifference(destination, source) {
  var result = {};

  _.forEach(source, function(sourceValue, key) {
    var destinactionValue = destination[key];
    if (!_.isEqual(sourceValue, destinactionValue)) {
      result[key] = destinactionValue;
    }
  });

  return result;
}



var api = {};

api._authToken = null;

api.loadSession = function(cb) {
  var authToken = window.localStorage.getItem('authToken');
  // Can check here against backend that this is a valid token
  api._authToken = authToken;
  setTimeout(function() {
    cb(null, authToken);
  }, 0);
};

api.destroySession = function() {
  window.localStorage.removeItem('authToken');
  api._authToken = null;
};

api.saveSession = function(authToken) {
  window.localStorage.setItem('authToken', authToken);
  api._authToken = authToken;
};

api.login = function(cb) {
  var authToken = 'abc123';
  api.saveSession(authToken);
  setTimeout(function() {
    cb(null, authToken);
  }, 1000);
};

api.logout = function(cb) {
  api.destroySession();
  setTimeout(function() {
    cb();
  }, 1000);
};

api._items = [
  {id: '1', name: 'Saphire'},
  {id: '2', name: 'Ruby'},
  {id: '3', name: 'Opal'}
];

api.getItems = function(options, cb) {
  var items = _.clone(api._items);
  if (options.sort === 'descending') {
    items = items.reverse();
  }
  setTimeout(function() {
    cb(null, items);
  }, 1000);
};

api.getItem = function(id, cb) {
  var item = _.find(api._items, {id: id});
  var err;
  if (!item) {
    err = {status: 404, message: 'Not found'};
  }
  setTimeout(function() {
    cb(err, item);
  }, 1000);
};

function pageFromRoute(route) {
  route = route || {};
  var matchedRoute = route.matchedRoute;
  var uri = route.uri;

  if (matchedRoute === '' && (uri === '/' || uri === '')) {
    return 'Home';
  }

  if (matchedRoute === '/login') {
    return 'Login';
  }

  if (matchedRoute === '/dashboard') {
    return 'Dashboard';
  }

  if (matchedRoute === '/items') {
    return 'Items';
  }

  if (matchedRoute === '/items/:id') {
    return 'Item Details';
  }

  return 'Not Found';
}

function itemsOrderFromRoute(route) {
  var queryParams = (route && route.queryParams) || {};
  if (queryParams.sort === 'descending') {
    return queryParams.sort;
  }
  return 'ascending';
}

var createDerivedState = function(getState) {
  return {
    isAuthenticated: function() {
      return Boolean(getState().authToken);
    },

    isLoggingIn: function() {
      var state = getState();
      return !Boolean(state.authToken) && state.isAuthenticating;
    },

    isLoggingOut: function() {
      var state = getState();
      return Boolean(state.authToken) && state.isAuthenticating;
    },

    page: function() {
      return pageFromRoute(getState().route);
    }
  };
};

var createActions = function(getState, setState, derivedState) {
  var buildUri = function(pattern, options) {
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
  };

  var getRouteForUri = function(uri) {
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
  };

  var updateBrowserUri = function(uri) {
    Aviator.navigate(uri, {silent: true});
  };

  var getUriForRoute = function(route) {
    var uri = buildUri(route.matchedRoute, {
      namedParams: route.namedParams,
      queryParams: route.queryParams
    });
    return uri;
  };

  var updateRouteQueryParams = function(route, queryParams) {
    route = _.cloneDeep(route);
    route.queryParams = _.assign(route.queryParams, queryParams);
    var uri = getUriForRoute(route);
    var newRoute = getRouteForUri(uri);
    return newRoute;
  };

  var actions = {
    _updateRoute: function(route) {
      // Really need to deep clone?
      route = _.cloneDeep(route);
      var page = pageFromRoute(route);

      if (!derivedState.isAuthenticated() && page !== 'Login') {
        console.log('not authenticated, redirecting to login');
        actions.navigateTo('/login');
        return;
      }

      if (derivedState.isAuthenticated() &&
          (page === 'Home' || page === 'Login')) {
        console.log('authenticated, redirecting to home');
        actions.navigateTo('/dashboard');
        return;
      }

      if (page === 'Dashboard') {
        return actions.showDashboard(route);
      }

      if (page === 'Items') {
        return actions.showItems(route);
      }

      if (page === 'Item Details') {
        return actions.showItemDetails(route);
      }

      setState({route: route});
    },

    navigateTo: function(pattern, options) {
      var uri = buildUri(pattern, options);
      var route = getRouteForUri(uri);
      updateBrowserUri(uri);
      actions._updateRoute(route);
    },

    login: function() {
      setState({isAuthenticating: true});
      api.login(function(err, authToken) {
        setState({
          isAuthenticating: false,
          authToken: authToken
        });
        actions.navigateTo('/dashboard');
      });
    },

    logout: function() {
      setState({isAuthenticating: true});
      api.logout(function() {
        setState({
          isAuthenticating: false,
          authToken: null
        });
        actions.navigateTo('/login');
      });
    },

    handleResourceError: function(resourceKey, err) {
      var resource = _.clone(getState()[resourceKey]);
      var stateUpdate = {};
      stateUpdate[resourceKey] = _.assign(resource, {
        status: 'error',
        data: err
      });
      setState(stateUpdate);
    },

    showDashboard: function(route) {
      setState({
        route: route,
        itemsResource: {status: 'pending'}
      });

      actions.getItems({});
    },

    showItems: function(route) {
      var sort = itemsOrderFromRoute(route);

      setState({
        route: route,
        itemsResource: {status: 'pending'},
        itemsOrder: sort
      });

      actions.getItems({sort: sort});
    },

    getItems: function(options) {
      api.getItems(options, function(err, items) {
        if (err) {
          return actions.handleResourceError('itemsResource', err);
        }

        setState({
          itemsResource: {status: 'success', data: items}
        });
      });
    },

    sortItems: function(order) {
      var route = getState().route;
      if (derivedState.page() !== 'Items') {
        return;
      }

      route = updateRouteQueryParams(route, {sort: order});
      actions.showItems(route);

      var uri = getUriForRoute(route);
      updateBrowserUri(uri);
    },

    showItemDetails: function(route) {
      var id = route.namedParams.id;

      setState({
        route: route,
        itemDetailsResource: {status: 'pending', request: {id: id}}
      });

      api.getItem(id, function(err, item) {
        if (err) {
          return actions.handleResourceError('itemDetailsResource', err);
        }

        setState({
          itemDetailsResource: {status: 'success', data: item, request: {id: id}}
        });
      });
    }
  };

  return actions;
};

var printableArray = function(data) {
  if (!(data && data.length > 2)) {
    return data;
  }

  var result = [
    data[0],
    data.length - 2 + ' more...',
    data[2]
  ];

  return result;
};

var printableState = function(state, derivedState) {
  var result = {
    authToken: state.authToken,
    route: (function() {
      var route = state.route;
      if (!route) {
        return route;
      }
      return '<Route ' + route.uri + '>';
    }()),
    isAuthenticating: state.isAuthenticating,
    itemsResource: (function() {
      var resource = state.itemsResource;
      if (!(resource && resource.data)) {
        return resource;
      }
      return _.assign(_.clone(resource), {
        data: printableArray(resource.data)
      });
    }()),
    itemDetailsResource: state.itemDetailsResource,
    itemsOrder: state.itemsOrder
  };

  result.derived = {
    isAuthenticated: derivedState.isAuthenticated(),
    isLoggingIn: derivedState.isLoggingIn(),
    isLoggingOut: derivedState.isLoggingOut(),
    page: derivedState.page()
  };

  return result;
};

function init(cb) {
  var props = {};

  api.loadSession(function(err, authToken) {
    props.authToken = authToken;
    cb(err, props);
  });
}

var App = React.createClass({
  getInitialState: function() {
    return {
      authToken: this.props.authToken,
      route: {},
      isAuthenticating: false,
      itemsResource: null,
      itemDetailsResource: null,
      itemsOrder: 'ascending'
    };
  },

  statics: {
    init: init
  },

  componentWillMount: function() {
    this.derivedState = this.setUpDerivedState();
    this.actions = this.setUpActions(this.derivedState);

    this.router = this.setUpRouter(this.actions);
    this.startRouter();
  },

  setUpDerivedState: function() {
    var self = this;
    var getState = function() {
      return self.state;
    };
    var derivedState = createDerivedState(getState);
    return derivedState;
  },

  setUpActions: function(derivedState) {
    var self = this;
    var getState = function() {
      return self.state;
    };
    var setState = this.setState.bind(this);
    var actions = createActions(getState, setState, derivedState);
    return actions;
  },

  setUpRouter: function(actions) {
    Aviator.pushStateEnabled = false;
    // TODO?: expand a list of routes ['/', '/items', '/items/:id']
    // into something Aviator.setRoutes() can take
    Aviator.setRoutes({
      '/': {
        target: actions,
        '/': '_updateRoute'
      },
      '/login': {
        target: actions,
        '/': '_updateRoute'
      },
      '/dashboard': {
        target: actions,
        '/': '_updateRoute'
      },
      '/items': {
        target: actions,
        '/': '_updateRoute',
        '/:id': '_updateRoute'
      }
    });
    return Aviator;
  },

  startRouter: function() {
    console.log(this.state);
    this.router.dispatch();
  },

  componentWillUpdate: function(nextProps, nextState) {
    // Called on props or state changes
    // Since app main component has no props,
    // this will be called on a state change
    var stateDiff = objectDifference(nextState, this.state);
    console.log('State changed', stateDiff);
  },

  componentDidMount: function() {
    this.applySyntaxColoring();
  },

  componentDidUpdate: function() {
    this.applySyntaxColoring();
  },

  applySyntaxColoring: function() {
    var el = this.refs.state.getDOMNode();
    hljs.highlightBlock(el);
  },

  render: function() {
    var title = this.renderTitle();
    var nav = this.renderNav();
    var content = this.renderContent();
    var state = this.renderState();

    return (
      <div>
        {title}
        {nav}
        {content}
        {state}
      </div>
     );
  },

  renderTitle: function() {
    var page = this.derivedState.page();

    if (page === 'Login') {
      return <h1>{'Login'}</h1>;
    }

    if (page === 'Dashboard') {
      return <h1>{'Dashboard'}</h1>;
    }

    if (page === 'Items') {
      return <h1>{'Items'}</h1>;
    }

    if (page === 'Item Details') {
      return <h1>{'Item Details'}</h1>;
    }

    return <h1>{'Not Found'}</h1>;
  },

  renderNav: function() {
    var self = this;
    var dashboardLink;
    var itemsLink;
    var authLink;

    if (!this.derivedState.isAuthenticated()) {
      dashboardLink = null;
    }
    else if (this.derivedState.page() === 'Dashboard') {
      dashboardLink = <span>{'Dashboard · '}</span>;
    }
    else {
      dashboardLink = (
        <span>
          <a href={'#/dashboard'}>{'Dashboard'}</a><span>{' · '}</span>
        </span>
      );
    }

    if (!this.derivedState.isAuthenticated()) {
      itemsLink = null;
    }
    else if (this.derivedState.page() === 'Items') {
      itemsLink = <span>{'Items · '}</span>;
    }
    else {
      var href = '#/items';
      if (this.state.itemsOrder === 'descending') {
        href = href + '?sort=descending';
      }
      itemsLink =
        <span><a href={href}>{'Items'}</a><span>{' · '}</span></span>;
    }

    if (this.derivedState.isLoggingIn()) {
      authLink = <span>{'Logging in...'}</span>;
    }
    else if (this.derivedState.isLoggingOut()) {
      authLink = <span>{'Logging out...'}</span>;
    }
    else if (!this.derivedState.isAuthenticated()) {
      var login = function(e) {
        e.preventDefault();
        self.actions.login();
      };

      authLink = <a href={''} onClick={login}>{'Log in'}</a>;
    }
    else {
      var logout = function(e) {
        e.preventDefault();
        self.actions.logout();
      };

      authLink = <a href={''} onClick={logout}>{'Log out'}</a>;
    }

    return (
      <p>
        {dashboardLink}
        {itemsLink}
        {authLink}
      </p>
    );
  },

  renderContent: function() {
    var page = this.derivedState.page();

    if (page === 'Login') {
      return null;
    }

    if (page === 'Dashboard') {
      return this.renderDashboard();
    }

    if (page === 'Items') {
      return this.renderItems();
    }

    if (page === 'Item Details') {
      return this.renderItemDetails();
    }

    return null;
  },

  renderState: function() {
    return (
      <pre ref={'state'}><code>
        {this.prettyPrintState()}
      </code></pre>
    );
  },

  prettyPrintState: function() {
    var prettyState = printableState(this.state, this.derivedState);
    return JSON.stringify(prettyState, null, 2);
  },

  renderDashboard: function() {
    var resource = this.state.itemsResource || {};

    if (resource.status === 'pending') {
      return <p>{'Loading summary...'}</p>;
    }

    if (resource.status === 'error') {
      return <p>{'Error loading summary'}</p>;
    }

    var items = resource.data;

    if (!(items && items.length)) {
      return <p>{'No items yet'}</p>;
    }

    var text = items.length + ' items';
    if (items.length === 1) {
      text = '1 item';
    }

    return <p><a href={'#/items'}>{text}</a></p>;
  },

  renderItems: function() {
    var resource = this.state.itemsResource || {};

    if (resource.status === 'pending') {
      return <p>{'Loading items...'}</p>;
    }

    if (resource.status === 'error') {
      return <p>{'Error loading items'}</p>;
    }

    var items = resource.data;

    if (!(items && items.length)) {
      return <p>{'No items yet'}</p>;
    }

    var self = this;
    var sort = function(order, e) {
      e.preventDefault();
      self.actions.sortItems(order);
    };
    var sortActions;
    if (this.state.itemsOrder === 'descending') {
      sortActions = (
        <p>
          {'Sort: '}
          <a href={''} onClick={sort.bind(null, 'ascending')}>
            {'Ascending'}
          </a>
          {' | Descending'}
        </p>
      );
    }
    else {
      sortActions = (
        <p>
          {'Sort: '}
          {'Ascending | '}
          <a href={''} onClick={sort.bind(null, 'descending')}>
            {'Descending'}
          </a>
        </p>
      );
    }

    var itemNodes = _.map(items, function(item) {
      return (
        <li>
          <a key={item.id} href={'#/items/' + item.id}>{item.name}</a>
        </li>
      );
    });

    return (
      <div>
        {sortActions}
        <ul>{itemNodes}</ul>
      </div>
    );
  },

  renderItemDetails: function() {
    var resource = this.state.itemDetailsResource || {};

    if (resource.status === 'pending') {
      return <p>{'Loading item details...'}</p>;
    }

    var item = resource.data;

    if (resource.status === 'error') {
      if (resource.data && resource.data.status === 404) {
        var requestedId = resource.request && resource.request.id;
        return <p>{'Could not find item with id ' + requestedId}</p>;
      }

      return <p>{'Error loading item details'}</p>;
    }

    return (
      <div>
        <p><strong>{'id: '}</strong>{item.id}</p>
        <p><strong>{'name: '}</strong>{item.name}</p>
      </div>
    );
  }
});

module.exports = App;
