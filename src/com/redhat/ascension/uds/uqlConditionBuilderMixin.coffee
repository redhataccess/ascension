moment = require 'moment'

module.exports =
  and: (l, r) ->
    if l? and r?
      "(#{l} and #{r})"
    else if l?
      "(#{l})"
    else if r?
      "(#{r})"
    else
      undefined

  or: (l, r) ->
    if l? and r?
      "(#{l} or #{r})"
    else if l?
      "(#{l})"
    else if r?
      "(#{r})"
    else
      undefined

  cond: (field, op, val) ->
    if val?
      "#{field} #{op} #{val}"
    else
      undefined

  dateRangeCond: (from, to) ->
    fromCond = @uqlCond("date", "gte", moment(from).format("YYYY/MM/DD"))
    toCond = @uqlCond("date", "lte", moment(to).format("YYYY/MM/DD"))
    @uqlAnd(fromCond, toCond)
