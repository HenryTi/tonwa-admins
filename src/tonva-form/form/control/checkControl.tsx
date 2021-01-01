import * as React from 'react';
import _ from 'lodash';
import {BoolField} from '../field';
import {CheckBoxFace} from '../face';
import {Control} from './control';

export class CheckControl extends Control {    
    protected element: HTMLInputElement;
    private trueValue: any;
    private falseValue: any;

    protected get field(): BoolField {return this._field as BoolField}
    protected get face(): CheckBoxFace {return this._face as CheckBoxFace}

    protected init() {
        super.init();
        let {trueValue, falseValue} = this.field;
        if (trueValue === undefined) this.trueValue = 1;
        if (falseValue === undefined) this.falseValue = 0;
    }

    setProps() {
        super.setProps();
        _.assign(this.props, {
            onChange: this.onChange.bind(this),
        });
    }

    clearValue() {
        this.element.checked = this._field.defaultValue === this.trueValue;
        this.value = this.getValueFromElement();
    }

    setInitValues(values: any) {
        let v = values[this._field.name];
        if (v === undefined) {
            v = this._field.defaultValue;
        }
        if (v !== undefined) {
            //this.element.checked = v === this.trueValue;
            //this.value = this.getValueFromElement();
        }
    }

    protected getValueFromElement():any { return this.element.checked? this.trueValue:this.falseValue; }

    private onChange() {
        this.value = this.getValueFromElement();
    }

    renderControl():JSX.Element {
        return <div className="form-control-static">
            <label className="form-control">
                <label className="custom-control custom-checkbox mb-0">
                    <input type='checkbox'
                        name={this._field.name}
                        ref={this.props.ref}
                        onChange={this.props.onChange}
                        className="custom-control-input" />
                    <span className="custom-control-indicator" />
                    <span className="custom-control-description">{this.face.label}</span>
                </label>
            </label>
        </div>;
    }
}
