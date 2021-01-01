import * as React from 'react';
import {observer} from 'mobx-react';
import {PageHeaderProps, renderPageHeader} from './pageHeader';
import { TabsProps, TabsView } from './tabs';
import { ScrollProps, ScrollView, PageWebNav, WebNavScrollView } from './scrollView';
import { nav } from '../nav';

export interface IVPage {
	content():JSX.Element;
	header():JSX.Element|string;
	footer():JSX.Element;
}

export interface PageProps extends ScrollProps {
    back?: 'close' | 'back' | 'none';
    header?: boolean | string | JSX.Element;
    right?: JSX.Element;
    footer?: JSX.Element;
    logout?: boolean | (()=>Promise<void>);
	headerClassName?: string;
	className?: string;
	afterBack?: () => void;
	tabsProps?: TabsProps;
	webNav?: PageWebNav;
}

@observer
export class Page extends React.Component<PageProps> {
	private tabsView: TabsView;
    constructor(props: PageProps) {
		super(props);
		let {tabsProps} = props;
		if (tabsProps) {
			this.tabsView = new TabsView(tabsProps);
		}
	}

	private renderHeader(webNav?: PageWebNav) {
		const {back, header, right, headerClassName, afterBack, logout} = this.props;
		if (header === false) return;
		//const {webNav} = this.props;
		let inWebNav = false;
		let pageHeaderProps:PageHeaderProps = {
			back,
			center: header as any,
			right,
			logout,
			className: headerClassName,
			afterBack,
		};
		if (webNav !== undefined) {
			inWebNav = true;
			let {renderPageHeader: rph} = webNav;
			if (rph) return rph(pageHeaderProps);
		}
		else {
			inWebNav = false;
		}
		return renderPageHeader(pageHeaderProps, inWebNav);
		/*
		let pageHeader = header !== false && <PageHeader 
			back={back} 
			center={header as any}
			right={right}
			logout={this.props.logout}
			className={headerClassName}
			afterBack={afterBack}
			/>;
		return pageHeader;
		*/
	}

	private renderFooter(webNav?: PageWebNav) {
		const {footer} = this.props;
		if (!footer) return;
		let elFooter = <footer>{footer}</footer>;
		if (webNav) return elFooter;
		return <>
			<section className="tv-page-footer">{elFooter}</section>
			{elFooter}
		</>;
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// You can also log the error to an error reporting service
		//logErrorToMyService(error, errorInfo);
		debugger;
	}
	
    render() {
		if (this.tabsView) {
			return React.createElement(this.tabsView.content);
		}
		const {onScroll, onScrollTop, onScrollBottom, children, className, webNav} = this.props;
		let pageWebNav:PageWebNav;
		if (!webNav) {
			pageWebNav = nav.pageWebNav;
		}
		else {
			pageWebNav = webNav;
		}
		let content = <>
			{this.renderHeader(pageWebNav)}
			<main>{children}</main>
			{this.renderFooter(pageWebNav)}
		</>;
		if (pageWebNav) {
			return <WebNavScrollView
				onScroll={onScroll}
				onScrollTop={onScrollTop}
				onScrollBottom={onScrollBottom}
				className={className}
				webNav={pageWebNav}
			>
				{content}
			</WebNavScrollView>;
		}
		else {
			return <ScrollView
				onScroll={onScroll}
				onScrollTop={onScrollTop}
				onScrollBottom={onScrollBottom}
				className={className}
			>
				{content}
			</ScrollView>;
		}
	}
}
