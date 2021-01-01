import * as React from 'react';
import {observer} from 'mobx-react';
import {Prop, Media, PropGrid} from 'tonva';
import {nav, Page}  from 'tonva';
import {caches} from 'store';
import {span} from './span';

export interface UserLinkProps {
    className?: string;
    id: number;
    assigned?: string;
    isLink?: boolean;
}

@observer
export class UserSpan extends React.Component<UserLinkProps> {
    onClick = (evt) => {
        evt.preventDefault();
        nav.push(<UserInfo id={this.props.id} />);
        return false;
    }
    render() {
        let {id, className, assigned, isLink} = this.props;
        let api = caches.users.get(id);
        let content:any;
        if (api === null) {
            content = id;
        }
        else {
            let {name, nick} = api;
            if (assigned !== undefined) nick = assigned;
            if (name !== undefined) {
                content = nick? <><b>{nick}</b> {name}</> : <><b>{name}</b></>;
            }
            else {
                content = id;
            }
        }
        return span(isLink, className, this.onClick, content);
    }
}

@observer
class UserInfo extends React.Component<UserLinkProps> {
    private rows:Prop[];
    render() {
        let uq = caches.users.get(this.props.id);
        let {name, nick, icon} = uq;
        this.rows = [
            '',
            {type: 'component', component: <Media icon={icon} main={nick} discription={name} />},
            '',
        ];
        return <Page header={'用户 - 详细资料'}>
            <PropGrid rows={this.rows} values={this.props} />
        </Page>;
    }
}
