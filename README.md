# Example AWS Lambda functions for Dynatrace autoremediation demo
See this blog post for details: https://www.dynatrace.com/blog/auto-mitigation-with-dynatrace-ai-or-shall-we-call-it-self-healing/
- service_scalling.js - this function checks the load on given host's NIC and scales services on Marathon when threshold is exceeded
- process_crash.js and deployment_change.js - those functions are used to disable problem patterns on easyTravel demo application
## Configuring Dynatrace connection
This code is prepared to work with multiple clusters. Configuration is stored in files under `config` directory. Files should be named 'config._name_'.js. And the _name_ is taken from `NODE_ENV` environmental variable. For tests you can also edit `config/config.test.js`.
## Build
- run `npm install` to download all needed dependencies
- tests can be started running `npm test`
