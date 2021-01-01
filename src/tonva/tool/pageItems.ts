import _ from 'lodash';
import {observable, IObservableArray, computed} from 'mobx';

export abstract class PageItems<T> {
    constructor(itemObservable:boolean = false) {
		if (itemObservable === undefined) itemObservable = false;
        this._items = observable.array<T>([], {deep:itemObservable});
    }
	private isFirst: boolean = true;
	private pageItemAction: (item:T, results:{[name:string]:any[]}) => void;
	private itemConverter: (item:any, queryResults:{[name:string]:any[]}) => T;
    @observable loading: boolean = false;
    @observable private beforeLoad: boolean = true;
    @observable protected loaded: boolean = false;
    protected _items:IObservableArray<T>;
    @observable allLoaded: boolean = false;
    @computed get items():IObservableArray<T> {
        if (this.beforeLoad === true) return null;
        if (this.loaded === false) return undefined;
        return this._items;
	}
	
	setEachPageItem(pageItemAction: (item:T, results:{[name:string]:any[]}) => void) {
		this.pageItemAction = pageItemAction;
	}

	setItemConverter(itemConverter: (item:any, queryResults:{[name:string]:any[]}) => T) {
		this.itemConverter = itemConverter;
	}

    @observable topDiv:string = '$$top';
    @observable bottomDiv:string = '$$bottom';
    scrollToTop = () => {
		this.scrollIntoView(this.topDiv);
		//let id = '$$top'+uid();
		//this.topDiv = id;
		/*
		setTimeout(() => {
			let div = document.getElementById(this.topDiv);
			div?.scrollIntoView();
		}, 20);
		*/
    }
    scrollToBottom = () => {
		this.scrollIntoView(this.bottomDiv);
		//let id = '$$bottom'+uid();
		//this.bottomDiv = id;
		/*
		setTimeout(() => {
			let div = document.getElementById(this.bottomDiv);
			div?.scrollIntoView();
		}, 20);
		*/
	}
	private scrollIntoView(divId:string) {
		setTimeout(() => {
			let div = document.getElementById(divId);
			div?.scrollIntoView();
		}, 20);
	}

    protected param: any;
    protected firstSize = 100;
    protected pageStart:any = undefined;
    protected pageSize = 30;
    protected appendPosition:'head'|'tail' = 'tail';

	protected sortOrder:'asc'|'desc';
	protected abstract loadResults(param:any, pageStart:any, pageSize:number):Promise<{[name:string]:any[]}>;
	protected getPageId(item:T):any {return;}
	protected setPageStart(item:T) {
		this.pageStart = this.getPageId(item);
	}
	
	protected async load(param:any, pageStart:any, pageSize:number):Promise<any[]> {
		let results = await this.loadResults(param, pageStart, pageSize);
		let pageList = results.$page;
		if (this.itemConverter) {
			let ret:T[] = [];
			let len = pageList.length;
			for (let i=0; i<len; i++) {
				let item = this.itemConverter(pageList[i], results);
				ret.push(item);
			}
			return ret;
		}
		if (this.pageItemAction !== undefined) {
			let len = pageList.length;
			for (let i=0; i<len; i++) {
				this.pageItemAction(pageList[i], results);
			}
		}
		return pageList;
	}

    reset() {
        this.isFirst = true;
        this.beforeLoad = true;
        this.loaded = false;
        this.param = undefined;
		this.allLoaded = false;
		this.pageStart = undefined;
        this._items.clear();
        //this.setPageStart(undefined);
    }

    append(item:T) {
        if (this.appendPosition === 'tail')
            this._items.unshift(item);
        else
            this._items.push(item);
    }

    async first(param:any):Promise<void> {
        this.reset();
        this.beforeLoad = false;
        this.param = param;
        await this.more();
	}

