/* RobCron lib/lib.redis.js
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

var dir = __dirname;
var conf = require(dir + '/../config/conf.js');
var redis = require('redis');
var tool = require(dir + "/lib.tool.js");
var util = require("util");
(function(module) {

	/**
	 * Global callback function of redis actions,
	 * 
	 * @param err	err if returns 
	 * @param data	return data
	 * @param fn {Function} function to callback
	 * @api public
	 */
	var cb = function(err, data, fn) {
		if (err) {
			console.log(err);
			return fn(false);
		}
		return fn(data);
	};


	/**
	 * Initialize a new redis data object 
	 *
	 * @api public
	 */
	var redisObject = module.redisObject = function() {
		this.redisClient = redis.createClient(config.redisEnv.port, config.redisEnv.host);
		this.redisClient.on('error', function(msg) {
			console.log(msg);
		});
	};

	/**
	 * incr max schedule job id and return it 
	 * @param fn {Function} callback function 
	 * @api public
	 */
	redisObject.prototype.getScheduleID = function(fn) {
		this.redisClient.incr(config.scheduleKeys.maxID, function(err, response) {
			return cb(err, response, fn);
		});
	};

	/**
	 * push new schedule id to list key 
	 * @param {int} id id to push
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.pushScheduleID = function(id, fn) {
		this.redisClient.sadd(config.scheduleKeys.ids, id, function(err, response) {
			return cb(err, response, fn);
		});
	};

	/**
	 * Get all schedule job ids
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.getScheduleIds = function(fn) {
		this.redisClient.smembers(config.scheduleKeys.ids, function(err, response) {
			return cb(err, response, fn);
		});
	};

	/**
	 * Dispatching an job, adding this id to the timestamp(minutes) which will be triggerd
	 * @param {int} tm unix timestamp 10 bits
	 * @param {int} id schedule job id 
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.dispatchJob = function(tm, id, fn) {
		this.redisClient.sadd(util.format(config.scheduleKeys.tmTask, tm), id, function(err, response) {
			return cb(err, response, fn);
		});
	};

	/**
	 * Get schedule job info by id
	 * @param {int} id job id 
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.getScheduleByID = function(id, fn) {
		this.redisClient.hgetall(util.format(config.scheduleKeys.scheduleInfo, id), function(err, response) {
			return cb(err, response, fn);
		});
	};

	/**
	 * Fetching jobs via timestamp
	 * @param {int} tm time stamp
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.fetchJobByTime = function(tm, fn) {
		var tm = tm || Date.now().toString().substring(0, 10);
		tm = (tm - tm % 60);
		var self = this;
		this.redisClient.spop(util.format(config.scheduleKeys.tmTask, tm), function(err, popedData) {
			if (err || popedData == null) {
				return cb(err, null, fn);
			}

			self.getScheduleByID(popedData, fn);
		});
	};

	/**
	 * Get task id 
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.getTaskID = function(fn) {
		this.redisClient.incr(util.format(config.scheduleKeys.taskID), function(err,response) {
			return cb(err, response, fn);
		});
	};


	/**
	 * Adding a schedule job 
	 * @param {object} scheduleData json-style data structrue 
	 * @param {Function} fn callback function 
	 * @api public
	 */
	redisObject.prototype.addSchedule = function(scheduleData, fn) {
		var self = this;
		this.getScheduleID(function(maxID) {
			if (!maxID) {
				return false;
			}

			self.pushScheduleID(maxID, function(pushResult) {
				if (!pushResult) {
					return false;
				}

				var data = tool.merge(scheduleData, {
					schedule_id: maxID,
					schedule_last_code: 0,
					schedule_err_times: 0,
					schedule_created: Date.now().toString().substring(0, 10)
				});

				self.redisClient.hmset(util.format(config.scheduleKeys.scheduleInfo, maxID), data, function(err, response) {
					cb(err, response, fn);
				});

			});

		});


	};




})(exports = module.exports || void 0);