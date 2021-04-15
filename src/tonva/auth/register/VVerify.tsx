import React from 'react';
import { VPage } from "../../vm";
import { CRegBase } from "./CRegister";
import {Schema, UiSchema, UiTextItem, UiButton, Form, Context, NumSchema} from '../../components';

export class VVerify extends VPage<CRegBase> {
    private schema: Schema = [
        {name: 'verify', type: 'number', required: true, maxLength: 6} as NumSchema,
        {name: 'submit', type: 'submit'},
    ]

    private onVerifyChanged = (context:Context, value:any, prev:any) => {
        context.setDisabled('submit', !value || (value.length !== 6));
    }
    private uiSchema: UiSchema = {
        items: {
            verify: {
                widget: 'text',
                label: '验证码',
                placeholder: '请输入验证码',
                onChanged: this.onVerifyChanged,
            } as UiTextItem, 
            submit: {
                widget: 'button', 
                className: 'btn btn-primary btn-block mt-3', 
                label: '下一步 >',
                disabled: true
            } as UiButton,
        }
	}
	
	private onVerify: (verify:string) => Promise<number>;
	init(onVerify: (verify:string) => Promise<number>) {
		this.onVerify = onVerify;
	}

	private onSubmit = async (name:string, context:Context):Promise<string> => {
        let verify = context.getValue('verify');
        let ret = await this.onVerify(verify);
        if (ret === 0) {
            context.setError('verify', '验证码错误');
            return;
        }
    }

    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'verify') {
            return await this.onSubmit('submit', context);
        }
    }

	header() {return '验证码'}

	content() {
        let typeText:string, extra:any;
        switch (this.controller.type) {
            case 'mobile': typeText = '手机号'; break;
            case 'email': 
                typeText = '邮箱'; 
                extra = <><span className="text-danger">注意</span>: 有可能误为垃圾邮件，请检查<br/></>;
                break;
        }
        return <div className="w-max-20c my-5 py-5"
			style={{marginLeft:'auto', marginRight:'auto'}}>
			验证码已经发送到{typeText}<br/>
			<div className="py-2 px-3 my-2 text-primary bg-light"><b>{this.controller.account}</b></div>
			{extra}
			<div className="h-1c" />
			<Form schema={this.schema} uiSchema={this.uiSchema} 
				onButtonClick={this.onSubmit} 
				onEnter={this.onEnter}
				requiredFlag={false} />
		</div>;
    }
}
