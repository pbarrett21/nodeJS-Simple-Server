// Paul Barrett

// https://nodejs.org/api/http.html
//
// This example uses a named function doprocess() for the callback function
// sent to the createServer() method.

const LOWERPORT = 34999;
const UPPERPORT = 34999;
const exec = require('child_process').exec;
const hostname = 'violet.cs.uky.edu';
const port = randomizePort(LOWERPORT, UPPERPORT);
var acceptableURL = /^\/COMIC\/\d\d\d\d\-\d\d\-\d\d$|^\/COMIC\/CURRENT$|^\/SEARCH\/[a-zA-Z0-9]+$|^\/MYFILE\/[a-zA-Z0-9]+.html$/; 

var http = require("http"),
	url = require('url');

function randomizePort(startport, endport) {
	return Math.floor(Math.random() * (endport - startport + 1)) + startport;
}

function giveFile(acceptedURL){
	var requestedFile = acceptedURL.substring(8);
}

function callCurlExec(reqURL, isCurrent, response){
	if(isCurrent){
		exec('curl ' + '"http://dilbert.com"', {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderror){
			if (error){
				console.error('Exec error'+error);
				return;
			}
			//console.log('stdout'+stdout);
			//console.log('stderror'+stderror);
		});
	} else {
		exec('curl ' + '"http://dilbert.com/strip/' + reqURL + '"', {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderror){
			if (error){
				console.error('Exec error'+error);
				return;
			}
			console.log("above");
			response.write(stdout);
			console.log("middle");
			//response.end();
			console.log("below");
			//setTimeout(function() { console.log("yo");response.end(); }, 10000);
		});
	}
}

function giveComic(acceptedURL, response){
	var requestedURL = acceptedURL.substring(7);
	var isCurrentURL;
	console.log("top");
	if(requestedURL == "CURRENT"){
		isCurrentURL = true;
		
	} else if (requestedURL.match(/^\d\d\d\d\-\d\d\-\d\d$/)){
		isCurrentURL = false;
			
	}
	callCurlExec(requestedURL, isCurrentURL, response);
	//response.end();
	console.log("far bottom");
}

function serveURL(request, response) {
	var xurl = request.url;
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/html');
	response.write('Hello, World! You requested the following URL: '+xurl+'\n');
	if(xurl.match(acceptableURL)) {
		console.log("VALID: Hey, the client requested the URL: ("+xurl+")");
		giveComic(xurl, response);
	} else {
		console.log("BAD:   Hey, the client requested the URL: ("+xurl+")");
		response.end();
	}
}

var server = http.createServer(serveURL);
console.log("Server started. Listening on http://"+hostname+":"+port);
server.listen(port,hostname);
