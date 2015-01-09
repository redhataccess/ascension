moment    = require 'moment'

#http://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript
Mixin =

  dynamicSort: (property) ->
    sortOrder = 1
    if property[0] is "-"
      sortOrder = -1
      property = property.substr(1)
    (a, b) ->
      result = (if (a[property] < b[property]) then -1 else (if (a[property] > b[property]) then 1 else 0))
      result * sortOrder

  dynamicSortMultiple: ->
    props = arguments
    (obj1, obj2) ->
      i = 0
      result = 0
      numberOfProperties = props.length

      # try getting a different result from 0 (equal)
      #         * as long as we have extra properties to compare
      #
      while result is 0 and i < numberOfProperties
        result = this.dynamicSort(props[i])(obj1, obj2)
        i++
      result

module.exports = Mixin
