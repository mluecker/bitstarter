#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var http = require('http');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var downloadFile = function(url) {
  var instr = url.toString();
  return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var doDownloadFile = function(url){
  var request = http.get(url, function(response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      var checkJson = checkHtmlFile(''+chunk, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      writeOutput(outJson);
    });
  }); 
}

var checkHtmlFile = function(htmlfile, checksfile) {
    if(htmlfile != 'index.html'){
      $ = cheerio.load(htmlfile);
    }else{
      $ = cheerioHtmlFile(htmlfile);
    }
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var writeOutput=function(out){
  var outfile = "result.json";
  fs.writeFileSync(outfile, out);  
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'url to index.html', clone(downloadFile))
        .parse(process.argv); 
    if(program.url){
      doDownloadFile(program.url);
    }else{
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      writeOutput(outJson);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}