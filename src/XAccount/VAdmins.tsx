import * as React from 'react';
import { CAppXAccount } from './CAppXAccount';
import { VPage, Page, List } from 'tonva';
import { VAddUser } from './VUser';
import { observer } from 'mobx-react';

export class VAdmins extends VPage<CAppXAccount> {
    async open() {
        this.openPage(this.page);
    }

    private page = observer(() => {
        let {appXAccount, renderUser} = this.controller;
        let {name} = appXAccount;
        let coll = this.controller.calcUserColl();
        return <Page header={'管理员 - ' + name} right={this.renderVm(VAddUser, -1)}>
            <List items={coll.admins} item={{render: renderUser}} />
        </Page>;
    })

}
