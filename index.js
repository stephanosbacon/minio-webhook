var http = require('http');

// This is a little relay service because I can't see how to get minio
// to kick authenticated webhooks.  

var wskService = process.env.WSK_SERVICE || 'nginx.openwhisk.svc';
var wskAuth = process.env.WSKAUTH;


/*

This is what comes in from minio:

{ EventName: "s3:ObjectCreated:Put",
  Key: "buck1/chestnut-horse-autumn_1000.jpg",
  Records: [ { eventVersion: "2.0",
               eventSource: "minio:s3",
               awsRegion: "",
               eventTime: "2018-04-20T17:50:47Z",
               eventName: "s3:ObjectCreated:Put",
               userIdentity: { principalId: "minio"
                             },
               requestParameters: { sourceIPAddress: "10.128.0.1:54668"
                                  },
               responseElements:{ "x-amz-request-id":"1527363FEB08D78E",
                                  "x-minio-origin-endpoint":"http://10.130.0.135:9000"
                                },
               s3: { s3SchemaVersion: "1.0",
                     configurationId: "Config",
                     bucket:{ name:"buck1",
                              ownerIdentity:{
                                principalId: "minio"
                              },
                              arn: "arn:aws:s3:::buck1"
                            },
                     object: { key: "chestnut-horse-autumn_1000.jpg",
                               size:177559,
                               eTag:"9c449f88502bd2e80e9a4b627640f2d2",
                               contentType: "image/jpeg",
                               userMetadata: { content-type: "image/jpeg"
                                             },
                               versionId: "1",
                               sequencer: "1527363FEB08D78E"
                             }
                   },
               source: { host: "",
                         port: "",
                         userAgent: ""
                       }
             }
           ]
}

This is what we send to the wsk trigger:

{ message: { ... see above ... }

*/

var server = http.createServer(function (req, res) {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {

    console.log(req.headers);
                
    console.log('body: ' + body);
    body = Buffer.concat(body).toString();
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.end(); //end the response
    console.log('service for openwhisk: ' + wskService);

    let postData = JSON.stringify({
      'message': body
    }, null, 4);

    console.log('postData: ' + postData);

    let options = {
      hostname: wskService,
      path: '/api/v1/namespaces/_/triggers/mt',
      port: 80,
      auth: wskAuth,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    let outReq = http.request(options, (res) => {
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

    outReq.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    outReq.write(postData);
    outReq.end();
  });
});

server.on('listening', () => {
  console.log('listening on port 8080');
});

server.listen(8080);
