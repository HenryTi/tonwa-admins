import { DevUQ } from "model";
import { FA, List, VPage } from "tonva";
import { CUqRoles } from "./CUqRoles";

export class VUqRoles extends VPage<CUqRoles> {
	header() {return 'UQ角色设置'}
	content() {
		let {devUQs, onDevUQ} = this.controller;
		return <div>
			<List items={devUQs} item={{render: this.renderDevUQ, onClick: onDevUQ}} />
		</div>
	}

	private renderDevUQ = (item: DevUQ&{roles:string[]}, index: number) => {
		let {name, discription, roles} = item;
		return <div className="px-3 py-2">
			<FA name="database" className="text-info my-2 mx-1" size="lg" />
			<div className="ml-3">
				<div>{name}</div>
				<div className="small text-muted">{discription}</div>
				<div className="mt-3">
					<small className="text-muted mr-1">角色:</small>
					{roles?.map((v, index) => <span key={index} className="mx-2">{v}</span>)}
				</div>
			</div>
		</div>;
	}

}
