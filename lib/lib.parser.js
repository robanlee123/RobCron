var monthCount = 12;

var normalDaySpec = [
31,	// January
28,	// February
31,	// March
30,	// April
31,	// May
30, // June
31,	// July
31,	// August
30,	// September
31,	// October
30,	// November
31	// December
];
var leapDaySpec = [
31,	// January
29,	// February
31,	// March
30,	// April
31,	// May
30, // June
31,	// July
31,	// August
30,	// September
31,	// October
30,	// November
31	// December
];

// provide a year-specific day spec
function daySpec(year){
        return ((year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) ? leapDaySpec : normalDaySpec);
}

Date.prototype.addYear = function(){
        this.setFullYear(this.getFullYear() + 1);
};

Date.prototype.addMonth = function(){
        var m = this.getMonth() + 1;
        if (m == monthCount)
        {
                this.setMonth(0);
                this.addYear();
        }
        else
        {
                var spec = daySpec(this.getFullYear());
                if (this.getDate() > spec[m])
                        this.setDate(spec[m]);
                this.setMonth(m);
        }
};

Date.prototype.addDay = function(){
        var spec = daySpec(this.getFullYear());
        var d = this.getDate() + 1;
        if (d > spec[this.getMonth()])
        {
                this.setDate(1)
                this.addMonth();
        }
        else
                this.setTime(this.getTime() + (24 * 60 * 60 * 1000));
};

Date.prototype.addHour = function(){
        var h = this.getHours() + 1;
        if (h == 24)
        {
                this.setHours(0);
                this.addDay();
        }
        else
                this.setTime(this.getTime() + (60 * 60 * 1000));
};

Date.prototype.addMinute = function(){
        var m = this.getMinutes() + 1;
        if (m == 60)
        {
                this.setMinutes(0);
                this.addHour();
        }
        else
                this.setTime(this.getTime() + (60 * 1000));
};

Date.prototype.addSecond = function(){
        var s = this.getSeconds() + 1;
        if (s == 60)
        {
                this.setSeconds(0);
                this.addMinute();
        }
        else
                this.setTime(this.getTime() + 1000);
};


function recurMatch(val, matcher){
        if (matcher == null)
                return true;
	
        if (typeof(matcher) == 'number')
                return (val == matcher);
        else if (typeof(matcher) == 'object' && matcher instanceof Range)
                return matcher.contains(val);
        else if (typeof(matcher) == 'array' || (typeof(matcher) == 'object' && matcher instanceof Array))
        {
                for (var i = 0; i < matcher.length; i++)
                {
                        if (recurMatch(val, matcher[i]))
                                return true;
                }
                return false;
        }
	
        return false;
}


function RecurrenceRule(year, month, date, dayOfWeek, hour, minute, second){
        this.recurs = true;
	
        this.year = (year == null) ? null : year;
        this.month = (month == null) ? null : month;
        this.date = (date == null) ? null : date;
        this.dayOfWeek = (dayOfWeek == null) ? null : dayOfWeek;
        this.hour = (hour == null) ? null : hour;
        this.minute = (minute == null) ? null : minute;
        this.second = (second == null) ? 0 : second;
}

var monthTranslation = {
        'jan': 0, 
        'feb': 1, 
        'mar': 2, 
        'apr': 3, 
        'may': 4, 
        'jun': 5, 
        'jul': 6, 
        'aug': 7, 
        'sep': 8, 
        'oct': 9, 
        'nov': 10, 
        'dec': 11
};
var dayTranslation = {
        'sun': 0, 
        'mon': 1, 
        'tue': 2, 
        'wed': 3, 
        'thu': 4, 
        'fri': 5, 
        'sat': 6
};

RecurrenceRule.valueForCronComponent = function(component, min, max, shiftIdxs){
        component = component.toLowerCase();
	
        min = (min == null) ? -1 : min;
        max = (max == null) ? -1 : max;
        shiftIdxs = (typeof(shiftIdxs) == 'boolean') ? shiftIdxs : false;
	
        if (component == '*' || component == '?')
                return null;
	
        if (component.match(/^([1-9]|[1-3][0-9])w$/))
        {
                // TODO: nearest weekday
                return null;
        }
	
        var result = [];
        var item, stepParts, rangeParts, itemRange;
        var items = component.split(',');
        for (var i = 0; i < items.length; i++)
        {
                item = items[i];
                if (item == '*' || item == '?')
                        return null; // if any component is *, the rule is *
                else if (item.match(/^[0-9]+$/))
                        result.push(parseInt(item, 10) - ((shiftIdxs) ? 1 : 0));
                else if (item == 'l')
                {
                // TODO: last
                }
                else
                {
                        // TODO
                        // 0#2 = second Sunday
			
                        itemRange = new Range();
                        stepParts = item.split('/', 2);
			
                        if (stepParts[0] == '*')
                        {
                                if (min <= -1 || max <= -1)
                                        continue;
				
                                itemRange.start = min;
                                itemRange.end = max;
                        }
                        else
                        {
                                rangeParts = stepParts[0].split('-', 2);
			
                                if (rangeParts[0] in monthTranslation)
                                        itemRange.start = monthTranslation[rangeParts[0]];
                                else if (rangeParts[0] in dayTranslation)
                                        itemRange.start = dayTranslation[rangeParts[0]];
                                else
                                        itemRange.start = parseInt(rangeParts[0], 10) - ((shiftIdxs) ? 1 : 0);
			
                                if (rangeParts.length == 2)
                                {
                                        if (rangeParts[1] in monthTranslation)
                                                itemRange.end = monthTranslation[rangeParts[1]];
                                        else if (rangeParts[1] in dayTranslation)
                                                itemRange.end = dayTranslation[rangeParts[1]];
                                        else
                                                itemRange.end = parseInt(rangeParts[1], 10) - ((shiftIdxs) ? 1 : 0);
                                }
                        }
			
                        itemRange.step = (stepParts.length == 2) ? parseInt(stepParts[1], 10) : 1;
                        result.push(itemRange);
                }
        }
	
        if (result.length == 0)
                return null;
        else if (result.length == 1)
                return result[0];
	
        return result;
};

