import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "http://localhost:6002/",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // FIXME: FOR IOS
  // const tokenString = sessionStorage.getItem("token");
  // const userToken = JSON.parse(tokenString);
  const userToken = "";
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: userToken ? `Bearer ${userToken}` : "",
    },
  };
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

export { client };
