import { client } from "./client";
import { LOGIN_QUERY } from "../apollo/public/auth";
import { user1, user2, user3 } from "./dummyData/user";
test("Test login with username", async () => {
  const res = await client.query({
    query: LOGIN_QUERY,
    variables: { authenticator: user1.userName, password: user1.password },
    fetchPolicy: "no-cache",
  });
  expect(res.data.login.success).toBe(true);
});

test("Test login with email", async () => {
  const res = await client.query({
    query: LOGIN_QUERY,
    variables: { authenticator: user1.email, password: user1.password },
    fetchPolicy: "no-cache",
  });
  expect(res.data.login.success).toBe(true);
});

test("Test login with phone", async () => {
  const res = await client.query({
    query: LOGIN_QUERY,
    variables: { authenticator: user1.phone, password: user1.password },
    fetchPolicy: "no-cache",
  });
  expect(res.data.login.success).toBe(true);
});

test("Test login with phone invalid password", async () => {
  const res = await client.query({
    query: LOGIN_QUERY,
    variables: { authenticator: user1.phone, password: "InvalidPassword1!" },
    fetchPolicy: "no-cache",
  });
  expect(res.data.login.success).toBe(false);
});
