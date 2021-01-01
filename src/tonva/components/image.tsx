import * as React from 'react';
import classNames from 'classnames';
import { nav } from './nav';

export interface ImageProps {
    src: string;
    className?: string;
    style?: React.CSSProperties;
    altImage?: string;
}

// src = .src, 表示fontawesome Icon
export function Image(props: ImageProps) {
	let {className, style, src, altImage} = props;
	let icon:string;
    if (src) {
		if (src.indexOf('.') !== 0) {
			if (src.startsWith(':') === true) {
				src = nav.resUrl + src.substr(1);
			}
			return <img src={src} className={className} alt="img"
				style={style}
				onError={evt=>{
					if (altImage) evt.currentTarget.src=altImage;
					else evt.currentTarget.src = 'https://tv.jkchemical.com/imgs/0001.png';
				}} />;
		}
		icon = src.substr(1);
	}
	else {
		icon = 'file-o'
	}
	return <span className={classNames(className, 'image-none')} style={style}>
		<i className={'fa fa-' + icon} />
	</span>;
}
