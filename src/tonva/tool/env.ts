import { LocalMap } from './localDb';

// 如果路径上有独立的test单词，则是test环境
function isTesting():boolean {
	let ret = /(\btest\b)/i.test(document.location.href);
	return ret;
}

export const env = (function () {
    let testing = isTesting();
    let localDb = new LocalMap(testing===true? '$$':'$');
    return {
        testing: testing,
        isDevelopment: process.env.NODE_ENV === 'development',
        localDb: localDb,
        setTimeout: (tag:string, callback: (...args: any[]) => void, ms: number, ...args: any[]):NodeJS.Timer => {
            //if (tag !== undefined) console.log('setTimeout ' + tag);
            return global.setTimeout(callback, ms, ...args);
        },
        clearTimeout: (handle:NodeJS.Timer):void => {
            global.clearTimeout(handle);
        },
        setInterval: (callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timer => {
            return global.setInterval(callback, ms, ...args);
        },
        clearInterval: (handle:NodeJS.Timer):void => {
            global.clearInterval(handle);
        }
    }
}());
