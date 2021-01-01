import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { IVPage } from './page';
import { IObservableValue } from 'mobx';
import '../../css/va-tab.css';
import { ScrollView } from './scrollView';

export type TabCaption = (selected:boolean) => JSX.Element;

export interface TabProp {
    name: string;
    caption: TabCaption;
	content?: () => JSX.Element;
	page?: IVPage;
    notify?: IObservableValue<number>;
    load?: () => Promise<void>;
	onShown?: () => Promise<void>;
	isSelected?: boolean;
	onScroll?: () => void;
	onScrollTop?: () => Promise<boolean>;
	onScrollBottom?: () => Promise<void>;
	className?: string;
}

export interface TabsProps {
    tabs: TabProp[];
    tabPosition?: 'top' | 'bottom';
    size?: 'sm' | 'lg' | 'md';
    tabBg?: string;
    contentBg?: string;
    sep?: string;
    selected?: string;
    borderColor?: string;
    borderWidth?: string;
}

class Tab {
	@observable private loaded: boolean = false;
    name: string;
    @observable selected: boolean;
    caption: TabCaption;
	contentBuilder: ()=>JSX.Element;
	page: IVPage;
    notify: IObservableValue<number>;
    load?: () => Promise<void>;
	onShown?: () => Promise<void>;
	onScroll?: () => void;
	onScrollTop?: () => Promise<boolean>;
	onScrollBottom?: () => Promise<void>;
	className?: string;

    private _content: JSX.Element;
    
    get content(): JSX.Element {
		if (this.load && this.loaded === false) return null;
		if (this.selected === false) return this._content;
		if (!this._content) {
			if (this.contentBuilder !== undefined) {
				this._content = this.contentBuilder();
			}
			else if (this.page !== undefined) {
				this._content = this.page.content();
			}
			else {
				this._content = <div className="p-5">tab 应该定义content或者page</div>;
			}
		}
		return this._content;
    }

    async shown() {
        if (this.onShown !== undefined) {
            await this.onShown();
        }
        if (this.load !== undefined) {
			if (this.loaded === false) {
				await this.load();
				this.loaded = true;
			}
        }
    }
}

export const TabCaptionComponent = (label:string, icon:string, color:string) => <div 
    className={'d-flex justify-content-center align-items-center flex-column cursor-pointer ' + color}>
    <div><i className={'fa fa-lg fa-' + icon} /></div>
    <small>{label}</small>
</div>;

//export const TabCaption = TabCaptionComponent;

export class TabsView {
	private props: TabsProps;
    private size: string;
    private tabBg: string;
    //private contentBg: string;
    private sep: string;
    @observable private selectedTab: Tab;
    @observable private tabArr: Tab[];

    constructor(props: TabsProps) {
		this.props = props;
		let {size, tabs, tabBg: tabBack, sep, selected} = props;
		this.size = size || 'md';
        this.tabArr = tabs.map(v => {
            let tab = new Tab();
            let {name, caption, content, page, notify, load, onShown, isSelected, onScroll, onScrollTop, onScrollBottom, className} = v;
			tab.name = name;
			if (isSelected === true || name === selected) {
				this.selectedTab = tab;
			}
			tab.selected = false;
			tab.caption = caption;
			if (content !== undefined) {
				tab.contentBuilder = content;
			}
			else if (page !== undefined) {
				tab.page = page;
				//contentBuilder = () => {return page.content()};
			}
            tab.notify = notify;
            tab.load = load;
			tab.onShown = onShown;
			tab.onScroll = onScroll;
			tab.onScrollTop = onScrollTop;
			tab.onScrollBottom = onScrollBottom;
			tab.className = className;
            return tab;
        });
        this.tabBg = tabBack;
        //this.contentBg = contentBack;
        this.sep = sep;
        if (this.selectedTab === undefined) {
			this.selectedTab = this.tabArr[0];
		}
        this.selectedTab.selected = true;
    }

    tabClick = async (tab:Tab) => {
		if (!tab) {
			tab = this.selectedTab;
			if (tab === undefined) {
				if (this.tabArr === undefined) return;
				if (this.tabArr.length === 0) return;
				tab = this.tabArr[0];
			}
		}

        this.selectedTab.selected = false;
        tab.selected = true;
		this.selectedTab = tab;
		
		await tab.shown();
    }

	/*
    showTab(tabName: string) {
        let tab = this.tabs.find(v => v.name === tabName);
        if (tab === undefined) return;
        if (this.selectedTab !== undefined) this.selectedTab.selected = false;
        tab.selected = true;
        this.selectedTab = tab;
	}
	*/

