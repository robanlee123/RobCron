var merge = function(old, newObj) {
	for (var x in newObj) {
		old[x] = newObj[x];
	}
	return old;
};


Date.prototype.format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

 
console.clog = function($msg, $type) {
	var tm = new Date().format('yyyy-MM-dd hh:mm:ss');
	var type = $type || 'info';
	var str = tm + ' [' + type + '][' + process.pid + ']:' + $msg;
	console.log(str);

}

console.cerr = function($msg) {
	console.clog($msg, 'ERR');
}

console.ip = function() {
	var os = require('os');
	var ifaces = os.networkInterfaces();
	var ip = '';
	for (var dev in ifaces) {
		var alias = 0;
		ifaces[dev].forEach(function(details) {
			if (details.family == 'IPv4') {
				ip = details.address;
				++alias;
			}
		});
	}
	return ip;
}

exports.merge = merge;