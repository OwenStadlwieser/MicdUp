import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
console.log(process.env.REACT_APP_URL);
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_URL,
});
console.log(httpLink);

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const tokenString = sessionStorage.getItem("token");
  const userToken = JSON.parse(tokenString);
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
