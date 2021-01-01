import * as React from 'react';
import { VPage, Page, Form, Schema, StringSchema, ButtonSchema, UiSchema, UiButton, UiTextItem, Context } from "tonva";
import { CAdmins } from './CAdmins';
import { unitCaption } from 'model';

export class VAddAdmin extends VPage<CAdmins> {
    private roleNum:number;
    private schema:Schema = [
        {name: 'user', type: 'string', required: true} as StringSchema,
        {name: 'submit', type: 'submit'} as ButtonSchema,
    ];
    private uiSchema:UiSchema = {
        items: {
            'user': {widget: 'text', label: '用户', placeholder: '请输入用户账号'} as UiTextItem,
            'submit': {widget: 'button', label: '提交', className: 'btn btn-primary'} as UiButton,
        }
    }
    async open(roleNum:number) {
        this.roleNum = roleNum;
        this.openPage(this.page);
    }

    private onSubmit = async (name:string, context:Context) => {
        let ret = await this.controller.addAdmin(context.data.user);
        if (ret === undefined) {
            this.closePage();
            return;
        }
        let err:string;
        switch (ret) {
            default: err = '未知错误'; break;
            case 'no-exist': err = '用户不存在'; break;
            case 'me': err = '你自己已经是管理员'; break;
            case 'admin': err = '已经是管理员'; break;
        }
        context.setError('user', err);
    }

    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'user') {
            await this.onSubmit('login', context);
            return;
        }
    }

    private page = () => {
        //let roleCaption = this.controller.getRoleCaption(this.roleNum);
        return <Page header={'新增 - ' + unitCaption(this.controller.unit) + '管理员'} back="close">
            <div className="m-5 px-5 py-3 bg-white border rounded">
                <Form schema={this.schema} uiSchema={this.uiSchema}
                    onEnter={this.onEnter}
                    onButtonClick={this.onSubmit}/>
            </div>
        </Page>
    }
}
