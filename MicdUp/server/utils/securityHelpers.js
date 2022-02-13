const { Profile } = require("../database/models/Profile");
const checkIfIsInPrivateList = async (context, parent) => {
  if (
    !context.postOwner ||
    (context.postOwner.id && context.postOwner.id !== parent.owner.toString())
  ) {
    context.postOwner = await Profile.findById(parent.owner);
  }
  if (!context.postOwner || !context.profile.id) return -1;
  if (context.postOwner.id === context.profile.id) return 0;
  const index = context.postOwner.privateList.findIndex((el) => {
    el.toString() === context.profile.id;
  });
  return index;
};
module.exports = { checkIfIsInPrivateList };
