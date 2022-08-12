import Rollbar from "rollbar";

const SINGLE_POST_KEY = "SinglePost";

const config = {
  accessToken: "9acdab57458540fda4d4df662189d166",
  enviorment: "production",
};
const rollbar = new Rollbar(config);

const updateMusicControlPause = () => {};
const updateMusicControlNewSoundPlaying = () => {};

export {
  SINGLE_POST_KEY,
  rollbar,
  updateMusicControlPause,
  updateMusicControlNewSoundPlaying,
};
