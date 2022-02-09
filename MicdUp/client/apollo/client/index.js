import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getData } from "../../reuseableFunctions/helpers";
const httpLinkPublic = createHttpLink({
  uri: "http://localhost:6002/public",
});

const httpLinkPrivate = createHttpLink({
  uri: "http://localhost:6002/private",
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const userToken = await getData("token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: userToken ? `Bearer ${userToken}` : "",
    },
  };
});

const nonAuthLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
    },
  };
});

const privateClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLinkPrivate),
});

const publicClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: nonAuthLink.concat(httpLinkPublic),
});

export { publicClient, privateClient };
