// Paul Barrett

// https://nodejs.org/api/http.html

const LOWERPORT = 2000;
const UPPERPORT = 35000;
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

function curlExec(whichone, reqURL, response){
	var placeholder;
	var curlstrip = 'curl ' + 'http://dilbert.com/strip/' + reqURL;
	var curlcurrent = 'curl ' + 'http://dilbert.com';
	var curlsearch = 'curl ' + 'https://duckduckgo.com/html/?q=' + reqURL + '&ia=web';
	if(whichone == "strip"){
		placeholder = curlstrip;
	} else if (whichone == "current"){
		placeholder = curlcurrent;
	} else if (whichone == "search"){
		placeholder = curlsearch;
	}

	exec(placeholder, {env: {'PATH': '/usr/bin'}}, (error, data, stderror) => {
		if(error) {
			console.error('Exec error' + error);
			return;
		}
		response.write(data);
		response.end();
	});
}

function giveComic(acceptedURL, response){
	var requestedURL = acceptedURL.substring(7);
	if(acceptedURL.match(/^\/COMIC\/\d\d\d\d\-\d\d\-\d\d$|^\/COMIC\/CURRENT$/)){
		if(requestedURL == "CURRENT"){
			curlExec("current", requestedURL, response);
		} else if (requestedURL.match(/^\d\d\d\d\-\d\d\-\d\d$/)){
			curlExec("strip", requestedURL, response);
		}
	} else if(acceptedURL.substring(1,6) == "COMIC") {
		response.write("Invalid format</br>Correct format is /COMIC/CURRENT for current comic or /COMIC/####-##-## for a comic on a specific date");
		response.end;
	}
}

function doSearch(acceptedURL, response){
	var requestedURL = acceptedURL.substring(8);
	if(acceptedURL.match(/^\/SEARCH\/[a-zA-Z0-9]+$/)){
		curlExec("search", requestedURL, response);
	} else if (acceptedURL.substring(1,7) == "SEARCH"){
		response.write("Incorrect search format</br>Correct format is /SEARCH/[a-zA-Z0-9]");
		response.end();
	}
}

function giveFile(acceptedURL, response){
	var requestedFile = acceptedURL.substring(8);
	var path = "./private_html/"+requestedFile;
	if(acceptedURL.match(/^\/MYFILE\/[a-zA-Z0-9]+.html$/)){
		//read file in ./private_html/
		if(fs.existsSync(path)){
			fs.readFile(path, (error, data) => {
				if (error) throw error;
				response.write("Here are the contents of the file that you requested:</br></br>");
				response.write(data);
				response.end();
			});
		} else { //if format is correct but file cannot be located
			response.write("The file that you requested does not exist!");
			response.end();
		}
	} else if (acceptedURL.substring(1,7)=="MYFILE"){ //if the format is invalid (forgot .html, etc.)
		response.write("Invalid format. Make sure your request is in the form /MYFILE/[a-zA-Z0-9].html");
		response.end();
	}
}

function serveURL(request, response) {
	var xurl = request.url;
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/html');
	response.write('Hello, World! You requested the following URL: '+xurl+'</br></br>');

	giveFile(xurl, response);
	giveComic(xurl, response);
	doSearch(xurl, response);

	if(xurl.match(acceptableURL)) {
		console.log("VALID: Hey, the client requested the URL: ("+xurl+")");
	} else {
		console.log("BAD:   Hey, the client requested the URL: ("+xurl+")");
		response.end();
	}
}

var server = http.createServer(serveURL);
console.log("Server started. Listening on http://"+hostname+":"+port);
server.listen(port,hostname);
