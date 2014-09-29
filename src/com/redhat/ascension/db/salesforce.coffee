jsforce     = require 'jsforce'
utils       = require('../utils/utils')
settings    = require('../settings/settings')
logger      = require('tracer').colorConsole(utils.logger_config)
prettyjson  = require 'prettyjson'
_           = require 'lodash'

# Create a regular Salesforce instance
pass_token = "#{settings.config.SFDC_API_PASS}#{settings.config['SFDC_API_TOKEN']}"
pass_token = pass_token.replace('\n', '')
#logger.debug "Connecting to pass_token: #{pass_token}"
#c = new jsforce.Connection({})
c = undefined

########################################################################################################################
# Login to the regular SF instance
#'Error: {"message":"Session expired or invalid","errorCode":"INVALID_SESSION_ID"}'
########################################################################################################################
login = (callback) ->
  c.login settings.config['SFDC_API_USER'], pass_token, (err, userInfo) ->
    if err
      logger.debug "Lost sf connection: #{prettyjson.render(err)}"

    logger.info "Access Token: #{c.accessToken}"
    logger.debug "User ID: #{userInfo.id}"
    logger.debug "Org ID: #{userInfo.organizationId}"
    callback()

  c.on "refresh", (accessToken, res) ->
    logger.info "Access Token refreshed: #{c.accessToken}"

# Perform an initial login
#login () -> undefined
########################################################################################################################

counter = 0

recoverableError = (err) ->
  ((err?.errorCode is "INVALID_SESSION_ID") or (err?.errorCode is "ECONNRESET") or (err?['message'] is "Invalid protocol"))

handleLogin = (opts, callback) ->
  if not c?
    c = new jsforce.Connection({})
    logger.debug "Querying SF for the first time, logging in..."
    login () -> callback()
  else if recoverableError(opts.err)
    login () -> callback()
  else
    callback()

querySfHelper = (opts, callback) ->
  handleLogin {}, ->
    # Allow at least 2 reconnection attempts
    if counter <= 2
      records = []
      logger.debug "Querying Salesforce with: #{prettyjson.render opts.soql}"

      try
        query = c.query opts['soql']
        query
        .on('record', (record) ->
          records.push record
        )
        .on('error', (err) ->
          logger.debug "recoverable? #{recoverableError(err)}"
          if recoverableError(err) and counter < 10
            logger.error "SOQL produced an error: #{err} Attempting to re-login"
            counter += 1
            handleLogin {err: err}, () ->
              logger.debug "Attmpting to re-query with the original soql."
              querySfHelper(opts,callback)
          else
            counter = 0
            logger.error "SOQL produced an error: #{err}, this is a hard failure, soql: #{prettyjson.render opts.soql}"
            callback JSON.stringify(err)
        )
        .on('end', () ->
          output = if opts['single'] is true then records?[0] else records
          callback null, output
        )
        .run {autoFetch: true, maxFetch: 10000}
      catch e
        logger.debug "recoverable? #{recoverableError(err)}"
        if recoverableError(err) and counter < 10
          logger.error "SOQL produced an error: #{err} Attempting to re-login"
          counter += 1
          handleLogin {err: err}, () ->
            logger.debug "Attmpting to re-query with the original soql."
            querySfHelper(opts,callback)

    else
      counter = 0
      callback "Max 2 reconnection tries attempted, please contact smendenh@redhat.com"

querySf = (opts, callback) ->
  querySfHelper opts, (err, results) -> callback err, results


exports.SPAM_QUEUE_ID = '00GA0000000XxxNMAS'
exports.querySf = querySf
exports.handleLogin = handleLogin
exports.conn = c
#exports.jsforce = jsforce

exports.cleanup = () ->
  c.logout (err) ->
    if err
      logger.error "Session has already expired: #{err}"
    logger.debug "Successfully logged out of the SF session with Access Token: #{c.accessToken}"
