Auth =
  authedUser: undefined
  setAuthedUser: (user) ->
    if user?
      Auth.authedUser = user
      localStorage.setItem('authedUser', JSON.stringify(user))
    else
      console.error("Attempting to localStore save an undefined user")
  getAuthedUser: ->
    user = Auth.authedUser || localStorage.getItem('authedUser')
    if user? and (user isnt "undefined")
      return if (typeof user is "object") then user else JSON.parse(user)

module.exports = Auth