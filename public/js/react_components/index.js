(function() {
  var About, Admin, App, Auth, Dashboard, DefaultRoute, IsotopeTasks, IsotopeTest, Link, NotFoundRoute, React, ReactTransitionGroup, Route, Router, Routes, Task, WebUtilsMixin, a, button, div, h1, imageURL, img, li, mountNode, p, routes, span, ul, _ref;

  React = require('react');

  if (typeof window !== 'undefined') {
    window.React = React;
  }

  Router = require('react-router/dist/react-router');

  ReactTransitionGroup = React.addons.TransitionGroup;

  Route = Router.Route;

  Routes = Router.Routes;

  Link = Router.Link;

  NotFoundRoute = Router.NotFoundRoute;

  DefaultRoute = Router.DefaultRoute;

  About = require('./about.coffee');

  Admin = require('./admin/admin.coffee');

  IsotopeTasks = require('./collections/isotopeTasks.coffee');

  IsotopeTest = require('./collections/isotopeTest.coffee');

  Task = require('./models/task/task.coffee');

  Auth = require('./auth/auth.coffee');

  WebUtilsMixin = require('./mixins/webUtilsMixin.coffee');

  require("style!css!less!../../stylesheets/main.less");

  imageURL = '../../images/yeoman.png';

  _ref = React.DOM, div = _ref.div, img = _ref.img, h1 = _ref.h1, ul = _ref.ul, li = _ref.li, button = _ref.button, a = _ref.a, span = _ref.span, p = _ref.p;

  Dashboard = React.createClass({
    render: function() {
      return div({
        key: 'mainDashboard'
      }, [
        IsotopeTasks({
          id: 'tasksContainer',
          key: 'isotopeTasks'
        }, [])
      ]);
    }
  });

  App = React.createClass({
    displayName: 'App',
    mixins: [WebUtilsMixin],
    getInitialState: function() {
      return {
        'authedUser': Auth.authedUser
      };
    },
    componentDidMount: function() {
      var self, ssoUsername, userPromise;
      self = this;
      ssoUsername = this.getRhUserCookie();
      userPromise = this.getAuthenticatedUser(this.props.query['userOverride'] || ssoUsername);
      return userPromise != null ? userPromise.done(function(user) {
        if ((user != null ? user['externalModelId'] : void 0) != null) {
          Auth.authedUser = user;
          return self.setState({
            'authedUser': Auth.authedUser
          });
        } else {
          return console.error("User: " + (JSON.stringify(user, null, ' ')) + " has no id");
        }
      }, function(err) {
        return console.error(err);
      }) : void 0;
    },
    generateAuthenticationElement: function() {
      if (this.state['authedUser'] != null) {
        return p({
          className: 'navbar-text',
          key: 'navbar-right'
        }, ["Logged in as " + this.state['authedUser']['resource']['firstName'] + " " + this.state['authedUser']['resource']['lastName']]);
      } else {

      }
      return a({
        target: '_blank',
        href: 'https://gss.my.salesforce.com',
        key: 'sso'
      }, ['https://gss.my.salesforce.com']);
    },
    render: function() {
      return div({}, [
        div({
          className: "navbar navbar-default",
          role: "navigation",
          key: 'navigation'
        }, [
          div({
            className: "navbar-header",
            key: 'navHeader'
          }, [
            button({
              type: "button",
              className: "navbar-toggle collapsed",
              'data-toggle': "collapse",
              'data-target': "#bs-example-navbar-collapse-1",
              key: 'navCollapse'
            }, [
              span({
                className: "sr-only",
                key: 'srNav'
              }, ['Toggle navigation']), span({
                className: "icon-bar",
                key: 'srNavIcon1'
              }, []), span({
                className: "icon-bar",
                key: 'srNavIcon2'
              }, []), span({
                className: "icon-bar",
                key: 'srNavIcon3'
              }, [])
            ]), a({
              className: "navbar-brand",
              href: "#",
              key: 'navBrand'
            }, ['Ascension'])
          ]), div({
            className: "collapse navbar-collapse",
            id: "bs-example-navbar-collapse-1",
            key: 'navCollapse'
          }, [
            ul({
              className: "nav navbar-nav",
              key: 'navbarNav'
            }, [
              li({
                key: 'dashboard'
              }, [
                Link({
                  to: 'dashboard',
                  key: 'linkDashboard'
                }, ['Dashboard'])
              ]), li({
                key: 'admin'
              }, [
                Link({
                  to: 'admin',
                  key: 'linkAdmin'
                }, ['Admin'])
              ])
            ]), ul({
              className: 'nav navbar-nav navbar-right',
              key: 'authInfo'
            }, [
              li({
                key: 'authLi'
              }, [this.generateAuthenticationElement()])
            ])
          ])
        ]), div({
          className: 'container-ascension',
          key: 'mainContainer'
        }, [this.props.activeRouteHandler()])
      ]);
    }
  });

  routes = Routes({
    location: 'hash'
  }, [
    Route({
      key: 'app',
      name: 'app',
      path: '/',
      params: '{userOverride: true}',
      handler: App
    }, [
      Route({
        key: 'dashboard',
        name: 'dashboard',
        handler: Dashboard
      }, []), Route({
        key: 'admin',
        name: 'admin',
        handler: Admin
      }, []), Route({
        key: 'task',
        name: 'task',
        path: 'task/:_id',
        handler: Task
      }, []), NotFoundRoute({
        key: 'notFound',
        handler: Dashboard
      }, []), DefaultRoute({
        key: 'defaultRoute',
        handler: Dashboard
      })
    ])
  ]);

  mountNode = document.getElementById('content');

  React.renderComponent(routes, mountNode);

  module.exports = App;

}).call(this);
