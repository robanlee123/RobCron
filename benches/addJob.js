var redisObject = require(__dirname + '/../lib/lib.redis').redisObject;
var rdo = new redisObject();

rdo.addSchedule({
	'schedule_name': 'scheduleName',
	'schedule_rule': '* * * * * ',
	'schedule_params': 'php ./benches/test.php',
	'schedule_timeout': 100
}, function(response) {
	console.log(response);
});