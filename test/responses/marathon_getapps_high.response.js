module.exports = {
  "apps": [
    {
      "id": "/nginx",
      "cmd": "nginx -g 'daemon off;'",
      "args": null,
      "user": null,
      "env": {},
      "instances": 1,
      "cpus": 0.1,
      "mem": 400,
      "disk": 0,
      "executor": "",
      "constraints": [],
      "uris": [],
      "fetch": [],
      "storeUrls": [],
      "ports": [
        9003,
        9004
      ],
      "requirePorts": false,
      "backoffSeconds": 1,
      "backoffFactor": 1.15,
      "maxLaunchDelaySeconds": 3600,
      "container": {
        "type": "DOCKER",
        "volumes": [],
        "docker": {
          "image": "easytravel/nginx-mesos-base:jnc",
          "network": "BRIDGE",
          "portMappings": [
            {
              "containerPort": 28083,
              "hostPort": 28083,
              "servicePort": 9003,
              "protocol": "tcp"
            },
            {
              "containerPort": 28084,
              "hostPort": 28084,
              "servicePort": 9004,
              "protocol": "tcp"
            }
          ],
          "privileged": false,
          "parameters": [],
          "forcePullImage": false
        }
      },
      "healthChecks": [],
      "dependencies": [],
      "upgradeStrategy": {
        "minimumHealthCapacity": 1,
        "maximumOverCapacity": 1
      },
      "labels": {},
      "acceptedResourceRoles": null,
      "ipAddress": null,
      "version": "2017-09-12T16:12:15.511Z",
      "versionInfo": {
        "lastScalingAt": "2017-09-12T16:12:15.511Z",
        "lastConfigChangeAt": "2017-09-12T16:12:15.511Z"
      },
      "tasksStaged": 0,
      "tasksRunning": 1,
      "tasksHealthy": 0,
      "tasksUnhealthy": 0,
      "deployments": []
    },
    {
      "id": "/micro-journey-service-1",
      "cmd": "node /src/proxy.js",
      "args": null,
      "user": null,
      "env": {
        "PROXY_BACKEND": "http://192.168.1.10:28083"
      },
      "instances": 10,
      "cpus": 0.01,
      "mem": 55,
      "disk": 0,
      "executor": "",
      "constraints": [],
      "uris": [],
      "fetch": [],
      "storeUrls": [],
      "ports": [
        9000
      ],
      "requirePorts": false,
      "backoffSeconds": 1,
      "backoffFactor": 1.15,
      "maxLaunchDelaySeconds": 3600,
      "container": {
        "type": "DOCKER",
        "volumes": [],
        "docker": {
          "image": "easytravel/nodejs-proxy",
          "network": "BRIDGE",
          "portMappings": [
            {
              "containerPort": 8080,
              "hostPort": 0,
              "servicePort": 9000,
              "protocol": "tcp"
            }
          ],
          "privileged": false,
          "parameters": [],
          "forcePullImage": false
        }
      },
      "healthChecks": [],
      "dependencies": [],
      "upgradeStrategy": {
        "minimumHealthCapacity": 1,
        "maximumOverCapacity": 1
      },
      "labels": {},
      "acceptedResourceRoles": null,
      "ipAddress": null,
      "version": "2017-10-20T13:00:03.105Z",
      "versionInfo": {
        "lastScalingAt": "2017-10-20T13:00:03.105Z",
        "lastConfigChangeAt": "2017-07-25T10:04:58.319Z"
      },
      "tasksStaged": 0,
      "tasksRunning": 5,
      "tasksHealthy": 0,
      "tasksUnhealthy": 0,
      "deployments": []
    },
    {
      "id": "/micro-journey-service-2",
      "cmd": "node /src/proxy.js",
      "args": null,
      "user": null,
      "env": {
        "PROXY_BACKEND": "http://192.168.1.10:28084"
      },
      "instances": 10,
      "cpus": 0.01,
      "mem": 55,
      "disk": 0,
      "executor": "",
      "constraints": [],
      "uris": [],
      "fetch": [],
      "storeUrls": [],
      "ports": [
        9001
      ],
      "requirePorts": false,
      "backoffSeconds": 1,
      "backoffFactor": 1.15,
      "maxLaunchDelaySeconds": 3600,
      "container": {
        "type": "DOCKER",
        "volumes": [],
        "docker": {
          "image": "easytravel/nodejs-proxy",
          "network": "BRIDGE",
          "portMappings": [
            {
              "containerPort": 8080,
              "hostPort": 0,
              "servicePort": 9001,
              "protocol": "tcp"
            }
          ],
          "privileged": false,
          "parameters": [],
          "forcePullImage": false
        }
      },
      "healthChecks": [],
      "dependencies": [],
      "upgradeStrategy": {
        "minimumHealthCapacity": 1,
        "maximumOverCapacity": 1
      },
      "labels": {},
      "acceptedResourceRoles": null,
      "ipAddress": null,
      "version": "2017-10-20T13:00:03.161Z",
      "versionInfo": {
        "lastScalingAt": "2017-10-20T13:00:03.161Z",
        "lastConfigChangeAt": "2017-07-25T10:05:04.321Z"
      },
      "tasksStaged": 0,
      "tasksRunning": 5,
      "tasksHealthy": 0,
      "tasksUnhealthy": 0,
      "deployments": []
    }
  ]
}