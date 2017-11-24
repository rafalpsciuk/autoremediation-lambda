var config = {};

config.monitoringInterval = 5*60*1000;
config.threshold = 5000000;
config.servicesNormal = 5;
config.servicesHigh = 10;
config.apiToken = '';
config.cluster = ''
config.environment = ''
config.monitoredHost = ''
config.marathonHost = '';
config.pluginServiceHost = '';

module.exports = config;