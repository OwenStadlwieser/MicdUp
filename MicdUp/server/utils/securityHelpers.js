const { Profile } = require("../database/models/Profile");
const checkIfIsInPrivateList = async (context, parent) => {
  if (
    !context.postOwner ||
    (context.postOwner.id && context.postOwner.id !== parent.owner.toString())
  ) {
    context.postOwner = await Profile.findById(parent.owner);
  }
  if (!context.postOwner || !context.profile || !context.profile.id) return -1;
  if (context.postOwner.id === context.profile.id) return 0;
  const index = context.postOwner.privates.get(context.profile.id);
  return index === "1" ? 1 : -1;
};
module.exports = { checkIfIsInPrivateList };
