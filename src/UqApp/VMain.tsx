import * as React from 'react';
import { VPage, TabCaptionComponent, Page, Tabs, Image } from 'tonva';
import { CApp } from './CApp';
// import { setting } from 'configuration';

const color = (selected: boolean) => selected === true ? 'text-primary' : 'text-muted';

export class VMain extends VPage<CApp> {
    async open() {
        this.openPage(this.render);
    }
    // opensrc = () => {
    //     window.open(setting.downloadAppurl);
    // }

    render = (param?: any): JSX.Element => {
        let { cHome, /*cMe, cPosts, cMedia, cTemplets*/ } = this.controller;
        /*
        let faceTabs = [
            { name: 'home', label: '绩效', icon: 'tasks', content: cHome.tab, },
            //    onShown:cPosts.loadList, notify: undefined },
            //{ name: 'image', label: '图片', icon: 'vcard', content: cMedia.tab, onShown:cMedia.loadList },
            //{ name: 'templet', label: '模板', icon: 'vcard', content: cTemplets.tab, onShown:cTemplets.loadList },
            { name: 'me', label: '我的', icon: 'user', content: cMe.tab }
        ].map(v => {
            let { name, label, icon, content } = v;
            return {
                name: name,
                caption: (selected: boolean) => TabCaptionComponent(label, icon, color(selected)),
                content: content,
                //notify: notify,
                //onShown: onShown,
            }
        });
        */
        return <Page header={false} headerClassName={"bg-info"} >
        </Page>;
        // <Tabs tabs={faceTabs} />
    }
}
