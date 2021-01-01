import * as React from 'react';
import { CAppXAccount } from './CAppXAccount';
import { VPage, Page, List } from 'tonva';
import { VAddUser } from './VUser';
import { observer } from 'mobx-react';

export class VNoRoleUsers extends VPage<CAppXAccount> {
    async open() {
        this.openPage(this.page);
    }

    private page = observer(() => {
        let {appXAccount, renderUser} = this.controller;
        let {name} = appXAccount;
        let coll = this.controller.calcUserColl();
        return <Page header={'普通用户 - ' + name} right={this.renderVm(VAddUser, -2)}>
            <List items={coll.users} item={{render: renderUser}} />
        </Page>;
    })

}
