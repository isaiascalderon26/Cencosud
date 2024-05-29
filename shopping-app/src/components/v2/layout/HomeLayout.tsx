import React, { FC } from 'react';
import BottomNavigationBar from '../navigation/bottom-navigation-bar';

import IconButton from '../inputs/IconButton';
import './index.less';
import { IconButtonProps } from '../inputs/IconButton/types';
import { IonContent, IonFooter, IonHeader, IonPage } from '@ionic/react';
import { ButtonNavigationBarItem } from '../navigation/bottom-navigation-bar/types';
import { useHistory } from 'react-router';
import FakeSelection from '../display-data/fake-selection';
import { chevronDown } from 'ionicons/icons';
import SettingsClient from '../../../clients/SettingsClient';
import ItemList from '../navigation/item-list';

interface HomeLayoutProps {
  bottomBar?: typeof BottomNavigationBar;
  rightOptions?: IconButtonProps[];
  bottomMenuItems?: ButtonNavigationBarItem[];
}

const HomeLayout: FC<HomeLayoutProps> = ({
  bottomBar,
  rightOptions = [],
  bottomMenuItems = [],
}) => {
  const history = useHistory();

  const showNotificationsPage = () => history.push(`/notifications`);

  const onGoBackToStores = () => {
    SettingsClient.remove('SELECTED_MALL');
    history.push('/');
  };

  const onGotoPerfil = (indice: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    indice === 4 ? history.push('/profile') : null;
  };

  return (
    <IonPage>
      <div className="home-layout">
        <IonHeader>
          <div className="top-bar">
            <div className="top-bar--burger-button">
              <IconButton icon="menu" onClick={showNotificationsPage} />
            </div>
            <div className="top-bar--center">
              <FakeSelection
                cssClass={'selection-mall-kghb'}
                width="100%"
                height="100%"
                imageContent={`${process.env.REACT_APP_BUCKET_URL}/logo/costaneracenter-light.png`}
                imageSelected={chevronDown}
                onClick={onGoBackToStores}
              />
            </div>
            <div className="top-bar--right-options">
              <IconButton
                key="notification-btn"
                variant="solid"
                onClick={showNotificationsPage}
                icon="bell"
              />
              {rightOptions?.map((option, index) => (
                <IconButton key={index} variant="solid" {...option} />
              ))}
            </div>
          </div>
        </IonHeader>
        <IonContent>
          <div className="main-content">
            <ItemList
              items={[
                {
                  text: 'Tickets',
                  icon: 'tickets',
                },
                {
                  text: 'Puntos Cencosud',
                  icon: 'parking',
                  badge: 'new',
                },
                {
                  text: 'Saldo Cencosud',
                  icon: 'cencosud',
                },
                {
                  text: 'Autopass',
                  icon: 'parking',
                },
                {
                  text: 'Cupones y descuentos',
                  icon: 'wallet',
                },
                {
                  text: 'Mis pedidos',
                  icon: 'food-book',
                },
              ]}
            />
          </div>
        </IonContent>

        <IonFooter>
          <div className="navigation-bar navigation-bar--bottom">
            <BottomNavigationBar
              onIndexChanged={onGotoPerfil}
              items={bottomMenuItems}
            />
          </div>
        </IonFooter>
      </div>
    </IonPage>
  );
};

export default HomeLayout;
