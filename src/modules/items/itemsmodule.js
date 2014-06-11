/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var utils = {
  itemsOrderFromRoute: function(route) {
    var query = (route && route.query) || {};
    if (query.sort === 'descending') {
      return query.sort;
    }
    return 'ascending';
  }
};

var bindToApp = function(app) {
return {
  initialAppState: function() {
    return {
      itemsOrder: 'ascending',
      itemDetailsResource: null
    };
  },

  derivedAppState: function() { return {}; },

  routes: function() {
    return [
      '/items',
      '/items/:id'
    ];
  },

  onRouteChange: function(route) {
    var path = route.path;

    if (path === '/items') {
      return app.actions.showItems(route);
    }

    if (path === '/items/:id') {
      return app.actions.showItemDetails(route);
    }
  },

  actions: function() {
    return {
      showItems: function(route) {
        var sort = utils.itemsOrderFromRoute(route);

        app.setState({
          route: route,
          itemsResource: {status: 'pending'},
          itemsOrder: sort
        });

        app.actions.getItems({sort: sort});
      },

      sortItems: function(order) {
        var route = app.state.route;
        var path = route.path;

        if (path !== '/items') {
          return;
        }

        route = app.router.updateRouteQuery(route, {sort: order});
        app.actions.showItems(route);

        var uri = app.router.getUriForRoute(route);
        app.router.updateBrowserUri(uri);
      },

      showItemDetails: function(route) {
        var id = route.params.id;

        app.setState({
          route: route,
          itemDetailsResource: {status: 'pending', request: {id: id}}
        });

        app.api.getItem(id, function(err, item) {
          if (err) {
            return app.actions.handleResourceError(
              'itemDetailsResource', err
            );
          }

          app.setState({
            itemDetailsResource: {
              status: 'success',
              data: item,
              request: {id: id}
            }
          });
        });
      }
    };
  },

  renderTitle: function() {
    var path = app.state.route.path;

    if (path === '/items') {
      return 'Items';
    }

    if (path === '/items/:id') {
      return 'Item Details';
    }
  },

  renderNavLinks: function() {
    var path = app.state.route.path;

    if (!app.derivedState.isAuthenticated()) {
      return null;
    }

    if (path === '/items') {
      return [<span>{'Items'}</span>];
    }

    var href = '#/items';
    if (app.state.itemsOrder === 'descending') {
      href = href + '?sort=descending';
    }

    return [<a href={href}>{'Items'}</a>];
  },

  renderContent: function() {
    var path = app.state.route.path;

    if (path === '/items') {
      return this.renderItems();
    }

    if (path === '/items/:id') {
      return this.renderItemDetails();
    }
  },

  renderItems: function() {
    var resource = app.state.itemsResource || {};

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

    var sort = function(order, e) {
      e.preventDefault();
      app.actions.sortItems(order);
    };
    var sortActions;
    if (app.state.itemsOrder === 'descending') {
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
    var resource = app.state.itemDetailsResource || {};

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
  },

  utils: utils
};
};

module.exports = {
  name: 'items',
  bindToApp: bindToApp
};
