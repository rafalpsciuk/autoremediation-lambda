'use strict';
/* jshint node: true */

function EventParser(eventToProcess) {
	this.event = eventToProcess;
}

EventParser.prototype.isOpen = function() {
	return this.event.State === "OPEN";
}

EventParser.prototype.hasApplication = function(appName) {
	return this.hasEntity('APPLICATION', appName);
}

EventParser.prototype.hasService = function(serviceName) {
	return this.hasEntity('SERVICE', serviceName);
}

EventParser.prototype.hasProcess = function(processName) {
	return this.hasEntity('PROCESS_GROUP_INSTANCE', processName);
}

EventParser.prototype.hasEntity = function(type, name) {
	if (!this.event.ImpactedEntities) {
		return false;
	}
	for (var i = 0; i < this.event.ImpactedEntities.length; ++i) {
		var entry = this.event.ImpactedEntities[i];
		if ((entry.type === type) && (entry.name === name)) {
			return true;
		}
	}
	return false;
}

EventParser.prototype.getProblemId = function() {
	return this.event.PID;
}

module.exports = EventParser;