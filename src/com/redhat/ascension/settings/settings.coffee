# https://github.com/nodeca/js-yaml
yaml        = require('js-yaml')
fs          = require('fs')
logger      = require('tracer').colorConsole()
prettyjson  = require 'prettyjson'
_           = require 'lodash'
Q           = require 'q'


Q.longStackSupport = true

# Load the config file either locally or in openshift if the OPENSHIFT_DATA_DIR variable exists
configFile = "#{process.env['HOME']}/.ascension-settings.yml"
if process.env['OPENSHIFT_DATA_DIR']?
  logger.debug "Loading settings under Openshift"
  configFile = "#{process.env['OPENSHIFT_DATA_DIR']}/.ascension-settings.yml"
else
  logger.debug "Loading settings under a non-Openshift env"
  configFile = "#{process.env['HOME']}/.ascension-settings.yml"

exports.resolveEnvVar = (envVar) ->
  if envVar is undefined then return undefined
  # See if the starting starts with a $, ie an environment variable

  if /^\$/i.test(envVar)
    val = process.env[envVar.slice 1, envVar.length]
    if val isnt '' and val isnt null
      logger.debug "resolved #{envVar} to #{val}"
      return val
    else
      logger.debug "resolved #{envVar} to undefined"
      return undefined

  logger.debug "resolved #{envVar} to #{envVar}"
  return envVar

exports.getEnvVar = (env) ->
  if process.env[env] isnt '' and process.env[env] isnt null
    logger.debug "resolved #{env} to #{process.env[env]}"
    return process.env[env]
  else
    logger.debug "resolved #{env} to undefined"
    return undefined

########################################################################################################################
# Export the KCS urls
########################################################################################################################
exports.AUTH_URL = "https://access.redhat.com/services/user/status"
exports.SF_URL = "https://na7.salesforce.com"

########################################################################################################################
# Export the UDS urls
########################################################################################################################
exports.UDS_URL = 'http://unified-ds.gsslab.rdu2.redhat.com:9100'

########################################################################################################################
# Export times - Remember redis setex takes seconds
########################################################################################################################
exports.ONE_DAY_IN_S = 86400
exports.ONE_DAY_IN_MS = 86400 * 1000

# There is a bit of a race condition here since a standalone prog will end up attempting to access the mongo data
# Before it is loaded.  The best way would be to use a callback, but that gets a bit complicated when handling modules
try
  doc = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'))
  #logger.debug "Succssfully read #{configFile}, properties: #{prettyjson.render doc}"
  exports.config = doc
  exports.config.SFDC_API_PASS = new Buffer(doc.SFDC_API_PASS, 'base64').toString('ascii').replace('\n', '')

  #logger.debug prettyjson.render exports.config
  # Figure the environment we are running in.  Easiest to base this on the settings yaml
  exports.env = doc.env
  exports.environment = doc.env

  logger.info "Running in #{doc.env}"

catch e
  #logger.error prettyjson.render(e)
  throw e
