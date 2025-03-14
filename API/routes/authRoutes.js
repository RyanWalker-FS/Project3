const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const axios = require("axios");
const Token = require("../model/token");
const User = require("../model/user");

const stateKey = "spotify_auth_state";
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// Function to generate a random string for state validation
function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Spotify Login Route
router.get("/login", (req, res) => {
  let state = generateRandomString(16);
  res.cookie(stateKey, state);

  let scope = "user-read-private user-read-email";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

// Spotify Auth Callback
router.get("/auth/callback", async (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    return res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  }

  res.clearCookie(stateKey);

  // Exchange code for access token
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };

  axios.post(authOptions, async function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let { access_token, refresh_token } = body;

      // Fetch User Data
      let userOptions = {
        url: "https://api.spotify.com/api",
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };

      request.get(userOptions, async (error, response, userData) => {
        if (error) {
          console.error("Error fetching user data:", error);
          return res.redirect("/login");
        }

        try {
          let user = await User.findOneAndUpdate(
            { spotifyId: userData.id },
            { email: userData.email, displayName: userData.display_name },
            { upsert: true, new: true }
          );

          // Save token in MongoDB
          await Token.findOneAndUpdate(
            { userId: user._id },
            { accessToken: access_token, refreshToken: refresh_token },
            { upsert: true, new: true }
          );

          // Redirect to frontend search page
          res.redirect(
            `http://localhost:3000/search?` +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token,
              })
          );
        } catch (err) {
          console.error("Database error:", err);
          res.redirect("/login");
        }
      });
    } else {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "invalid_token",
          })
      );
    }
  });
});

module.exports = router;
