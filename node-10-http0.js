// Paul Barrett
// Simple Proxy Server
// https://nodejs.org/api/http.html

// set various values to easily change later or save time typing
// port numbers, requires for exec and fs, and the hostname
const LOWERPORT = 2000;
const UPPERPORT = 35000;
const exec = require('child_process').exec;
const hostname = 'violet.cs.uky.edu';
const port = randomizePort(LOWERPORT, UPPERPORT);
const fs = require('fs');
// the regular expression for acceptable urls accepts only certain urls
var acceptableURL = /^\/COMIC\/\d\d\d\d\-\d\d\-\d\d$|^\/COMIC\/CURRENT$|^\/SEARCH\/[a-zA-Z0-9]+$|^\/MYFILE\/[a-zA-Z0-9]+\.html$/; 
var http = require("http"),
	url = require('url');

// randomize which port to use
function randomizePort(startport, endport) {
	return Math.floor(Math.random() * (endport - startport + 1)) + startport;
}

// given which function wants to use it,
// curlExec uses exec and curl to display whichever link corresponds
function curlExec(whichone, reqURL, response){
	var placeholder;
	var curlstrip = 'curl ' + 'http://dilbert.com/strip/' + reqURL;
	var curlcurrent = 'curl ' + 'http://dilbert.com';
	var curlsearch = 'curl ' + 'https://duckduckgo.com/html/?q=' + reqURL + '&ia=web';
	if(whichone == "strip"){ //decide which exec function to call
		placeholder = curlstrip;
	} else if (whichone == "current"){
		placeholder = curlcurrent;
	} else if (whichone == "search"){
		placeholder = curlsearch;
	}
	//call exec
	exec(placeholder, {env: {'PATH': '/usr/bin'}}, (error, data, stderror) => {
		if(error) {
			console.error('Exec error' + error);
			return;
		}
		response.write(data);
		response.end();
	});
}

// decide whether to display current comic, one from a specific date, or display an error
// then, call corresponding curl exec function
function giveComic(acceptedURL, response){
	var requestedURL = acceptedURL.substring(7);
	if(acceptedURL.match(/^\/COMIC\/\d\d\d\d\-\d\d\-\d\d$|^\/COMIC\/CURRENT$/)){ //if url matches format, decide CURRENT or strip
		if(requestedURL == "CURRENT"){
			curlExec("current", requestedURL, response);
		} else if (requestedURL.match(/^\d\d\d\d\-\d\d\-\d\d$/)){
			curlExec("strip", requestedURL, response);
		}
	} else if(acceptedURL.substring(1,6) == "COMIC") { //if url is wrong, display error
		response.write("Invalid format</br>Correct format is /COMIC/CURRENT for current comic or /COMIC/####-##-## for a comic on a specific date");
		response.end;
	}
}

// searches using the curl exec function or display an error
function doSearch(acceptedURL, response){
	var requestedURL = acceptedURL.substring(8);
	if(acceptedURL.match(/^\/SEARCH\/[a-zA-Z0-9]+$/)){ //if url matches format, call exec
		curlExec("search", requestedURL, response);
	} else if (acceptedURL.substring(1,7) == "SEARCH"){ //if url is wrong, display error
		response.write("Incorrect search format</br>Correct format is /SEARCH/[a-zA-Z0-9]");
		response.end();
	}
}

// displays the requested file, or gives an error
function giveFile(acceptedURL, response){
	var requestedFile = acceptedURL.substring(8);
	var path = "./private_html/"+requestedFile;
	if(acceptedURL.match(/^\/MYFILE\/[a-zA-Z0-9]+\.html$/)){
		//read file in ./private_html/
		if(fs.existsSync(path)){
			fs.readFile(path, (error, data) => {
				if (error) throw error;
				response.write("Here are the contents of the file that you requested:</br></br>");
				response.write(data);
				response.end();
			});
		} else { //if format is correct but file cannot be located
			response.write("403 ERROR: The file that you requested does not exist!");
			response.end();
		}
	} else if (acceptedURL.substring(1,7)=="MYFILE"){ //if the format is invalid (forgot .html, etc.)
		response.write("Invalid format. Make sure your request is in the form /MYFILE/[a-zA-Z0-9].html");
		response.end();
	}
}

var doOnce = true;
// handle server and call other functions
function serveURL(request, response) {
	var xurl = request.url;
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/html');

	// Welcome and inform user how to use the server
	if (doOnce == true){
		response.write("Welcome to my simple proxy server! You can request a comic or a file, or do a search.</br>");
		response.write("Examples requests you can do: /COMIC/CURRENT, /COMIC/2018-01-01, /SEARCH/purple, /MYFILE/mytrip.html</br>");
		response.write("If your request doesn't display, ensure your formatting is correct in the address bar: /COMIC/, /SEARCH/, or /MYFILE/</br>");
		response.write("This message will only display once.");
		doOnce = false;
	}
	
	// call functions
	giveFile(xurl, response);
	giveComic(xurl, response);
	doSearch(xurl, response);

	// display in console if url is valid or bad
	if(xurl.match(acceptableURL)) {
		console.log("VALID: Hey, the client requested the URL: ("+xurl+")");
	} else {
		console.log("BAD:   Hey, the client requested the URL: ("+xurl+")");
		response.end();
	}
}

// create the server and show which port and host are being used
var server = http.createServer(serveURL);
console.log("Server started. Listening on http://"+hostname+":"+port);
server.listen(port,hostname);
