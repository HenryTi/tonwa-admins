import * as React from 'react';
import { ControlBase } from './control';

export class ButtonsControl extends ControlBase {
    constructor(props) {
        super(props);
        this.otherClick = this.otherClick.bind(this);
    }
    private otherClick() {
        let onOther = this.formView.props.onOther;
        if (onOther === undefined) return;
        let values = this.formView.readValues();
        onOther(values);
    }
    renderControl(): JSX.Element {
        console.log('buttons.renderControl');
        let nothing = this.formView.nothing;
        let hasError = this.formView.hasError;
        let props = this.formView.props;
        console.log('buttons.renderControl nothing:%s hasError:%s', nothing, hasError);
        let { submitButton, otherButton } = props;
        let btnOther: any;
        if (otherButton !== undefined) {
            btnOther = <button className="btn btn-outline-info ms-auto" onClick={this.otherClick}>
                {otherButton}
            </button>
        }
        return <div className="d-flex justify-content-start">
            <button
                className="btn btn-primary"
                type="submit"
                disabled={nothing || hasError}>
                {submitButton || '提交'}
            </button>
            {btnOther}
        </div>;
    }
}
