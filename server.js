const http = require("node:http");

const routes = {
  // Route: GET / - main home page
  "GET /": (req, res) => {
    res.writeHead(200, "{'content-type' = 'text/plain'}");
    res.end("Hello From Server!");
  },
  // Route: POST /data - Handles incoming JSON payloads
  "POST /": (req, res) => {
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
  },
  // Route: GET /api - Returns a JSON object
  "GET /api": (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "good", message: "Hello From Server" }));
  },
};

// Initialize the server instance
const server = http.createServer((req, res) => {
  const key = `${req.method} ${req.url}`;
  const handler = routes[key];

  if (handler) {
    handler (req, res);
  }else{
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("There is nothing here");
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