	private changing = false;
	async attach(): Promise<void> {
		if (this.sortOrder === undefined) {
			console.error('没有定义增减序，无法attach');
			return;
		}
		if (this.changing === true) return;
		this.changing = true;
		let items = this._items;
		let isAsc = this.sortOrder === 'asc';
		//let isTail:boolean, 
		let endItem:T;
		let scrollToEnd:() => void;
		let pushItem:(item:T) => void;
		if (this.appendPosition === 'tail') {
			//isTail = true;
			endItem = items[0];
			scrollToEnd = this.scrollToTop;
			pushItem = (item:T) => items.unshift(item);

		}
		else {
			//isTail = false;
			let endIndex = items.length;
			endItem = items[endIndex-1];
			scrollToEnd = this.scrollToBottom;
			pushItem = (item:T) => items.splice(endIndex, 0, item);
		}
		let startId = this.getPageId(endItem);
		let pid = undefined;
		let sum = 0, max = 50;
		for (;sum < max;) {
			let ret = await this.load(this.param, pid, 3);
			let len = ret.length;
			if (len === 0) break;

			for (let i=0; i<len; i++) {
				let item = ret[i];
				pid = this.getPageId(item);
				if (isAsc === true) {
					if (pid >= startId) {
						max = 0;
						break;
					}
				}
				else {
					if (pid <= startId) {
						max = 0;
						break;
					}
				}
				pushItem(item);
				/*
				if (isTail === true) {
					this._items.unshift(item);
				}
				else {
					this._items.push(item);
				}
				*/
				++sum;
			}
		}
		this.changing = false;
		if (sum > 0) {
			scrollToEnd();
			/*
			if (isTail === true) this.scrollToTop();
			else this.scrollToBottom();
			*/
		}
	}

	async refresh(): Promise<void> {
		if (this.changing === true) return;
		this.changing = true;
		let ret = await this.load(this.param, undefined, this.firstSize>this.pageSize? this.firstSize:this.pageSize);
		this._items.clear();
		this.setLoaded(ret);
		/*
		for (let i=0; i<len; i++) {
			let item = ret[i];
			let pid = this.getRefreshPageId(item);
			let index = this._items.findIndex(v => this.getRefreshPageId(v) === pid);
			//let index = _.sortedIndexBy(this._items, item, v=>this.getRefreshPageId(v));
			//let oldItem = this._items[index];
			//let oid = this.getRefreshPageId(oldItem);
			if (index >= 0) {
				_.merge(this._items[index], item);
			}
			else {
				this._items.splice(0, 0, item);
			}
		}
		*/
		this.changing = false;
	}

	protected getRefreshPageId(item:T) {
		return this.getPageId(item);
	}

    protected async onLoad(): Promise<void> {}
    protected async onLoaded(): Promise<void> {}

    async more():Promise<boolean> {
        if (this.allLoaded === true) return false;
		if (this.loading === true) return true;
		if (this.changing === true) return true;
		this.loading = true;
		this.changing = true;
        await this.onLoad();
        if (this.pageStart === undefined) this.setPageStart(undefined);
        let pageSize = this.pageSize + 1;
        if (this.isFirst === true) {
            if (this.firstSize > this.pageSize) pageSize = this.firstSize+1;
        }
        let ret = await this.load(
                this.param, 
                this.pageStart,
				pageSize);
        this.loaded = true;
		let len = ret.length;
        if ((this.isFirst===true && len>this.firstSize) ||
            (this.isFirst===false && len>this.pageSize))
        {
            this.allLoaded = false;
            --len;
            ret.splice(len, 1);
        }
        else {
            this.allLoaded = true;
		}
		/*
        if (len === 0) {
			this.setPageStart(undefined);
            this._items.clear();
		}
		else {
			this.setPageStart(ret[len-1]);
			if (this.appendPosition === 'tail') {
				this._items.push(...ret);
			}
			else {
				this._items.unshift(...ret.reverse());
			}
		}
		*/
		this.setLoaded(ret);
		this.isFirst = false;
		this.onLoaded();
		this.changing = false;
		this.loading = false;
		return !this.allLoaded;
	}
	
	private setLoaded(data:any[]) {
		let len = data.length;
        if (len === 0) {
			this.setPageStart(undefined);
            this._items.clear();
		}
		else {
			this.setPageStart(data[len-1]);
			if (this.appendPosition === 'tail') {
				this._items.push(...data);
			}
			else {
				this._items.unshift(...data.reverse());
			}
		}
	}

	findItem(item:any):T {
		let pid = this.getPageId(item);
		let index = _.findIndex(this._items, v => this.getPageId(v) === pid);
		if (index < 0) return;
		return this._items[index];
		//let oldItem = this._items[index];
		//let oid = this.getPageId(oldItem);
		//if (pid === oid) return oldItem;
	}
}
