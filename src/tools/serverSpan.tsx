import * as React from 'react';
import {observer} from 'mobx-react';
import {Prop, Media, PropGrid} from 'tonva';
import {nav, Page}  from 'tonva';
import {appIcon} from '../consts';
import {caches} from '../store';
import {span} from './span';
import {UnitSpan} from './unitSpan';

export interface ServerSpanProps {
    className?: string;
    id: number;
    isLink?: boolean;
}

@observer
export class ServerSpan extends React.Component<ServerSpanProps> {
    onClick = (evt) => {
        evt.preventDefault();
        nav.push(<ServerInfo id={this.props.id} />)
        return false;
    }
    render() {
        let {id, isLink, className} = this.props;
        let server = caches.servers.get(id);
        let content:any;
        if (server === null) {
            content = id;
        }
        else {
            let {ip, name, url} = server;
            if (name !== undefined) {
                content = <>
                    {name}&nbsp; <small className="text-muted">{url || ip}</small>
                </>;
            }
            else {
                content = id;
            }
        }
        if (!content) content = <small className="text-muted">[无]</small>;
        return span(isLink, className, this.onClick, content);
    }
}

class ServerInfo extends React.Component<ServerSpanProps> {
    private rows:Prop[];
    render() {
        let server = caches.servers.get(this.props.id);
        let {discription, ip, unit} = server;
        /*
        let disp = <div>
            <div>{discription}</div>
            <IdDates date_update={date_update} date_init={date_init} />
        </div>;
        */
        this.rows = [
            '',
            {type: 'component', component: <Media icon={appIcon} main={discription} discription={ip} />},
            '',
            {type: 'component', label: '所有者', component: <div className="py-2"><UnitSpan id={unit} isLink={true} /></div> },
            {type: 'string', label: '云服务', name: 'cloud'},
        ];
        return <Page header={'服务器 - 详细资料'}>
            <PropGrid rows={this.rows} values={this.props} />
        </Page>;
    }
}
