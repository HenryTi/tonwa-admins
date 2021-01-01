import React from "react";
import classNames from 'classnames';
import { nav } from "../nav";

export interface AxProps extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
	//children: React.ReactNode;
	//href: string;
	//onClick?: (event:React.MouseEvent) => void;
	//className?: string;
	aClassName?: string;
	naClassName?: string;
	//target?: string;
	//props?: any;
}

// 如果是web方式，用webNav方式route网页
// 如果是app方式，用click方式压栈页面
export const Ax = (axProps: AxProps) => {
	let {href, children, className, onClick} = axProps;
	if (nav.isWebNav === true) {
		let {aClassName } = axProps;
		if (!href) return <span className="text-danger">Error: href not defined in Ax</span>;
		let onAxClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
			evt.preventDefault();
			let ret:boolean;
			if (onClick) {
				ret = onClick(evt) as unknown as boolean;
			}
			else {
				nav.navigate(href);
				ret = false;
			}
			return ret;
		}
		return <a {...axProps} className={classNames(className, aClassName)} onClick={onAxClick}>{children}</a>;
	}
	else {
		let {naClassName} = axProps;
		if (!onClick) {
			onClick = () => {
				nav.openSysPage(href); //.navigate(href);
				return false;
			}
		}
		return <span className={classNames(className, 'cursor-pointer', naClassName)} onClick={onClick}>{children}</span>;
	}
}

// 同普通的a tag
// 会自动处理href，处理生产版跟测试版之间的不同
export const A = (props: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
	let {children} = props;
	if (nav.isWebNav === false) {
		return <a {...props}>{children}</a>;
	}
	let {href} = props;
	//if (nav.testing === true) href += '#test';
	let onClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
		evt.preventDefault();
		nav.navigate(href);
		return false;
	}
	return <a {...props} href={href} onClick={onClick}>{children}</a>;
}
