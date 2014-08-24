Data structure in this project
-------------------------------------------
+ schedule job<br/>
{<br/>
	'schedule_name' : 'scheduleName',<br/>
	'schedule_id' : 1,<br/>
	'schedule_rule' : '* * * * * ',<br/>
	'schedule_params' : 'php test.php',<br/>
	'schedule_timeout' : 60<br/>
}
+ task<br/>
 {<br/>
	'task_name': 'scheduleName',<br/>
	'schedule_id': '5',<br/>
	'task_start': '1399950000',<br/>
	'task_status': '1',<br/>
	'task_created': '1399950000',<br/>
	'task_id': '77',<br/>
	'task_end': '1399950000',<br/>
	'task_exit_code': '1'<br/>
}



Dependencies
-------------------------------------------
Redis lib, run code to install :<br/>

npm install redis


Configurations
-------------------------------------------

1. change your enviroment by edit env.js 
2. find configuration file undef config and edit redis host & post
3. run: node ./benches/addJob.js  to adding a new job
	
Start!
-------------------------------------------
run code:
<br/>
node index.js

About author
-------------------------------------------
Roban lee (robanlee at gmail dot com) <br/>
HTTP://WWW.RobanLee.COM