RecurrenceRule.fromCronString = function(cronStr){
        cronStr = cronStr.toLowerCase().replace(/^\s*|\s*$/g, '');
	
        /* special commands */
        if (cronStr == '@yearly' || cronStr == '@annually')
                return new RecurrenceRule(null, 0, 1, null, 0, 0, 0);
        else if (cronStr == '@monthly')
                return new RecurrenceRule(null, null, 1, null, 0, 0, 0);
        else if (cronStr == '@weekly')
                return new RecurrenceRule(null, null, null, 0, 0, 0, 0);
        else if (cronStr == '@daily')
                return new RecurrenceRule(null, null, null, null, 0, 0, 0);
        else if (cronStr == '@hourly')
                return new RecurrenceRule(null, null, null, null, null, 0, 0);
        else
        {
                // parse it out
                var parts = cronStr.split(/\s+/);
                if (parts.length < 5 || parts.length > 6)
                        return null;
		
                var rule = new RecurrenceRule();
                // minute
                rule.minute = RecurrenceRule.valueForCronComponent(parts[0], 0, 59);
		
                // hour
                rule.hour = RecurrenceRule.valueForCronComponent(parts[1], 0, 23);
		
                // date
                rule.date = RecurrenceRule.valueForCronComponent(parts[2], 1, 31);
		
                // month
                rule.month = RecurrenceRule.valueForCronComponent(parts[3], 0, 11, true);
		
                // day of week
                rule.dayOfWeek = RecurrenceRule.valueForCronComponent(parts[4], 0, 6);
		
                // year
                if (parts.length == 6)
                        rule.year = RecurrenceRule.valueForCronComponent(parts[5]);
		
                rule.second = 0;
		
                if (rule.validate())
                        return rule;
        }
	
        return null;
};

RecurrenceRule.prototype.validate = function(){
        // TODO: validation
        return true;
};

RecurrenceRule.prototype.nextInvocationDate = function(base){
        base = (base instanceof Date) ? base : (new Date());
	
        if (!this.recurs)
                return null;
	
        var now = new Date();
        if (this.year !== null && (typeof(this.year) == 'number') && this.year < now.getFullYear())
                return null;
	
        var next = new Date(base.getTime());
        next.addSecond();
	
        while (true)
        {
                if (this.year != null && !recurMatch(next.getYear(), this.year))
                {
                        next.addYear();
                        next.setMonth(0);
                        next.setDate(1);
                        next.setHours(0);
                        next.setMinutes(0);
                        next.setSeconds(0);
                        continue;
                }
                if (this.month != null && !recurMatch(next.getMonth(), this.month))
                {
                        next.addMonth();
                        next.setDate(1);
                        next.setHours(0);
                        next.setMinutes(0);
                        next.setSeconds(0);
                        continue;
                }
                if (this.date != null && !recurMatch(next.getDate(), this.date))
                {
                        next.addDay();
                        next.setHours(0);
                        next.setMinutes(0);
                        next.setSeconds(0);
                        continue;
                }
                if (this.dayOfWeek != null && !recurMatch(next.getDay(), this.dayOfWeek))
                {
                        next.addDay();
                        next.setHours(0);
                        next.setMinutes(0);
                        next.setSeconds(0);
                        continue;
                }
                if (this.hour != null && !recurMatch(next.getHours(), this.hour))
                {
                        next.addHour();
                        next.setMinutes(0);
                        next.setSeconds(0);
                        continue;
                }
                if (this.minute != null && !recurMatch(next.getMinutes(), this.minute))
                {
                        next.addMinute();
                        next.setSeconds(0);
                        continue;
                }
                if (this.second != null && !recurMatch(next.getSeconds(), this.second))
                {
                        next.addSecond();
                        continue;
                }
		
                break;
        }
	
        return next;
};

function Range(start, end, step){
        this.start = start || 0;
        this.end = end || 60;
        this.step = step || 1;
}

Range.prototype.contains = function(val){
        if (this.step === null || this.step === 1)
                return (val >= this.start && val <= this.end);
        else
        {
                for (var i = this.start; i < this.end; i += this.step)
                {
                        if (i == val)
                                return true;
                }
		
                return false;
        }
};
 
 
exports.fromCronString = RecurrenceRule.fromCronString;
