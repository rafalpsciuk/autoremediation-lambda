'use strict';
/* jshint node: true */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const config = require('./config/main');

const DynatraceUtils = require('./dynatrace_utils');
const dtUtils = new DynatraceUtils(config.cluster + config.environment, config.apiToken);

const MarathonUtils = require('./marathon_utils');
const marathonUtils = new MarathonUtils(config.marathonHost);

const EventParser = require('./event_parser');

exports.handler = function(event, context, callback) {
  var parsedEvent = parseEvent(event);

  if (!isCorrectProblem(parsedEvent)) {
    callback(null, { "Result": "Problem not complete, nothing to do" });
  } else {
    getLoad(parsedEvent, callback);
  }
};

function parseEvent(event) {
  console.log(event);
  var parser = new EventParser(event);

  var parsedEvent = {
    hasApplication: parser.hasApplication(),
    isOpen: parser.isOpen(),
    hasDBService:  parser.hasService('easyTravel-Business'),
    problemId: parser.getProblemId()
  };

  return parsedEvent;
}

function isCorrectProblem(parsedEvent) {
  console.log("hasApplication: " + parsedEvent.hasApplication + " problemId: " + parsedEvent.problemId + " hasDBService: " + parsedEvent.hasDBService);
  return parsedEvent.problemId !== 0 && parsedEvent.hasDBService;
}

function getLoad(parsedEvent, done) {
  var endTime = new Date().getTime() - 120000;
  var startTime = endTime - config.monitoringInterval;

  console.log("startTime: "  + startTime + " endTime: " + endTime);

  dtUtils.getLoad(config.monitoredHost, startTime, endTime, function(error, resp) {
    getLoadCallback(parsedEvent, error, resp, done);
  });
}

function getLoadCallback(parsedEvent, error, resp, done) {
  if (error) {
    done("Error: getting load" + JSON.stringify(error, null, 2));
  } else {
    var load = resp;
    console.log("Detected load: " + load);
    console.log("Expected instances of micro-journey-service " + getExpectedServices(load) + ' (x2)');
    getCurrentServices(parsedEvent, load, done);
  }
}

function getExpectedServices(load) {
  var services = (load > config.threshold ? config.servicesHigh : config.servicesNormal);
  return services;
}

function getCurrentServices(parsedEvent, load, done) {
  getServicesFromMarathon(function(error, resp) {
    getMarathonServicesCallback(parsedEvent, load, error, resp, done);
  });
}

function getServicesFromMarathon(done) {
  marathonUtils.getApps(function(err, resp) {
    if (err) {
      done(err, resp);
    } else {
      var mjs1Cnt = 0;
      var mjs2Cnt = 0;
      resp.apps.forEach(function(app) {
        if (app.id === '/micro-journey-service-1') {
          mjs1Cnt = app.instances;
        } else if (app.id === '/micro-journey-service-2') {
          mjs2Cnt = app.instances;
        }
      });
      done(null, {
        "mjs1Cnt": parseInt(mjs1Cnt, 10),
        "mjs2Cnt": parseInt(mjs2Cnt, 10)
      });
    }
  });
}

function getMarathonServicesCallback(parsedEvent, load, error, resp, done) {
  if (error) {
    console.error("Error getting applications from marathon ", JSON.stringify(error, null, 2));
    done(error);
  } else {
    var services = getExpectedServices(load);
    console.log("Current instances of micro-journey-service  " + resp.mjs1Cnt + " " + resp.mjs2Cnt);
    if (resp.mjs1Cnt === resp.mjs2Cnt && resp.mjs2Cnt === services) {
      done(null, { "Result": "Scaling not needed" });
    } else {
      scaleServices(parsedEvent, load, done);
    }
  }
}

function scaleServices(parsedEvent, load, done) {
  var services = getExpectedServices(load);
  console.log("Scaling");
  scaleServicesOnMarathon(services, function(err) {
    if (err) {
      console.log("Error scaling services ", JSON.stringify(err, null, 2));
      done(err);
    } else {
      addServicesScaledComment(parsedEvent, load, done);
    }
  });
}

function scaleServicesOnMarathon(instances, done) {
  marathonUtils.scale(instances, 'micro-journey-service-1', function(err) {
    if (err) {
      done(err);
    }
    marathonUtils.scale(instances, 'micro-journey-service-2', function(err) {
      done(err);
    });
  });
}

function addServicesScaledComment(parsedEvent, load, done) {
  var services = getExpectedServices(load);
  var commentText = getComment(load, services);
  addComment(parsedEvent.problemId, commentText, function(err) {
    if (err) {
      console.error("Error adding comment ", JSON.stringify(err, null, 2));
      done(err);
    } else {
      done(null, { "Result": "Services scaled, comment added to problem" });
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


function getComment(load, services) {
  var loadText = formatBits(load * 8) + "/s (threshold: " + formatBits(config.threshold * 8) + "/s)";
  var trafficText = (load > config.threshold ? "High traffic detected:" : "Normal traffic detected:");
  var servicesTotal = services * 2;
  var scalingText = "Changed number of MicroJourneyService instances to " + servicesTotal;
  return trafficText + " " + loadText + " " + scalingText;
}


function formatBits(bytes, decimals) {
  if (bytes === 0) return '0 bits';
  var k = 1000,
    dm = decimals || 2,
    sizes = ['bits', 'kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
