import * as React from 'react';
import {nav} from '../nav';

export interface PageHeaderProps {
    back?: 'back' | 'close' | 'none';
    center: string | JSX.Element;
    right?: JSX.Element;
    logout?: boolean | (()=>Promise<void>);
    className?: string;
	afterBack?: () => void;
	ex?: JSX.Element;
}

export function renderPageHeader(props: PageHeaderProps, inWebNav?: boolean) {
    let onBack = async () => {
        await nav.back(); // 这个才会显示confirm box，在dataForm里面，如果输入了数据的话
		let {afterBack} = props;
		if (afterBack) afterBack();
    }
    let onLogoutClick = () => {
		let logout = async () => {
			let {logout} = props;
			if (typeof logout === 'function') {
				await logout(); 
			}
			await nav.logout(undefined);
		}
		nav.showLogout(logout);
    }

	let b = nav.level > 1 || window.self !== window.top;
	let {back, right, center, logout, className, ex} = props;
	if (inWebNav === true &&  !back && !right && !center) return;
	let vBack:any, debugLogout:any;
	if (logout !== undefined && window.self === window.top) {
		if ((typeof logout === 'boolean' && logout === true)
			|| typeof logout === 'function')
		{
			let {user} = nav;
			if (user !== undefined) {
				let {nick, name} = user;
				debugLogout = <div className="d-flex align-items-center">
					<small className="text-light">{nick || name}</small>
					{
						// eslint-disable-next-line
						<div className="ml-2 py-2 px-3 cursor-pointer"
							role="button"
							onClick={onLogoutClick}>
							<i className="fa fa-sign-out fa-lg" />
						</div>
					}
				</div>;
			}
		}
	}
	if (b) {
		switch (props.back) {
			case 'none':
				vBack = undefined;
				break;
			default:
			case 'back':
				vBack = <nav onClick={onBack}>{nav.backIcon}</nav>;
				break;
			case 'close':
				vBack = <nav onClick={onBack}>{nav.backIcon}</nav>;
				break;
		}
	}
	if (window.self !== window.top) {
		console.log(document.location.href);
		// pop = <header onClick={this.openWindow} className="mx-1"><FA name="external-link" /></header>;
	}
	if (vBack === undefined && typeof center === 'string') {
		center = <div className="px-3">{center}</div>;
	}
	let rightView = (right || debugLogout) && <aside>{right} {debugLogout}</aside>;
	let header = <header className={className}>
		<nav>
			{vBack}
			{/*pop 弹出window暂时停止作用 */}
			<div>{center}</div>
			{rightView}
		</nav>
		{ex}
	</header>;
	if (inWebNav === true) return header;
	return <>
		<section className="tv-page-header">{header}</section>
		{header}
	</>;
}

export class PageHeader extends React.Component<PageHeaderProps> {
	render() {return renderPageHeader(this.props)}
	/*
    private back = async () => {
        await nav.back(); // 这个才会显示confirm box，在dataForm里面，如果输入了数据的话
		let {afterBack} = this.props;
		if (afterBack) afterBack();
    }
    openWindow() {
        window.open(document.location.href);
    }
    private logoutClick = () => {
        nav.showLogout(this.logout);
    }
    private logout = async () => {
        let {logout} = this.props;
        if (typeof logout === 'function') {
            await logout(); 
        }
        await nav.logout(undefined);
    }
    render() {
        let b = nav.level > 1 || window.self !== window.top;
        let {right, center, logout, className, ex} = this.props;
        let back:any, debugLogout:any;
        if (logout !== undefined && window.self === window.top) {
            if ((typeof logout === 'boolean' && logout === true)
                || typeof logout === 'function')
            {
                let {user} = nav;
                if (user !== undefined) {
                    let {nick, name} = user;
                    debugLogout = <div className="d-flex align-items-center">
                        <small className="text-light">{nick || name}</small>
                        {
                            // eslint-disable-next-line
                            <div className="ml-2 py-2 px-3 cursor-pointer"
                                role="button"
                                onClick={this.logoutClick}>
                                <i className="fa fa-sign-out fa-lg" />
                            </div>
                        }
                    </div>;
                }
            }
        }
        if (b) {
            switch (this.props.back) {
                case 'none':
                    back = undefined;
                    break;
                default:
                case 'back':
                    back = <nav onClick={this.back}><i className="fa fa-angle-left" /></nav>;
                    break;
                case 'close':
                    back = <nav onClick={this.back}><i className="fa fa-close" /></nav>;
                    break;
            }
        }
        if (window.self !== window.top) {
            console.log(document.location.href);
            // pop = <header onClick={this.openWindow} className="mx-1"><FA name="external-link" /></header>;
        }
        if (back === undefined && typeof center === 'string') {
            center = <div className="px-3">{center}</div>;
        }
		let rightView = (right || debugLogout) && <aside>{right} {debugLogout}</aside>;
		let header = <header className={className}>
			<nav>
				{back}
				<div>{center}</div>
				{rightView}
			</nav>
			{ex}
		</header>;
        return <>
			<section className="tv-page-header">{header}</section>
			{header}
		</>;
	}
	*/
}
