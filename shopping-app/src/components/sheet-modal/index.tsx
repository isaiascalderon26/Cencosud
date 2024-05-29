import { ComponentRef, ModalOptions } from '@ionic/core';
import {
  createGesture,
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonRow,
} from '@ionic/react';
import { ReactOverlayProps } from '@ionic/react/dist/types/components/createOverlayComponent';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import sc from 'styled-components';

export interface SheetModalProps
  extends ReactOverlayProps,
    Pick<ModalOptions, 'cssClass'> {
  children: React.ReactNode;
  header?: React.ReactChild;
  maxHeight?: number;
  minHeight?: number;
  expanded: boolean;
  backdropDismiss?: boolean;
}

const Modal = sc(IonModal)`
    --max-height: ${({ maxHeight = 0.9 }: SheetModalProps) =>
      `${maxHeight * 100}%`};
    --height: ${({
      minHeight = 0.2,
      maxHeight = 0.9,
      expanded,
    }: SheetModalProps) => {
      return `${
        expanded
          ? `${maxHeight * 100}%`
          : minHeight <= 1
          ? `${minHeight * 100}%`
          : `${minHeight + 20}px`
      }`;
    }};

    .modal-wrapper {
        transition: height 0.3s;
        box-shadow: 0px 2px 2px 1px black;
    }
`;

function SheetModal({ children, header, ...props }: SheetModalProps) {
  const headerEl = useRef<any>(null);
  //   useEffect(() => {
  //     if (headerEl.current) {
  //       const dragGesture = createGesture({
  //         el: headerEl,
  //         gestureName: 'sheet-dragging',
  //         onMove(ev) {
  //           debugger;
  //         },
  //       });
  //     }
  //   }, [headerEl]);
  return (
    <Modal {...props} >
      <IonHeader draggable={true} ref={headerEl}>
        {/*<DrawerBtn>*/}
        {/*  <div className="drawer-pull"></div>*/}
        {/*</DrawerBtn>*/}
      </IonHeader>
      <IonContent>
        <IonRow>{children}</IonRow>
      </IonContent>
    </Modal>
  );
}

export default SheetModal;
