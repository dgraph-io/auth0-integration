// This enrichment function is an example and isn't called in the default setup for the
// integration.
//
// As mentioned in add-user-to-slash-graphql.js, the data to enrich the JWT could come 
// from data that the logging-in user can't read (perhaps the list of 'Admin' users is
// protected).  In which case, you'd do something like use a JWT with special authentication
// (as add-user-to-slash-graphql.js does to add users) and enrich the JWT from such values.
//
// If permission data is always readable to an authenticated user ... then your app
// can probably read that as part of its in-app flows once it's received the signed
// JWT after user-login. 

// This example is taken from 
// https://github.com/dgraph-io/discuss-tutorial
// where the app reads a user's roles and assigns a role of "Admin" or "User"
// to each user sign-in and that permission grants "Admin" users the right
// to create new categories, block users, assign other users as Admins, etc.

function enrichJWTFromSlashGraphQL(user, context, callback) {
  // In a production app, roles should only be set to verified users.
  // if (!user.email || !user.email_verified) {
  //   return callback(null, user, context)
  // }

  const axios = require("axios@0.19.2")
  const { GraphQLClient } = require("graphql-request@1.8.2")

  // Fill these values in with the details of your Auth0 "MACHINE TO MACHINE" application.
  // Creating the M2M app gives you the credentials needed to call the
  // "Client Credentials Exchange" and thus generate an Auth0 signed JWT.
  const authorizationHook = "<<your-M2M-hook>>"
  const clientID = "<<your-client-id>>"
  const clientSecret = "<<your-client-secret>>"
  const authAudience = "<<your-M2M-audience>>"

  // Fill this value with your Slash GraphQL backend.
  const slashGraphQL = "<<your-Slash-GraphQL-URL>>"

  // Fill this in with the custom claims namespace for your app.
  const namespace = "<<app-claims-namespace>>"

  const getLoggedInUser = `
    query getLoggedInUser($userID: String!) {
      getUser(userID: $userID) {
        roles {
          role
          forCategory {
            id
          }
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
      const client = new GraphQLClient(slashGraphQL, {
        headers: { Authorization: response.data.access_token },
      })

      client
        .request(getLoggedInUser, { userID: user.user_id })
        .then((data, error) => {
          if (error) {
            callback(error, user, context)
          } else {
            // console.log(data)
            const hasAdminRole = !!(
              data &&
              data.getUser &&
              data.getUser.roles.find(
                (p) => p.role === "ADMINISTRATOR" && !p.forCategory
              )
            )
            context.idToken[namespace].role = hasAdminRole ? "Admin" : "User"

            callback(null, user, context)
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
