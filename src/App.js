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

function HelloUser(props) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { username: props.username },
  })

  if (loading) {
    return <p>Loading</p>
  }
  if (error) {
    return <p>`GraphQL Error: ${error.message}`</p>
  }

  return (
    <div>
      Hi {data.getUser.displayname}, you can
      <button
        onClick={() => {
          props.logout({ returnTo: window.location.origin })
        }}
      >
        Log out
      </button>{" "}
      once you are finished.
    </div>
  )
}

function App() {
  const {
    auth0IsLoading,
    auth0Error,
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0()

  if (auth0IsLoading) {
    return <p>Auth0 is starting</p>
  }
  if (auth0Error) {
    return <p>Oops, Auth0 couldn't start: {auth0Error}</p>
  }

  return (
    <div>
      {!isAuthenticated ? (
        <p>
          <button onClick={loginWithRedirect}>Log in</button> to say hi.
        </p>
      ) : (
        <HelloUser username={user.name} logout={logout} />
      )}
    </div>
  )
}

export default App
