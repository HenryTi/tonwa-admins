import * as React from 'react';
import { observer } from 'mobx-react';
import { VPage, Page } from 'tonva';
import { List, SearchBox, LMR, FA } from 'tonva';
import { CUsers, AppUsers } from './CUsers';

export class VApps extends VPage<CUsers> {
    async open() {
        this.openPage(this.page);
    }

    private renderRow = (appUsers: AppUsers, index: number): JSX.Element => {
        let { app, more, users } = appUsers;
        let { name, discription } = app;
        let right = <small className="text-muted">{discription}</small>;
        return <div className="d-block px-3 py-2">
            <LMR className="mb-2" right={right}>
                <FA name="address-card-o" className="text-primary me-3" />
                <b>{name}</b>
            </LMR>
            <div>
                <small className="text-muted">用户: </small>
                {users.length === 0 ?
                    '[无]' :
                    users.map(u => u.assigned || u.nick || u.name).join(', ') + (more === true ? ' ...' : '')}
            </div>
        </div>;
    }

    private page = observer(() => {
        let { appUsersList, searchApp, onAppsClick } = this.controller;
        let searchBox = <SearchBox className="w-100 pe-1"
            onSearch={searchApp}
            placeholder="搜索App"
            allowEmptySearch={true} />;
        return <Page header={searchBox}>
            <List items={appUsersList}
                item={{ render: this.renderRow, onClick: onAppsClick, key: (item => item.app.id) }} />
        </Page>;
    });
}
