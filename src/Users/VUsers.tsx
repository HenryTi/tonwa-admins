import * as React from 'react';
import { observer } from 'mobx-react';
import { VPage, Page, LMR } from 'tonva';
import { List, SearchBox, FA } from 'tonva';
import { CUsers, UserApps } from './CUsers';

export class VUsers extends VPage<CUsers> {
    async open() {
        this.openPage(this.page);
    }

    private renderRow = (userApps: UserApps, index:number):JSX.Element => {
        let {user, apps} = userApps;
        let {name, nick, assigned} = user;
        let left = <FA name="user-o" size="lg" className="text-info mx-3 mt-2" fixWidth={true} />;
        return <LMR className="py-2" left={left}>
            <div className="mb-2">                
                <b>{assigned || nick || name}</b>
            </div>
            <div className="d-flex flex-wrap mt-1">
                {   apps.length===0?
                    <small className="text-muted">[无]</small>
                    :
                    apps.map(a => this.box(a.name, 'px-2 text-info border-muted bg-white'))
                }
            </div>
        </LMR>;
    }

    private box = (text:string, cn:string) => {
        return <div className={'mr-3 mb-1 py-1 small border rounded ' + cn} key={text}>{text}</div>;
    }

    private page = observer(() => {
        let {userAppsList, searchUser, onUsersClick} = this.controller;
        let searchBox = <SearchBox className="w-100 pr-1" label="App管理员 &nbsp; "
            onSearch={searchUser} 
            placeholder="搜索管理员" 
            allowEmptySearch={true} />;
        return <Page header={searchBox}>
            <List items={userAppsList} 
                item={{render: this.renderRow, onClick:onUsersClick, key: (item=>item.user.id)}} />
        </Page>;
    });
}

