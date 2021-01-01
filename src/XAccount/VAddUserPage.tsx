import * as React from 'react';
import { CAppXAccount } from "./CAppXAccount";
import { VPage, Page, Form, Schema, StringSchema, ButtonSchema, UiSchema, UiButton, UiTextItem, Context } from "tonva";

export class VAddUserPage extends VPage<CAppXAccount> {
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
        let ret = await this.controller.addUser(this.roleNum, context.data.user);
        if (ret === undefined) {
            this.closePage();
            return;
        }
        context.setError('user', ret);
    }

    private onEnter = async (name:string, context:Context):Promise<string> => {
        if (name === 'user') {
            await this.onSubmit('login', context);
            return;
        }
    }

    private page = () => {
        let roleCaption = this.controller.getRoleCaption(this.roleNum);
        return <Page header={'新增 - ' + roleCaption} back="close">
            <div className="m-5 px-5 py-3 bg-white border rounded">
                <Form schema={this.schema} uiSchema={this.uiSchema}
                    onEnter={this.onEnter}
                    onButtonClick={this.onSubmit}/>
            </div>
        </Page>
    }
}
