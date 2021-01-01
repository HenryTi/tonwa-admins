import React from 'react';
import { observer } from "mobx-react";
import { IObservableValue } from 'mobx';

//export function autoHideTips(visible: IObservableValue<boolean>, tips:string|JSX.Element, timeout?:number):React.FunctionComponentElement<any>;
//export function autoHideTips(tips: IObservableValue<string>, tips:string|JSX.Element, timeout?:number):React.FunctionComponentElement<any>;

export function autoHideTips(
	tips: IObservableValue<boolean|string|JSX.Element>, 
	templet?:string|JSX.Element|((v:string|JSX.Element)=>JSX.Element), 
	timeout?:number):React.FunctionComponentElement<any> {
/*
export function autoHideTips(tips: IObservableValue<boolean|string|JSX.Element>, timeout?:number):React.FunctionComponentElement<any>;
export function autoHideTips(tips: IObservableValue<boolean|string|JSX.Element>, templet:(tips: boolean|string|JSX.Element) => JSX.Element, timeout?:number):React.FunctionComponentElement<any>;

export function autoHideTips(tips: IObservableValue<boolean|string|JSX.Element>, ...params:any[]) {
*/
	let timer:any;
	return React.createElement(observer(():JSX.Element => {
		if (timer) {
			clearTimeout(timer);
			timer = undefined;
		}
		let t = tips.get();
		if (!t) return null;
		if (timeout === undefined) timeout = 3000;
		//let p0 = params[0];
		//let timeout = 3000;
		//let templet: (tips: boolean|string|JSX.Element) => JSX.Element;
		/*
		switch (typeof p0) {
			case 'number':
				timeout = p0;
				break;
			case 'function':
				templet = p0;
				let p1 = params[1];
				if (typeof p1 === 'number') {
					timeout = p1;
				}
				break;
		}
		*/

		if (timeout > 0) {
			timer = setTimeout(() => {
				tips.set(null);
			}, timeout);
		}
		switch (typeof templet) {
			case 'undefined': return <>{t}</>;
			case 'function': return templet(t as string);
			case 'string': return <>{templet}</>;
			default: return templet;
		}
	}));
};
