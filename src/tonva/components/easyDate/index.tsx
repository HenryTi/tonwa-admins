import * as React from 'react';
import { setRes } from '../../components';

export interface EasyDateProps {
    date: Date | number;
}

//type YMD = (year:number, month:number, date:number) => string;
//type MD = (month:number, date:number) => string;

const timeRes:{[prop:string]:any} = {
	md: (month:number, date:number) => `${month}-${date}`,
	ymd: (year:number, month:number, date:number) => `${year}-${month}-${date}`,
	yesterday: 'Yday',
	today: 'Today',
	tomorrow: 'Tmw',
	$zh: {
		md: (month:number, date:number) => `${month}月${date}日`,
		ymd: (year:number, month:number, date:number) => `${year}年${month}月${date}日`,
		yesterday: '昨天',
		today: '今天',
		tomorrow: '明天',
	},
	$en: {
		md: (month:number, date:number) => `${month}-${date}`,
		ymd: (year:number, month:number, date:number) => `${year}-${month}-${date}`,
		yesterday: 'Yday',
		today: 'Today',
		tomorrow: 'Tmw',
	}
}

setRes(timeRes, timeRes);

function tt(str:string):any {
	return timeRes[str];
}

function renderDate(vDate:Date|number, withTime:boolean, always:boolean = false) {
    if (!vDate) return null;
    let date: Date;
    switch (typeof vDate) {
        default: date = vDate as Date; break;
        case 'string': date = new Date(vDate); break;
        case 'number': date = new Date((vDate as number)*1000); break;
    }

    let now = new Date();
    let tick:number, nDate:number, _date:number, month:number, year:number, nowYear:number;
    let d = date;
    tick = now.getTime() - d.getTime();
    let hour=d.getHours(), minute=d.getMinutes();
    nDate=now.getDate();
    _date=d.getDate();
    month=d.getMonth()+1;
    year=d.getFullYear();
	nowYear = now.getFullYear();

	let appendTime:boolean = false;
	let dPart:string = (function() {
		if (tick < -24*3600*1000) {
			if (year === nowYear) {
				appendTime = true;
				return tt('md')(month, _date);
			}
			else {
				appendTime = true;
				return tt('ymd')(year, month, _date);
			}
		}
		if (tick < 24*3600*1000) {
			if (_date!==nDate) {
				appendTime = true;
				return tt(tick < 0? 'tomorrow' : 'yesterday');
			}
			if (withTime===true) {
				appendTime = true;
				return '';
			}
			return tt('today');
		}
		if (year === nowYear) {
			return tt('md')(month, _date);
		}
		return tt('ymd')(year, month, _date);
	})();

	let hm = hour + ((minute<10?':0':':') + minute);

	/*
    if (tick < -24*3600*1000) {
        if (year === nowYear)
            return tt('md')(month, _date) + ' ' + hm;
        else
            return tt('ymd')(year, month, _date) + ' ' + hm;
    }
    if (always === true || tick < 24*3600*1000) {
        return _date!==nDate? 
            tt(tick < 0? 'tomorrow' : 'yesterday') + ' ' + hm 
            : withTime===true? hm : tt('today');
    }
    if (year === nowYear) {
        return tt('md')(month, _date);
    }
	return tt('ymd')(year, month, _date);
	*/
	if (appendTime === true || always === true) {
		return dPart + ' ' + hm;
	}
	return dPart;
}


export class EasyDate extends React.Component<EasyDateProps> {
    render() {
        return renderDate(this.props.date, false);
    }
}

interface EasyTimeProps extends EasyDateProps {
	always?: boolean;
}
export class EasyTime extends React.Component<EasyTimeProps> {
    render() {
		let {date, always} = this.props;
        return renderDate(date, true, always);
    }
}
