'use strict';
/* jshint node: true, mocha:true */
const LambdaTester = require('lambda-tester');
const nock = require("nock");
const expect = require("chai").expect;

const processcrash = require('../deployment_change');
const problemOpened = require('./events/deployment_change.open');
const problemClosed = require('./events/deployment_change.closed');
const problemDBSlowdownOpened = require('./events/dbslowdown_app.open');
const config = require('../config/main');

describe("Deployment Change test", function() {

	before(function() {
		var n = nock("/.*/")
			.persist()
			.get('/')
			.reply(500, "not used");
	})

	after(function() {
		nock.cleanAll();
	});

	it("Test open problem event", function() {
		var disableDBSpammingPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=DBSpammingAuthWithAppDeployment&enabled=false")
			.reply(200, "");
		var addResolvingComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-6681805313861849020/comments", /Resolving problem by deploymentChangeAutoRemediation Lambda/g)
			.reply(200, "");

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "plugin disalbed, comment added to problem" });
				expect(disableDBSpammingPlugin.isDone(), "disableDBSpammingPlugin.isDone()").to.be.true;
				expect(addResolvingComment.isDone(), "addResolvingComment.isDone()").to.be.true;
			});
	});

	it("Test open dbslowdown problem event", function() {
		var disableDBSpammingPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=DBSpammingAuthWithAppDeployment&enabled=false")
			.reply(200, "");
		var addResolvingComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-4768003441119873242/comments", /Resolving problem by deploymentChangeAutoRemediation Lambda/g)
			.reply(200, "");

		return LambdaTester(processcrash.handler)
			.event(problemDBSlowdownOpened)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "Not a valid problem" });
				expect(disableDBSpammingPlugin.isDone(), "disableDBSpammingPlugin.isDone()").to.be.false;
				expect(addResolvingComment.isDone(), "addResolvingComment.isDone()").to.be.false;
			});
	});

	it("Test closed problem event", function() {
		var addResolvedComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-6681805313861849020/comments", /Problem resolved by deploymentChangeAutoRemediation Lambda/g)
			.reply(200, "");

		return LambdaTester(processcrash.handler)
			.event(problemClosed)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "comment added to problem" });
				expect(addResolvedComment.isDone(), "addResolvedComment.isDone()").to.be.true;
			});
	});
});

describe("Test errors", function() {
	after(function() {
		nock.cleanAll();
	});

	it("Test erorr in disabling plugin", function() {
		var disableDBSpammingPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=DBSpammingAuthWithAppDeployment&enabled=false")
			.reply(500, "");
		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test error in adding resolving problem comment", function() {
		var disableDBSpammingPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=DBSpammingAuthWithAppDeployment&enabled=false")
			.reply(200, "");
		var addResolvingComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-6681805313861849020/comments", /Resolving problem by Autoremediation Lambda/g)
			.reply(500, "");

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test erorr in adding resolved comment plugin", function() {
		var addResolvingComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/-6681805313861849020/comments", /Resolving problem by Autoremediation Lambda/g)
			.reply(500, "");

		return LambdaTester(processcrash.handler)
			.event(problemClosed)
			.timeout(10)
			.expectError();
	});
});