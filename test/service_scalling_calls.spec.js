'use strict';
/* jshint node: true, mocha:true */
const LambdaTester = require('lambda-tester');
const nock = require("nock");
const expect = require("chai").expect;

const config = require('../config/main');

const processcrash = require('../service_scalling');
const problemOpened = require('./events/dbslowdown.open');

const marathonGetAppsLowResponse = require('./responses/marathon_getapps_low.response');
const marathonGetAppsHighResponse = require('./responses/marathon_getapps_high.response');
const marathonScaleAppsResponse = require('./responses/marathon_scale.response');
const getLoadHighResponse = require('./responses/dynatrace_getload_high.response.js');
const getLoadLowResponse = require('./responses/dynatrace_getload_low.response.js');

describe("Service scalling test", function() {

	after(function() {
		nock.cleanAll();
	});

	it("Test scale up", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsLowResponse);
		var scaleMicroJourneyService1 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-1")
			.reply(200, marathonScaleAppsResponse);
		var scaleMicroJourneyService2 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-2")
			.reply(200, marathonScaleAppsResponse);
		var addHighTrafficComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-4768003441119873242/comments", /High traffic detected: 387\.13.*Changed number of MicroJourneyService instances to 20/g)
			.reply(200, "");
		var getLoad = nock(config.cluster)
			.post(config.environment + "/api/v1/timeseries", new RegExp(config.monitoredHost))
			.reply(200, getLoadHighResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "Services scaled, comment added to problem" });
				expect(marathonGetApps.isDone(), "marathonGetApps.isDone()").to.be.true;
				expect(scaleMicroJourneyService1.isDone(), "scaleMicroJourneyService1.isDone()").to.be.true;
				expect(scaleMicroJourneyService2.isDone(), "scaleMicroJourneyService2.isDone()").to.be.true;
				expect(addHighTrafficComment.isDone(), "addHighTrafficComment.isDone()").to.be.true;
				expect(getLoad.isDone(), "getLoad.isDone()").to.be.true;

			});
	});

	it("Test scale not needed", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsLowResponse);
		var getLoad = nock(config.cluster)
			.post(config.environment + "/api/v1/timeseries", new RegExp(config.monitoredHost))
			.reply(200, getLoadLowResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "Scaling not needed" });
				expect(marathonGetApps.isDone(), "marathonGetApps.isDone()").to.be.true;
				expect(getLoad.isDone(), "getLoad.isDone()").to.be.true;
			});
	});

	it("Test scale low", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsHighResponse);
		var scaleMicroJourneyService1 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-1")
			.reply(200, marathonScaleAppsResponse);
		var scaleMicroJourneyService2 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-2")
			.reply(200, marathonScaleAppsResponse);
		var addHighTrafficComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-4768003441119873242/comments", /Normal traffic detected: 38\.72.*Changed number of MicroJourneyService instances to 10/g)
			.reply(200, "");
		var getLoad = nock(config.cluster)
			.post(config.environment + "/api/v1/timeseries", new RegExp(config.monitoredHost))
			.reply(200, getLoadLowResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "Services scaled, comment added to problem" });
				expect(marathonGetApps.isDone(), "marathonGetApps.isDone()").to.be.true;
				expect(scaleMicroJourneyService1.isDone(), "scaleMicroJourneyService1.isDone()").to.be.true;
				expect(scaleMicroJourneyService2.isDone(), "scaleMicroJourneyService2.isDone()").to.be.true;
				expect(addHighTrafficComment.isDone(), "addHighTrafficComment.isDone()").to.be.true;
				expect(getLoad.isDone(), "getLoad.isDone()").to.be.true;

			});
	});

	it("Test get marathon apps error", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(500, marathonGetAppsHighResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});
});

describe("Test errors", function() {
	after(function() {
		nock.cleanAll();
	});

	it("Test get marathon apps error", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(500, marathonGetAppsHighResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test scale micro-journey-service-1 error", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsHighResponse);
		var scaleMicroJourneyService1 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-1")
			.reply(500, marathonScaleAppsResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test scale micro-journey-service-2 error", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsHighResponse);
		var scaleMicroJourneyService1 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-1")
			.reply(200, marathonScaleAppsResponse);
		var scaleMicroJourneyService2 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-2")
			.reply(500, marathonScaleAppsResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test add high traffic comment error", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsHighResponse);
		var scaleMicroJourneyService1 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-1")
			.reply(200, marathonScaleAppsResponse);
		var scaleMicroJourneyService2 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-2")
			.reply(200, marathonScaleAppsResponse);
		var getLoad = nock(config.cluster)
			.post(config.environment + "/api/v1/timeseries", new RegExp(config.monitoredHost))
			.reply(200, getLoadLowResponse);
		var addHighTrafficComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-4768003441119873242/comments", /Normal traffic detected: 38\.72.*Changed number of MicroJourneyService instances to 10/g)
			.reply(500, "");

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test get load error", function() {
		var marathonGetApps = nock(config.marathonHost)
			.get("/v2/apps/")
			.reply(200, marathonGetAppsHighResponse);
		var scaleMicroJourneyService1 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-1")
			.reply(200, marathonScaleAppsResponse);
		var scaleMicroJourneyService2 = nock(config.marathonHost)
			.put("/v2/apps/micro-journey-service-2")
			.reply(200, marathonScaleAppsResponse);
		var getLoad = nock(config.cluster)
			.post(config.environment + "/api/v1/timeseries", new RegExp(config.monitoredHost))
			.reply(500, getLoadLowResponse);

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

});