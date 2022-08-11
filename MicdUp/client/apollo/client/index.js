import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getData } from "../../reuseableFunctions/helpers";
import {
  privateUrl,
  publicUrl,
} from "../../reuseableFunctions/constantsshared";
const httpLinkPublic = createHttpLink({
  uri: publicUrl,
});

const httpLinkPrivate = createHttpLink({
  uri: privateUrl,
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

const privateClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLinkPrivate),
});

const publicClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLinkPublic),
});

export { publicClient, privateClient };
