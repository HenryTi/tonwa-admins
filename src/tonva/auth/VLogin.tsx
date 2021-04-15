import * as React from 'react';
import {nav, Form, Schema, UiSchema, UiTextItem, UiPasswordItem, Context, UiButton, StringSchema, Ax} from '../components';
import { tonvaTop, getSender } from './tools';
import { User } from '../tool';
import { CLogin } from './CLogin';
import { VPage } from '../vm';

const schema: Schema = [
    {name: 'username', type: 'string', required: true, maxLength: 100} as StringSchema,
    {name: 'password', type: 'string', required: true, maxLength: 100} as StringSchema,
    {name: 'login', type: 'submit'},
];

export class VLogin extends VPage<CLogin> {
    private onLogin: (un:string, pwd:string) => Promise<boolean>;
    private withBack: boolean;

	init({onLogin, withBack}:{onLogin: (un:string, pwd:string) => Promise<boolean>; withBack: boolean;}) {
		this.onLogin = onLogin;
		this.withBack = withBack;
	}

    private uiSchema: UiSchema = {
        items: {
            username: {placeholder: '手机/邮箱/用户名', label: '登录账号'} as UiTextItem,
            password: {widget: 'password', placeholder: '密码', label: '密码'} as UiPasswordItem,
            login: {widget: 'button', className: 'btn btn-primary btn-block mt-3', label: '登录'} as UiButton,
        }
    }

    private onSubmit = async (name:string, context:Context):Promise<string> => {
        let values = context.form.data;
        let un = values['username'];
        let pwd = values['password'];
        if (pwd === undefined) {
            return 'something wrong, pwd is undefined';
		}
		let ret = await this.onLogin(un, pwd);
		if (ret === true) return;

		let sender = getSender(un);
		let type:string = sender !== undefined? sender.caption : '用户名';
		return type + '或密码错！';
    }
    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'password') {
            return await this.onSubmit('login', context);
        }
	}

	header() {
        if (this.withBack === true) {
            return '登录';
		}
		return false;
	}

	footer() {
        return <div className="d-block">
            <div className='text-center'>
                <Ax href="/register" className="btn btn-link" style={{margin:'0px auto'}}>
                    注册账号
                </Ax>
            </div>
            {nav.privacyEntry()}
        </div>;
	}

	content() {
        return <div className="d-flex p-5 flex-column justify-content-center align-items-center">
			<div className="flex-fill" />
			<div className="w-20c">
				{tonvaTop()}
				<div className="h-2c" />
				<Form schema={schema} uiSchema={this.uiSchema} 
					onButtonClick={this.onSubmit} 
					onEnter={this.onEnter}
					requiredFlag={false} />
				{/*onClick={() => this.clickForget()}*/}
				<Ax className="btn btn-link btn-block" href="/forget">
					忘记密码
				</Ax>
			</div>
			<div className="flex-fill" />
			<div className="flex-fill" />
		</div>;
    }
}
