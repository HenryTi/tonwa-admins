import { Entity } from "../entity";
import { TagView } from "./tagView";

export interface TagValue {
	id: number;
	name: string;
	ext: string;
}

export class Tag extends Entity {
    get typeName(): string { return 'tag';}
	values: TagValue[];
	private coll: {[id:number]: TagValue} = {};

	private _view: TagView;
	get view(): TagView { 
		if (this._view !== undefined) return this._view; 
		return this._view = new TagView(this);
	}

	nameFromId(id:number) {
		let c = this.coll[id]; 
		return c===undefined? undefined : c.name;
	}

	namesFromIds(ids:string):string[] {
		let ret:string[] = [];
		for (let id of ids.split('|')) {
			let c = this.coll[Number(id)];
			let name = c===undefined? undefined : c.name;
			if (name !== undefined) ret.push(name);
		}
		return ret;
	}

	async loadValues():Promise<TagValue[]> {
		if (this.values !== undefined) return this.values;
		this.values = [];
		let ret = await this.uqApi.get('tag/values/' + this.name);
		if (ret === undefined) return;
		let lines = (ret as string).split('\n');
		for (let line of lines) {
			if (line.length === 0) continue;
			let parts = line.split('\t');
			let id = Number(parts[0]);
			let val = {
				id: id,
				name: parts[1],
				ext: parts[2],
			};
			this.values.push(val);
			this.coll[id] = val;
		}
		return this.values;
	}
}
