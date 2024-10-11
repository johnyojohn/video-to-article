import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// TODO: this sucks for some reason can't handle big loads

const httpLink = createHttpLink({
  uri: "http://localhost:8080/query",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;