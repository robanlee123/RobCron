exports = module.exports = config = {
	redisEnv: {
		host: '127.0.0.1',
		port: 6379
	},
	scheduleKeys: {
		maxID: 'rob:schedule:maxID',
		ids: 'rob:schedule:ids',
		scheduleInfo: 'rob:schedule:%s',
		tmTask:'rob:schedule:runat:%s',
		taskID: 'rob:schedule:task:maxID',
		taskInfo:'rob:schedule:task:info:%s'
	}

}
;