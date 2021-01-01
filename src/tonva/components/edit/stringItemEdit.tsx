import * as React from 'react';
import { UiTextItem } from '../schema';
import { nav } from '../nav';
import { Page } from '../page/page';
import { observer } from 'mobx-react';
import { ItemEdit } from './itemEdit';

export interface InputOptions {
	type: string;
	min?: number;
	max?: number;
	step?: number;
}

export class StringItemEdit extends ItemEdit {
    get uiItem(): UiTextItem {return this._uiItem as UiTextItem}
    protected async internalStart():Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let element = React.createElement(this.page, {resolve, reject});
            nav.push(element,reject);
        });
    }

    private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.newValue = evt.target.value;
        let preValue = this.value;
        this.isChanged = (this.newValue !== preValue);
    }

    private onBlur = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.verifyValue();
    }

    private onFocus = () => {
        this.error = undefined;
	}
	
	protected inputOptions():InputOptions {
		return {
			type: 'text',
		}
	}

    private page = observer((props:{resolve:(value:any)=>void, reject: (resean?:any)=>void}):JSX.Element => {
		let {resolve} = props;
		let onSave = () => {
			this.verifyValue();
			if (this.error === undefined) {
				let val = this.newValue;
				resolve(val);				
			}
		}
        let right = <button
            className="btn btn-sm btn-success align-self-center mr-2"
            disabled={!this.isChanged}
            onClick={onSave}>保存</button>;
		let onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
			if (evt.keyCode === 13) onSave();
		}
		let {type, max, min, step} = this.inputOptions();
        return <Page header={this.label} right={right}>
            <div className="m-3">
				<input type={type}
					onChange={this.onChange}
					onKeyDown={onKeyDown}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    className="form-control" 
                    defaultValue={this.value} min={min} max={max} step={step} />
                {
                    this.uiItem && <div className="small muted m-2">{this.uiItem.placeholder}</div>
                }
                {this.error && <div className="text-danger">{this.error}</div>}
            </div>
        </Page>;
    })
}
