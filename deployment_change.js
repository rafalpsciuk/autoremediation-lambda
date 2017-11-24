'use strict';
/* jshint node: true */
const config = require('./config/main');

const DynatraceUtils = require('./dynatrace_utils');
const dtUtils = new DynatraceUtils(config.cluster + config.environment, config.apiToken);

const EasyTravelUtils = require('./easytravel_utils');
const etUtils = new EasyTravelUtils(config.pluginServiceHost);

const EventParser = require('./event_parser');

const dbSpammingPlugin = 'DBSpammingAuthWithAppDeployment';

exports.handler = function(event, context, callback) {
  var parsedEvent = parseEvent(event);

  if (!isCorrectProblem(parsedEvent)) {
    callback(null, { "Result": "Not a valid problem" });
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
    hasAuthenticationService: parser.hasService('AuthenticationService'),
    hasDBService:  parser.hasService('easyTravel-Business'),
    isOpen: parser.isOpen(),
    problemId: parser.getProblemId()
  };

  return parsedEvent;
}

function isCorrectProblem(parsedEvent) {
  console.log("isOpen: " + parsedEvent.isOpen + " hasApplication: " + parsedEvent.hasApplication 
    + " hasAuthenticationService: " + parsedEvent.hasAuthenticationService + " hasDBService: " + parsedEvent.hasDBService);
  return parsedEvent.hasApplication && parsedEvent.hasAuthenticationService && parsedEvent.problemId !== 0 && !parsedEvent.hasDBService;
}

function processEvent(parsedEvent, done) {
  if (parsedEvent.isOpen) {
    console.log("Resolving problem");
    disablePlugin(parsedEvent, done);
  } else {
    console.log("Send resolved comment");
    addProblemResolvedComment(parsedEvent.problemId, done);
  }
}

function disablePlugin(parsedEvent, done) {
  etUtils.setPluginState(dbSpammingPlugin, 'false', function(error, resp) {
    disablePluginCallback(parsedEvent, error, done);
  });
}

function disablePluginCallback(parsedEvent, error, done) {
  if (error) {
    console.error("Error disabling plugin " + JSON.stringify(error, null, 2));
    done(error);
  } else {
    addResolvingProblemComment(parsedEvent.problemId, done);
  }
}

function addResolvingProblemComment(problemId, done) {
  addComment(problemId, "Resolving problem by deploymentChangeAutoRemediation Lambda", function(err) {
    if (err) {
      console.error("Error adding comment ", JSON.stringify(err, null, 2));
      done(err);
    } else {
      done(null, { "Result": "plugin disalbed, comment added to problem" });
    }
  });
}

function addProblemResolvedComment(problemId, done) {
  addComment(problemId, "Problem resolved by deploymentChangeAutoRemediation Lambda", function(err) {
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