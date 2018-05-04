const options = {
	sourceDirectory:		"../datafiles/input",		/* Input hopper folder */
	filePatterns: 			[ /\.png$/,  /\.jpg$/i ],	/* regular expressions to identify files */
	filePollSeconds:		15,	/* freq in seconds to poll input hopper */
	fileExpirationAgeHours:		24, 	/* age in hours of files before deletion */	
	postURL:			"http://localhost:8888/upload",		/* URL to POST files to */
	heartBeatURL: 			"http://localhost:8888/heartBeat/",	/* URL for heartbeat requests  */
	heartBeatIntervalMinutes:	10,	/* freq in minutes of heartbeat requests */
	runOnce:			false	/* set to true if using an outside scheduler to run the client (e.g.: cron) */
}

module.exports = options; 
