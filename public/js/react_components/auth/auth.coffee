Store = require 'store.js/store'

Auth =
  'authedUser': undefined

  setAuthedUser: (user) ->
    Auth.authedUser = user
    Store.set('authedUser', user)
  getAuthedUser: ->
    Auth.authedUser || Store.get('authedUser')

  'scopedUser': undefined
  setScopedUser: (user) ->
    Auth.scopedUser = user
    Store.set('scopedUser', user)
  getScopedUser: ->
    Auth.scopedUser || Store.get('scopedUser')

module.exports = Auth