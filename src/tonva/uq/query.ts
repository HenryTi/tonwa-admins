import _ from 'lodash';
import {observable, IObservableArray} from 'mobx';
import { PageItems } from '../tool';
import {Field, ArrFields} from './uqMan';
import {Entity} from './entity';
import { QueryQueryCaller, QueryPageCaller } from './caller';

export type QueryPageApi = (name:string, pageStart:any, pageSize:number, params:any) => Promise<string>;

export class QueryPager<T extends any> extends PageItems<T> {
	private query: Query;
	private $page: any;
	protected idFieldName: any;
    constructor(query: Query, pageSize?: number, firstSize?: number, itemObservable?:boolean) {
        super(itemObservable);
        this.query = query;
        if (pageSize !== undefined) this.pageSize = pageSize;
		if (firstSize !== undefined) this.firstSize = firstSize;
	}

	setReverse() {
		this.appendPosition = 'head';
	}

    protected async onLoad() {
		if (this.$page) return;
        let {schema} = this.query;
        if (schema === undefined) {
			await this.query.loadSchema();
			schema = this.query.schema;
		}
		if (schema === undefined) return;
		let $page = this.$page = (schema.returns as any[]).find(v => v.name === '$page');
		if ($page === undefined) return;
		this.sortOrder = $page.order;
		let fields = $page.fields;
		if (fields !== undefined) {
			let field = fields[0];
			if (field) this.idFieldName = field.name;
		}
    }

    protected async loadResults(param:any, pageStart:number, pageSize:number):Promise<{[name:string]:any[]}> {
		let ret = await this.query.page(param, pageStart, pageSize);
		return ret;
	}
	protected getPageId(item:T) {
		if (item === undefined) return;
		if (typeof item === 'number') return item;
		let start = (item as any)[this.idFieldName];
		if (start === null) return;
		if (start === undefined) return;
		if (typeof start === 'object') {
			let id = start.id;
			if (id !== undefined) return id;
		}
		return start;
	}
	async refreshItems(item:T) {
		let index = this._items.indexOf(item);
		if (index < 0) return;
		let startIndex:number;
		if (this.appendPosition === 'tail') {
			startIndex = index - 1;
		}
		else {
			startIndex = index + 1;
		}
		let pageStart = this.getPageId(this._items[startIndex]);
		let pageSize = 1;
        let ret = await this.load(
			this.param, 
			pageStart,
			pageSize);
		let len = ret.length;
		if (len === 0) {
			this._items.splice(index, 1);
			return;
		}
		for (let i=0; i<len; i++) {
			let newItem = ret[i];
			if (!newItem) continue;
			let newId = newItem[this.idFieldName];
			if (newId === undefined || newId === null) continue;
			if (typeof newId === 'object') newId = newId.id;
			let oldItem = this._items.find(v => {
				let oldId = (v as any)[this.idFieldName];
				if (oldId === undefined || oldId === null) return false;
				if (typeof oldId === 'object') oldId = oldId.id;
				return oldId = newId;
			});
			if (oldItem) {
				_.merge(oldItem, newItem);
			}
		}
	}
}

export class UqQuery<P, R> extends Entity {
    get typeName(): string { return 'query';}
    private pageStart: any;
    private pageSize:number;
    private params:any;
    private more: boolean;
    private startField: Field;
    @observable list:IObservableArray; // = observable.array([], {deep: false});
    returns: ArrFields[];
    isPaged: boolean;

    setSchema(schema:any) {
        super.setSchema(schema);
        let {returns} = schema;
        //this.returns = returns;
        this.isPaged = returns && (returns as any[]).find(v => v.name === '$page') !== undefined;
    }

    resetPage(size:number, params:any) {
        this.pageStart = undefined;
        this.pageSize = size;
        this.params = params;
        this.more = false;
        this.list = undefined;
    }
    get hasMore() {return this.more;}
    async loadPage():Promise<void> {
        if (this.pageSize === undefined) {
            throw new Error('call resetPage(size:number, params:any) first');
        }
        let pageStart:any;
        if (this.pageStart !== undefined) {
            switch (this.startField.type) {
                default: pageStart = this.pageStart; break;
                case 'date':
                case 'time':
                case 'datetime': pageStart = (this.pageStart as Date).getTime(); break;
            }
        }
		let ret = await this.page(this.params, pageStart, this.pageSize+1);
		let page = (ret as any).$page;
        /*
        await this.loadSchema();
        let res = await this.tvApi.page(this.name, pageStart, this.pageSize+1, this.params);
        let data = await this.unpackReturns(res);
        let page = data['$page'] as any[];
        */
        this.list = observable.array([], {deep: false});
        if (page !== undefined) {
            if (page.length > this.pageSize) {
                this.more = true;
                page.pop();
                let ret = this.returns.find(r => r.name === '$page');
                this.startField = ret.fields[0];
                this.pageStart = page[page.length-1][this.startField.name];
            }
            else {
                this.more = false;
            }
            this.list.push(...page);
        }
        //this.loaded = true;
    }

    protected pageCaller(params: any, showWaiting: boolean = true): QueryPageCaller {
        return new QueryPageCaller(this, params, showWaiting);
    }

    async page(params:P, pageStart:any, pageSize:number, showWaiting: boolean = true):Promise<R> {
        let p = {pageStart, pageSize, params};
        let res = await this.pageCaller(p, showWaiting).request();
        return res;
    }
    protected queryCaller(params: P, showWaiting: boolean = true): QueryQueryCaller {
        return new QueryQueryCaller(this, params, showWaiting);
    }
    async query(params:P, showWaiting:boolean = true):Promise<R> {
        let res = await this.queryCaller(params, showWaiting).request();
        return res;
    }
    async table(params:P, showWaiting:boolean = true): Promise<any[]> {
        let ret = await this.query(params, showWaiting);
        for (let i in ret) {
            return (ret as any)[i];
        }
    }
    async obj(params:P, showWaiting:boolean = true):Promise<any> {
        let ret = await this.table(params, showWaiting);
        if (ret.length > 0) return ret[0];
    }
    async scalar(params:P, showWaiting:boolean = true):Promise<any> {
        let ret = await this.obj(params, showWaiting);
        for (let i in ret) return ret[i];
    }
}

export class Query extends UqQuery<any, any> {
}
