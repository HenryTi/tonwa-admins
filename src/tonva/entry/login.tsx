import * as React from 'react';
import {nav, Page, Form, Schema, UiSchema, UiTextItem, UiPasswordItem, Context, UiButton, resLang, StringSchema, Ax} from '../components';
import { userApi } from '../net';
import { LoginRes, loginRes } from '../res';
import { tonvaTop, getSender } from './tools';
import { User } from '../tool/user';

const schema: Schema = [
    {name: 'username', type: 'string', required: true, maxLength: 100} as StringSchema,
    {name: 'password', type: 'string', required: true, maxLength: 100} as StringSchema,
    {name: 'login', type: 'submit'},
];

export interface LoginProps {
    withBack?: boolean;
    callback?: (user:User) => Promise<void>;
    //top?: any;
}

export default class Login extends React.Component<LoginProps> {
    private res: LoginRes = resLang(loginRes);
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
        let user = await userApi.login({
            user: un,
            pwd: pwd,
            guest: nav.guest,
        });

        if (user === undefined) {
            let sender = getSender(un);
            let type:string = sender !== undefined? sender.caption : '用户名';
            return type + '或密码错！';
        }
		console.log("onLoginSubmit: user=%s pwd:%s", user.name, user.token);
        await nav.userLogined(user, this.props.callback);
    }
    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'password') {
            return await this.onSubmit('login', context);
        }
	}
	/*
    private clickReg = () => {
        //nav.replace(<RegisterView />);
        let register = new RegisterController(undefined);
        register.start();
    }
    private clickForget = () => {
        let forget = new ForgetController(undefined);
        forget.start();
	}
	*/
    render() {
        let footer = <div><div className="d-block">
            <div className='text-center'>
                <Ax href="/register" className="btn btn-link" style={{margin:'0px auto'}}>
                    注册账号
                </Ax>
            </div>
            {nav.privacyEntry()}
        </div>
        </div>;
        let header:string|boolean|JSX.Element = false;
        if (this.props.withBack === true) {
            header = '登录';
        }
        return <Page header={header} footer={footer}>
            <div className="d-flex p-5 flex-column justify-content-center align-items-center">
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
            </div>
        </Page>;
    }
}
