#Animo     = require 'animo.js/animo' # This will put animo on the global $ namespace
React     = require 'react'
# This is a workaround described @ https://github.com/STRML/react-router-component/issues/59
# For making the Router work which expects a global React var
# See also https://github.com/STRML/react-router-component/issues/2
if typeof window isnt 'undefined'
  window.React = React
Router               = require 'react-router/dist/react-router'
ReactTransitionGroup = React.addons.TransitionGroup
Route                = Router.Route
Routes               = Router.Routes
Link                 = Router.Link
NotFoundRoute        = Router.NotFoundRoute
DefaultRoute         = Router.DefaultRoute

# Components
About           = require './about.coffee'
Admin           = require './admin/admin.coffee'
IsotopeTasks    = require './collections/isotopeTasks.coffee'
IsotopeTest     = require './collections/isotopeTest.coffee'
Task            = require './models/task/task.coffee'
Auth            = require './auth/auth.coffee'

# Mixins
WebUtilsMixin   = require './mixins/webUtilsMixin.coffee'

# global css
#require '../../stylesheets/reset.css'
#require '../../stylesheets/main.css'
require("style!css!less!../../stylesheets/main.less");

imageURL = '../../images/yeoman.png'

{div, img, h1, ul, li, button, a, span, p} = React.DOM

#About = React.createClass
#  render: ->
#    (h1 {}, ['About'])

Dashboard = React.createClass
  getInitialState: ->
    query: @props.query

  # This is required to properly pass the query properties to the sub components
  # https://github.com/rackt/react-router/blob/master/docs/api/components/Route.md
  componentWillReceiveProps: (nextProps) ->
    @setState
      query: nextProps.query

  render: ->
    (div {key: 'mainDashboard'}, [
      #(h1 {key: 'header'}, ['Dashboard'])
      (IsotopeTasks
        id: 'tasksContainer'
        key: 'isotopeTasks'
        query: @state.query
      , [])
#      (IsotopeTest {id: 'tasksContainer', key: 'isotopeTasks'}, [])
    ])

App = React.createClass
  displayName: 'App'
  mixins: [WebUtilsMixin]

  getInitialState: ->
    'authedUser': Auth.authedUser

#  render: ->
#    (div {className: 'main'}, [
#      (ul {}, [
#        (li {}, [
#          (Link {to: 'about'}, ['About'])
#          (Link {to: 'dashboard'}, ['Dashboard'])
#        ])
#      ])
#      @props.activeRouteHandler()
#      #(h1 {}, ['Hello from React! mod'])
#    ])

  componentDidMount: ->
    self = @
    ssoUsername = @getRhUserCookie()
    #userPromise = @getAuthenticatedUser(@props.query['ssoUsername'] || ssoUsername)
    userPromise = @getAuthenticatedUser(ssoUsername)
    userPromise?.done((user) ->
      if _.isArray(user) then user = user[0]

      if user?['externalModelId']?
        #console.debug "Setting authed user to: #{JSON.stringify(user, null, ' ')}"
        Auth.set(user)
        self.setState {'authedUser': Auth.authedUser}
      else
        Auth.set(undefined)
        self.setState {'authedUser': Auth.authedUser}
        console.error "User: #{JSON.stringify(user, null, ' ')} has no id"
    , (err) ->
      console.error err
    )

  generateAuthenticationElement: () ->
    if Auth.get()?
      return (p {className: 'navbar-text', key: 'navbar-right'}, ["Logged in as #{Auth.get()['resource']['firstName']} #{Auth.get()['resource']['lastName']}"])
    else
      return (a {target: '_blank', href: 'https://gss.my.salesforce.com', key: 'sso'}, ['https://gss.my.salesforce.com'])

  render: ->
    (div {}, [
      (div {className: "navbar navbar-default", role: "navigation", key: 'navigation'}, [
        (div {className: "navbar-header", key: 'navHeader'}, [
          (button {type: "button", className: "navbar-toggle collapsed", 'data-toggle': "collapse", 'data-target': "#bs-example-navbar-collapse-1", key: 'navCollapse'}, [
            (span {className: "sr-only", key: 'srNav'}, ['Toggle navigation'])
            (span {className: "icon-bar", key: 'srNavIcon1'}, [])
            (span {className: "icon-bar", key: 'srNavIcon2'}, [])
            (span {className: "icon-bar", key: 'srNavIcon3'}, [])
          ])
          (a {className: "navbar-brand", href: "#", key: 'navBrand'}, ['Ascension'])
        ])
        (div {className: "collapse navbar-collapse", id: "bs-example-navbar-collapse-1", key: 'navCollapse'}, [
          (ul {className: "nav navbar-nav", key: 'navbarNav'}, [
            # TODO -- figure out how to make the active styling work with the react-router
#              (li {className: "active"}, [
            (li {key: 'dashboard'}, [
              #(a {href: "#"}, ['Admin'])
              (Link
                to: 'dashboard'
                key: 'linkDashboard'
                query: @props.query
              , ['Dashboard'])
            ])
            (li {key: 'admin'}, [
              #(a {href: "#"}, ['Tasks'])
              (Link {to: 'admin', key: 'linkAdmin'}, ['Admin'])
            ])
          ])
          (ul {className: 'nav navbar-nav navbar-right', key: 'authInfo'}, [
#            (li {}, [
#              (a {href: '#'}, ['Link'])
#            ])
            (li {key: 'authLi'}, [
              @generateAuthenticationElement()
            ])
          ])
        ])
      ])
      (div {className: 'container-ascension', key: 'mainContainer'}, [
        @props.activeRouteHandler()
      ])
      #(div {className: 'container', key: 'mainContainer'}, [
      #  (div {className: 'row', key: 'row'}, [
      #    (div {className: 'col-xs-12', key: 'col'}, [
      #      @props.activeRouteHandler()
      #    ])
      #  ])
      #])
    ])


routes = (
  (Routes {location: 'hash'}, [
    #params: '{ssoUsername: true, admin: true}',
    (Route {key: 'app', name: 'app', path: '/', handler: App}, [
      (Route {key: 'dashboard', name: 'dashboard', handler: Dashboard, addHandlerKey: true}, [])
      (Route {key: 'admin', name: 'admin', handler: Admin}, [])
      (Route {key: 'task', name: 'task', path: 'task/:_id', handler: Task}, [])
      (NotFoundRoute {key: 'notFound', handler: Dashboard}, [])
      (DefaultRoute {key: 'defaultRoute', handler: Dashboard})
    ])
  ])
)

mountNode = document.getElementById 'content'
React.renderComponent routes, mountNode

module.exports = App
