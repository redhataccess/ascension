_   = require 'lodash'
Q   = require 'q'


WebUtilsMixin = {}

WebUtilsMixin.calculateSpinnerClass = (loading) -> if loading is true then 'fa-spinner fa-spin' else ''

# Where x = [[var1, var2], [var3, var4], ect..]
WebUtilsMixin.isEqual = (x) ->
  _.each x, (group) -> if not _.isEqual(group[0], group[1]) then return false
  return true

WebUtilsMixin.trim = (str) ->
  newstr = str.replace(/^\s*/, "").replace(/\s*$/, "")
  newstr = newstr.replace(/\s{2,}/, " ")

WebUtilsMixin.getCookie = (key) ->
  key = key + "="
  for c in document.cookie.split(';')
    c_trimmed = WebUtilsMixin.trim(c)
    return c_trimmed.substring(key.length, c_trimmed.length) if c_trimmed.indexOf(key) is 0
  return null

WebUtilsMixin.getRhUserCookie = ->
  rh_user = WebUtilsMixin.getCookie('rh_user')
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

WebUtilsMixin.getUser = (ssoUsername) ->
  deferred = Q.defer()

  if ssoUsername? and ssoUsername isnt ''

    #url = "/user/#{ssoUsername}"
    url = "/user?where=SSO is \"#{ssoUsername}\" and (isActive is true)"

    config =
      url: url
    #data: {}
    #crossDomain: true
      type: 'GET'
    #xhrFields:
    #  withCredentials: true
      timeout: 60000  # 30s
      success: ((result, textStatus, jqXHR) ->
        deferred.resolve result
      ).bind(this)
      error: ((jqXHR, textStatus, errorThrown) ->
        console.error("Error while retrieving user: #{ssoUsername}")
        deferred.reject "Error while retreiving user: #{ssoUsername}"
      ).bind(this)

    #_.defaults(config, {'url': url})

    $.ajax config

  deferred.promise


module.exports = WebUtilsMixin
