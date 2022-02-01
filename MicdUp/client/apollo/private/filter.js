import { gql } from "@apollo/client";

const GET_FILTERS_QUERY = gql`
  query getFilters($skipMult: Int!) {
    getFilters(skipMult: $skipMult) {
      id
      title
      type
      image {
        id
        signedUrl
      }
      reverbPreset
      reverb
      distortionPreset
      distortion
      equalizerPreset
      pitchNum
    }
  }
`;

export { GET_FILTERS_QUERY };
