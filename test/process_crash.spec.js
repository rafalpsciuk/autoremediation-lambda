'use strict';
/* jshint node: true, mocha:true */
const LambdaTester = require('lambda-tester');
const nock = require("nock");
const expect = require("chai").expect;

const processcrash = require('../process_crash');
const problemOpened = require('./events/process_crash.open');
const problemClosed = require('./events/process_crash.closed');
const config = require('../config/main');

describe("Process Crash test", function() {

	after(function() {
		nock.cleanAll();
	});

	it("Test open problem event", function() {
		var disableJavaScriptPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=JavascriptChangeDetectionWithError&enabled=false")
			.reply(200, "");
		var disableCouchPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=CrashCouchDB&enabled=false")
			.reply(200, "");
		var addResolvingComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/1724771582765390602/comments", /Resolving problem by processCrashAutoRemediation Lambda/g)
			.reply(200, "");

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectResult(function(result) {
				expect(result).to.be.deep.equal({ Result: "plugin disalbed, comment added to problem" });
				expect(disableJavaScriptPlugin.isDone(), "disableJavaScriptPlugin.isDone()").to.be.true;
				expect(disableCouchPlugin.isDone(), "disableJavaScriptPlugin.isDone()").to.be.true;
				expect(addResolvingComment.isDone(), "addResolvingComment.isDone()").to.be.true;
			});
	});

	it("Test closed problem event", function() {
		var addResolvedComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/5928653535240633324/comments", /Problem resolved by processCrashAutoRemediation Lambda/g)
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

	it("Test disabling JavascriptChangeDetectionWithError plugin error", function() {
		var disableJavaScriptPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=JavascriptChangeDetectionWithError&enabled=false")
			.reply(500, "");
		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});


	it("Test disabling CrashCouchDB plugin error", function() {
		var disableJavaScriptPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=JavascriptChangeDetectionWithError&enabled=false")
			.reply(200, "");
		var disableCouchPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=CrashCouchDB&enabled=false")
			.reply(500, "");

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test adding resolving problem comment error  ", function() {
		var disableJavaScriptPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=JavascriptChangeDetectionWithError&enabled=false")
			.reply(200, "");
		var disableCouchPlugin = nock(config.pluginServiceHost)
			.get("/services/ConfigurationService/setPluginEnabled?name=CrashCouchDB&enabled=false")
			.reply(200, "");
		var addResolvingComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/5928653535240633324/comments", /Resolving problem by Autoremediation Lambda/g)
			.reply(500, "");

		return LambdaTester(processcrash.handler)
			.event(problemOpened)
			.timeout(10)
			.expectError();
	});

	it("Test error add resloved comment", function() {
		var addResolvedComment = nock(config.cluster)
			.post(config.environment + "/api/v1/problem/details/5928653535240633324/comments", /Problem resolved by Autoremediation Lambda/g)
			.reply(500, "");

		return LambdaTester(processcrash.handler)
			.event(problemClosed)
			.timeout(10)
			.expectError();
	});
});