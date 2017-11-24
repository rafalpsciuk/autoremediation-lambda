'use strict';
/* jshint node: true, mocha:true */
const expect = require("chai").expect;
const rewire = require("rewire");
const scaleServices = rewire("../service_scalling");
const config = require("../config/main");

describe("Prepare a comment", function() {
	var privateGetComment = scaleServices.__get__('getComment');
	var privateFormatBits = scaleServices.__get__('formatBits');

	it("get comment for given load smaller than threshold and number of services", function() {
		var load = config.threshold - 10000;
		var loadString = getLoadString(load);
		var comment = privateGetComment(load,5);

		expect(comment).to.equal("Normal traffic detected: " + loadString + " Changed number of MicroJourneyService instances to 10" );
	});

	it("get comment for given load bigger than threshold and number of services", function() {
		var load = config.threshold + 10000;
		var loadString = privateFormatBits(load * 8) + "/s (threshold: " + privateFormatBits(config.threshold * 8) + "/s)";
		var comment = privateGetComment(load,5);

		expect(comment).to.equal("High traffic detected: " + loadString + " Changed number of MicroJourneyService instances to 10" );
	});
});

function getLoadString(load) {
	var privateFormatBits = scaleServices.__get__('formatBits');
	return privateFormatBits(load * 8) + "/s (threshold: " + privateFormatBits(config.threshold * 8) + "/s)";
}

describe("Test formatBits", function() {
	var privateFormatBits = scaleServices.__get__('formatBits');

	it("Test formatBits", function() {
		var bit8 = privateFormatBits(8);
		var kiloBit8 = privateFormatBits(8000);
		var megaBit8 = privateFormatBits(8000000);
		var gigaBit8 = privateFormatBits(8000000000);

		expect(bit8).to.equal("8 bits" );
		expect(kiloBit8).to.equal("8 kb" );
		expect(megaBit8).to.equal("8 Mb" );
		expect(gigaBit8).to.equal("8 Gb" );
	});
});