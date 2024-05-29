import { IonIcon } from '@ionic/react';
import { alertCircle } from 'ionicons/icons';
import React from 'react';
import './index.less';
interface IProps {
  type: string; // "alert-expired" | "alert-active"
  text: string;
  show?: boolean;
}
export default class Alert extends React.Component<IProps> {
    render() {
        const { type, text, show } = this.props;
        return (
            <div className="alert-component" style={{ display: show || show === undefined ? 'block' : 'none' }}>
                <div className={`alert-body ${this.props.type}`}>
                    <div className="alert-content">
                        <div className={`icon-type-${type}`}><IonIcon icon={alertCircle} /></div>
                        <div className={`alert-text ${type}-text`}>{text}</div>
                    </div>
                </div>
            </div>
        )
    }
}