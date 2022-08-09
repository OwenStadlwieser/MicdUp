import { publicClient } from "../../apollo/client/index";
import { GET_FILTERS_QUERY } from "../../apollo/private/filter";
import { rollbar } from "../../reuseableFunctions/constants";

let previousQuery = -1;
export const getFilters =
  (skipMult = 0) =>
  async (dispatch) => {
    let fetchPolicy = "network-only";
    if (previousQuery !== 0) fetchPolicy = "no-cache";
    previousQuery = skipMult;
    try {
      const res = await publicClient.query({
        query: GET_FILTERS_QUERY,
        variables: { skipMult },
        fetchPolicy,
      });
      return res.data.getFilters;
    } catch (err) {
      rollbar.log(err);
    }
  };
