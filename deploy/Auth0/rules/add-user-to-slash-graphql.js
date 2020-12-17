function addUserToSlashGraphQL(user, context, callback) {
  const axios = require("axios@0.19.2")
  const { GraphQLClient } = require("graphql-request@1.8.2")

  // Fill these values in with the details of your Auth0 "MACHINE TO MACHINE" application.
  // Creating the M2M app gives you the credentials needed to call the
  // "Client Credentials Exchange" and thus generate an Auth0 signed JWT that has
  // permission to add a user to the Slash GraphQL database.
  const authorizationHook = "<<your-M2M-hook>>"
  const clientID = "<<your-client-id>>"
  const clientSecret = "<<your-client-secret>>"
  const authAudience = "<<your-M2M-audience>>"

  // Fill this value with your Slash GraphQL backend.
  const slashGraphQL = "<<your-Slash-GraphQL-URL>>"

  const findUser = `
    query getUser($userID: String!) {
      getUser(userID: $userID) {
        userID
      }
    }
  `

  const addUser = `
    mutation($userID: String!, $displayName: String) {
      addUser(input: [{ userID: $userID, displayName: $displayName }]) {
        user {
          userID
        }
      }
    }
  `

  axios
    .post(authorizationHook, {
      client_id: clientID,
      client_secret: clientSecret,
      audience: authAudience,
      grant_type: "client_credentials",
    })
    .then(function (response) {
      // Now we have a signed JWT in body.access_token that has the "Admin" role, so we 
      // query if this user exists and can add the new user into Slash GraphQL with an 
      // authenticated GraphQL mutation.

      const client = new GraphQLClient(slashGraphQL, {
        headers: { Authorization: response.data.access_token },
      })

      const displayName = user.email.substring(0, user.email.lastIndexOf("@"));

      // This code is called during the login flow.  Depending on the Auth0 settings, a user 
      // could be logging in with username password, through a social connection, etc.  not all
      // those flows go through the Auth0 post-user-registration hook, so the best way to insert
      // a user is to check on sign-in if they exist in Slash GraphQL and make a choice based on
      // the result.
      //
      // This is also the flow you'd use if you were enriching the JWT with data from Slash GraphQL.
      // For example, if data in Slash GraphQL gave the user a role to insert into the JWT, or other
      // values that your app needs in the JWT rather than via query once the user has the JWT
      // (e.g. the JWT we are using at this point has an "Admin" role which might be able to query
      // in a way that the user, can't.).

      client
        .request(findUser, { userID: user.user_id })
        .then((data, error) => {
          if (error) {
            callback(error, user, context)
          } else if (data && data.getUser && data.getUser.userID) {
            // The user is already in the Slash GraphQL database
            callback(null, user, context)
          } else {
            client
              .request(addUser, { userID: user.user_id, displayName: displayName })
              .then((data, error) => {
                callback(error, user, context)
              })
              .catch((error) => {
                callback(error, user, context)
              })
          }
        })
        .catch((error) => {
          callback(error, user, context)
        })
    })
    .catch((error) => {
      callback(error, user, context)
    })
}
