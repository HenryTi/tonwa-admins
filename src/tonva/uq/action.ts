import { Entity } from './entity';
import { ActionCaller } from './caller';

export class UqAction<P, R> extends Entity {
    get typeName(): string { return 'action';}
    async submit(data:P, waiting: boolean = true) {
		let caller = new ActionSubmitCaller(this, data)
		let ret = await caller.request();
		return ret;
    }
    async submitReturns(data:P):Promise<R> {
       return await new SubmitReturnsCaller(this, data).request();
    }
    async submitConvert(data:P) {
        return await new SubmitConvertCaller(this, data).request();
    }
}

export class Action extends UqAction<any, any> {
}

export class ActionSubmitCaller extends ActionCaller {
    get path():string {return 'action/' + this.entity.name;}
    buildParams():any {
		return {data: this.entity.pack(this.params)}
	}
}

class SubmitReturnsCaller extends ActionSubmitCaller {
    get path():string {return 'action/' + this.entity.name + '/returns';}
    xresult(res:any):any {
        let {returns} = this.entity;
        let len = returns.length;
        let ret:{[r:string]:any[]} = {};
        for (let i=0; i<len; i++) {
            let retSchema = returns[i];
            ret[retSchema.name] = res[i];
        }
        return ret;
    }
}

class SubmitConvertCaller extends ActionSubmitCaller {
    get path():string {return 'action-convert/' + this.entity.name;}
    buildParams():any {
        return {
            data: this.params
        };
    }
}
