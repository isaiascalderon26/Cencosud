import React from 'react';
import { IonButton } from '@ionic/react';

// index
import './index.less';

export interface IDefaultFooterProps {
  mainActionText: string;
  mainActionIsDisabled?: boolean;
  onClickMainAction: () => void;
}

interface IState {}

export default class DefaultFooter extends React.Component<IDefaultFooterProps, IState> {
  state: IState = {
  }

  render() {
    const { mainActionText, mainActionIsDisabled, onClickMainAction } = this.props;

    const isDisabled = mainActionIsDisabled || false;
    return (
      <div id="default-footer" className='pad-buttons'>
        <IonButton className='white-centered' disabled={isDisabled} onClick={onClickMainAction}>
          {mainActionText}
        </IonButton>
      </div>
    )
  }
};
