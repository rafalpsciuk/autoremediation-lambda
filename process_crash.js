'use strict';
/* jshint node: true */

/* jshint node: true */
const config = require('./config/main');

const DynatraceUtils = require('./dynatrace_utils');
const dtUtils = new DynatraceUtils(config.cluster + config.environment, config.apiToken);

const EasyTravelUtils = require('./easytravel_utils');
const etUtils = new EasyTravelUtils(config.pluginServiceHost);

const EventParser = require('./event_parser');

const couchDBPlugin = 'CrashCouchDB';
const javascriptErrorsPlugin = 'JavascriptChangeDetectionWithError';



exports.handler = function(event, context, callback) {
  var parsedEvent = parseEvent(event);

  if (!isCorrectProblem(parsedEvent)) {
    callback(null, { "Not a valid problem": "true" });
  } else {
    processEvent(parsedEvent, callback);
  }
};

function parseEvent(event) {
  console.log('Loading event');
  console.log(event);

  var parser = new EventParser(event);

  var parsedEvent = {
    hasApplication: parser.hasApplication('www.easytravel.com'),
    hasProcess: parser.hasProcess('CouchDB_ET'),
    isOpen: parser.isOpen(),
    problemId: parser.getProblemId()
  };
  console.log("isOpen: " + parsedEvent.isOpen + " hasApplication: " + parsedEvent.hasApplication + " hasProcess: " + parsedEvent.hasProcess);

  return parsedEvent;
}

function isCorrectProblem(parsedEvent) {
  return parsedEvent.hasApplication && parsedEvent.hasProcess && parsedEvent.problemId !== 0;
}

function processEvent(parsedEvent, done) {
    if (parsedEvent.isOpen) {
      console.log("Resolving problem");
      disablePlugins(parsedEvent, done);
    } else {
      console.log("Send resolved comment");
      addProblemResolvedComment(parsedEvent.problemId, done);
    }  
}

function disablePlugins(parsedEvent, done) {
  var error = {
    couchErr: null,
    javaScriptErr: null
  };

  disablePlugin(couchDBPlugin, function(couchErr) {
    error.couchErr = couchErr;
    disablePlugin(javascriptErrorsPlugin, function(javaScriptErr) {
      error.javaScriptErr = javaScriptErr;
      disablePluginCallback(parsedEvent, error, done);
    });
  });
}

function disablePlugin(pluginName, done) {
  etUtils.setPluginState(pluginName, 'false', function(err, resp) {
    done(err, resp);
  });
}

function disablePluginCallback(parsedEvent, error, done) {
  if (error.couchErr || error.javaScriptErr) {
    console.error("Error disabling plugin", JSON.stringify(error, null, 2));
    done(error);
  } else {
    addResolvingProblemComment(parsedEvent.problemId, done);
  }
}

function addResolvingProblemComment(problemId, done) {
  addComment(problemId, "Resolving problem by processCrashAutoRemediation Lambda", function(err) {
    if (err) {
      console.error("Error adding comment ", JSON.stringify(err, null, 2));
      done(err);
    } else {
      done(null, { "Result": "plugin disalbed, comment added to problem" });
    }
  });
}

function addProblemResolvedComment(problemId, done) {
  addComment(problemId, "Problem resolved by processCrashAutoRemediation Lambda", function(err) {
    if (err) {
      console.error("Error adding comment ", JSON.stringify(err, null, 2));
      done(err);
    } else {
      done(null, { "Result": "comment added to problem" });
    }
  });
}

function addComment(problemId, commentText, done) {
  var comment = {
    "comment": commentText,
    "user": "demoability@dynatrace.com",
    "context": "Lambda"
  };

  dtUtils.addComment(problemId, comment, function(err, resp) {
    done(err, resp);
  });
}