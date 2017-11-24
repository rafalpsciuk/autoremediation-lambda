'use strict';
/* jshint node: true, mocha:true */

const expect = require('chai').expect;
const EventParser = require('../event_parser');
const dbSlowdownOpen = require('./events/dbslowdown.open');
const deploymentChangeOpen = require('./events/deployment_change.open.js');
const deploymentChangeClosed = require('./events/deployment_change.closed.js');
const processCrashOpen = require('./events/process_crash.open.js');
const testEvent = require('./events/test.event.js');
const mergedEvent = require('./events/merged.event.js');
const emptyEvent = require('./events/empty.event.js');


describe("Test evnet parser", function() {
	it("Test dbSlowdown event", function() {

		var parser = new EventParser(dbSlowdownOpen);
		expect(parser.isOpen(), "isOpen").to.be.true;
		expect(parser.hasApplication('www.easytravel.com'), "hasApplication").to.be.false;
		expect(parser.hasService('easyTravel-Business'), "hasService easyTravel-Business").to.be.true;
		expect(parser.getProblemId(), "problemID").to.equal('-4768003441119873242');
	});

	it("Test deploymentchageOpen event", function() {

		var parser = new EventParser(deploymentChangeOpen);
		expect(parser.isOpen(), "isOpen").to.be.true;
		expect(parser.hasApplication('www.easytravel.com'), "hasApplication").to.be.true;
		expect(parser.hasService('AuthenticationService'), "hasService AuthenticationService").to.be.true;
		expect(parser.hasService('easyTravel-Business'), "hasService easyTravel-Business").to.be.false;
		expect(parser.getProblemId(), "problemID").to.equal('-6681805313861849020');
	});

	it("Test deploymentChangeClosed event", function() {

		var parser = new EventParser(deploymentChangeClosed);
		expect(parser.isOpen(), "isOpen").to.be.false;
		expect(parser.hasApplication('www.easytravel.com'), "hasApplication").to.be.true;
		expect(parser.hasService('AuthenticationService'), "hasService AuthenticationService").to.be.true;
		expect(parser.hasService('easyTravel-Business'), "hasService easyTravel-Business").to.be.false;
		expect(parser.getProblemId(), "problemID").to.equal('-6681805313861849020');
	});

	it("Test test event", function() {

		var parser = new EventParser(testEvent);
		expect(parser.isOpen(), "isOpen").to.be.true;
		expect(parser.hasApplication('www.easytravel.com'), "hasApplication").to.be.false;
		expect(parser.hasService('easyTravel Customer Frontend'), "hasService easyTravel Customer Frontend").to.be.false;
		expect(parser.hasProcess('CouchDB_ET'), "hasProcess CouchDB_ET").to.be.false;
		expect(parser.getProblemId(), "problemID").to.equal('{PID}');
	});

	it("Test merged event", function() {
		var parser = new EventParser(mergedEvent);
		expect(parser.isOpen(), "isOpen").to.be.false;
		expect(parser.hasApplication('www.easytravel.com'), "hasApplication").to.be.false;
		expect(parser.hasService('easyTravel Customer Frontend'), "hasService easyTravel Customer Frontend").to.be.false;
		expect(parser.hasProcess('CouchDB_ET'), "hasProcess CouchDB_ET").to.be.false;
		expect(parser.getProblemId(), "problemID").to.equal('-2948781800117283610');
		expect(parser.hasProcess('CouchDB_ET'), "hasProcess CouchDB_ET").to.be.false;
	});

	it("Test empty event", function() {
		var parser = new EventParser(emptyEvent);
		expect(parser.isOpen(), "isOpen").to.be.false;
		expect(parser.hasApplication('www.easytravel.com'), "hasApplication").to.be.false;
		expect(parser.hasService('easyTravel Customer Frontend'), "hasService easyTravel Customer Frontend").to.be.false;
		expect(parser.hasProcess('CouchDB_ET'), "hasProcess CouchDB_ET").to.be.false;
		expect(parser.getProblemId(), "problemID").to.be.undefined;
		expect(parser.hasProcess('CouchDB_ET'), "hasProcess CouchDB_ET").to.be.false;
	});
});