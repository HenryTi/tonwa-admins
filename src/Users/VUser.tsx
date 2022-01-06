import * as React from 'react';
import { observer } from 'mobx-react';
import { VPage, Page, LMR, FA } from 'tonva';
import { List } from 'tonva';
import { CUsers, App } from './CUsers';

export class VUser extends VPage<CUsers> {
    async open() {
        this.openPage(this.page);
    }

    private page = observer(() => {
        let { curUser, curUserApps, onUserEditApps } = this.controller;
        let right = <button className="btn btn-sm btn-success align-self-center me-2" onClick={() => onUserEditApps()}>增减App</button>;
        return <Page header={'用户 - ' + (curUser.assigned || curUser.nick || curUser.name)}
            right={right}>
            <List items={curUserApps} item={{ render: this.renderApp }} />
        </Page>
    })

    private renderApp = (app: App, index: number): JSX.Element => {
        let { name, discription } = app;
        let left = <FA name="caret-square-o-right" size="lg" className="me-3 mt-1 text-info" />;
        let right = <small className="text-muted">{discription}</small>
        return <LMR className="px-3 py-2" left={left} right={right}><b>{name}</b></LMR>
    }
}