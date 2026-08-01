// ======================================================
// backend/utils/gmailClient.js
// Shared Gmail API (OAuth2) mail sender.
// Replaces Nodemailer + Gmail SMTP everywhere in the project.
// ======================================================

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || "http://localhost:53682/oauth2callback"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// =============================
// Base64URL encode (Gmail API requirement)
// =============================
function encodeMessage(message) {
    return Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// =============================
// Encode subject so non-ASCII text (₹, etc.) is safe
// =============================
function encodeSubject(subject) {
    return `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
}

// =============================
// Build a raw RFC 2822 email
// =============================
function buildRawMessage({ from, to, subject, html }) {
    const messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${encodeSubject(subject)}`,
        "",
        html
    ];

    return messageParts.join("\n");
}

// =============================
// Send mail via Gmail API
// =============================
async function sendMailViaGmail({ to, subject, html, from }) {
    const fromAddress =
        from || `"UniSphere Campus" <${process.env.CAMPUS_EMAIL}>`;

    const rawMessage = buildRawMessage({
        from: fromAddress,
        to,
        subject,
        html
    });

    const encodedMessage = encodeMessage(rawMessage);

    const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });

    return response.data;
}

module.exports = {
    sendMailViaGmail,
    oauth2Client
};