export const CAppUserManagers = 1;

/*
import * as React from 'react';
import { Controller, VPage, Page, Form, Schema, UiSchema, UiTextItem, Context, FA } from "tonva";

export class CAppUserManagers extends Controller {
    protected async internalStart(param?: any) {
        this.openVPage(VAppUserManagers);
    }

    showAddNewPage = () => {
        this.openVPage(VAppUserManagerNew);
    }

    addNew = async (data: any):Promise<string> => {
        return;
    }
}

class VAppUserManagers extends VPage<CAppUserManagers> {
    async open() {
        this.openPage(this.page);
    }

    private page = () => {
        let right = <button className="btn btn-sm btn-success align-self-center me-1"
            onClick={this.controller.showAddNewPage}>
            <FA name="plus" />
        </button>;
        return <Page header="App用户管理员" right={right}>

        </Page>
    }
}

class VAppUserManagerNew extends VPage<CAppUserManagers> {
    private schema: Schema = [
        {name:'user', type:'string', required:true},
        {name:'submit', type:'submit'}
    ]
    private uiSchema: UiSchema = {
        items: {
            user: {widget:'text', maxLength: 100, placeholder: '用户账号，手机或邮箱', label: 'App用户管理员'} as UiTextItem,
            submit: {widget:'button', label: '新增', className: 'btn btn-primary'}
        }
    }

    async open() {
        this.openPage(this.page);
    }

    private onClickAddNew = async (name:string, context: Context) => {
        let ret = await this.controller.addNew(context.data);
        if (!ret) {
            this.closePage();
            return;
        }
    }

    private page = () => {
        return <Page header="新增App用户管理员">
            <Form className="p-3" schema={this.schema} 
                uiSchema={this.uiSchema} 
                onButtonClick={this.onClickAddNew}/>
        </Page>
    }
}
*/