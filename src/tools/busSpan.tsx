import * as React from 'react';
import {observer} from 'mobx-react';
import {Prop, Media, PropGrid} from 'tonva';
import {nav, Page}  from 'tonva';
import {appIcon} from 'consts';
import {caches} from 'store';
import {IdDates} from './idDates';
import {span} from './span';
import {UnitSpan} from './unitSpan';

export interface BusLinkProps {
    className?: string;
    id: number;
    isLink?: boolean;
}

@observer
export class BusSpan extends React.Component<BusLinkProps> {
    onClick = (evt) => {
        evt.preventDefault();
        nav.push(<BusInfo id={this.props.id} />);
        return false;
    }
    render() {
        let {id, className, isLink} = this.props;
        let api = caches.buses.get(id);
        let content:any;
        if (api === null) {
            content = id;
        }
        else {
            let {name, owner} = api;
            if (name !== undefined) {
                content = <>{name} / {owner}</>;
            }
            else {
                content = id;
            }
        }
        return span(isLink, className, this.onClick, content);
    }
}

@observer
class BusInfo extends React.Component<BusLinkProps> {
    private rows:Prop[];
    render() {
        let uq = caches.buses.get(this.props.id);
        let {name, discription, unit, date_init, date_update} = uq;
        let disp = <div>
            <div>{discription}</div>
            <IdDates date_update={date_update} date_init={date_init} />
        </div>;
        this.rows = [
            '',
            {type: 'component', component: <Media icon={appIcon} main={name} discription={disp} />},
            '',
            {type: 'component', label: '所有者', component: <div className="py-2"><UnitSpan id={unit} isLink={true} /></div> },
        ];
        return <Page header={'UQ - 详细资料'}>
            <PropGrid rows={this.rows} values={this.props} />
        </Page>;
    }
}
