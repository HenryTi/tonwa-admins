import React from 'react';
import { UqActionProps } from './uqActionProps';
import { DevUQ } from 'model';
import { observer } from 'mobx-react';
import { ResultSections, Section } from './resultSections';
import { nav, Page } from 'tonva';

interface CompileResultProps extends UqActionProps {
    uq: DevUQ;
    caption?: string;
    action: 'upload' | 'test' | 'deploy';
    actionName: string;
    res: Response;
    abortController: AbortController;
}

@observer
export class CompileResultPage extends React.Component<CompileResultProps> {
    private resultSections: ResultSections;
    private timeHandler: any;
    constructor(props: CompileResultProps) {
        super(props);
        this.resultSections = new ResultSections(undefined);
    }
    private autoScrollEnd: boolean = false;
    private autoScroll = true;
    private startAutoScrollToBottom() {
        if (this.autoScrollEnd === true) return;
        this.autoScroll = true;
        if (this.timeHandler !== undefined) return;
        this.timeHandler = setInterval(() => {
            if (this.autoScroll === false) return;
            var pane = document.getElementById('bottomDiv');
            pane && pane.scrollIntoView();
        }, 100);
    }
    private endAutoScrollToBottom() {
        setTimeout(() => {
            this.autoScroll = false;
            this.autoScrollEnd = true;
            if (this.timeHandler === undefined) return;
            clearInterval(this.timeHandler);
            this.timeHandler = undefined;
        }, 300);
    }
    private pauseAutoScrollToBottom() {
        this.autoScroll = false;
    }
    private getParent(el: HTMLElement): HTMLElement {
        if (!el) return;
        if (el.tagName === 'MAIN') return el;
        return this.getParent(el.parentElement);
    }
    private topIntoView() {
        var pane = document.getElementById('topDiv');
        pane && pane.scrollIntoView();
    }
    private bottomIntoView() {
        var pane = document.getElementById('bottomDiv');
        pane && pane.scrollIntoView();
    }
    private doubleClick = () => {
        if (this.autoScrollEnd === true) return;
        var pane = document.getElementById('scrollDiv');
        let main = this.getParent(pane);
        if (!main) return;
        if (main.scrollTop >= main.scrollHeight / 2) {
            this.topIntoView();
        }
        else {
            this.bottomIntoView();
        }
    }
    private lastScrollTop = 0;
    private onScroll = (e: any) => {
        let el = e.target as HTMLBaseElement;
        let { scrollTop, scrollHeight, offsetHeight } = el;
        if (scrollTop <= this.lastScrollTop) {
            this.pauseAutoScrollToBottom();
        }
        else if (scrollTop + offsetHeight > scrollHeight - 30) {
            this.startAutoScrollToBottom();
        }

        this.lastScrollTop = scrollTop;
    }

    private uintToString(uintArray: number[]): string {
        let encodedString = String.fromCharCode(...uintArray);
        try {
            return decodeURIComponent(escape(encodedString));
        }
        catch (err) {
            return encodedString;
        }
    }

    private startTime: Date;
    private total: number;
    private async pump(reader: ReadableStreamDefaultReader<any>, resultSections: ResultSections): Promise<boolean> {
        let ret = await reader.read();
        let { done, value } = ret;
        if (done) {
            this.resultSections.seconds = (new Date().getTime() - this.startTime.getTime());
            let { action, services } = this.props;
            if (services !== undefined) {
                let now = Date.now() / 1000;
                for (let service of services) {
                    switch (action) {
                        case 'test': service.compile_time = now; break;
                        case 'deploy': service.deploy_time = now; break;
                    }
                }
            }
            return true;
        }
        let buf: Uint8Array = value;
        for (let p = 0; p < buf.length; p += 0x4000) {
            let sec = buf.slice(p, p + 0x4000);
            let text = this.uintToString(sec as any);
            //this.resultSections.add(text);
            resultSections.add(text);
            this.total += value.byteLength;
        }
        return false;
    }

    async componentDidMount() {
        nav.regConfirmClose(async (): Promise<boolean> => {
            if (this.resultSections.seconds >= 0) return true;
            return new Promise<boolean>((resolve, reject) => {
                try {
                    if (window.confirm(`正在${this.props.actionName}中，真的要中止吗？`) === true) {
                        try {
                            this.props.abortController.abort();
                        }
                        catch (err) {
                            console.error(err);
                        }
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
                catch (err) {
                    reject(err);
                }
            })
        });

        this.startAutoScrollToBottom();
        try {
            let reader = this.props.res.body.getReader();
            this.startTime = new Date();
            this.total = 0;
            let containerElement = document.getElementById('scrollDiv') as HTMLDivElement;
            let resultSections = new ResultSections(containerElement);
            while (true) {
                let retPump = await this.pump(reader, resultSections);
                if (retPump === true) break;
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            this.endAutoScrollToBottom();
        }
    }
    private renderText = (section: Section, index: number): JSX.Element => {
        return <section.render key={section.rowId} />;
    }
    render() {
        let { uq, actionName, caption } = this.props;
        let { seconds, /*sections, */hasError } = this.resultSections;
        let finish = hasError === true ? '发生错误' : '完成';
        let header: string;
        if (caption) header = '[' + caption + '] ';
        else header = '';
        if (uq !== undefined) header += uq.name + ' - ';
        header += actionName + (seconds >= 0 ? finish : "中...");
        return <Page header={header} back="close" onScroll={this.onScroll}>
            <div id='topDiv' />
            <div id='scrollDiv'
                onDoubleClick={this.doubleClick}
                className='py-2 px-3'
                style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                {/*sections.map(this.renderText)*/}
            </div>
            {seconds >= 0 ? <div className='px-3 pb-3' style={{ color: 'red', fontWeight: 'bold' }}>
                {actionName}完成。共计用时{Math.floor(seconds / 1000)}秒
            </div> : undefined}
            <div id='bottomDiv' />
        </Page>;
    }
}
