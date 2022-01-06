import * as React from 'react';
import { CAppXAccount, Coll } from './CAppXAccount';
import { VPage, Page, PropGrid, Media, Prop, FA, LMR } from 'tonva';
import { IdDates } from 'tools';
import { observer } from 'mobx-react';

export class VApp extends VPage<CAppXAccount> {
    async open() {
        this.openPage(this.page)
    }

    private page = observer(() => {
        let { appXAccount, showDetail, users, showUserList, calcUserColl } = this.controller;
        let coll = calcUserColl();
        let { name, discription, icon, date_init, date_update } = appXAccount;
        let disp = <div>
            <div>{discription}</div>
            <IdDates date_update={date_update} date_init={date_init} />
        </div>;
        let right = <button className="btn btn-success btn-sm me-2 align-self-center"
            onClick={showDetail}><FA name="ellipsis-h" fixWidth={true} /></button>;
        let rows: Prop[] = [
            '',
            {
                type: 'component',
                component: <Media icon={icon} main={name} discription={disp} />
            },
            '',
        ];
        return <Page header={"App - " + name} right={right}>
            <PropGrid rows={rows} values={{}} />
            {this.renderAdmins(coll)}
            {this.renderRoles(coll)}
            {this.renderUsers(coll)}
            <div className="h-1c" />
            {this.row('全部用户', users.length, showUserList, 'text-info', 'list')}
        </Page>;
    })

    private row(content: JSX.Element | string, count: number, onClick: () => void, color: string, icon?: string): JSX.Element {
        let left = <FA className={"me-3 " + color} fixWidth={true} name={icon || "user"} size="lg" />;
        let right = <>{count} &nbsp; &nbsp; <FA className="align-self-center" name="angle-right" /></>;
        return <LMR className="my-2 px-3 py-2 bg-white align-items-center"
            onClick={onClick} left={left} right={right}>{content}</LMR>;
    }

    private renderAdmins(coll: Coll): JSX.Element {
        let { showAdmins, unit } = this.controller;
        if (unit.isAdmin === 1) {
            return this.row('管理员', coll.admins.length, showAdmins, 'text-danger');
        }
    }

    private renderRoles(coll: Coll): JSX.Element {
        let { showRoles, roleUserCount } = this.controller;
        let { roleUsers } = coll;
        if (!roleUsers) return;
        return this.row('角色用户', roleUserCount, showRoles, 'text-success');
    }

    private renderUsers(coll: Coll): JSX.Element {
        let { showUsers } = this.controller;
        return this.row('普通用户', coll.users.length, showUsers, 'text-info');
    }
}
