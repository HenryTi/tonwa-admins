import * as React from 'react';
import { CAppXAccount, User } from "./CAppXAccount";
import { View, LMR, Image, FA } from "tonva";
import { caches } from 'store';
import { observer } from 'mobx-react';

export class VUser extends View<CAppXAccount> {
    render(user: User):JSX.Element {
		//return <this.row user={user} />;
		return React.createElement(this.row, {user});
    }

    private row = observer((props: {user: User}) => {
        let {user} = props;
        let u = caches.users.get(user.id);
        if (u === null) return;
        let {name, nick, icon} = u;
        let {assigned, isAdmin, roleBins} = user;
        if (assigned !== undefined) nick = assigned;
        if (name !== undefined) {
            let {uqRoles, showEditUserPage, user:_user} = this.controller;
            let left = <Image className="w-3c h-3c mr-3" src={icon} />;
            let isMe = user.id === _user.id;
            let caption:any = isMe === true?
                <div>
                    {nick? <><b>{nick}</b> {name}</> : <><b>{name}</b></>} 
                    &nbsp; <small className="text-muted">[自己]</small>
                </div>
                :
                <div>{nick? <>{nick} <small>{name}</small></> : <>{name}</>}</div>;
            let divRoles:any[] = [];
            if (uqRoles !== undefined) {
                let len = uqRoles.length;
                for (let i=0; i<len; i++) {
                    if ((roleBins & (1<<i)) === 0) continue;
                    divRoles.push(this.box(uqRoles[i], 'px-2 text-primary border-primary bg-white'));
                }
            }

            return <LMR className="px-3 py-3 cursor-pointer" left={left} onClick={()=>showEditUserPage(user)}>
                {caption}
                <div className="d-flex flex-wrap mt-1">
                    {isAdmin===true && this.box('管理员', 'px-2 text-success border-success bg-light')}
                    {divRoles}
                </div>
            </LMR>;
        }
    });

    private box = (text:string, cn:string) => {
        return <div className={'mr-3 py-0 small border rounded ' + cn} key={text}>{text}</div>;
    }
}

export class VAddUser extends View<CAppXAccount> {
    render(roleNum:number):JSX.Element {
        return <button 
            className="btn btn-sm btn-success align-self-center mr-2" 
            onClick={()=>this.controller.showAddUserPage(roleNum)}>
                <FA name="plus" />
        </button>;
    }
}
