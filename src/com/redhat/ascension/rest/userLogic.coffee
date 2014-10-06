fs                = require 'fs'
logger            = require('tracer').colorConsole()
settings          = require '../settings/settings'
Utils             = require '../utils/utils'
prettyjson        = require 'prettyjson'
_                 = require 'lodash'
moment            = require 'moment'
Q                 = require 'q'
MongoOps          = require '../db/MongoOperations'
mongoose          = require 'mongoose'
mongooseQ         = require('mongoose-q')(mongoose)
TaskActionsEnum   = require './enums/taskActionsEnum'
request           = require 'request'
Uri               = require 'jsuri'

UserLogic = {}

UserLogic.normalizeUserResponse = (body) ->
  u = undefined
  if _.isArray(body)
    u = body[0]
  else
    u = body

  if u?
    id = u['externalModelId']
    u = u['resource']
    u.id = id
    u.email = u.email[0]?.address
    u.sso = u.sso[0]
  u

UserLogic.fetchUser = (opts) ->
  self = UserLogic
  deferred = Q.defer()

  opts =
    url: "#{settings.UDS_URL}/user/#{opts.userInput}"
    json: true

  logger.debug "UserLogic.fetchUser: #{opts.url}"
  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    user = self.normalizeUserResponse(body)

    if err
      deferred.reject err
      return

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

  deferred.promise

module.exports = UserLogic
