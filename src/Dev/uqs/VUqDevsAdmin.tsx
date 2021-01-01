import * as React from 'react';
import { VPage, Page, LMR, Image, List } from 'tonva';
import { CUq } from './CUq';
import { UnitAdmin } from '../../model';

export class VUqDevsAdmin extends VPage<CUq> {
    async open() {
        await this.controller.loadAdmins();
        this.openPage(this.page);
    }

    private onSelect = async (admin:any, isSelected:boolean) => {
        await this.controller.devChanged(admin, isSelected);
    }

    private page = ():JSX.Element => {
        let {uqDevs, admins} = this.controller;
        let selectedItems = admins.devs.filter(v => uqDevs.find(d => d.userId === v.id) !== undefined);
        let listHeader = <div className="px-3 py-1 small text-muted">开发者</div>;
        return <Page header="增减开发者">
            <div className='my-3'>
                {listHeader}
                <List
                    items={admins.devs} 
                    none='[无]'
                    selectedItems = {selectedItems}
                    item={{onSelect: this.onSelect, render: this.row}}
                />
            </div>
        </Page>;
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

}
