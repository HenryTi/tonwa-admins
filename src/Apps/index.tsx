import * as React from 'react';
import { observer } from 'mobx-react';
import { List, FA, LMR, Badge } from 'tonva';
import { nav, Page, Image } from 'tonva';
import { store } from '../store';
import { NewApp } from './new';
import { UnitApp } from '../model';
import { Info } from './info';

@observer
export default class AppsPage extends React.Component {
    async componentDidMount() {
        await store.loadApps();
    }
    private itemRender(app: UnitApp, index: number) {
        let { name, discription, icon, inUnit } = app;
        let ban;
        if (inUnit === 0)
            ban = <FA className="text-danger" name='ban' />;
        return <LMR className="px-3 py-1"
            left={<Badge><Image src={icon} /></Badge>}
            right={ban}>
            <div className="px-3">
                <div>{name}</div>
                <small className="text-muted">{discription}</small>
            </div>
        </LMR>;
    }
    private appClick(app: UnitApp) {
        nav.push(<Page header="App详细信息">
            <Info app={app} />
        </Page>);
    }
    private newItem() {
        nav.push(<NewApp {...this.props} />);
    }
    render() {
        let right = <button
            className='btn btn-success btn-sm me-1 align-self-center'
            onClick={() => this.newItem()}><FA name="plus" /></button>;
        return <Page header="启停App" right={right}>
            <List items={store.apps} item={{ render: this.itemRender, onClick: this.appClick }} />
        </Page>;
    }
}
