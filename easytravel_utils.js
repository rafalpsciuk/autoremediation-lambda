'use strict';
/* jshint node: true */
var sa = require('superagent');

function EasyTravelUtils(pluginHost) {
	this.pluginHost = pluginHost;
}

EasyTravelUtils.prototype.setPluginState = function(pluginName, enabled, done) {
	var url = this.pluginHost + '/services/ConfigurationService/setPluginEnabled?name=' + pluginName + '&enabled=' + enabled;
	sa.get(url)
		.end(function(error, resp) {
			done(error, resp);
		});

};

module.exports = EasyTravelUtils;