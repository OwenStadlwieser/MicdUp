//FIXME: import filter and connect to mongoose

let filters = [
  { title: "Parametric", type: "EQUALIZER", equalizerPreset: 0 },
  { title: "Low Pass", type: "EQUALIZER", equalizerPreset: 1 },
  { title: "High Pass", type: "EQUALIZER", equalizerPreset: 2 },
  { title: "Resonant Low Pass", type: "EQUALIZER", equalizerPreset: 3 },
  { title: "Resonant High Pass", type: "EQUALIZER", equalizerPreset: 4 },
  { title: "Band Pass", type: "EQUALIZER", equalizerPreset: 5 },
  { title: "Band Stop", type: "EQUALIZER", equalizerPreset: 6 },
  { title: "Low Shelf", type: "EQUALIZER", equalizerPreset: 7 },
  { title: "High Shelf", type: "EQUALIZER", equalizerPreset: 8 },
  { title: "Resonant Low Shelf", type: "EQUALIZER", equalizerPreset: 9 },
  {
    title: "Drums Bit Brush",
    type: "DISTORTION",
    distortionPreset: 0,
    distortion: 50,
  },
  {
    title: "Drums Buffer Beats",
    type: "DISTORTION",
    distortionPreset: 1,
    distortion: 50,
  },
  {
    title: "Drums LoFi",
    type: "DISTORTION",
    distortionPreset: 2,
    distortion: 50,
  },
  {
    title: "Broken Speaker",
    type: "DISTORTION",
    distortionPreset: 3,
    distortion: 50,
  },
  {
    title: "Cellphone Concert",
    type: "DISTORTION",
    distortionPreset: 4,
    distortion: 50,
  },
  {
    title: "Decimated 1",
    type: "DISTORTION",
    distortionPreset: 5,
    distortion: 50,
  },
  {
    title: "Decimated 2",
    type: "DISTORTION",
    distortionPreset: 6,
    distortion: 50,
  },
  {
    title: "Decimated 3",
    type: "DISTORTION",
    distortionPreset: 7,
    distortion: 50,
  },
  {
    title: "Decimated 4",
    type: "DISTORTION",
    distortionPreset: 8,
    distortion: 50,
  },
  {
    title: "Distorted Funk",
    type: "DISTORTION",
    distortionPreset: 9,
    distortion: 50,
  },
  {
    title: "Distorted Cubed",
    type: "DISTORTION",
    distortionPreset: 10,
    distortion: 50,
  },
  {
    title: "Distorted Squared",
    type: "DISTORTION",
    distortionPreset: 11,
    distortion: 50,
  },
  {
    title: "Echo 1",
    type: "DISTORTION",
    distortionPreset: 12,
    distortion: 50,
  },
  {
    title: "Echo 2",
    type: "DISTORTION",
    distortionPreset: 13,
    distortion: 50,
  },
  {
    title: "Tight Echo 1",
    type: "DISTORTION",
    distortionPreset: 14,
    distortion: 50,
  },
  {
    title: "Tight Echo 2",
    type: "DISTORTION",
    distortionPreset: 15,
    distortion: 50,
  },
  {
    title: "Everything is Broke",
    type: "DISTORTION",
    distortionPreset: 16,
    distortion: 50,
  },
  {
    title: "Alien Chatter",
    type: "DISTORTION",
    distortionPreset: 17,
    distortion: 50,
  },
  {
    title: "Cosmic Interface",
    type: "DISTORTION",
    distortionPreset: 18,
    distortion: 50,
  },
  {
    title: "Golden Pi",
    type: "DISTORTION",
    distortionPreset: 19,
    distortion: 50,
  },
  {
    title: "Radio Tower",
    type: "DISTORTION",
    distortionPreset: 20,
    distortion: 50,
  },
  {
    title: "Speech Waves",
    type: "DISTORTION",
    distortionPreset: 21,
    distortion: 50,
  },
  { title: "Small Room", type: "REVERB", reverbPreset: 0, reverb: 50 },
  { title: "Medium Room", type: "REVERB", reverbPreset: 1, reverb: 50 },
  { title: "Large Room", type: "REVERB", reverbPreset: 2, reverb: 50 },
  { title: "Medium Hall", type: "REVERB", reverbPreset: 3, reverb: 50 },
  { title: "Large Hall", type: "REVERB", reverbPreset: 4, reverb: 50 },
  { title: "Plate", type: "REVERB", reverbPreset: 5, reverb: 50 },
  { title: "Medium Chamber", type: "REVERB", reverbPreset: 6, reverb: 50 },
  { title: "Large Chamber", type: "REVERB", reverbPreset: 7, reverb: 50 },
  { title: "Cathedral", type: "REVERB", reverbPreset: 8, reverb: 50 },
  { title: "Large Room 2", type: "REVERB", reverbPreset: 9, reverb: 50 },
  { title: "Medium Hall 2", type: "REVERB", reverbPreset: 10, reverb: 50 },
  { title: "Medium Hall 3", type: "REVERB", reverbPreset: 11, reverb: 50 },
  { title: "Large Hall 2", type: "REVERB", reverbPreset: 12, reverb: 50 },
  { title: "Chipmunk", type: "PITCH", pitchNum: 2000 },
  { title: "Deep", type: "PITCH", pitchNum: 200 },
  { title: "Funny", type: "PITCH", pitchNum: 1256 },
];
try {
  await Filter.collection.drop();
} catch (err) {}
try {
  await Filter.insertMany(filters);
} catch (err) {
  console.log(err);
}
