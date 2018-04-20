var http = require('http');

// This is a little relay service because I can't see how to get minio
// to kick authenticated webhooks.

var wskService = process.env.WSK_SERVICE || 'nginx';
var wskAuth = process.env.WSKAUTH;

http.createServer(function (req, res) {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    console.log(body);
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.end(); //end the response

    let options = {
      hostname: wskService,
      port: 80,
      auth: wskAuth,
      method: 'POST'
    };

    let req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.write({
      message: body
    });
    req.end();
  });
}).listen(8080); //the server object listens on port 8080
















