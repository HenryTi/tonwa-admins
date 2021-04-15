import React from 'react';
import { VPage } from "../../vm";
import { tonvaTop, getSender } from '../tools';
import {nav, Page, Schema, UiSchema, UiTextItem, UiButton, Form, Context, StringSchema, Ax} from '../../components';
import { CForget, CRegBase, CRegister } from './CRegister';

export abstract class VStart<T extends CRegBase> extends VPage<T> {
    private schema: Schema = [
        {name: 'user', type: 'string', required: true, maxLength: 100} as StringSchema,
        {name: 'verify', type: 'submit'},
    ]
	private uiSchema: UiSchema;
	
	abstract get accountLable():string;
	abstract get pageCaption():string;

	init() {
        this.uiSchema = {
            items: {
                user: {
                    widget: 'text',
                    label: this.accountLable,
                    placeholder: '手机号或邮箱',
                } as UiTextItem, 
                verify: {widget: 'button', className: 'btn btn-primary btn-block mt-3', label: '发送验证码'} as UiButton,
            }
        }
	}

	header() {return this.pageCaption;}
	footer() {
		return <div className="text-center">
			<Ax href="/login" className="text-primary">已有账号，直接登录</Ax>
		</div>;
	}

    content():JSX.Element {
        return <div className="w-max-20c my-5 py-5"
                style={{marginLeft:'auto', marginRight:'auto'}}>
			{tonvaTop()}
			<div className="h-3c" />
			<Form schema={this.schema} uiSchema={this.uiSchema} 
				onButtonClick={this.onSubmit}
				onEnter={this.onEnter} 
				requiredFlag={false} />
			{nav.privacyEntry()}
		</div>;
    }

    private onSubmit = async (name:string, context:Context):Promise<string> => {
        context.clearContextErrors();
        let user = 'user';
        let value = context.getValue(user);
        let sender = getSender(value);
        if (sender === undefined) {
            context.setError(user, '必须是手机号或邮箱');
            return;
        }
        let type:'mobile'|'email' = sender.type as 'mobile'|'email';
        if (type === 'mobile') {
            if (value.length !== 11 || value[0] !== '1') {
                context.setError(user, '请输入正确的手机号');
                return;
            }
        }
        this.controller.account = value;
        this.controller.type = type;
        let ret = await this.controller.checkAccount();
        if (ret !== undefined) context.setError(user, ret);
    }

    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'user') {
            return await this.onSubmit('verify', context);
        }
    }
}

export class VRegisterStart extends VStart<CRegister> {
	get accountLable():string {return '账号'}
	get pageCaption():string {return '注册账号'}
}

export class VForgetStart extends VStart<CForget> {
	footer():JSX.Element {return null;}
	get accountLable():string {return '账号'}
	get pageCaption():string {return '密码找回'}
}
