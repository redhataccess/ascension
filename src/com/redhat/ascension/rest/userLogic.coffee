fs                = require 'fs'
logger            = require('tracer').colorConsole()
settings          = require '../settings/settings'
Utils             = require '../utils/utils'
prettyjson        = require 'prettyjson'
_                 = require 'lodash'
moment            = require 'moment'
Q                 = require 'q'
TaskActionsEnum   = require './enums/taskActionsEnum'
request           = require 'request'
requestify        = require 'requestify'
Uri               = require 'jsuri'

UserLogic = {}

UserLogic.normalizeUserResponse = (body) ->
  u = undefined

  if _.isString(body)
    u = JSON.parse(body)

  if _.isArray(body)
    u = body[0]
  else
    u = body

  if u?['resource']?
    id = u['externalModelId']
    u = u['resource']
    u.id = id
    u.email = u.email?[0]?.address
    u.sso = u.sso?[0]
  u

UserLogic.fetchUser = (opts) ->
  self = UserLogic
  deferred = Q.defer()

  opts =
    url: "#{settings.UDS_URL}/user/#{opts.userInput}"
    json: true
    gzip: true

  request opts, (err, response, body) ->
    user = self.normalizeUserResponse(body)

    if err
      deferred.reject err
      return;

    if not user?
      deferred.reject "Could not find user with input: #{opts.userInput}"
      return

    deferred.resolve user

  deferred.promise


UserLogic.fetchUserUql = (opts) ->
  self = UserLogic
  deferred = Q.defer()

  uri = new Uri(settings.UDS_URL).setPath('/user').setQuery('where=' + opts.where)
  opts =
    url: uri.toString()
    json: true
    gzip: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    user = undefined

    if _.isArray(body)
      user = self.normalizeUserResponse(body[0])
    else
      user = self.normalizeUserResponse(body)

    if err
      deferred.reject err
      return

    if not user?
      deferred.reject "Could not find user with input: #{opts.userInput}"
      return

    deferred.resolve user
#  requestify.get(opts.url).then((response) ->
#    user = self.normalizeUserResponse(response.getBody())
#    deferred.resolve user
#  , (err) ->
#    deferred.reject err
#  )

  deferred.promise

UserLogic.fetchUsersUql = (opts) ->
  self = UserLogic
  deferred = Q.defer()

  uri = new Uri(settings.UDS_URL).setPath('/user').setQuery('where=' + opts.where)
  opts =
    url: uri.toString()
    json: true
    gzip: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    if err
      deferred.reject err
      return

    users = []

    _.each body, (u) ->
      normalizedUser = self.normalizeUserResponse(u)
      users.push normalizedUser

    deferred.resolve users

  deferred.promise

module.exports = UserLogic