	private tabs = observer(() => {
        let {tabPosition, borderColor} = this.props;
        let bsCur:React.CSSProperties, bsTab:React.CSSProperties
        if (borderColor) {
            bsCur = {
                borderColor: borderColor,
                borderStyle: 'solid',
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
            }
            bsTab = {
                borderColor: borderColor,
                borderStyle: 'solid',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderLeftWidth: 0,
                borderRightWidth: 0,
            }
            if (tabPosition === 'top') {
                bsCur.borderBottomWidth = 0;
                bsCur.borderTopLeftRadius = 10;
                bsCur.borderTopRightRadius = 10;
                bsTab.borderTopWidth = 0;
            }
            else {
                bsCur.borderTopWidth = 0;
                bsCur.borderBottomLeftRadius = 10;
                bsCur.borderBottomRightRadius = 10;
                bsTab.borderBottomWidth = 0;
            }
        }
		let cn = classNames('tv-tabs', this.tabBg, this.sep, 'tv-tabs-' + this.size);
		let tabs = <div className={cn}>
            {this.tabArr.map((v,index) => {
                let {selected, caption, notify} = v;
                let notifyCircle:any;
                if (notify !== undefined) {
                    let num = notify.get();
                    if (num !== undefined) {
                        if (num > 0) notifyCircle = <u>{num>99?'99+':num}</u>;
                        else if (num < 0) notifyCircle = <u className="dot" />;
                    }
                }
                return <div key={index} onClick={()=>this.tabClick(v)} style={selected===true? bsCur:bsTab}>
					<div>
					{notifyCircle}
					{caption(selected)}
					</div>
                </div>
            })}
		</div>;
		return tabs;
	});

	content = observer(() => {
		let displayNone:React.CSSProperties = {visibility: 'hidden'};
		return <>
			{this.tabArr.map((v,index) => {
				let {tabPosition} = this.props;
				let {content, page, onScroll, onScrollTop, onScrollBottom, className} = v;
				let tabs = React.createElement(this.tabs);
				let pageHeader:any, pageFooter:any;
				if (page !== undefined) {
					pageHeader = page.header();
					pageFooter = page.footer();
				}
				let header:any, footer:any;
				let visibility:React.CSSProperties = {visibility:'hidden'};
				if (tabPosition === 'top') {
					header = <>
						<section className="tv-page-header">
							<header>{tabs}{pageHeader}</header>
						</section>
						<header style={visibility}>{tabs}{pageHeader}</header>
					</>;
					if (pageFooter !== undefined) {
						footer = <>
							<footer style={visibility}>{pageFooter}</footer>
							<section className="tv-page-footer">
								<footer>{pageFooter}</footer>
							</section>
						</>;
					}
				}
				else {
					if (pageHeader !== undefined) {
						header = <>
							<section className='tv-page-header'>
								<header>{pageHeader}</header>
							</section>
							<header style={visibility}>{pageHeader}</header>
						</>;
					}
					footer = <>
						<footer style={visibility}>{pageFooter}{tabs}</footer>
						<section className='tv-page-footer'>
							<footer>{pageFooter}{tabs}</footer>
						</section>
					</>;
				}

				let style:React.CSSProperties;
				if (v.selected===false) style = displayNone;
				return <ScrollView key={index} className={className}
					style={style}
					onScroll={onScroll} onScrollTop={onScrollTop} onScrollBottom={onScrollBottom}>
					{header}
					{content}
					{footer}
				</ScrollView>;
			})}
		</>;
	});

    render() {
		let {tabPosition} = this.props;
		let tabs = React.createElement(this.tabs);
		let header:any, footer:any;
		let visibility:React.CSSProperties = {display:'none'};
		if (tabPosition === 'top') {
			header = <header>{tabs}</header>;
		}
		else {
			footer = <footer>{tabs}</footer>;
		}
		return <>
			{header}
			{this.tabArr.map((v,index) => {
				let style:React.CSSProperties;
				if (v.selected===false) style = visibility;
				return <div key={index} className={classNames(v.className)} style={style}>
					{v.content}
				</div>;
			})}
			{footer}
		</>;
    }
};

@observer export class Tabs extends React.Component<TabsProps> {
	private readonly tabsView: TabsView;
    constructor(props: TabsProps) {
		super(props);
		this.tabsView = new TabsView(props);
		setTimeout(() => {
			this.tabsView.tabClick(undefined);
		}, 100);
    }

    render() {
		return this.tabsView.render();
    }
};

@observer export class RootTabs extends React.Component<TabsProps> {
	private readonly tabsView: TabsView;
    constructor(props: TabsProps) {
		super(props);
		this.tabsView = new TabsView(props);
		setTimeout(() => {
			this.tabsView.tabClick(undefined);
		}, 100);
    }

    render() {
		return React.createElement(this.tabsView.content);
    }
};
