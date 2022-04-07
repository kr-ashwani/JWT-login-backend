const bcrypt = require("bcrypt");
const User = require("../../models/user");
const handleErrors = require("../handleErrors");
const { createAccessToken, createRefreshToken } = require("../newJwtToken");

function signup_get(req, res) {
  res.render("signup");
}

async function signup_post(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      collegeName,
      address,
      password,
      authType = "others",
      photoUrl,
    } = req.body;
    const payloadData = {
      email,
      firstName,
      lastName,
    };
    const accessToken = createAccessToken(payloadData);
    const refreshToken = createRefreshToken(payloadData);
    const data = await User.create({
      firstName,
      lastName,
      email,
      collegeName,
      address,
      password,
      authProvider: [authType],
      refreshToken: [refreshToken],
      photoUrl,
    });

    // secure:true
    res.cookie("_auth_token", refreshToken, {
      httpOnly: true,

      maxAge: 60 * 1000,
      sameSite: "none",
    });

    //convert mongodb query object to object data.toObject().j
    //best way to extract few properties from object and send the remaining.
    const currentUser = (({
      authProvider,
      refreshToken,
      password,
      __v,
      ...dataToSend
    }) => dataToSend)(data.toObject());

    res.status(200).json({ accessToken, currentUser });
  } catch (err) {
    const message = handleErrors(err);
    res.status(400).json({ message });
  }
}

module.exports = { signup_get, signup_post };
