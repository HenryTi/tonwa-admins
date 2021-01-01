import * as React from 'react';
import classNames from 'classnames';
import { Widget } from './widget';
import { UiTag, IValuesViewRenderOptions } from '../../schema';
import { RowContext } from '../context';

abstract class TagWidget extends Widget {
    protected inputs: {[index:number]: HTMLInputElement} = {};
    protected get ui(): UiTag {return this._ui as UiTag};

    protected setElementValue(value:any) {
        for (let i in this.inputs) {
            let input = this.inputs[i];
            input.checked = value === input.value;
        }
    }
    setReadOnly(value:boolean) {
        this.readOnly = value;
        for (let i in this.inputs) this.inputs[i].readOnly = value;
    }
    setDisabled(value:boolean) {
        this.disabled = value;
        for (let i in this.inputs) this.inputs[i].disabled = value
	}
	
	abstract render():JSX.Element;
}

export class TagSingleWidget extends TagWidget {
	render() {
		let {valuesView, wrapClassName} = this.ui;
		if (valuesView === undefined) return <>valuesView must be defined</>;
        let {isRow} = this.context;
        let rowKey:number;
        if (isRow === true) {
            rowKey = (this.context as RowContext).rowKey;
        }
        let cn = classNames(this.className, 'py-0');
		let name = this.name;
		if (rowKey !== undefined) name += '-' + rowKey;
		let options:IValuesViewRenderOptions = {
			className: cn,
			inputName: name,
			wrapClassName,
			onInputChange: this.onInputChange
		}
		return valuesView.renderRadios(this.defaultValue, options);
    }
}

export class TagMultiWidget extends TagWidget {
	private defaultArr:number[];
	init() {
		super.init();
		let def = this.defaultValue;
		switch (typeof def) {
			default:
				this.defaultArr = [];
				break;
			case 'string':
				this.defaultArr = def.split('|').map(v => Number(v));
				break;
		}
	}
    protected onInputChange = (evt: React.ChangeEvent<any>) => {
		let values:string[] = [];
		for (let i in this.inputs) {
			let input = this.inputs[i];
			if (input.checked === true) values.push(input.value);
		}
        this.changeValue(values.join('|'), true);
	}
	render() {
		let {valuesView, wrapClassName} = this.ui;
		if (valuesView === undefined) return <>valuesView must be defined</>;
        let cn = classNames(this.className, 'py-0');
		let options:IValuesViewRenderOptions = {
			className: cn,
			inputs: this.inputs,
			wrapClassName,
			onInputChange: this.onInputChange
		}
		return valuesView.renderChecks(this.defaultValue, options);
    }
}
