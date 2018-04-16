var http = require('http');

//create a server object:
http.createServer(function (req, res) {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log(body);
    console.log(req);
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.end(); //end the response
  });
}).listen(8080); //the server object listens on port 8080










