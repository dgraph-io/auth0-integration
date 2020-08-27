import React from "react"
import { useQuery, gql } from "@apollo/client"
import { useAuth0 } from "@auth0/auth0-react"

const GET_USER = gql`
  query($username: String!) {
    getUser(username: $username) {
      username
      displayname
    }
  }
`

function App() {
  const {
    auth0IsLoading,
    auth0Error,
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0()

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { username: user.email ? user.email : "no user" },
  })

  if (auth0IsLoading) {
    return <p>Auth0 is starting</p>
  }
  if (auth0Error) {
    return <p>Oops, Auth0 couldn't start: {error.message}</p>
  }

  if (loading) {
    return <p>Loading</p>
  }
  if (error) {
    return <p>`GraphQL Error: ${error.message}`</p>
  }

  return (
    <div>
      {!isAuthenticated ? (
        <p>
          <button onClick={loginWithRedirect}>Log in</button> to say hi.
        </p>
      ) : (
        <p>
          Hi {data.displayname}, you can
          <button
            onClick={() => {
              logout({ returnTo: window.location.origin })
            }}
          >
            Log out
          </button>{" "}
          once you are finished.
        </p>
      )}
    </div>
  )
}

export default App
