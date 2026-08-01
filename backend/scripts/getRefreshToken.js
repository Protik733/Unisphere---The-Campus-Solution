// ======================================================
// backend/scripts/getRefreshToken.js
// ======================================================

require("dotenv").config();
const { google } = require("googleapis");
const http = require("http");

// সরাসরি এখানে ভ্যালুগুলো হার্ডকোড করে দেওয়া হলো যাতে কোনোভাবেই নাল (null) না হয়
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env");
    process.exit(1);
}
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES
});

console.log("\n================ GMAIL REFRESH TOKEN GENERATOR ================\n");
console.log("1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n=================================================================\n");
console.log(`Waiting for Google to redirect back to ${REDIRECT_URI} ...\n`);

const server = http.createServer(async (req, res) => {
    try {
        if (!req.url.startsWith("/oauth2callback")) {
            res.end("Waiting for Google login...");
            return;
        }

        const reqUrl = new URL(req.url, REDIRECT_URI);
        const code = reqUrl.searchParams.get("code");
        const error = reqUrl.searchParams.get("error");

        if (error) {
            res.end("Authorization was denied. You can close this tab.");
            console.error("\nAuthorization denied by Google:", error, "\n");
            server.close(() => process.exit(1));
            return;
        }

        res.end("Login successful! You can close this tab and return to your terminal.");
        server.close();

        const { tokens } = await oauth2Client.getToken(code);

        console.log("\n========================= SUCCESS =========================\n");
        console.log("Refresh Token:\n");
        console.log(tokens.refresh_token);
        console.log("\nCopy the value above into GMAIL_REFRESH_TOKEN inside your .env file.");
        console.log("=============================================================\n");

        process.exit(0);
    } catch (err) {
        console.error("\nError exchanging code for tokens:", err.message, "\n");
        server.close(() => process.exit(1));
    }
});

server.listen(PORT);