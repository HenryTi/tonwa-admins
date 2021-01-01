import * as React from 'react';
import { observable } from 'mobx';
import { Page, VPage, nav } from 'tonva';
import { CUq } from './CUq';
import { Prop, PropGrid } from 'tonva';
import { StringValueEdit, ServerSpan } from 'tools';
import { observer } from 'mobx-react';
import { DevService } from 'model';

export class ServicePage extends VPage<CUq> {
    @observable private service: DevService;
    async open(service: DevService) {
        this.service = service;
        this.openPage(this.page);
    }
    private async changeProp(prop:string, value:any):Promise<any> {
        return await this.controller.changeServiceProp(this.service, prop, value);
	}
	/*
    private onUrlChanged = async (value:any, orgValue:any):Promise<string|void> => {
        let ret = await this.changeProp('url', value);
        if (ret === 0) {
            //return 'URL已经被使用了';
            return;
        }
        this.service.url = value;
    }
    private onUrlTestChanged = async (value:any, orgValue:any):Promise<string|void> => {
        let ret = await this.changeProp('urlTest', value);
        if (ret === 0) {
            //return 'URL已经被使用了';
            return;
        }
        this.service.urlTest = value;
	}
	*/
    private onDbChanged = async (value:any, orgValue:any):Promise<string|void> => {
        let ret = await this.changeProp('db', value);
        if (ret === 0) {
            return 'Db已经被使用了';
        }
        this.service.db = value;
    }
    private onServerPick = async () => {
        let ret = await this.controller.pickServer();
        this.changeProp('server', ret);
        this.service.server = ret;
    }
    private onServerTestPick = async () => {
        let ret = await this.controller.pickServer();
        this.changeProp('server_test', ret);
        this.service.serverTest = ret;
    }
    private onDeleteClick = async () => {
        if (window.confirm("真的要删除Service吗？删除了不可恢复，需要重新录入。")!==true) return;
        await this.controller.delService(this.service);
        nav.pop();
    }
    private page = observer(() => {
        let {uq} = this.controller;
        let rows:Prop[] = [
            '',
            {
                type: 'string',
                name: 'db',
                label: '数据库名',
                onClick: ()=>nav.push(<StringValueEdit 
                    title="数据库名字"
                    value={this.service.db}
                    onChanged={this.onDbChanged} />)
            },
            '',
            {
                type: 'component',
                label: '生产服务器',
                component: <ServerSpan id={this.service.server} />,
                onClick: this.onServerPick
            },
            {
                type: 'component',
                label: '测试服务器',
                component: <ServerSpan id={this.service.serverTest} />,
                onClick: this.onServerTestPick
			},
			/*
            '',
            {
                type: 'string',
                name: 'url',
                label: 'URL',
                onClick: ()=>nav.push(<StringValueEdit 
                    title="修改URL"
                    value={this.service.url}
                    onChanged={this.onUrlChanged} />)
            },
            {
                type: 'string',
                name: 'urlTest',
                label: 'URL-Test',
                onClick: ()=>nav.push(<StringValueEdit 
                    title="修改URL-Test"
                    value={this.service.urlTest}
                    onChanged={this.onUrlTestChanged} />)
			},
			*/
        ];
        let right = <button onClick={this.onDeleteClick} 
            className="btn btn-sm btn-success align-self-center">删除</button>;
        return <Page header={'UQ - ' + uq.name} right={right}>
            <PropGrid rows={rows} values={this.service} />
        </Page>
    })
}

