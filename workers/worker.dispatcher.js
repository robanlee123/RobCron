/* RobCron worker/worker.dispatcher.js
 *
 * Copyright (c) 2014, Roban lee <Robanlee at gmail dot com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 * * Neither the name of Redis nor the names of its contributors may be used
 * to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var redisObject = require(__dirname+'/../lib/lib.redis').redisObject;
var parser = require(__dirname + '/../lib/lib.parser.js');
var rdo = new redisObject();

(function(module) {
	/**
	 * Initialize a new dispatcher worker
	 *
	 * @api public
	 */
	var dispatcher = module.dispatcher = function() {
		var self = this;
		console.clog('Worker: dispatcher is working now ... ');

		this.fetchJob();
		setInterval(function() {
			self.fetchJob();
		}, 60 * 1000);
	};

	/**
	 * Get schedule job and dispatch it
	 *
	 * @return null
	 * @api public
	 */
	dispatcher.prototype.fetchJob = function() {
		rdo.getScheduleIds(function(ids) {
			if (!ids) {
				return false;
			}

			for (var x in ids) {
				(function(id) {
					rdo.getScheduleByID(id, function(job) {
						var rule = job.schedule_rule;
						var spec = parser.fromCronString(rule);
						var nextTickTime = spec.nextInvocationDate().getTime().toString().substring(0, 10);
						rdo.dispatchJob(nextTickTime, id, function(response) {
							if (!response) {
								return false;
							}
							console.clog('Scheule job  of id : ' + id + ' has been dispatched');
						});
					});
				})(ids[x]);
			}
		});
	};

})(exports = module.exports || void 0);