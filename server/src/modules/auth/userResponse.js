// One place for how a user is sent to the client, and for the default avatar every new account gets.

const defaultAvatar = (username) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

const formatUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar || defaultAvatar(user.username),
  providers: user.providers || [],
  hasPassword: !!user.password,
  createdAt: user.createdAt
});

module.exports = { defaultAvatar, formatUserResponse };
