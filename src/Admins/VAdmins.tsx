import * as React from 'react';
import { CAdmins } from "./CAdmins";
import { VPage, List, Page, Image, LMR, FA } from "tonva";
import { UnitAdmin } from 'model';
import { VEditAdmin } from './VEditAdmin';
import { VAddAdmin } from './VAddAdmin';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

export class VAdmins extends VPage<CAdmins> {
    private list: List;
    @observable allSelectVisible: boolean = true;
    @observable allUnSelectVisible: boolean = false;
    @observable disableDel: boolean = true;

    async open() {
        this.openPage(this.page);
    }

    private onNewFellow = () => {
        //nav.push(<NewFellow />);
    }
    private onItemClick = (ua:UnitAdmin) => {
        //store.admins.cur = ua;
        this.controller.admins.cur = ua;
        this.openVPage(VEditAdmin);
        //nav.push(<EditAdmin />);
    }
    private onItemSelect = (ua:UnitAdmin, isSelected:boolean, anySelected:boolean) => {
        this.disableDel = !anySelected;
    }

    private onSelectAll = () => {
        this.list.selectAll();
    }

    private onClearAll = () => {
        this.list.unselectAll();
    }

    private onDel = async () => {
        await this.controller.delAdmins(this.list.selectedItems);
    }

    private row = ({icon, name, nick}:UnitAdmin) => {
        let content = nick?
            <><b>{nick}</b> &nbsp; <small className="text-muted">{name}</small></>
            :
            <b>{name}</b>;
        let left = <Image className="w-2-5c h-2-5c" src={icon} />; 
        return <LMR className="py-2 px-3 align-items-stretch" left={left}>
            <div className="px-3">{content}</div>
        </LMR>;
    }

    onAddAdmin = () => {
        this.openVPage(VAddAdmin);
    } 

    private page = observer(() => {
        let {admins} = this.controller;
        let right = <button 
            className="btn btn-sm btn-success mr-2 align-self-center"
            onClick={this.onAddAdmin}><FA name="plus" /></button>;
        /*
        let showOwners = false, showAdmins = false;
        let ownersView:any, adminsView:any;
        if (unit.isRoot === 1) {
            showOwners = true;
            showAdmins = true;
        }
        if (unit.isOwner === 1) showAdmins = true;
        if (showOwners === true) {
            let header = <LMR 
                className="px-3 py-1 small"
                left="高管" 
                right={<a href='/' onClick={this.onNewOwner}>新增</a>} />;
            ownersView = <List 
                className="my-4"
                header={header} items={owners}
                none="[无]"
                item={{onClick: this.onItemClick, render: this.row}}
            />;
        }
        if (showAdmins === true) {
            let header = <LMR 
                className="px-3 py-1 small"
                left="管理员" 
                right={<a href='/' onClick={this.onNewAdmin}>新增</a>} />;
            adminsView = <List 
                className='my-4' 
                header={header} items={admins} 
                none='[无]'
                item={{onClick: this.onItemClick, render: this.row}}
            />;
        }
        */
        let adminsView = <List ref={(list) => this.list = list}
            className="my-1" items={admins.admins} 
            none='[无]'
            item={{render: this.row, onSelect: this.onItemSelect}}
            />;
        let cnBtn = 'btn btn-sm btn-outline-info mr-1';
        let buttons = admins.admins.length > 0 && <div className="pl-3">
            <button className={cnBtn} onClick={this.onSelectAll}>全选</button>
            <button className={cnBtn} onClick={this.onClearAll}>全清</button>
            <button className={cnBtn} disabled={this.disableDel} onClick={this.onDel}>移除</button>
        </div>;

        return <Page header="管理员" right={right}>
            <div className='my-3'>
                {buttons}
                {adminsView}
                {buttons}
            </div>
        </Page>;
    })
}
