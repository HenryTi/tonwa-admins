import React from 'react';
import { VPage } from "../../vm";
import {nav, Page, Schema, UiSchema, UiPasswordItem, UiButton, Form, Context, StringSchema} from '../../components';
import { CForget, CRegBase, CRegister } from './CRegister';

export abstract class VPassword<T extends CRegBase> extends VPage<T> {
	protected abstract get pageCaption():string;
	protected abstract get submitCaption():string;

	get account():string {return this.controller.account}

    private schema: Schema = [
        {name: 'pwd', type: 'string', required: true, maxLength: 100} as StringSchema,
        {name: 'rePwd', type: 'string', required: true, maxLength: 100} as StringSchema,
        {name: 'submit', type: 'submit'},
    ]

	private onButtonSubmit = async (name:string, context:Context):Promise<string> => {
        let values = context.form.data;
        let {pwd, rePwd} = values;
        let error:string;
        if (!pwd || pwd !== rePwd) {
            context.setValue('pwd', '');
            context.setValue('rePwd', '');
            error = '密码错误，请重新输入密码！';
            context.setError('pwd', error);
        }
        else {
			error = await this.controller.onPasswordSubmit(pwd);
            if (error !== undefined) {
                nav.push(<Page header="注册不成功"><div className="p-5 text-danger">{error}</div></Page>);
            }
        }
        return error;
    }
    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'rePwd') {
            return await this.onButtonSubmit('submit', context);
        }
    }
	
	header() {
		return this.pageCaption;
	}

	content() {
		let uiSchema: UiSchema = {
			items: {
				pwd: {widget: 'password', placeholder: '密码', label: '密码'} as UiPasswordItem,
				rePwd: {widget: 'password', placeholder: '重复密码', label: '重复密码'} as UiPasswordItem,
				submit: {widget: 'button', className: 'btn btn-primary btn-block mt-3', label: this.submitCaption} as UiButton,
			}
		}
		return <div className="w-max-20c my-5 py-5"
			style={{marginLeft:'auto', marginRight:'auto'}}>
			注册账号<br/>
			<div className="py-2 px-3 my-2 text-primary bg-light"><b>{this.account}</b></div>
			<div className="h-1c" />
			<Form schema={this.schema} uiSchema={uiSchema}
				onButtonClick={this.onButtonSubmit}
				onEnter={this.onEnter}
				requiredFlag={false} />
		</div>;
    }
}

export class VRegisterPassword extends VPassword<CRegister> {
	get pageCaption():string {return '注册账号'}
	get submitCaption():string {return '注册新账号'}
}

export class VForgetPassword extends VPassword<CForget> {
	get pageCaption():string {return '账号密码'}
	get submitCaption():string {return '改密码'}
}
