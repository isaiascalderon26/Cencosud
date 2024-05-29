import { IonIcon } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react"
import { close } from 'ionicons/icons';

import './index.less';

interface IActionSheetProps {
    /**
     * Child node, any ReactNode
     */
    children?: React.ReactNode;
    /**
     * Indicate that show be displayed
     */
    show?: boolean;
    /**
     * When times icons clicked
     * @returns 
     */
    onClose?: () => void;
}

const ActionSheet: React.FC<IActionSheetProps> = ({ children, onClose = () => { }, show = false }) => {

    const firstRender = useRef(false);

    const [showing, setShowing] = useState(false);

    const [boundingHeight, setBoundingHeight] = useState(0);

    const actionSheetRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        setShowing(false);
    }

    useEffect(() => {

        setTimeout(() => {
            setShowing(show);
            setBoundingHeight(actionSheetRef.current?.querySelector(".action-sheet-wrapper")?.getBoundingClientRect().height ?? 0)
        }, 100);
    });

    useEffect(() => {
        if (!showing && firstRender.current)
            setTimeout(() => {
                onClose?.();
            }, 100);

        if (!firstRender.current)
            firstRender.current = true;

    }, [showing])

    return (
        <div ref={actionSheetRef} className={`action-sheet ${showing && 'is-visible'}`}>
            <div className="action-sheet-wrapper" style={{
                marginBottom: !showing ? (boundingHeight * -1) - 16 : 0
            }}>
                {/* Main Header */}
                <div className="action-sheet-header">
                    <button className="close-button" onClick={handleClose}>
                        <IonIcon icon={close} />
                    </button>
                </div>
                {/* Sheet children */}
                <div>{children}</div>
            </div>
        </div>
    )
}

export default ActionSheet