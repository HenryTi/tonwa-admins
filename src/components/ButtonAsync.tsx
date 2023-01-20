import React, { CSSProperties, MouseEvent, MouseEventHandler, useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    children: React.ReactNode;
}

export function ButtonAsync(props: { onClick: (evt: MouseEvent<HTMLButtonElement>) => Promise<void> } & Props): JSX.Element {
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    let { children, onClick } = props;
    let isMounted = useRef<boolean>(false);
    let newOnClick: MouseEventHandler<HTMLButtonElement> | undefined;
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        }
    });
    if (onClick) {
        newOnClick = async (evt: MouseEvent<HTMLButtonElement>) => {
            setIsWaiting(true);
            try {
                await onClick(evt);
            }
            catch (err) {
                console.error(err);
                throw err;
            }
            finally {
                if (isMounted.current === true) {
                    setIsWaiting(false);
                }
            }
        };
    }
    if (isWaiting === true) {
        let { className } = props;
        className = (className ?? '') + ' position-relative';
        let style: CSSProperties = {
            zIndex: 30001,
            background: 'rgba(0, 0, 0, 0.3)',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        }
        return <button {...props} disabled={true} className={className}>
            {children}
            <div className="d-flex position-absolute align-items-center justify-content-center" style={style}>
                <i className="fa fa-spinner fa-spin" />
            </div>
        </button>;
    }
    else {
        return <button {...props} onClick={newOnClick}>{children}</button>;
    }
}
