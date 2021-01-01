import * as React from 'react';
import { CAppXAccount } from './CAppXAccount';
import { VPage, Page, List } from 'tonva';
import { observer } from 'mobx-react';

export class VUserList extends VPage<CAppXAccount> {
    async open() {
        this.openPage(this.page);
    }

    private page = observer(() => {
        let {appXAccount, users, renderUser} = this.controller;
        let {name} = appXAccount;
        return <Page header={'用户列表 - ' + name}>
            <List items={users} item={{render: renderUser}} />
        </Page>;
    })
}
