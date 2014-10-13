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
Tasks           = require './collections/tasks.coffee'
IsotopeTest     = require './collections/isotopeTest.coffee'
Task            = require './models/task/task.coffee'
Auth            = require './auth/auth.coffee'

# Mixins
WebUtilsMixin   = require './mixins/webUtilsMixin.coffee'

# Bootstrap components
Alert           = require 'react-bootstrap/Alert'

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
    params: @props.params

  # This is required to properly pass the query properties to the sub components
  # https://github.com/rackt/react-router/blob/master/docs/api/components/Route.md
  componentWillReceiveProps: (nextProps) ->
    @setState
      query: nextProps.query
      params: nextProps.params

  render: ->
    (div {key: 'mainDashboard'}, [
      #(h1 {key: 'header'}, ['Dashboard'])
      (Tasks
        id: 'tasksContainer'
        key: 'isotopeTasks'
        query: @state.query
        params: @state.params
      , [])
#      (IsotopeTest {id: 'tasksContainer', key: 'isotopeTasks'}, [])
    ])

App = React.createClass
  displayName: 'App'
  mixins: [WebUtilsMixin]

  getInitialState: ->
    # Represents the currently authed user
    'authedUser': Auth.authedUser
    # Represents the currently scoped user, i.e. ?ssoUsername=rhn-support-someone
    'scopedUser': Auth.scopedUser
    'authFailed': false
    'scopedFailed': false

  queryScopedUser: (ssoUsername) ->
    self = @
    userPromise = @getUser(ssoUsername)
    userPromise?.done((user) ->
      if _.isArray(user) then user = user[0]

      if user?['externalModelId']?
        console.debug "Setting scoped user to: #{user['resource']['firstName']}"
        Auth.setScopedUser(user)
        self.setState
          'scopedUser': user
          'scopedFailed': false
      else
        Auth.setScopedUser(undefined)
        self.setState
          'scopedUser': user
          'scopedFailed': true
        console.error "User: #{JSON.stringify(user, null, ' ')} has no id"
    , (err) ->
      Auth.setScopedUser(undefined)
      self.setState
        'scopedUser': undefined
        'scopedFailed': true
      console.error err
    )

  componentWillReceiveProps: (nextProps) ->
    #console.debug "componentWillReceiveProps:query: #{JSON.stringify(nextProps.query)}"
    #console.debug "componentWillReceiveProps:params: #{JSON.stringify(nextProps.params)}"
    # This means the ssoUsername changed, need to re-query to scope this user
    if not _.isEqual(@props.query.ssoUsername, nextProps.query.ssoUsername)
      @queryScopedUser(nextProps.query.ssoUsername)

  componentDidMount: ->
    self = @
    ssoUsername = @getRhUserCookie()
    # TODO -- if no RhUserCookie, redirect to the gss.my
    if ssoUsername?
      userPromise = @getUser(ssoUsername)
      userPromise?.done((user) ->
        if _.isArray(user) then user = user[0]

        if user?['externalModelId']?
          console.debug "Setting authed user to: #{user['resource']['firstName']}"
          Auth.setAuthedUser(user)
          self.setState
            'authedUser': user
            'authFailed': false
        else
          Auth.setAuthedUser(undefined)
          self.setState
            'authedUser': undefined
            'authFailed': true
          console.error "User: #{JSON.stringify(user, null, ' ')} has no id"
      , (err) ->
        Auth.setAuthedUser(undefined)
        self.setState
          'authedUser': undefined
          'authFailed': true
        console.error err
      )
    else
      Auth.setAuthedUser(undefined)
      self.setState
        'authedUser': undefined
        'authFailed': true

    if @props.query.ssoUsername? and @props.query.ssoUsername isnt ''
      @queryScopedUser(@props.query.ssoUsername)

  genAuthenticationElement: () ->
    if Auth.getAuthedUser()?
      return (p {className: 'navbar-text', key: 'navbar-right'}, ["Logged in as #{Auth.getAuthedUser()['resource']['firstName']} #{Auth.getAuthedUser()['resource']['lastName']}"])
    else
      return (a {target: '_blank', href: 'https://gss.my.salesforce.com', key: 'sso'}, ['https://gss.my.salesforce.com'])

  genMainContents: () ->
    if @state.authFailed is true
      return (Alert {bsStyle: "warning", key: 'alert'}, [
        "Not authenticated, please login @ "
        (a {target: '_blank', href: 'https://gss.my.salesforce.com', key: 'sso'}, ['https://gss.my.salesforce.com'])
        " and refresh."
      ])
    else if @state.scopedFailed is true
      return (Alert {bsStyle: "warning", key: 'alert'}, [
        "Scoped User failed to load, make sure you typed in the rhn-support-<name> correctly, ex. rhn-support-rmanes"
      ])
    else
      @props.activeRouteHandler()

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
                params: {_id: 'tasks'}
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
              @genAuthenticationElement()
            ])
          ])
        ])
      ])
      (div {className: 'container-ascension', key: 'mainContainer'}, [
        @genMainContents()
      ])
    ])

routes = (
  (Routes {location: 'hash'}, [
    #params: '{ssoUsername: true, admin: true}',
    (Route {key: 'app', name: 'app', path: '/', handler: App}, [
      #(Route {key: 'dashboard', name: 'dashboard', handler: Dashboard, addHandlerKey: true}, [])
      #(Route {key: 'dashboard', name: 'dashboard', path: 'dashboard/:_id', handler: Dashboard, addHandlerKey: true}, [])
      (Route {key: 'dashboard', name: 'dashboard', path: 'dashboard/:_id', handler: Dashboard}, [])
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
