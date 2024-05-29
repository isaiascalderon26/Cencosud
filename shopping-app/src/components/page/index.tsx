import React, { Fragment } from 'react';
import { IonContent, IonFooter, IonHeader} from '@ionic/react';

// index
import './index.less';
// components
import DefaultHeader, { IDefaultHeaderProps } from './components/default-header';
import DefaultFooter, { IDefaultFooterProps } from './components/default-footer';

// export internal components
export { DefaultHeader, DefaultFooter };
export type { IDefaultHeaderProps, IDefaultFooterProps };

export interface IPageProps {
  header?: JSX.Element;
  content: JSX.Element;
  footer?: JSX.Element;
}

interface IState {}

export default class Page extends React.Component<IPageProps, IState> {
  state: IState = {
  }

  render() {
    const { header, content, footer } = this.props;

    const headerComponent = header ? <IonHeader>{header}</IonHeader> : null;
    const footerComponent = footer ? <IonFooter className="default-footer">{footer}</IonFooter> : null;
    return (
      <Fragment>
        {headerComponent}
        <IonContent id='page-content'>
          {content}
        </IonContent>
        {footerComponent}
      </Fragment>
    )
  }
};
