import * as React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { VPage, Page, nav, Prop, Media, PropGrid, DropdownActions, List, LMR, FA } from 'tonva';
import { AppController/*, UqAccess*/ } from '.';
import { IdDates, UnitSpan, ServerSpan, UnitName } from 'tools';
import { EditPage } from './editPage';
import { SearchUqPage } from './appUqs';
import { DevUQ } from 'model';
//import { DevModel } from 'model';

export class AppPage extends VPage<AppController> {
    async open() {
        //this.uqs.list = this.controller.uqs;
        this.openPage(this.page);
    }

    private editItem = async () => {
        await this.openVPage(EditPage);
        //nav.push(<EditAppPage {...this.props} />);
    }

    private deleteItem = async () => {
        if (window.confirm('真的要删除吗？系统删除时并不会检查相关引用，请谨慎') === true) {
            await this.controller.deleteApp();
            nav.pop();
        }
    }

    private page = observer((): JSX.Element => {
        let { app, uqs } = this.controller;
        //let mainId = mainUq === undefined? 0: mainUq.id;
        let { unit, name, caption, discription, icon, server, date_init, date_update } = app;
        let disp = <div>
            <div>{discription}</div>
            <IdDates date_update={date_update} date_init={date_init} />
        </div>;
        let menuItems = [
            // {icon: 'cogs', caption:'设置关联UQ', action: ()=>nav.push(<AppUqs />)},
            { caption: '修改App', action: this.editItem, icon: 'edit' },
            { caption: '删除', action: this.deleteItem, icon: 'trash-o' }
        ];

        let right = <DropdownActions actions={menuItems} className="btn-primary me-2" />;
        let spanCaption = caption ?
            <>{name}: <b>{caption}</b></> :
            <b>{name}</b>;
        let rows: Prop[] = [
            '',
            {
                type: 'component',
                component: <Media icon={icon} main={spanCaption} discription={disp} />
            },
            '',
            {
                type: 'component',
                label: '开发号',
                component: <div className="py-2"><UnitSpan id={unit} isLink={true} /></div>
            },
            /*
            {
                type: 'component', 
                label: 'Service',
                vAlign: 'stretch',
                component: <ServiceRow />,
            },*/
            {
                label: 'URL',
                name: 'url',
                type: 'string',
            },
            {
                type: 'component',
                label: '服务器',
                component: <ServerSpan id={server} />
            },
            '',
            //this.uqs,
        ];
        let btnAddUq = <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => this.openVPage(SearchUqPage)}>增加UQ</button>;
        //let slaveUqs = uqs.filter(v => v.id !== mainId);
        return <Page header={'App - ' + name} right={right}>
            <PropGrid rows={rows} values={app} />
            <LMR className="mx-3 mt-3 mb-1" right={btnAddUq}>关联UQ</LMR>
            <List
                items={uqs}
                item={{ render: this.renderUqRow, onClick: this.uqClick }} />
        </Page>
    })

    private uqClick = (uq: DevUQ) => {
        this.controller.onUq(uq);
    }

    private renderUqRow = (uq: DevUQ, index: number): JSX.Element => {
        if (uq === undefined) return null;
        let { name, discription, unit } = uq;
        let right = discription && <div className="small text-muted"> &nbsp; {discription}</div>;
        let isMain = this.controller.isMain(uq);
        let cn = classNames("px-3 py-2 align-items-center bg-white", isMain === true && "font-weight-bold my-2");
        return <LMR className={cn} right={right}>
            {isMain === true && <FA className="text-warning me-3" name="star-o" />}
            <UnitName id={unit} /> / {name}
        </LMR>
    }
}
