const SINGLE_POST_KEY = "SinglePost";
import Rollbar from "rollbar";
const config = {
  accessToken: "9acdab57458540fda4d4df662189d166",
  enviorment: "production",
};
const rollbar = new Rollbar(config);
export { SINGLE_POST_KEY, rollbar };
