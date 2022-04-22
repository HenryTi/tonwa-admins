import * as React from 'react';
import { CDevelopers } from "./CDevelopers";
import { Page, VPage, List, LMR, Image, FA } from "tonva";
import { UserUqsBuses } from 'store/adminDevs';
import { observer } from 'mobx-react';
import { caches } from 'store';

export class VDevelopers extends VPage<CDevelopers> {
    async open() {
        this.openPage(this.page);
    }

    private renderUserUqsBuses = (user: number, index: number) => {
        let userUqsBuses: UserUqsBuses = this.controller.adminDevs.getUserUqsBuses(user);
        let { uqs, buses } = userUqsBuses;
        let userObj = caches.users.get(user);
        let content: any;
        if (userObj !== null) {
            let { name, nick, icon } = userObj;
            content = <LMR className="w-100"
                left={<Image className="w-3c h-3c me-4" src={icon} />}
                right={<div className="text-end">uq: {uqs.length}<br />bus: {buses.length}</div>}>
                <div>{nick ? <><b>{nick}</b><br /><small className="text-muted">{name}</small></> : <><b>{name}</b></>}</div>
            </LMR>
        }
        return <div className="px-3 py-2">{content}</div>;
    }

    private onClickUserUqsBuses = (user: number) => {
        this.controller.showUserUqsBuses(user);
    }

    private onAddUser = () => {
        this.controller.showAddDeveloper();
    }

    private page = observer(() => {
        let { adminDevs } = this.controller;
        let { unit, users } = adminDevs;
        let right = <button className="btn btn-sm btn-success align-self-center me-3" onClick={this.onAddUser}><FA name="plus" /></button>
        return <Page header={"开发者 - " + unit.name} right={right}>
            <List className="my-3" items={users}
                item={{ render: this.renderUserUqsBuses, onClick: this.onClickUserUqsBuses }} />
        </Page>
    });
}
