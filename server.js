const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

const twilioAccountSid = "AC8cc92cda3a1b99692e6f98fce8ba92d0";
const twilioAuthToken = "a0f4ad2fd811d6b66c767744526621c3";
const twilioApiKey = "SKc09f59dc07d9c3b7ced74d3945b8112d";
const twilioApiSecret = "VNo7LyEBMxMLIpfA13lkSK28Ul4MdWRx";

app.get("/api/token-service", (req, res) => {
  const AccessToken = require("twilio").jwt.AccessToken;

  const VideoGrant = AccessToken.VideoGrant;

  const videoGrant = new VideoGrant();

  const { identity } = req.query;
  console.log("identity", identity);

  // create an access token which we will sign with Twilio and we will return that to client
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity: identity }
  );

  token.addGrant(videoGrant);

  const accessToken = token.toJwt();

  res.send({
    accessToken: accessToken,
  });
});

app.get("/api/room-exists", (req, res) => {
  const { roomId } = req.query;

  const client = require("twilio")(twilioAccountSid, twilioAuthToken);

  client.video
    .rooms(roomId)
    .fetch()
    .then((room) => {
      if (room) {
        res.send({
          roomExists: true,
          room,
        });
      } else {
        res.send({
          roomExists: false,
        });
      }
    })
    .catch((err) => {
      res.send({
        roomExists: false,
        err,
      });
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server started");
  console.log(`Listening at port ${PORT}`);
});
