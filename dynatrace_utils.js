'use strict';
/* jshint node: true */
var sa = require('superagent');


function DynatraceUtils(tenant, token) {
	this.dtTentant = tenant;
	this.apiToken = token;
}

DynatraceUtils.prototype.getLoad = function(host, startTime, endTime, done) {
	var url = this.dtTentant + '/api/v1/timeseries';
	sa.post(url)
		.set('authorization', this.apiToken)
		.set('Content-Type', 'application/json')
		.send({
			startTimestamp: startTime
		})
		.send({
			endTimestamp: endTime
		})
		.send({
			queryMode: "total"
		})
		.send({
			timeseriesId: "com.dynatrace.builtin:host.nic.bytessent"
		})
		.send({
			aggregationType: "SUM"
		})
		.send({
			entities: [host]
		})
		.end(function(error, resp) {
			if (error) {
				done(error, resp);
			} else {
				var key = Object.keys(resp.body.result.dataPoints)[0];
				var load = resp.body.result.dataPoints[key][0][1];
				done(null, load);
			}
		});
};

DynatraceUtils.prototype.addComment = function(problemId, comment, done) {
	var url = this.dtTentant + '/api/v1/problem/details/' + problemId + '/comments';
	sa.post(url)
		.set('authorization', this.apiToken)
		.set('Content-Type', 'application/json')
		.send(comment)
		.end(function(error, resp) {
			done(error, resp);
		});
};

module.exports = DynatraceUtils;