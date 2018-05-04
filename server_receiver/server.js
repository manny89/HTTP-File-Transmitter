var express     = require('express'); 
var bodyParser  = require('body-parser');
var formidable  = require('formidable'); /* Form processing */ 
var path        = require('path');
var fs          = require('fs');

function dumpFileProps(files) {
        console.log("  file size: " + files.file.size);
        console.log("  file path: " + files.file.path);
        console.log("  file name: " + files.file.name);
        console.log("  file type: " + files.file.type);
        console.log("  astModifiedDate: "   + files.file.lastModifiedDate);
        /* console.dir( files.file );    */ 
}

/* Local config options */
var config = require('./config'); 

var app = express();
// app.use(express.static(path.join(__dirname, 'public')));

app.use( express.urlencoded( {extended: true} ) );
app.use( express.json() );

app.route('/upload').post(function (req, res, next) {

    var form = new formidable.IncomingForm();
    
    /*  Formidable uploads to operating systems tmp dir by default */
    /* If a tempFolder has been declared, use it. Otherwise, put temp files in target folder */
    const tmp = config.tempFolder; 
    const tempFolder = (tmp && tmp.length) ? tmp : config.targetFolder; 
    
    form.uploadDir = tempFolder; 
    form.keepExtensions = false;     // don't preserve file extension in temp name

    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        
        /** DEBUG INFO **/ 
        console.log('File Upload:');
        dumpFileProps(files);

        /* Formidable changes the name of the uploaded file */ 
        /* Rename the file to its original name */ 
        const targetName = path.join(config.targetFolder, files.file.name);
        fs.rename(files.file.path,  targetName,  function(err) {
            if (err) {
                console.error("Error renaming '" + files.file.path + "' to '" + targetName + "' - [" + err.code + "]  " + err.message);
                /* throw err; */
            } else {
                console.log('rename complete');  
            }
        });
        
        res.end();
    });
});

function getNow() {
    var d = new Date();
    return d.toISOString().replace(/\..+/,'');
}

/* Just a place holder for testing. The actual heartbeat would likely */
/* go to a hosted service or a formal monitoring package */
app.route('/heartBeat').get(function (req, res, next) {
    console.log("Request on /heartBeat @ " + getNow() );
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received heartbeat:\n\n');
    res.end();
});



var server = app.listen(config.serverPort, function() {
    console.log('Listening on port %d', server.address().port);
});
