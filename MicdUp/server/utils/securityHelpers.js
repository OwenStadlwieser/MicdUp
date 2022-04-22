const { Profile } = require("../database/models/Profile");
const contextService = require("request-context");
const checkIfIsInPrivateList = async (context, parent) => {
  if (
    !context.postOwner ||
    (context.postOwner.id && context.postOwner.id !== parent.owner.toString())
  ) {
    context.postOwner = await Profile.findById(parent.owner);
  }
  if (context.profile && context.profile.id && context.postOwner.blockedMap) {
    const blockedIndex = context.postOwner.blockedMap.get(context.profile.id);
    if (blockedIndex === "1") {
      return -1;
    }
  }
  if (!parent.privatePost) {
    return 1;
  }
  if (!context.postOwner || !context.profile || !context.profile.id) return -1;
  if (context.postOwner.id === context.profile.id) return 0;
  const index = context.postOwner.privates.get(context.profile.id);
  return index === "1" ? 1 : -1;
};

const profileCheckForBlocked = (context, parent) => {
  if (context.profile) {
    let blocked = [...context.profile.blockedMap.keys()];
    let blockedBy = [...context.profile.blockedByMap.keys()];
    if (
      blocked.findIndex(
        (blockedmember) => blockedmember.toString() === parent.id
      ) > -1 ||
      blockedBy.findIndex((blockedmember) => {
        return blockedmember.toString() === parent.id;
      }) > -1
    ) {
      return -1;
    }
  }
  return 1;
};
// todo: remove
const getFilteredResults = async (result, loggedInUser, reverse = false) => {
  if (!result.length) {
    return result;
  }
  for (let i = 0; i < result.length; i++) {
    let profile;
    if (result[i].owner) {
      profile = await Profile.findById(result[i].owner);
    } else if (result[i].profile) {
      profile = await Profile.findById(result[i].profile);
    }

    if (loggedInUser) {
      const index = await checkIfBlocked(profile, loggedInUser);
      if (index === -1) {
        delete result[i];
      }
      if (reverse) {
        const profileLoggedIn = await Profile.findById(loggedInUser.profile);
        let index2 = await checkIfBlocked(profileLoggedIn, {
          profile: profile.id,
        });
        if (index2 === -1) {
          delete result[i];
        }
      }
    } else {
      console.log("not logged int");
    }
  }
  let filtered = result.filter((entry) => entry);
  return filtered;
};

const checkIfBlocked = async (profileToView, loggedInUser) => {
  const blockedIndex = profileToView.blockedMap.get(`${loggedInUser.profile}`);
  if (blockedIndex === "1") {
    return -1;
  }
  return 1;
};
module.exports = {
  checkIfIsInPrivateList,
  checkIfBlocked,
  getFilteredResults,
  profileCheckForBlocked,
};
