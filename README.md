# Example React Architecture

One way of organizing the architecture of a web app built with [React](http://facebook.github.io/react).

## Quick start

Clone this repo and install dependencies:

```bash
$ npm install
```

Start development server with:

```bash
$ npm start
```

Point your browser to `http://localhost:3000`.

## Explanation

### App features

To illustrate this architecture example, I've used a minimal dummy app. However, I tried to make it a little less trivial than all the Todo apps out there. Some of the "features" that I wanted to support are:

- Manage "logged in" and "logged out" states
- Save the session in `localStorage`, destroy it on logout
- Use routes with the "hash URI" (ex: `http://localhost:3000/#/items/1`), and be able to directly access a page by copy/pasting a valid route in a new browser tab
- Redirect to login if not authenticated and trying to access a page requiring authentication (and the opposite: redirect to "home" if authenticated and trying to access the login page)
- Handle query strings in the URI to modify a particular route (ex: route `#/items`, modified with `#/items?sort=descending`)
- Have at least two "modules" (a module contains a set of features that can be added/removed without affecting the rest of the app)
- Simulate fetching data from a backend, with latency and loading indicators

### Design goals

In terms of the app's architecture, I paid particular attention to the following:

- Centralize state in a main `App` component; other components are stateless as much as possible (forms can be an exception)
- Allow to easily add/remove "modules" (i.e. a set of features), without having to understand or touch all of the app
- Have only one central place that can "touch" state (I call them "actions"), and use it only in the `App` component or in top-level module components
- Treat routing like any other "action", i.e. a change in the hash URI is handled like the user clicking a button, and changes the app's state
- Be able to easily "snapshot" all of the app's state, and visualize it (ex: a big JSON document), rebooting the app with that state should lead to the same thing on screen
- Only store the minimum necessary in the app's state, use "derived state" to produce more information off of the "core state"

### Constraints

To limit the scope of this example, I've laid out some constraints for myself:

- Limit the number of dependencies (only [React](http://facebook.github.io/react), [Lo-Dash](http://lodash.com/), and routing utilities - using [Aviator](https://github.com/swipely/aviator/) currently)
- Limit the number of abstractions (for more complex apps, you might want to take a look at the [Flux](http://facebook.github.io/react/docs/flux-overview.html) patterns, which I've used as inspiration)

## Build

To build the production version run:

```bash
$ npm run build
```

To test the production build, start the static server:

```bash
$ npm run server
```

Point your browser to `http://localhost:3000`.
