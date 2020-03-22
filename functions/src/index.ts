import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

// imports
import { google } from "googleapis";

// config
const CLIENT_ID =
  "302313684265-0knsk18lfbeklpp2sqab95a0ta491qva.apps.googleusercontent.com";
const CLIENT_SECRET = "iO3dNImWtHXJ1igLisDreu0f";
const SCOPES = ["https://www.googleapis.com/auth/fitness.activity.read"];
const REDIRECT_URL =
  "https://us-central1-centering-chess-271107.cloudfunctions.net/oauthcallback";

// const REDIRECT_URL =
// "http://127.0.0.1:5000/centering-chess-271107/us-central1/oauthcallback";

// globals
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

export const authUrl = functions.https.onRequest((request, response) => {
  const url = oauth2Client.generateAuthUrl({
    prompt: "consent",

    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",

    scope: [...SCOPES, "profile", "email"]
  });

  response.send({
    url
  });
});

// helper method
import Axios from "axios";
const getUser = async (access_token: string) => {
  const apiResponse = await Axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );

  return apiResponse.data;

  //   { sub: '100578302509357608338',
  // >    name: 'Yousuf Khan',
  // >    given_name: 'Yousuf',
  // >    family_name: 'Khan',
  // >    picture:
  // >     'https://lh3.googleusercontent.com/a-/AOh14Gh7DiqWD1t9k_Xgc6zNlF1WG0e-TRDCOQ26x5U1rt0',
  // >    email: 'yusufkhanjee@gmail.com',
  // >    email_verified: true,
  // >    locale: 'en-GB' }
};

export const oauthcallback = functions.https.onRequest(
  async (request, response) => {
    const code = request.query.code;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const me = await getUser(tokens.access_token as string);

    response.send({
      user: me,
      tokens
    });
  }
);
