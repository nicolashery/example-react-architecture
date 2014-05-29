/******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var React = window.React;

	var App = __webpack_require__(1);

	App.init(function(err, props) {
	  window.app = React.renderComponent(
	    App(props), document.getElementById('app')
	  );
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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

	  if (matchedRoute === '/items') {
	    return 'Items';
	  }

	  if (matchedRoute === '/items/:id') {
	    return 'Item Details';
	  }

	  return 'Not Found';
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
	  var getRouteForUri = function(uri, options) {
	    var _navigator = Aviator._navigator;
	    options = options || {};

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

	    var queryString = uri.split('?')[1];
	    if (queryString) {
	      queryString = '?' + queryString;
	    }
	    else {
	      queryString = null;
	    }

	    var route = _navigator.createRouteForURI(uri);
	    route = _navigator.createRequest(uri, null, route.matchedRoute);

	    return route;
	  };

	  var updateBrowserUri = function(uri) {
	    Aviator.navigate(uri, {silent: true});
	  };

	  var actions = {
	    _updateRoute: function(route) {
	      // Really need to deep clone?
	      route = _.cloneDeep(route);
	      var page = pageFromRoute(route);

	      if (!derivedState.isAuthenticated() && page !== 'Login') {
	        console.log('not authenticated, redirecting to login');
	        Aviator.navigate('/login');
	        return;
	      }

	      if (derivedState.isAuthenticated() &&
	          (page === 'Home' || page === 'Login')) {
	        console.log('authenticated, redirecting to home');
	        Aviator.navigate('/items');
	        return;
	      }

	      if (page === 'Items') {
	        return actions.showItems(route);
	      }

	      if (page === 'Item Details') {
	        return actions.showItemDetails(route);
	      }

	      setState({route: route});
	    },

	    navigateTo: function(uri, options) {
	      var route = getRouteForUri(uri, options);
	      actions._updateRoute(route);
	    },

	    login: function() {
	      setState({isAuthenticating: true});
	      api.login(function(err, authToken) {
	        var uri = '/items';
	        setState({
	          isAuthenticating: false,
	          authToken: authToken,
	          route: getRouteForUri(uri)
	        });
	        updateBrowserUri(uri);
	      });
	    },

	    logout: function() {
	      setState({isAuthenticating: true});
	      api.logout(function() {
	        var uri = '/login';
	        setState({
	          isAuthenticating: false,
	          authToken: null,
	          route: getRouteForUri(uri)
	        });
	        updateBrowserUri(uri);
	      });
	    },

	    showItems: function(route) {
	      setState({
	        route: route,
	        itemsResource: {status: 'pending'}
	      });

	      api.getItems({}, function(err, items) {
	        if (derivedState.page() !== 'Items') {
	          setState({itemsResource: null});
	          return;
	        }

	        if (err) {
	          setState({
	            itemsResource: {status: 'error', data: err}
	          });
	          return;
	        }

	        setState({
	          itemsResource: {status: 'success', data: items}
	        });
	      });
	    },

	    showItemDetails: function(route) {
	      var id = route.namedParams.id;

	      setState({
	        route: route,
	        itemDetailsResource: {status: 'pending', request: {id: id}}
	      });

	      api.getItem(id, function(err, item) {
	        if (derivedState.page() !== 'Item Details') {
	          setState({itemDetailsResource: null});
	          return;
	        }

	        if (err) {
	          setState({
	            itemDetailsResource: {status: 'error', data: err, request: {id: id}}
	          });
	          return;
	        }

	        setState({
	          itemDetailsResource: {status: 'success', data: item, request: {id: id}}
	        });
	      });
	    }
	  };

	  return actions;
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
	    itemsResource: state.itemsResource,
	    itemDetailsResource: state.itemDetailsResource
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

	var App = React.createClass({displayName: 'App',
	  getInitialState: function() {
	    return {
	      authToken: this.props.authToken,
	      route: {},
	      isAuthenticating: false,
	      itemsResource: null,
	      itemDetailsResource: null
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
	      React.DOM.div(null, 
	        title,
	        nav,
	        content,
	        state
	      )
	     );
	  },

	  renderTitle: function() {
	    var page = this.derivedState.page();

	    if (page === 'Login') {
	      return React.DOM.h1(null, 'Login');
	    }

	    if (page === 'Items') {
	      return React.DOM.h1(null, 'Items');
	    }

	    if (page === 'Item Details') {
	      return React.DOM.h1(null, 'Item Details');
	    }

	    return React.DOM.h1(null, 'Not Found');
	  },

	  renderNav: function() {
	    var self = this;
	    var itemsLink;
	    var authLink;

	    if (!this.derivedState.isAuthenticated()) {
	      itemsLink = null;
	    }
	    else if (this.derivedState.page() === 'Items') {
	      itemsLink = React.DOM.span(null, 'Items · ');
	    }
	    else {
	      itemsLink =
	        React.DOM.span(null, React.DOM.a( {href:'#/items'}, 'Items'),React.DOM.span(null, ' · '));
	    }

	    if (this.derivedState.isLoggingIn()) {
	      authLink = React.DOM.span(null, 'Logging in...');
	    }
	    else if (this.derivedState.isLoggingOut()) {
	      authLink = React.DOM.span(null, 'Logging out...');
	    }
	    else if (!this.derivedState.isAuthenticated()) {
	      var login = function(e) {
	        e.preventDefault();
	        self.actions.login();
	      };

	      authLink = React.DOM.a( {href:'', onClick:login}, 'Log in');
	    }
	    else {
	      var logout = function(e) {
	        e.preventDefault();
	        self.actions.logout();
	      };

	      authLink = React.DOM.a( {href:'', onClick:logout}, 'Log out');
	    }

	    return (
	      React.DOM.p(null, 
	        itemsLink,
	        authLink
	      )
	    );
	  },

	  renderContent: function() {
	    var page = this.derivedState.page();

	    if (page === 'Login') {
	      return null;
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
	      React.DOM.pre( {ref:'state'}, React.DOM.code(null, 
	        this.prettyPrintState()
	      ))
	    );
	  },

	  prettyPrintState: function() {
	    var prettyState = printableState(this.state, this.derivedState);
	    return JSON.stringify(prettyState, null, 2);
	  },

	  renderItems: function() {
	    var resource = this.state.itemsResource || {};

	    if (resource.status === 'pending') {
	      return React.DOM.p(null, 'Loading items...');
	    }

	    if (resource.status === 'error') {
	      return React.DOM.p(null, 'Error loading items');
	    }

	    var items = resource.data;

	    if (!(items && items.length)) {
	      return React.DOM.p(null, 'No items yet');
	    }

	    var itemNodes = _.map(items, function(item) {
	      return (
	        React.DOM.li(null, 
	          React.DOM.a( {key:item.id, href:'#/items/' + item.id}, item.name)
	        )
	      );
	    });

	    return (
	      React.DOM.ul(null, itemNodes)
	    );
	  },

	  renderItemDetails: function() {
	    var resource = this.state.itemDetailsResource || {};

	    if (resource.status === 'pending') {
	      return React.DOM.p(null, 'Loading item details...');
	    }

	    var item = resource.data;

	    if (resource.status === 'error') {
	      if (resource.data && resource.data.status === 404) {
	        var requestedId = resource.request && resource.request.id;
	        return React.DOM.p(null, 'Could not find item with id ' + requestedId);
	      }

	      return React.DOM.p(null, 'Error loading item details');
	    }

	    return (
	      React.DOM.div(null, 
	        React.DOM.p(null, React.DOM.strong(null, 'id: '),item.id),
	        React.DOM.p(null, React.DOM.strong(null, 'name: '),item.name)
	      )
	    );
	  }
	});

	module.exports = App;


/***/ }
/******/ ])