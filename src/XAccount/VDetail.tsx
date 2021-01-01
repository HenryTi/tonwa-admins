import * as React from 'react';
import { observer } from 'mobx-react';
import {Media, List, LMR, Prop, PropGrid, FA, VPage, Page} from 'tonva';
import { CAppXAccount } from './CAppXAccount';
import { IdDates, UnitSpan } from 'tools';

export class VDetail extends VPage<CAppXAccount> {
    async open() {
        this.openPage(this.page);
    }

    private renderUqRow = (uqAccess:any, index:number):JSX.Element => {
        let {name, owner, discription} = uqAccess;
        return <LMR className="py-2" right={<small className="text-muted">{discription}</small>}>
            {owner} / {name}
        </LMR>;
    }

    private onTurnOnOff = async () => {
        if (await this.controller.appTurnOnOff() === true) {
            this.closePage();
            // after action;
            //let {id, inUnit} = this.props.app;
            //appActed?.(id, inUnit);
        }
    }

    private status = ():JSX.Element => {
        let {inUnit} = this.controller.appXAccount;
        let text:string, right:any;
        if (inUnit === 1) {
            right = <button className="btn btn-danger" onClick={this.onTurnOnOff}>
                <FA name="ban" /> 停用APP
            </button>;
            text = '运行中';
        }
        else if (inUnit === 0) {
            right = <button className="btn btn-success" onClick={this.onTurnOnOff}>
                <FA name="refresh" size="lg" /> 恢复APP
            </button>;
            text = '停运中';
        }
        else {
            right = <button className="btn btn-primary" onClick={this.onTurnOnOff}>
                <FA name="plus" size="lg" /> 新建
            </button>;
            text = '启用APP';
        }
        return <LMR className="w-100 align-items-center my-1" right={right}>{text}</LMR>;
    }

    private page = observer(() => {
        let {appXAccount, uqAccesses} = this.controller;
        let {unit, name, discription, icon, date_init, date_update} = appXAccount;
        let disp = <div>
            <div>{discription}</div>
            <IdDates date_update={date_update} date_init={date_init} />
        </div>;
        let rows:Prop[] = [
            '',
            {
                type: 'component', 
                component: <Media icon={icon} main={name} discription={disp} />
            },
            '',
            {
                type: 'component', 
                label: '开发号', 
                component: <div className="py-2"><UnitSpan id={unit} isLink={true} /></div>
            },
            {
                type: 'component', 
                label: '关联UQ', 
                component: <List className="w-100" items={uqAccesses}
                    item={{render: this.renderUqRow}} />
            },
            '',
            {
                type: 'component', 
                label: '状态',
                component: this.status()
            },
        ];
        return <Page header={"App详情 - " + name}>
            <PropGrid rows={rows} values={{}} labelFixLeft={true} />
        </Page>
    })
}
