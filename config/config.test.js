var config = require('./config.global');

config.apiToken = 'Api-Token testtoken';
config.cluster = 'https://localhost'
config.environment = '/e/envid'
config.monitoredHost = 'testMonitoredHost'
config.marathonHost = 'https://localhost';
config.pluginServiceHost = 'http://localhost:8091';

module.exports = config;