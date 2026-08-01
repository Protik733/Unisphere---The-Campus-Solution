// ======================================
// 📌 SHARED API BASE CONFIG
// ======================================
// Include this file FIRST on every page, before app.js / dashboard.js /
// canteen.js / report.js / bus.js / helpdesk.js.
//
// - On Render (or any server that serves this frontend folder itself,
//   e.g. running `node server.js` and opening http://localhost:3000):
//   window.API_BASE = "" -> fetch("/api/...") hits the SAME server. No
//   domain or port to edit, ever, no matter what your Render URL is.
//
// - If you open the frontend a different way locally (VS Code "Live
//   Server" on port 5500, double-clicking the HTML file, etc.), the
//   page's origin is NOT your Node server, so relative "/api/..." calls
//   would go nowhere. In that case we point straight at the backend on
//   port 3000 (the default PORT in backend/.env).

window.API_BASE = (function () {

    const host = window.location.hostname; // "" for file://, else e.g. "localhost", "127.0.0.1", your-app.onrender.com
    const port = window.location.port;

    const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "";
    const isServedByBackend = port === "3000"; // matches PORT in backend/.env

    if (isLocalHost && !isServedByBackend) {
        return "http://localhost:3000";
    }

    return ""; // same-origin — correct for Render and for http://localhost:3000

})();
