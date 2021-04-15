import { Entity } from './entity';
import { PageItems } from '../tool/pageItems';
import { EntityCaller } from './caller';
import { ArrFields, Field } from './uqMan';

export interface SheetState {
    name: string;
    actions: SheetAction[];
}

export interface SheetAction {
    name: string;
}

export interface StateCount {
    state: string;
    count: number;
}

export interface SheetSaveReturnV<V> {
	id: number;
	flow: number;
	state: string;
	verify: V[];
}

export interface SheetSaveReturn extends SheetSaveReturnV<any> {
}

interface GetSheetReturn<M> {
	brief: any;
	data: M;
	flows: any[];
}

export class UqSheet<M, V> extends Entity {
    get typeName(): string { return 'sheet';}
	states: SheetState[];
	verify: {returns: ArrFields[]};

    /*
    setStates(states: SheetState[]) {
        for (let state of states) {
            this.setStateAccess(this.states.find(s=>s.name==state.name), state);
        }
    }*/
    setSchema(schema:any) {
        super.setSchema(schema);
		this.states = schema.states;
		this.verify = schema.verify;
    }
    build(obj:any) {
        this.states = [];
        for (let op of obj.ops) {
            this.states.push({name: op, actions:undefined});
        }
        /*
        for (let p in obj) {
            switch(p) {
                case '#':
                case '$': continue;
                default: this.states.push(this.createSheetState(p, obj[p])); break;
            }
        }*/
    }
    private createSheetState(name:string, obj:object):SheetState {
        let ret:SheetState = {name:name, actions:[]};
        let actions = ret.actions;
        for (let p in obj) {
            let action:SheetAction = {name: p};
            actions.push(action);
        }
        return ret;
    }
    async save(discription:string, data:M):Promise<SheetSaveReturn> {
        let {id} = this.uq;
        let params = {app: id, discription: discription, data:data};
        return await new SaveCaller(this, params).request();
    }
    async saveDebugDirect(discription:string, data:M):Promise<SheetSaveReturn> {
        let {id} = this.uq;
        let params = {app: id, discription: discription, data:data};
        return await new SaveDirectCaller(this, params).request();
    }
    async action(id:number, flow:number, state:string, action:string) {
        return await new ActionCaller(this, {id:id, flow:flow, state:state, action:action}).request();
    }
    async actionDebugDirect(id:number, flow:number, state:string, action:string) {
        return await new ActionDirectCaller(this, {id:id, flow:flow, state:state, action:action}).request();
    }
    private unpack(data:any):GetSheetReturn<M> {
        //if (this.schema === undefined) await this.loadSchema();
        let ret = data[0];
        let brief = ret[0];
        let sheetData = this.unpackSheet(brief.data);
        let flows = data[1];
        return {
            brief: brief,
            data: sheetData,
            flows: flows,
        }
    }
    async getSheet(id:number):Promise<GetSheetReturn<M>> {
        /*
        await this.loadSchema();
        let ret = await this.uqApi.getSheet(this.name, id);
        */
        let ret = await new GetSheetCaller(this, id).request();
        if (ret[0].length === 0) return await this.getArchive(id);
        return this.unpack(ret);
    }
    async getArchive(id:number):Promise<GetSheetReturn<M>> {
        /*
        await this.loadSchema();
        let ret = await this.uqApi.sheetArchive(this.name, id)
        return this.unpack(ret);
        */
        let ret = await new SheetArchiveCaller(this, id).request();
        return this.unpack(ret);
    }

    async getArchives(pageStart:number, pageSize:number) {
        /*
        await this.loadSchema();
        let ret = await this.uqApi.sheetArchives(this.name, {pageStart:pageStart, pageSize:pageSize});
        return ret;
        */
        let params = {pageStart:pageStart, pageSize:pageSize};
        return await new SheetArchivesCaller(this, params).request();
    }

    async getStateSheets(state:string, pageStart:number, pageSize:number):Promise<any[]> {
        /*
        await this.loadSchema();
        let ret = await this.uqApi.stateSheets(this.name, {state:state, pageStart:pageStart, pageSize:pageSize});
        return ret;
        */
        let params = {state:state, pageStart:pageStart, pageSize:pageSize};
        return await new StateSheetsCaller(this, params).request();
    }
    createPageStateItems<T>(): PageStateItems<T> {return new PageStateItems<T>(this);}

    async stateSheetCount():Promise<StateCount[]> {
        /*
        await this.loadSchema();
        let ret:StateCount[] = await this.uqApi.stateSheetCount(this.name);
        return this.states.map(s => {
            let n = s.name, count = 0;
            let r = ret.find(v => v.state === n);
            if (r !== undefined) count = r.count;
            return {state: n, count: count} 
        });
        */
        return await new StateSheetCountCaller(this, undefined).request();
    }

