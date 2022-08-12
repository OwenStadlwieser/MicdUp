import { Client } from "rollbar-react-native";
import MusicControl from "../../components/reuseable/MusicControl";

const SINGLE_POST_KEY = "SinglePost";

const rollbar = new Client("9acdab57458540fda4d4df662189d166");

const updateMusicControlPause = () => {
  MusicControl.updatePlayback({
    state: MusicControl.STATE_STOPPED,
  });
};

const updateMusicControlNewSoundPlaying = (sound) => {
  MusicControl.setNowPlaying({
    title: sound.title, // (STATE_ERROR, STATE_STOPPED, STATE_PLAYING, STATE_PAUSED, STATE_BUFFERING)
    speed: 1, // Playback Rate,
    artwork: sound.owner.image
      ? sound.owner.image.signedUrl
      : "../../assets/no-profile-pic-icon-27.jpg",
    isLiveStream: false,
  });
};
export {
  SINGLE_POST_KEY,
  rollbar,
  updateMusicControlPause,
  updateMusicControlNewSoundPlaying,
};
