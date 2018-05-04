const fs	= require('fs');
const path	= require('path');
const request	= require('request');
const config	= require('./config');

var _heartBeatInterval, _processingInterval;

function heartBeatInterval() { return _heartBeatInterval; }
function processingInterval() { return _processingInterval; }

function minutesSince(pastDate) {
	return parseInt( ( (new Date()) - pastDate ) / 60000 );
}

function fileMatch(fn) { 
	const pats = config.filePatterns; 
	for (var i=0; i<pats.length; i++)
		if ( fn.search(pats[i]) > 0 ) return true; 
	return false; 
}

function postFile( fpath, cb ) {
	console.log("POSTing file: " + fpath); 
	var req = request.post( config.postURL, (err, resp, body ) => {
		if (err) { 
			console.error("DATA POST ERROR");
			console.error(err.code + " - " + err.message); 
		} else {
			if (resp.statusCode == 200) {
				console.log("DATA POST Succeeded: [" + resp.statusCode + "] " + resp.statusMessage);
				cb( fpath );
			} else {
				console.log("DATA POST Failed: [" + resp.statusCode + "] " + resp.statusMessage + " - "  + config.postURL );
			}
		}
	});
	
	var form = req.form(); 
	form.append('file', fs.createReadStream( fpath ), {filename: path.basename(fpath) } );
}

function heartBeatCallback() {
	console.log("** heartBeatCallback **");
	var req = request.get( config.heartBeatURL, (err, resp, body ) => {
		if (err) { 
			console.error("heartBeat request error"); 
			console.error(err.code + " - " + err.message); 
		} else {
			console.log("heartBeat request succeeded: [" + resp.statusCode + "] " + resp.statusMessage); 
		}
	});
}

function removeFileSync(fpath) {
	try {
		fs.unlinkSync(fpath); 
		console.log("deleted file: " + fpath); 
	} catch (err) {
		console.error(err.code + " - " + err.message); 
		console.error("Unable to delete file: " + fpath); 
	}
}

/* Returns a list of files in the source directory that are candidates to POST or remove */
function getFileNames() {
	var fileNames = fs.readdirSync( config.sourceDirectory );
	return fileNames.filter( fileMatch );
}

function removeExpiredSync() {
	console.log("checking for expired files..");
	const fileNames = getFileNames()
	
	/* Continue to approach everything here Sync (rather than Async) */
	for ( var i=0; i<fileNames.length; i++ ) {
		var fname = fileNames[i]
		var fpath = path.join( config.sourceDirectory, fname );
		var stats = fs.statSync( fpath );
		// console.log("minutes old: " + minutesSince(stats.birthtime) + ", fpath: " + fpath );
		if ( minutesSince(stats.birthtime) > (config.fileExpirationAgeHours * 60) ) {
			removeFileSync(fpath);
		}
	}
}

function processFiles() {
	
	/* First thing is to check if any files need to be deleted based on expiration of dtc */
	
	/* Decided to approach this using Sync (rather than Async) logic */
	/* This will mitigate issues where we're trying to Post AND possibly Delete the same files */
	/* in different async callbacks */ 
	removeExpiredSync();
	
	/* Now continue processing remaining files - this can be done async */ 
	const fileNames = getFileNames();
	fileNames.forEach( fname => {
		
		/* Create full pathname to file */
		const fpath = path.join( config.sourceDirectory, fname );
		
		/* postFIle will fire the Post request async. We pass a callback to be */
		/* executed if the POST returns a 200. */
		postFile( fpath, removeFileSync ) ;
	});
}

function heartBeatConfigured() {
	return ( 
		config.heartBeatURL && 
		config.heartBeatURL.length && 
		config.heartBeatIntervalMinutes > 0 
	);
}

function setupHeartBeat() {
	if ( heartBeatConfigured() ) {
		/* Set the schedule for future heartbeat pulses */
		_heartBeatInterval = setInterval( heartBeatCallback, 60000 * config.heartBeatIntervalMinutes );
	}
}

function start(runOnce=config.runOnce) {

	processFiles();

	if ( heartBeatConfigured() ) heartBeatCallback();
	
	if (!runOnce) {

		/* Now, set the frequency for future polling / file processing */ 
		_processingInterval = setInterval( processFiles, 1000 * config.filePollSeconds );

		/* Finally, see if the heartBeat parameters have been set and initialize */ 
		setupHeartBeat();
	}
}

module.exports.getFileNames		= getFileNames;
module.exports.removeExpiredSync	= removeExpiredSync;
module.exports.processingInterval	= processingInterval;
module.exports.heartBeatInterval	= heartBeatInterval;
module.exports.start 			= start; 
