import * as React from 'react';
import { CAppXAccount, User } from './CAppXAccount';
import { VPage, Page, List, LMR } from 'tonva';
import { VAddUser } from './VUser';
import { observer } from 'mobx-react';

export class VRoleUsers extends VPage<CAppXAccount> {
    async open() {
        this.openPage(this.page);
    }

    private page = observer(() => {
        let {appXAccount} = this.controller;
        let {name} = appXAccount;
        let coll = this.controller.calcUserColl();
        let {roleUsers} = coll;
        return <Page header={'角色用户 - ' + name}>
            <div className="py-0">
                {roleUsers && roleUsers.map((v, index) => {
                    return this.renderRole(v, index);
                })}
            </div>
        </Page>;
    })

    private renderRole = (users:User[], index:number) => {
        let {uqRoles, renderUser} = this.controller;
        let role = uqRoles[index];
        if (!role) return;
        return <div key={index} className="my-3">
            <LMR className="pl-3 pb-1 align-items-end" right={this.renderVm(VAddUser, index+1)}>{uqRoles[index]}</LMR>
            <List items={users} item={{render: renderUser}} none={()=><small className="text-muted">[无]</small>} />
        </div>;
    }

}
