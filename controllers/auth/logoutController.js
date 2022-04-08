const jwt = require("jsonwebtoken");
const User = require("../../models/user.js");

module.exports = async function (req, res) {
  const { _auth_token } = req.cookies;
  res.clearCookie("_auth_token");
  try {
    if (!_auth_token) return res.sendStatus(401);

    let decoded;
    jwt.verify(
      _auth_token,
      process.env.REFRESH_TOKEN_SECRET_KEY,
      (err, res) => {
        if (err) return res.sendStatus(404);
        decoded = res;
      }
    );

    const user = await User.findOne({ email: decoded.email }).exec();

    // console.log(user);
    if (!user) return res.sendStatus(403);

    const remaingRefreshTokenList = user.refreshTokenList.filter(
      (token) => token.refreshToken !== _auth_token
    );
    user.refreshTokenList = remaingRefreshTokenList;
    await user.save();

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(404);
  }
};