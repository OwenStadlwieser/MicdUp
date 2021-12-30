const validateUsername = (user) => {
  // First char is a letter, otherwise alphanumeric so no special characters.
  const regex = new RegExp("^[a-zA-z][a-zA-Z0-9]+$");
  return regex.test(user);
};

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const validatePhoneNumber = (phone) => {
  // Matches the following
  // (123) 456-7890
  // (123)456-7890
  // 123-456-7890
  // 123.456.7890
  // 1234567890
  // +31636363634
  // 075-63546725
  const regex = new RegExp(
    "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"
  );
  return regex.test(phone);
};

const validatePassword = (password) => {
  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.
  const regex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$"
  );
  return regex.test(password);
};

const validateAge = (date) => {
  var isOldEnough = false;
  const dob = new Date(date);
  const today = new Date();
  var age = today.getFullYear() - dob.getFullYear();
  var m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  if (age >= 13) {
    isOldEnough = true;
  } else {
    isOldEnough = false;
  }
  return isOldEnough;
};

export {
  validateUsername,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateAge,
};
