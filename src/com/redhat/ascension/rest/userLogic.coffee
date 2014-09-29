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

UserLogic = {}

UserLogic.fetchUser = (opts) ->
  deferred = Q.defer()

  opts =
    url: "#{settings.UDS_URL}/user/#{opts.userInput}"
    json: true

  # Lookup user based on given sso username
  request opts, (err, response, body) ->
    user = body['resource']

    if err
      deferred.reject err
      return

    if not user?
      deferred.reject "Could not find user with input: #{opts.userInput}"
      return

    # Now transform the UDS user
    user.email = user.email[0]?.address
    user.sso = user.sso[0]
    user.id = body['externalModelId']

    deferred.resolve user

  deferred.promise

module.exports = UserLogic
