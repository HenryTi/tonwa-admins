import * as React from 'react';
import {observable} from 'mobx';
import {FormView} from '../formView';
import {Field} from '../field';
import {Face, TuidPickFace} from '../face';
import {Control} from './control';

export class PickTuidControl extends Control {
    protected get face(): TuidPickFace {return this._face as TuidPickFace}
    // protected value: number;
    @observable private caption: string|JSX.Element;
    constructor(formView:FormView, field:Field, face:Face) {
        super(formView, field, face);
        this.onIdChanged = this.onIdChanged.bind(this);
        //this.onClick = this.onClick.bind(this);
    }
    /*
    private async onClick() {
        let {pick, fromPicked} = this.face;
        let item = await pick(this.face, this.formView.props, this.formView.readValues());
        if (item === undefined) {
            this.value = undefined;
            return;
        }
        if (fromPicked === undefined) {
            this.value = item.id;
            return;
        }
        let {id, caption} = fromPicked(item);
        this.value = id;
        this.caption = caption;
    }*/
    onIdChanged(id: any) {
        this.value = id.id;
    }
    setInitValues(values: any) {
        let v = values[this._field.name];
        this.value = v;
    }
    private buildContent():JSX.Element {
		/*
        return <this.face.input.component 
            {...this.face}
            id={this.value}
            onFormValues={()=>this.formView.readValues()}
			onIdChanged={this.onIdChanged} />;
		*/
		return React.createElement(this.face.input.component, {
			id: this.value,
            onFormValues: ()=>this.formView.readValues(),
			onIdChanged: this.onIdChanged,
			...this.face
		})
    }
    renderControl():JSX.Element {
        return <div className="form-control-static ">
            {this.buildContent()}
        </div>;
    }
}
/*
<button className="form-control btn btn-outline-info"
type="button"
style={{textAlign:'left', paddingLeft:'0.75rem'}}
onClick={this.onClick}>
{this.buildContent()}
</button>
*/