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
const fs = require('fs');
var acceptableURL = /^\/COMIC\/\d\d\d\d\-\d\d\-\d\d$|^\/COMIC\/CURRENT$|^\/SEARCH\/[a-zA-Z0-9]+$|^\/MYFILE\/[a-zA-Z0-9]+.html$/; 
var http = require("http"),
	url = require('url');

function randomizePort(startport, endport) {
	return Math.floor(Math.random() * (endport - startport + 1)) + startport;
}

function callCurlExec(reqURL, isCurrent, isSearch, response){
	if(isCurrent){
		exec('curl ' + '"http://dilbert.com"', {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderror){
			if (error){
				console.error('Exec error'+error);
				return;
			}
			response.write(stdout);
		});
	} else if (isSearch) {
		exec('curl ' + '"https://duckduckgo.com/html/?q=' + reqURL + '&ia=web"', {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderror){
			if (error){
				console.error('Exec error'+error);
				return;
			}
			response.write(stdout);
		});
		
	} else {
		exec('curl ' + '"http://dilbert.com/strip/' + reqURL + '"', {env: {'PATH': '/usr/bin'}}, function(error, stdout, stderror){
			if (error){
				console.error('Exec error'+error);
				return;
			}
			response.write(stdout);
		});
	}
}

function giveComic(acceptedURL, response){
	var requestedURL = acceptedURL.substring(7);
	var isCurrentURL;
	if(requestedURL == "CURRENT"){
		isCurrentURL = true;
		callCurlExec(requestedURL, isCurrentURL, false, response);
	} else if (requestedURL.match(/^\d\d\d\d\-\d\d\-\d\d$/)){
		isCurrentURL = false;
		callCurlExec(requestedURL, isCurrentURL, false, response);			
	}
}

function doSearch(acceptedURL, response){
	var requestedURL = acceptedURL.substring(8);
	if(acceptedURL.match(/^\/SEARCH\/[a-zA-Z0-9]+$/)){
		callCurlExec(requestedURL, false, true, response);
	}
}

function giveFile(acceptedURL, response){
	var requestedFile = acceptedURL.substring(8);
	var path = "./private_html/"+requestedFile;
	if(acceptedURL.match(/^\/MYFILE\/[a-zA-Z0-9]+.html$/)){
		//read file in ./private_html/
		if(fs.existsSync(path)){
			console.log("file found");
			fs.readFile(path, (error, data) => {
				if (error) throw error;
				response.write(data);
				response.end();
			});
		}
	}
}

function serveURL(request, response) {
	var xurl = request.url;
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/html');
	response.write('Hello, World! You requested the following URL: '+xurl+'\n');
	if(xurl.match(acceptableURL)) {
		console.log("VALID: Hey, the client requested the URL: ("+xurl+")");
		giveComic(xurl, response);
		doSearch(xurl, response);
		giveFile(xurl, response);
	} else {
		console.log("BAD:   Hey, the client requested the URL: ("+xurl+")");
		response.end();
	}
}

var server = http.createServer(serveURL);
console.log("Server started. Listening on http://"+hostname+":"+port);
server.listen(port,hostname);
