/**
@param {object} client - information about the client
@param {string} client.name - name of client
@param {string} client.id - client id
@param {string} client.tenant - Auth0 tenant name
@param {object} client.metadata - client metadata
@param {array|undefined} scope - array of strings representing the scope claim or undefined
@param {string} audience - token's audience claim
@param {object} context - additional authorization context
@param {object} context.webtask - webtask context
@param {function} cb - function (error, accessTokenClaims)
*/

// Add this hook as a "Client Credentials Exchange" hook.
// You'll need to set up a corresponding "MACHINE TO MACHINE"
// application so you can get a client ID and secret to
// call this hook (see add-user-to-slash-graphql.js for how it's called).
//
// This gets called by the Auth0 login flow on a first login to generate
// a special JWT that has the permission to add a new user to Slash GraphQL.
//
// There's no way to get such a JWT except via this code, and it's
// only run by Auth0 (or if you know the Auth0 client secrets), 
// so adding users is a secured flow in the app and can only happen for 
// users who sign up using the Auth0 flow.

module.exports = function (client, scope, audience, context, cb) {
  var access_token = {}
  access_token.scope = scope
  access_token["<<app-claims-namespace>>"] = { role: "Admin" }

  cb(null, access_token)
}
