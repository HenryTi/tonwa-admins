import * as React from 'react';
import { observable } from 'mobx';
import { Page, VPage, nav } from 'tonva';
import { CUq } from './CUq';
import { Prop, PropGrid } from 'tonva';
import { StringValueEdit, ServerSpan, UnitSpan } from 'tools';
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
    private onDbChanged = async (value:any, orgValue:any):Promise<string|void> => {
        let ret = await this.changeProp('db', value);
        if (ret === 0) {
            return 'Db已经被使用了';
        }
        this.service.db = value;
    }
    private onUnitPick = async () => {
        let ret = await this.controller.pickUnit();
        this.changeProp('uq_unique_unit', ret);
        this.service.uqUniqueUnit = ret;
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
            {
                type: 'component',
                label: '小号($unit)',
                component: <UnitSpan id={this.service.uqUniqueUnit} />,
                onClick: this.onUnitPick
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
        ];
        let right = <button onClick={this.onDeleteClick} 
            className="btn btn-sm btn-success align-self-center">删除</button>;
        return <Page header={'UQ - ' + uq.name} right={right}>
            <PropGrid rows={rows} values={this.service} />
        </Page>
    })
}

