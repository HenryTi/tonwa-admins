import React from 'react';
import _ from 'lodash';
import { FA, Page } from '../../components';
import { Controller } from "../controller";
import { observable } from 'mobx';
import { observer } from 'mobx-react';

export interface CStringEditProps {
	label?: string;
	placeholder?: string;
	maxLength?: number;
	onValueChange?: (value: string) => Promise<void>;
}

export class CStringEdit extends Controller {
	private props: CStringEditProps = {
		label: '编辑'
	}
	@observable value: string;
	@observable private newValue: string;
	@observable private isChanged: boolean;
	@observable private error: string;

	protected async internalStart() {}
	render(value:string, props?:CStringEditProps) {
		this.value = value;
		if (props) _.merge(this.props, props);
		return React.createElement(observer(()=><>{this.renderValue()}{this.renderPencil()}</>))
	}

	protected renderValue() {return <>{this.value}</>}
	protected renderPencil() {
		return <span onClick={this.onEdit} className="cursor-pointer">
			&nbsp; <FA className="text-info" name="pencil-square-o" /> &nbsp;
		</span>;
	}

    private onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.newValue = evt.target.value;
        let preValue = this.value;
        this.isChanged = (this.newValue !== preValue);
    }

    private onBlur = (evt: React.ChangeEvent<HTMLInputElement>) => {
        this.verifyValue();
	}
	
	protected verifyValue() {}

    private onFocus = () => {
        this.error = undefined;
	}
	
	private onEdit = () => {
		let {label, maxLength, placeholder, onValueChange} = this.props;
		let onSave = () => {
			this.verifyValue();
			if (this.error === undefined) {
				this.value = this.newValue;
				this.closePage();
				if (onValueChange) onValueChange(this.value);
			}
		}
        let right = React.createElement(observer(() => <button
            className="btn btn-sm btn-success align-self-center mr-2"
            disabled={!this.isChanged}
            onClick={onSave}>保存</button>));
		let onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
			if (evt.keyCode === 13) onSave();
		}
		this.openPage(<Page header={label} right={right}>
            <div className="m-3">
				<input type="text"
					onChange={this.onChange}
					onKeyDown={onKeyDown}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
					className="form-control"
					defaultValue={this.value}
					maxLength={maxLength} />
                {
					React.createElement(observer(()=> placeholder && <div className="small muted m-2">{placeholder}</div>))                    
                }
                {this.error && <div className="text-danger">{this.error}</div>}
            </div>
		</Page>);
	}
}
