_   = require 'lodash'
Q   = require 'q'
Q.longStackSupport = true
S   = require 'string'


WebUtilsMixin = {}

WebUtilsMixin.calculateSpinnerClass = (loading) -> if loading is true then 'fa-spinner fa-spin' else ''

# Where x = [[var1, var2], [var3, var4], ect..]
WebUtilsMixin.isEqual = (x) ->
  _.each x, (group) -> if not _.isEqual(group[0], group[1]) then return false
  return true

WebUtilsMixin.trim = (str) ->
  newstr = str.replace(/^\s*/, "").replace(/\s*$/, "")
  newstr = newstr.replace(/\s{2,}/, " ")


WebUtilsMixin.isDefined = (obj, path) ->
  return false unless obj # no object, return false
  return true if obj and not path # has object, no path, return true

  # I suggest var per variable for clarity
  props = path.split(".")
  currentObject = obj
  i = 0

  while i < props.length

    #store the next property, evaluate and break out if it's undefined
    currentObject = currentObject[props[i]]
    return false unless currentObject
    ++i

  # If the loop did not break until the last path, then the path exists
  true

# Null safe return a deeply nested object
WebUtilsMixin.getDefined = (obj, path) ->
  return null unless obj # no object, return false

  # I suggest var per variable for clarity
  props = path.split(".")
  currentObject = obj
  i = 0

  while i < props.length

    #store the next property, evaluate and break out if it's undefined
    currentObject = currentObject[props[i]]
    return null unless currentObject
    ++i

  currentObject

module.exports = WebUtilsMixin
