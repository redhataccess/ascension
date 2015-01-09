moment    = require 'moment'
_         = require 'lodash'
Uri       = require 'jsUri'
Q         = require 'q/q'

urlPrefix = '/etc/os1/ascension'

Mixin =

  get: (opts) ->

    metricsConfig =
      data: {}
      xhrFields:
        withCredentials: true
      timeout: 60000  # 30s
      cache: true

    uri = new Uri()
    if ENVIRONMENT is 'production'
      uri.setPath "#{urlPrefix}#{opts.path}"
    else
      uri.setPath "#{opts.path}"

    #uri.addQueryParam('accountIds', accountIds.join(','))
    #uri.addQueryParam('beginDate', opts.beginDate) if opts.beginDate?
    #uri.addQueryParam('endDate', opts.endDate) if opts.endDate?
    _.each opts['queryParams'], (queryParam) ->
      uri.addQueryParam(queryParam['name'], queryParam['value'])

    #console.debug "getMetrics: #{JSON.stringify(config.data)}"
    callConfig = _.defaults(_.clone(metricsConfig), {url: uri.toString()})

    # Ensure the ajax promise is A+ promise compatible
    Q($.ajax(callConfig))

  post: (opts) ->

    metricsConfig =
      data: {}
      xhrFields:
        withCredentials: true
      timeout: 60000  # 30s
      cache: true
      type: 'POST'

    uri = new Uri()
    if ENVIRONMENT is 'production'
      uri.setPath "#{urlPrefix}#{opts.path}"
    else
      uri.setPath "#{opts.path}"

    _.each opts['queryParams'], (queryParam) ->
      uri.addQueryParam(queryParam['name'], queryParam['value'])

    callConfig = _.defaults(_.clone(metricsConfig), {url: uri.toString()})

    Q($.ajax(callConfig))

module.exports = Mixin
