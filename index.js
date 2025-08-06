const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body>
        <h1>vibecodingtest</h1>
        <p>Successfully deployed with GitHub, Vercel, and Render!</p>
        <ul>
          <li>GitHub: Version control</li>
          <li>Vercel: Frontend hosting</li>
          <li>Render: Backend hosting</li>
        </ul>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