    async userSheets(state:string, user:number, pageStart:number, pageSize:number):Promise<any[]> {
        let params = {state:state, user:user, pageStart:pageStart, pageSize:pageSize};
        return await new UserSheetsCaller(this, params).request();
    }

    async mySheets(state:string, pageStart:number, pageSize:number):Promise<any[]> {
        /*
        await this.loadSchema();
        let ret = await this.uqApi.mySheets(this.name, {state:state, pageStart:pageStart, pageSize:pageSize});
        return ret;
        */
        let params = {state:state, pageStart:pageStart, pageSize:pageSize};
        return await new MySheetsCaller(this, params).request();
    }
}

export class Sheet extends UqSheet<any, any> {
}

abstract class SheetCaller<T> extends EntityCaller<T> {
    protected get entity(): Sheet {return this._entity as Sheet;}
    protected readonly suffix:string;
    get path():string {return `sheet/${this.entity.name}/${this.suffix}`;}
}

class SaveCaller extends SheetCaller<{app:number; discription:string; data:any}> {
    get path():string {return `sheet/${this.entity.name}`;}
    buildParams() {
        let {app, discription, data} = this.params;
        return {
            app: app,
            discription: discription,
            data: this.entity.pack(data)
        };
    }
    xresult(res:any):any {
		let {verify} = this.entity;
		if (verify === undefined) return res;
		let resVerify = res.verify;
		if (resVerify === undefined || resVerify.length === 0) {
			res.verify = undefined;
			return res;
		}
		let {returns} = verify;
		res.verify = this.entity.unpackReturns(resVerify, returns);
        return res;
    }
}

class SaveDirectCaller extends SaveCaller {
    get path():string {return `sheet/${this.entity.name}/direct`;}
}

class ActionCaller extends SheetCaller<{id:number, flow:number, state:string, action:string}> {
    method = 'PUT';
    get path():string {return `sheet/${this.entity.name}`;}
}

class ActionDirectCaller extends ActionCaller {
    get path():string {return `sheet/${this.entity.name}/direct`;}
}

class GetSheetCaller extends SheetCaller<number> {
    //protected readonly params: number;  // id
    method = 'GET';
    //private id:number;
    //protected readonly suffix = 'archive';
    buildParams() {}
    get path():string {return `sheet/${this.entity.name}/get/${this.params}`;}
}

class SheetArchiveCaller extends SheetCaller<number> {
    //protected readonly params: number;  // id
    method = 'GET';
    //protected readonly suffix = 'archive';
    buildParams() {}
    get path():string {return `sheet/${this.entity.name}/archive/${this.params}`;}
}

class SheetArchivesCaller extends SheetCaller<{pageStart:number, pageSize:number}> {
    protected readonly suffix = 'archives';
}

class StateSheetsCaller extends SheetCaller<{state:string, pageStart:number, pageSize:number}> {
    protected readonly suffix = 'states';
}

class StateSheetCountCaller extends SheetCaller<undefined> {
    method = 'GET';
    protected readonly suffix = 'statecount';
    xresult(res:any):any {
        let {states} = this.entity;
        return states.map(s => {
            let n = s.name, count = 0;
            let r = (res as any[]).find(v => v.state === n);
            if (r !== undefined) count = r.count;
            return {state: n, count: count} 
        });
    }
}

class UserSheetsCaller extends SheetCaller<{state:string, user:number, pageStart:number, pageSize:number}> {
    protected readonly suffix = 'user-sheets';
    xresult(res:any):any {
        return res;
    }
}

class MySheetsCaller extends SheetCaller<{state:string, pageStart:number, pageSize:number}> {
    protected readonly suffix = 'my-sheets';
    xresult(res:any):any {
        return res;
    }
}

export class PageStateItems<T> extends PageItems<T> {
    private sheet: Sheet;
    constructor(sheet: Sheet) {
        super(true);
        this.sheet = sheet;
        this.pageSize = 10;
	}
	protected async loadResults(param:any, pageStart:any, pageSize:number):Promise<{[name:string]:any[]}> {
		let ret = await this.sheet.getStateSheets(param, pageStart, pageSize);
		return {$page: ret};
	}
	/*
    protected async load(param:any, pageStart:any, pageSize:number):Promise<any[]> {
        let ret = await this.sheet.getStateSheets(param, pageStart, pageSize);
        return ret;
	}
	*/
	protected getPageId(item:T) {
		return item === undefined? 0 : (item as any).id;
	}
	/*
    protected setPageStart(item:any) {
        this.pageStart = item === undefined? 0 : item.id;
	}
	*/
}
