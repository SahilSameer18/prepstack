/**
 * Helper to generate a unique username based on the Google display name.
 */
const generateUniqueUsername = async (displayName, userModel) => {
  // 1. Strip non-letters/numbers, replace spaces with underscores, lowercase
  let baseUsername = displayName
    .replace(/[^a-zA-Z0-9 ]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
  
  // 2. Ensure it starts with a letter, and truncate to 15 chars (leaving room for suffix)
  baseUsername = baseUsername.replace(/^[^a-z]+/, '');
  baseUsername = baseUsername.substring(0, 15);

  // 3. Fallback if empty or too short
  if (baseUsername.length < 4) {
    baseUsername = 'prepstack_user';
  }

  // 4. Try finding a unique username
  let uniqueUsername = baseUsername;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const existingUser = await userModel.findOne({ username: uniqueUsername });
    if (!existingUser) {
      isUnique = true;
    } else {
      attempts++;
      // Append random 3-digit number
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      uniqueUsername = `${baseUsername}_${randomSuffix}`;
    }
  }

  // 5. Absolute fallback if all 10 attempts fail
  if (!isUnique) {
    uniqueUsername = `user_${Date.now().toString(36)}`;
  }

  return uniqueUsername;
};

module.exports = { generateUniqueUsername };

