import React from 'react';
import { UiCheckItem } from '../schema';
import { ItemEdit } from './itemEdit';

export class CheckBoxItemEdit extends ItemEdit {
	private input: HTMLInputElement;
    get uiItem(): UiCheckItem {return this._uiItem as UiCheckItem}
	get editInRow(): boolean {return true;}
    protected async internalStart():Promise<any> {
		if (!this.input) return;
		let uiItem = this.uiItem;
		if (uiItem === undefined) return this.input.checked;
		let {checked} = this.input;
		return this.getValue(checked);
    }
	async end():Promise<any> {}
	renderContent() {
		let {readOnly} = this.uiItem;
		let disabled = readOnly === true;
		let onChange:any;
		if (readOnly !== true) onChange = this.onChange;
		return <input ref={r => this.input=r} type="checkbox" 
			defaultChecked={this.value} disabled={disabled}
			onChange={onChange} />
	}

	private getValue(checked: boolean) {
		let {trueValue, falseValue} = this.uiItem;
        return checked === true? (trueValue??true) : (falseValue??false);
	}

    private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.newValue = this.getValue(evt.target.checked);
        let preValue = this.value;
		this.isChanged = (this.newValue !== preValue);
		this.edit.onItemChanged(this, this.newValue);
    }
}
