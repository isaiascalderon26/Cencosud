import {
  IonButton,
  IonCol,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonText,
} from '@ionic/react';
import React, { useState } from 'react';
import { i18nFactory } from '../../i18n';
import SheetModal, { SheetModalProps } from '../../sheet-modal';
import localize from '../locale';
import { mapOutline, walk } from 'ionicons/icons';
import { LazarilloRoute } from '../types';
import PlaceIcon from './place-icon';
import PlaceInstruction from './place-instruction';
import { IMerchant } from '../../../models/merchants/IMerchant';
import { IMerchantPlace, ISitePlace } from '../../../models/how-to/place';
import sc from 'styled-components';
import StepInstruction from './step-instruction';
import MapIcon from '../../../assets/media/map/map.svg';
import RepeatIcon from '../../../assets/media/routing/repeat.svg';
import NavigationIcon from '../../../assets/media/routing/navigation.svg'
import { close } from 'ionicons/icons';
import './instructions-modal.less';
const I18 = i18nFactory(localize);

interface Props extends Pick<SheetModalProps, 'maxHeight' | 'minHeight'> {
  isOpen?: boolean;
  route?: LazarilloRoute;
  start?: IMerchant | false;
  end: IMerchant;
  site: ISitePlace;
  onEnd?: () => void;
  animationInProgress: boolean;
  animateRoute?: () => void;
}

const Instructions = sc.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;
  padding-top: 10px;

  >.line {
    width: 1px;
    background-color: #E1E1E1;
    height: calc(100% - 180px);
    position: absolute;
    margin-left: 20px;
    margin-top: 20px;
  }
`;

const HandlerBtn = sc(IonButton)<{ xPadding: string }>`
  width: auto;

  ${({ xPadding }) => `
    --padding-start: ${xPadding};
    --padding-end: ${xPadding};
  `}
`;

function InstructionsModal({
  maxHeight = 0.96,
  minHeight = 70,
  isOpen = true,
  route,
  end,
  start,
  site,
  onEnd,
  animationInProgress,
  animateRoute
}: Props) {
  const [instructiosExpanded, setInstructionsExpanded] = useState(false);

  const safeAreaBottom = +getComputedStyle(document.documentElement)
    .getPropertyValue('--ion-safe-area-bottom')
    .replace('px', '');

  return (
    <SheetModal
      isOpen={isOpen}
      cssClass="lazarillo-map-instructions lazarillo-map-sheet-modal"
      maxHeight={maxHeight}
      expanded={instructiosExpanded}
      minHeight={minHeight + (isNaN(safeAreaBottom) ? 10 : safeAreaBottom)}
      header={<></>}
    >
      <IonGrid>
        {/*<IonHeader>*/}
        {/*  <I18 id="INSTRUCTIONS_TITLE" />*/}
        {/*  <I18 id="INSTRUCTIONS_DESCRIPTION" variant="p" />*/}
        {/*</IonHeader>*/}
        <IonRow
          style={{
            paddingTop: '10px',
            paddingBottom: instructiosExpanded
              ? 0
              : 'var(--ion-safe-area-bottom)',
            justifyContent: 'space-around',
          }}
        >
          {!instructiosExpanded ? (
            <IonCol>
            <IonButton
              className="outline-instruction-button"
              fill="outline"
              disabled={animationInProgress}
              onClick={() => {
                // setInstructionsExpanded(!instructiosExpanded);
                animateRoute && animateRoute()
              }}
            >
              <IonIcon
                icon={RepeatIcon}
                slot='start'
              />
              {localize("REPEAT_ROUTE")}
            </IonButton>
            </IonCol>
          ) : null}
          {!instructiosExpanded  ? (
            <IonCol>
              <IonButton
                onClick={() => {
                  setInstructionsExpanded(!instructiosExpanded);
                }}
              >
                <IonIcon
                  icon={NavigationIcon}
                  slot='start'
                />
                {localize("SEE_STEPS")}
              </IonButton>
            </IonCol>
          ) : null}
        </IonRow>
        {route && instructiosExpanded && (
          <div style={{width: "100%"}}>
          <IonRow>
            <IonText className='instructions-title'>Ver Pasos</IonText>
            <IonText className='instructions-body'>Sigue las indicaciones para llegar a tu destino.</IonText>
          </IonRow>
          <IonFab slot="fixed" vertical="top" horizontal="end"
            role='button'
            onClick={()=>{
              setInstructionsExpanded(false)
            }}
          >
            <IonFabButton className='instructions-button'>
              <IonIcon icon={close}></IonIcon>
            </IonFabButton>
          </IonFab>

          </div>

        )}
        {route && instructiosExpanded && (
          <Instructions>
            <div className="line"></div>
            {start && (
              <PlaceInstruction merchant={start} site={site.site} />
            )}
            {route.data.legs[0].steps.map((step: any) => (
              <StepInstruction step={step} site={site.place} />
            ))}
            <PlaceInstruction
              merchant={end}
              start={false}
              site={site.site}
            />
          </Instructions>
        )}
      </IonGrid>
    </SheetModal>
  );
}

export default InstructionsModal;
