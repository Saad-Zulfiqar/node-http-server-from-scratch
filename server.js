const http = require("node:http");

const routes = {
  // Route: GET / - main home page
  "GET /": homeHandler,
  // Route: POST /data - Handles incoming JSON payloads
  "POST /": postHandler,
  // Route: GET /api - Returns a JSON object
  "GET /api": apiHandler,
};

// Initialize the server instance
const server = http.createServer((req, res) => {
  let next = logger(req);
  if (next) next(req);

  //get clean url path after parsing
  const pathName = parseURL(req); 

  const key = `${req.method} ${pathName}`;
  const handler = routes[key];

  if (handler) {
    handler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("There is nothing here");
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running on port 3000");
});

//route handler function implementations
function homeHandler(req, res) {
  res.writeHead(200, "{'content-type' = 'text/plain'}");
  res.end("Hello From Server!");
}

function postHandler(req, res) {
  let chunks = [];

  // Listen for incoming data stream 'chunks'
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  // Event fired when the entire request body has been received
  req.on("end", () => {
    try {
      // Combine chunks and convert them into a readable string
      const body = Buffer.concat(chunks).toString();

      // Check if the body is empty before attempting to parse
      if (!body || body.trim() === "") {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("There is nothing in request");
      }

      // Parse string into a JavaScript object
      const parsed = JSON.parse(body);

      // Success response: Echo back the data with a new status message
      res.writeHead(200, { "Content-Type": "application/json" });
      parsed.message = "Data received";
      res.end(JSON.stringify(parsed));
    } catch (err) {
      // Handle bad JSON
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Wrong JSON Format");
    }
  });
}

function apiHandler(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "good", message: "Hello From Server" }));
}

// middleware function
function logger(req) {
  console.log(`${req.method} ${req.url}`);
  return (req) =>
    console.log(
      `I am the next middleware, the previos middleware gave me ${req.method}`,
    );
}

function parseURL(req) {
  const protocol = req.socket.encrypted ? "https" : "http";
  const baseURL = `protocol://${req.headers.host}`;

  //to extract pathname witout querys (quereys are dumped here) and to lower case path
  const parsedUrl = new URL(req.url, baseURL);
  //cleaning trailing '/' and lowering the case
  const pathName = parsedUrl.pathname.toLowerCase().replace(/\/+$/, "") || "/";

  return pathName;
}
