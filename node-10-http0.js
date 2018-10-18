// Paul Barrett

// https://nodejs.org/api/http.html
//
// This example uses a named function doprocess() for the callback function
// sent to the createServer() method.

const LOWERPORT = 34999;
const UPPERPORT = 34999;
var acceptableURL = /^\/COMIC\/\d\d\d\d\-\d\d\-\d\d$|^\/COMIC\/CURRENT$|^\/SEARCH\/[a-zA-Z0-9]+$|^\/MYFILE\/[a-zA-Z0-9]+.html$/; 

var http = require("http"),
	url = require('url');

function randomizePort(startport, endport) {
	return Math.floor(Math.random() * (endport - startport + 1)) + startport;
}

const hostname = 'violet.cs.uky.edu';
const port = randomizePort(LOWERPORT, UPPERPORT);

function doprocess(request, response) {
	var xurl = request.url;
	if(xurl.match(acceptableURL)) {
		response.statusCode = 200;
		response.setHeader('Content-Type', 'text/plain');
		response.end('Hello, World!  You requested the following URL: '+xurl+'\n');
		console.log("VALID: Hey, the client requested the URL: ("+xurl+")");
	} else {
		console.log("BAD:   Hey, the client requested the URL: ("+xurl+")");
	}
}

var server = http.createServer(doprocess);
console.log("Server started. Listening on http://"+hostname+":"+port);
server.listen(port,hostname);










