import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getData } from "../../reuseableFunctions/helpers";
const httpLink = createHttpLink({
  uri: "http://10.0.2.2:6002/",
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

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

export { client };
