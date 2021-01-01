import { LocalMap, LocalCache, env } from '../tool';
import { UqData, UqAppData, loadAppUqs } from '../net';
import { UqMan } from './uqMan';
import { TuidImport, TuidInner } from './tuid';
import { nav } from '../components';

export interface TVs {
    [uqName:string]: {
        [tuidName: string]: (values: any) => JSX.Element;
    }
}

export class UQsMan {
	static _uqs: any;
	static value: UQsMan;
	static errors: string[];

	static async load(tonvaAppName:string, version:string, tvs:TVs) {
		let uqsMan = UQsMan.value = new UQsMan(tonvaAppName, tvs);
        let {appOwner, appName} = uqsMan;
        let {localData} = uqsMan;
        let uqAppData:UqAppData = localData.get();
        if (!uqAppData || uqAppData.version !== version) {
			uqAppData = await loadAppUqs(appOwner, appName);
			if (!uqAppData.id) {
				return [
					`${appOwner}/${appName}不存在。请仔细检查app全名。`
				];
			}
            uqAppData.version = version;
            localData.set(uqAppData);
            // 
            for (let uq of uqAppData.uqs) uq.newVersion = true;
        }
        let {id, uqs} = uqAppData;
        uqsMan.id = id;
        await uqsMan.init(uqs);
        let retErrors = await uqsMan.load();
        if (retErrors.length === 0) {
            retErrors.push(...uqsMan.setTuidImportsLocal());
            if (retErrors.length === 0) {
                UQsMan._uqs = uqsMan.buildUQs();
                return;
            }
        }
        UQsMan.errors = retErrors;
	}

    private collection: {[uqName: string]: UqMan};
    private readonly tvs: TVs;

    readonly appOwner: string;
    readonly appName: string;
    readonly localMap: LocalMap;
    readonly localData: LocalCache;
    id: number;

    private constructor(tonvaAppName:string, tvs:TVs) {
        this.tvs = tvs || {};
        this.buildTVs();
        this.collection = {};
        let parts = tonvaAppName.split('/');
        if (parts.length !== 2) {
            throw new Error('tonvaApp name must be / separated, owner/app');
        }
        this.appOwner = parts[0];
        this.appName = parts[1];
        this.localMap = env.localDb.map(tonvaAppName);
        this.localData = this.localMap.child('uqData');
    }

    // to be removed in the future
    addUq(uq: UqMan) {
        this.collection[uq.name] = uq;
    }

    private buildTVs() {
        for (let i in this.tvs) {
            let uqTVs = this.tvs[i];
            if (uqTVs === undefined) continue;
            let l = i.toLowerCase();
            if (l === i) continue;
            this.tvs[l] = uqTVs;
            for (let j in uqTVs) {
                let en = uqTVs[j];
                if (en === undefined) continue;
                let lj = j.toLowerCase();
                if (lj === j) continue;
                uqTVs[lj] = en;
            }
        }
    }

    async init(uqsData:UqData[]):Promise<void> {
        let promiseInits: PromiseLike<void>[] = uqsData.map(uqData => {
			let {uqOwner, uqName} = uqData;
			let uqFullName = uqOwner + '/' + uqName;
			//let uqUI = this.ui.uqs[uqFullName] as UqUI || {};
			//let cUq = this.newCUq(uqData, uqUI);
			//this.cUqCollection[uqFullName] = cUq;
			//this.uqs.addUq(cUq.uq);
			let uq = new UqMan(this, uqData, undefined, this.tvs[uqFullName] || this.tvs[uqName]);
			this.collection[uqFullName] = uq;
			let lower = uqFullName.toLowerCase();
			if (lower !== uqFullName) {
				this.collection[lower] = uq;
			}
			return uq.init();
		});
        await Promise.all(promiseInits);
    }

    async load(): Promise<string[]> {
        let retErrors:string[] = [];
        let promises: PromiseLike<string>[] = [];
        for (let i in this.collection) {
            let uq = this.collection[i];
            promises.push(uq.loadEntities());
		}
        let results = await Promise.all(promises);
        for (let result of results)
        {
            let retError = result; // await cUq.loadSchema();
            if (retError !== undefined) {
                retErrors.push(retError);
                continue;
            }
		}
        return retErrors;
    }

    buildUQs(): any {
        let that = this;
        let uqs:any = {};
        for (let i in this.collection) {
            let uqMan = this.collection[i];
            //let n = uqMan.name;
            let uqName = uqMan.uqName;
            let l = uqName.toLowerCase();
			let uqKey:string = uqName.split(/[-._]/).join('').toLowerCase();
            let entities = uqMan.entities;
            let keys = Object.keys(entities);
            for (let key of keys) {
                let entity = entities[key];
				let {name} = entity;
				entities[name.toLowerCase()] = entity;
            }
            let proxy = uqs[l] = new Proxy(entities, {
                get: function(target, key, receiver) {
                    let lk = (key as string).toLowerCase();
                    let ret = target[lk];
                    if (ret !== undefined) return ret;
					debugger;
					let err = `entity ${uqName}.${String(key)} not defined`;
                    console.error(err);
                    that.showReload('UQ错误：' + err);
                    return undefined;
                }
			})
			if (uqKey !== l) uqs[uqKey] = proxy;
        }
        //let uqs = this.collection;
        return new Proxy(uqs, {
            get: function (target, key, receiver) {
                let lk = (key as string).toLowerCase();
                let ret = target[lk];
                if (ret !== undefined) return ret;
                /*
                for (let i in uqs) {
                    if (i.toLowerCase() === lk) {
                        return uqs[i];
                    }
                }*/
                debugger;
                console.error('error in uqs');
                that.showReload(`代码错误：新增 uq ${String(key)}`);
                return undefined;
            },
        });
	}
	
	getUqCollection() {
		return this.collection;
	}

    private showReload(msg: string) {
        this.localMap.removeAll();
        nav.showReloadPage(msg);
    }

    setTuidImportsLocal():string[] {
        let ret:string[] = [];
        for (let i in this.collection) {
            let uq = this.collection[i];
            for (let tuid of uq.tuidArr) {
                if (tuid.isImport === true) {
                    let error = this.setInner(tuid as TuidImport);
                    if (error) ret.push(error);
                }
            }
        }
        return ret;
    }

    private setInner(tuidImport: TuidImport):string {
        let {from} = tuidImport;
        let fromName = from.owner + '/' + from.uq;
        let uq = this.collection[fromName];
        if (uq === undefined) {
            //debugger;
            return `setInner(tuidImport: TuidImport): uq ${fromName} is not loaded`;
        }
        let iName = tuidImport.name
        let tuid = uq.tuid(iName);
        if (tuid === undefined) {
            //debugger;
            return `setInner(tuidImport: TuidImport): uq ${fromName} has no Tuid ${iName}`;
        }
        if (tuid.isImport === true) {
            //debugger;
            return `setInner(tuidImport: TuidImport): uq ${fromName} Tuid ${iName} is import`;
        }
        tuidImport.setFrom(tuid as TuidInner);
    }
}
