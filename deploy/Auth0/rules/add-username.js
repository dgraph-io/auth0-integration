function addUsername(user, context, callback) {
  const namespace = "https://myapp.io/claims"
  context.idToken[namespace] = {
    username: user.email,
  }

  return callback(null, user, context)
}
