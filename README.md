Data structrue in this project
-------------------------------------------
{
'schedule_name' : 'scheduleName',
'schedule_id' : 1,
'schedule_rule' : '* * * * * ',
'schedule_params' : 'php test.php',
'schedule_timeout' : 60
}

Dependencies
-------------------------------------------
Redis lib, run code to install :
npm install redis


Configrations
-------------------------------------------

1. change your enviroment by edit env.js 
2. find configuration file undef config and edit redis host & post
3. run: node ./benches/addJob.js  to adding a new job
	
Start!
-------------------------------------------
run code:
node index.js
