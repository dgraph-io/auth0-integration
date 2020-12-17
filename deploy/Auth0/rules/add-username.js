function addUsername(user, context, callback) {
  const namespace = "<<app-claims-namespace>>"
  context.idToken[namespace] = {
    userID: user.email,
  }

  return callback(null, user, context)
}
