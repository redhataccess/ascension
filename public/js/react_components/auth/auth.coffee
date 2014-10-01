Store = require 'store.js/store'

Auth =
  'authedUser': undefined
  set: (user) ->
    Auth.authedUser = user
    Store.set('authedUser', user)
  get: ->
    Auth.authedUser || Store.get('authedUser')

module.exports = Auth