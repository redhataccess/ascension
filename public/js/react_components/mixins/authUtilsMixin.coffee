moment        = require 'moment'
_             = require 'lodash'
Uri           = require 'jsUri'
Q             = require 'q/q'
Q.longStackSupport = true
S   = require 'string'
WebUtilsMixin = require './webUtilsMixin.coffee'
AjaxMixin     = require './ajaxMixin.coffee'

Mixin =

  getCookie: (key) ->
    key = key + "="
    for c in document.cookie.split(';')
      c_trimmed = WebUtilsMixin.trim(c)
      return c_trimmed.substring(key.length, c_trimmed.length) if c_trimmed.indexOf(key) is 0
    return null

  getRhUserCookie: ->

    rh_user = this.getCookie('rh_user')
    if rh_user? and rh_user.indexOf("|") != -1
      rh_user = rh_user.substring(0, rh_user.indexOf("|"))

      # Make a call here to the backend to set the authenticated user
      #if not authenticated_sfdc_user()?
      #  req = $.get "/sfdc_user", {sso_username: rh_user}
      #  req.done (response) =>
      #    the_response = parse_or_return_json(response)
      #    @authenticated_sfdc_user(the_response)
      #  req.fail (jqXHR, textStatus, errorThrown) =>
      #    noty {text: "Could not authenticate your user with rh_user: #{rh_user}", type: 'error'}

      return rh_user
    else
      return undefined

  getUser: (ssoUsername) ->
    deferred = Q.defer()

    if ssoUsername? and ssoUsername isnt ''

      #url = "/user/#{ssoUsername}"
      ssoUsername = S(ssoUsername).replaceAll('"', '').s
      path = "/user?where=SSO is \"#{ssoUsername}\" and (isActive is true)"

      AjaxMixin.get({path: path})
      .then((user) =>
        deferred.resolve(user)
      )
      .catch((err) =>
        console.error("Error while retrieving user: #{ssoUsername}, #{err.stack}")
        deferred.reject "Error while retrieving user: #{ssoUsername}"
      )
      .done()
    else
      deferred.reject "No ssoUsername specified"

    deferred.promise

  queryUser: (ssoUsername) ->
    deferred = Q.defer()
    userPromise = @getUser(ssoUsername)
    userPromise?.then((user) ->
      if _.isArray(user)
        deferred.resolve user[0]
      else if user?['externalModelId']?
        deferred.resolve user
      else
        deferred.reject "User: #{JSON.stringify(user, null, ' ')} has no id"
    ).catch((err) ->
      deferred.reject "No user found given ssoUsername: #{ssoUsername}, err: #{err.stack}"
    ).done()
    deferred.promise

module.exports = Mixin
