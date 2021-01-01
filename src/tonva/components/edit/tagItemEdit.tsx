import * as React from 'react';
import { UiTag } from '../schema';
import { nav } from '../nav';
import { Page } from '../page/page';
import { observer } from 'mobx-react';
import { ItemEdit } from './itemEdit';

abstract class TagItemEdit extends ItemEdit {
	protected inputs: {[index:number]: HTMLInputElement} = {};
	protected inputType: 'checkbox' | 'radio';
    get uiItem(): UiTag {return this._uiItem as UiTag};

	init() {
        if (this.value === undefined) {
            this.value = this._uiItem===undefined? undefined : this._uiItem.defaultValue;
        }
	}

    protected async internalStart():Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let element = React.createElement(this.page, {resolve:resolve, reject:reject});
            nav.push(element,reject);
        });
	}
	
	renderContent() {
		let valuesView = this.uiItem.valuesView;
		if (valuesView === undefined) return super.renderContent();
		return valuesView.render(this.value);
	}

	protected abstract renderInputs():JSX.Element;
    private page = observer((props:{resolve:(value:any)=>void, reject: (resean?:any)=>void}):JSX.Element => {
        let {resolve} = props;
        let right = <button
            className="btn btn-sm btn-success align-self-center"
            disabled={!this.isChanged}
            onClick={()=>{
                this.verifyValue();
                if (this.error === undefined) resolve(this.newValue);
			}}>保存</button>;
		/*
        let content = list?
            list.map((v, index:number) => {
                let {name:itemName, id} = v;
                return <div key={index} className="col"><label className="px-3 py-2 cursor-pointer">
                    <input ref={input=>this.inputs[id] = input} name={name} type={this.inputType} value={id} 
						onClick={(e)=>this.onChange(e.currentTarget.checked, id)}
                        defaultChecked={this.defaultChecked(id)} /> {itemName} &nbsp;
                </label></div>;
            })
            :
			<>no list defined</>;
		*/
        return <Page header={'更改' + this.label} right={right}>
			<div className="p-3">
				{this.renderInputs()}
			</div>
        </Page>;
    })
}

export class TagSingleItemEdit extends TagItemEdit {
	protected inputType:'radio'|'checkbox' = 'radio';
    protected onInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		let {currentTarget} = evt;
		if (currentTarget.checked === false) return;
        this.newValue = Number(currentTarget.value);
        let preValue = this.value;
        this.isChanged = (this.newValue !== preValue);
	}
	
	protected renderInputs():JSX.Element {
		let {valuesView} = this.uiItem;
		let options = {
			inputs: this.inputs,
			onInputChange: this.onInputChange,
		};
		return valuesView.renderRadios(this.value, options);
	}
}

export class TagMultiItemEdit extends TagItemEdit {
	//private arr:number[];
	protected inputType:'radio'|'checkbox' = 'checkbox';

	private onInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		let values:string[] = [];
		for (let i in this.inputs) {
			let input = this.inputs[i];
			if (input.checked === true) values.push(input.value);
		}
        this.newValue = values.join('|');
        //this.newValue = value;
        let preValue = this.value;
        this.isChanged = (this.newValue !== preValue);
	}
	protected renderInputs():JSX.Element {
		let {valuesView} = this.uiItem;
		let options = {
			inputs: this.inputs,
			onInputChange: this.onInputChange
		};
		return valuesView.renderChecks(this.value, options);
	}
}
