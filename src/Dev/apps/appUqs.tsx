import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { List, LMR, SearchBox } from 'tonva';
import { Page, VPage } from 'tonva';
import { AppController } from '.';
import { DevUQ } from 'model';

export class SearchUqPage extends VPage<AppController> {
    @observable private uqs: DevUQ[];

    async open() {
        //this.uqs = await this.controller.getMyUqs();
        let pageStart = 0, pageSize = 200;
        this.uqs = await this.controller.searchUq('', pageStart, pageSize);
        this.openPage(this.page);
    }

    private onSearch = async (key: string) => {
        let pageStart = 0;
        let pageSize = 100;
        this.uqs = await this.controller.searchUq(key, pageStart, pageSize);
    }

    private page = observer(() => {
        let { onUq } = this.controller;
        let header = <SearchBox className="w-100 mx-1"
            label="选择关联UQ "
            onSearch={this.onSearch}
            placeholder="搜索UQ名字"
            maxLength={100} />;
        return <Page back="close" header={header}>
            <List items={this.uqs} item={{ render: this.row, onClick: onUq }} />
        </Page>;
    });

    private row = (uq: DevUQ) => {
        let { owner, name, discription } = uq;
        return <LMR className="py-2 px-3" right={discription}>
            <div>{owner} / {name}</div>
        </LMR>;
    };
}
/*
@observer
export class AppUqs extends React.Component {
    @observable anySelected: boolean = false;
    private list:List;
    private onSelect = (item: UQ, isSelected:boolean, anySelected:boolean) => {
        this.anySelected = anySelected;
    }
    private row = (item: UQ) => {
        let {name, unit, discription} = item;
        return <LMR className="px-3 py-2" right={<small className="text-muted">{discription}</small>}>
            <UnitSpan id={unit} />/{name}
        </LMR>;
    }
    private removeBind = () => {
        if (this.list === null) return;
        let {selectedItems} = this.list;
        if (selectedItems === undefined) return;
        if (selectedItems.length === 0) return;
        store.dev.apps.appRemoveUq(selectedItems.map(v => v.id));
    }
    render() {
        let btnProps = this.anySelected?
            {color:'danger', onClick:this.removeBind, icon:'trash', text:'取消'}:
            {color:'primary', onClick:()=>nav.push(<Uqs/>), icon:'plus', text:'新增'};
        let btn = (p)=><button 
            className={classNames('btn', 'btn-outline-'+p.color, 'btn-sm')} 
            onClick={p.onClick}>
            <i className={"fa fa-" + p.icon} /> {p.text}关联
        </button>;
        let listHeader = <div className="va-row py-1 justify-content-center">{btn(btnProps)}</div>;
        return <Page header="关联UQ">
            <List ref={list=>this.list=list} header={listHeader}
                items={store.dev.apps.uqs}
                item={{render: this.row, onSelect: this.onSelect}} />
        </Page>;
    }
}

@observer
class Uqs extends React.Component {
    onSearch = async (key:string) => {
        await store.dev.apps.searchUq(key);
    }
    onBind(uq: UQ, bind: boolean) {
        store.dev.apps.appBindUq([uq.id]);
    }
    row = (uq: UQ) => {
        let isConnected = store.dev.apps.uqs.find(a => a.id === uq.id) !== undefined;
        let cn = ['btn', 'btn-sm'];
        let btnContent:any, onClick:any;
        if (isConnected) {
            cn.push('btn-success');
            //onClick = ()=>this.onBind(uq, false);
            btnContent = <div>已关联</div>;
        }
        else {
            cn.push('btn-primary');
            onClick = ()=>this.onBind(uq, true);
            btnContent = <button className={classNames(cn)} onClick={onClick}><span><i className="fa fa-check"/> 关联</span></button>;
        }
        return <div className="d-flex justify-content-start py-1 px-3">
            <div className="align-self-center">{uq.name + ' - ' + uq.discription}</div>
            <footer className="ms-auto">{btnContent}</footer>
        </div>
    }
    render() {
        let header = <SearchBox className="w-100 mx-1" 
            onSearch={this.onSearch} 
            placeholder="搜索UQ名字" 
            maxLength={100} />;
        return <Page back="close" header={header}>
            <List items={store.dev.apps.searchedUqs} item={{render: this.row}} loading={null} />
        </Page>;
    }
}
*/