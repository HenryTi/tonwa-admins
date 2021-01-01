import * as React from 'react';
import { VPage, Page, Image, EasyDate } from 'tonva';
import { AppController } from '.';
import { List, LMR, Badge, FA } from 'tonva';
import { DevApp } from 'model';

export class AppsPage extends VPage<AppController> {
    async open(param:any) {
        this.openPage(this.page);
    }
    private page = ():JSX.Element => {
        let {appList, listRowClick, showNewApp} = this.controller;
        let right = <button className='btn btn-success btn-sm mr-2' onClick={showNewApp}>
			<FA name="plus" /></button>;
        return <Page header="App" right={right}>
            <List items={appList} item={{render: this.appRow, onClick: listRowClick}} />
        </Page>
    }
    private appRow = (item:DevApp):JSX.Element => {
        let {name, caption, icon, date_init} = item;
        let left = <Badge size="sm"><Image src={icon} /></Badge>;
        /*let urlDiv = <div className="text-muted small">
            {url || '-'} {urlDebug}
        </div>;*/
        let spanCaption = caption?
            <><div className="small text-muted">{name}</div><div><b>{caption}</b></div></> :
            <div><b>{name}</b></div>;
        //let disDiv = <div><Muted>{discription}</Muted></div>
        let right = <small className="text-muted"><EasyDate date={date_init} /></small>;
        return <LMR className="py-2 px-3 align-items-stretch" left={left} right={right}>
            <div className="px-3">
                {spanCaption}
            </div>
        </LMR>;
    }
}
