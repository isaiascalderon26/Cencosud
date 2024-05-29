import React from 'react';
import { IonIcon} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

// index
import './index.less';

export interface IDefaultHeaderProps {
  title?: string;
  onBack: () => void;
}

interface IState {}

export default class DefaultHeader extends React.Component<IDefaultHeaderProps, IState> {
  state: IState = {
  }

  render() {
    const { title} = this.props;

    const onBack = this.props.onBack || (() => null);
    return (
      <div id="default-header">
        <IonIcon icon={arrowBack} onClick={onBack}/>
        {title && <div className='title'>
          <h1>{title}</h1>
        </div>}
      </div>
    )
  }
};
