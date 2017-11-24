'use strict';
/* jshint node: true */
var sa = require('superagent');

function MarathonUtils(marathon) {
  this.marathonHost = marathon;
}

MarathonUtils.prototype.scale = function(instances, appName, done) {
  var url = this.marathonHost + '/v2/apps/' + appName;
  sa.put(url)
    .auth('labuser', 'm4r4th0n')
    .send({
      instances: instances
    })
    .end(
      function(error, resp) {
        if (error) {
          done(error, resp);
        } else {
          done(error, resp.body);
        }
      }
    );
}

MarathonUtils.prototype.getApps = function(done) {
  var url = this.marathonHost + '/v2/apps/';
  sa.get(url)
    .auth('labuser', 'm4r4th0n')
    .end(
      function(error, resp) {
        if (error) {
          done(error, resp);
        } else {
          done(error, resp.body);
        }
      }
    );
}
module.exports = MarathonUtils;