const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, "/client/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// // const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, "/client/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// });

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;

app.get("/api/token-service", (req, res) => {
  const AccessToken = require("twilio").jwt.AccessToken;

  const VideoGrant = AccessToken.VideoGrant;

  const videoGrant = new VideoGrant();

  const { identity } = req.query;

  // create an access token which we will sign with Twilio and we will return that to client
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity: identity }
  );

  token.addGrant(videoGrant);

  const accessToken = token.toJwt();
  console.log("identity", accessToken);
  res.send({
    accessToken: accessToken,
  });
});

app.get("/api/room-exists", (req, res) => {
  const { roomId } = req.query;

  const client = require("twilio")(twilioAccountSid, twilioAuthToken);
  console.log("room", client);
  client.video
    .rooms(roomId)
    .fetch()
    .then((room) => {
      if (room) {
        console.log("room", roomId);
        res.send({
          roomExists: true,
          room,
        });
      } else {
        console.log("not roomId", roomId);
        res.send({
          roomExists: false,
        });
      }
    })
    .catch((err) => {
      console.log("err roomId", roomId);
      res.send({
        roomExists: false,
        err,
      });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server started");
  console.log(`Listening at  ${PORT}`);
});
