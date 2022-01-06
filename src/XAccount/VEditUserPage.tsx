import * as React from 'react';
import classNames from 'classnames';
import { CAppXAccount, User } from "./CAppXAccount";
import { VPage, Page, FA } from "tonva";
import { UserSpan } from 'tools/userSpan';

export class VEditUserPage extends VPage<CAppXAccount> {
    private user: User;
    async open(user: User) {
        this.user = user;
        this.openPage(this.page);
    }

    private row = (caption: string, cn: string,
        isChecked: boolean,
        isMeAdmin: boolean,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>) => {
        if (!caption) return;
        return <label className={classNames(
            "px-3 py-2 m-0 d-flex bg-white mb-1 w-100 align-items-center",
            { "cursor-pointer": !isMeAdmin })}>
            <input type="checkbox" className="me-4" defaultChecked={isChecked}
                disabled={isMeAdmin}
                onChange={onChange} />
            <span className={cn}>{caption}</span>
        </label>
    }

    private onAdminChanged = async (value: boolean) => {
        let ret = await this.controller.setAppAdmin(this.user, value);
        if (ret === undefined) this.closePage();
        else alert(ret);
    }

    private onRoleChanged = async (value: boolean, roleNum: number) => {
        let ret = await this.controller.setAppRole(this.user, roleNum, value);
        // if (ret === undefined) this.closePage();
        // else alert(ret);
        if (ret !== undefined) alert(ret);
    }

    private onDelUer = async () => {
        let ret = await this.controller.delUser(this.user);
        if (ret === undefined) this.closePage();
        else alert(ret);
    }

    private page = () => {
        let { isAdmin, roleBins } = this.user;
        let header = <>用户 -&nbsp;<UserSpan id={this.user.id} /></>;
        let btnDel = this.user.id !== this.controller.user.id
            && <div className="text-right m-3"><button onClick={this.onDelUer}
                className="btn btn-sm btn-outline-primary"
            ><FA name="trash" /> 从App中移除</button>
            </div>;
        let isMeAdmin = this.user.id === this.controller.user.id;
        let onAdminChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            await this.onAdminChanged(event.target.checked);
        }
        return <Page header={header}>
            <div className="my-3">
                {this.row('App管理员', 'text-success font-weight-bold', isAdmin, isMeAdmin, onAdminChange)}
                <div className="h-1c" />
                {this.controller.uqRoles.map((v, index) => {
                    let onRoleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
                        await this.onRoleChanged(event.target.checked, index);
                    }
                    let isChecked = (roleBins & (1 << index)) !== 0;
                    return this.row(v, 'text-primary', isChecked, false, onRoleChange);
                })}
                {btnDel}
            </div>
        </Page>
    }
}
