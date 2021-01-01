import * as React from 'react';
import { CDevelopers } from "./CDevelopers";
import { VPage, Page, Form, ItemSchema, StringSchema, UiSchema, 
    ButtonSchema, UiTextItem, UiButton, Context } from 'tonva';

export class VAddDeveloper extends VPage<CDevelopers> {
    async open() {
        this.openPage(this.page);
    }

    private onSubmitClick = async (name:string, context:Context) => {
        let ret = await this.controller.addDev(context.data.user);
        let {r} = ret;
        if (r === 'success') {
            this.closePage();
            return;
        }
        let error: string;
        switch (r) {
            case 'is-root': error = '是创建人，不需要设为开发者'; break;
            case 'is-owner': error = '是所有者，不需要设为开发者'; break;
            case 'is-admin': error = '是管理员，不需要设为开发者'; break;
            case 'is-dev': error = '已经是开发者了'; break;
        }
        context.setError('user', error);
    }

    private page = () => {
        let schema: ItemSchema[] = [
            {name: 'user', type: 'string', maxLength: 50, required: true} as StringSchema,
            {name: 'submit', type: 'submit' } as ButtonSchema,
        ];
        let uiSchema: UiSchema = {
            items: {
                user: {widget: 'text', label: '用户名', placeholder: '请输入开发者的账号'} as UiTextItem,
                submit: {widget: 'button', label: '提交', className:'btn btn-success'} as UiButton
            }
        };
        return <Page header="新增开发者">
            <Form className="m-5" schema={schema} uiSchema={uiSchema} 
                onEnter={this.onSubmitClick}
                onButtonClick={this.onSubmitClick} />
        </Page>;
    }
}