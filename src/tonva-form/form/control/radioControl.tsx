import * as React from 'react';
import {RadioFace} from '../face';
import {Control} from './control';

export class RadioControl extends Control {
    protected get face(): RadioFace {return this._face as RadioFace}
    renderControl():JSX.Element {
        return <div className="form-control-static">
            <div className="form-control">
            {
                this.face.list.map((item, index) => {
                    let t:any; //, v:any;
                    if (typeof item !== 'object') t = item;
                    else {
                        t = item.text;
                        //v = item.value;
                    }
                    return <label key={index} className="custom-control custom-radio w-25">
                        <input type='radio'
                            name={this._field.name} 
                            className="custom-control-input" />
                        <span className="custom-control-indicator"></span>
                        <span className="custom-control-description">{t}</span>
                    </label>;
                })
            }
            </div>
        </div>;
    }
}
