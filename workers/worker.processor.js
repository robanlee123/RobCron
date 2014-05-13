/* RobCron worker/worker.processor.js
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

var redisObject = require(__dirname + '/../lib/lib.redis').redisObject;
var parser = require(__dirname + '/../lib/lib.parser.js');
var tool = require(__dirname + '/../lib/lib.tool.js');
var rdo = new redisObject();
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
(function(module) {

	/**
	 * Initialize a new processor object
	 *
	 * @api public
	 */
	var processor = module.processor = function() {
		var self = this;
		console.clog('Worker: processor is working now ... ');

		this.getJob();
		setInterval(function() {
			self.getJob();
		}, 55 * 1000);
	};

	/**
	 * Pop an task in timestamp and run this job
	 * @api public
	 */
	processor.prototype.getJob = function() {
		var self = this;
		rdo.fetchJobByTime(undefined, function(data) {
			if (!data) {
				return false;
			}

			self.runJob(data);

			process.nextTick(function() {
				self.getJob();
			});

		});
	};

	/**
	 * Run schedule job
	 * @param {Object} json data
	 * @api public
	 */
	processor.prototype.runJob = function(data) {
		var day = new Date().format('yyyy-MM-dd');
		var path = __dirname + '/../logs/' + day;
		var self = this;

		//create log path by date
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}

		//create task 
		var taskInfo = {
			task_name: data.schedule_name,
			schedule_id: data.schedule_id
		};

		this.createTask(taskInfo, function(response) {
			if (!response) {
				console.cerr('Failed to create task!');
				return false;
			}

			var command = data.schedule_params;
			command = util.format('%s > %s/../logs/%s/RobCron-log-%s-%s.log 2>&1', command, __dirname, day, data.schedule_id, response.task_id);
			console.clog('Command:' + command);

			//Log details to console
			console.clog(util.format('Processing Detail:Task id:%s of job:%s', response.task_id, data.schedule_id));

			var timeout = data.schedule_timeout || 60;
			var commandOptions = {timeout: timeout * 1000, maxBuffer: 1024 * 1024 * 100, killSignal: 'SIGHUP'};
			var cmd = exec(command, commandOptions);
			cmd.on('exit', function(code) {
				var taskEndInfo = {
					task_status: 1,
					task_end: Date.now().toString().substring(0, 10),
					task_exit_code: code
				};
				self.endTask(response.task_id, taskEndInfo, function() {
					console.clog( util.format('Task:%s of schedule %s has been done,code is: %s',response.task_id,data.schedule_id,code) );
				});
			});

		});
	};

	processor.prototype.endTask = function(taskID, taskData, fn) {
		rdo.modifyTask(taskID, taskData, fn);
	};

	processor.prototype.createTask = function(scheduleInfo, fn) {
		var taskInfo = tool.merge(scheduleInfo, {
			task_start: Date.now().toString().substring(0, 10),
			task_status: 0,
			task_created: Date.now().toString().substring(0, 10)
		});

		rdo.getTaskID(function(taskID) {
			taskInfo.task_id = taskID;
			rdo.modifyTask(taskID, taskInfo, fn);
		});
	};




})(exports = module.exports || void 0);