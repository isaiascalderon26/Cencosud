import React from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';

// style
import './index.less';
// components
import ErrorModal from '../../../../components/error-modal';
// assets
import commentImg from '../../../../assets/media/comment.svg';

const reasons: IReason[] = [
  {
    type: 'PREFER_PHYSICAL_TICKET',
    details: 'Prefiero utilizar ticket físico'
  },
  {
    type: 'PREFER_PAY_AUTOSCAN',
    details: 'Prefiero pagar con Escanea tu ticket'
  },
  {
    type: 'PREFER_ANOTHER_PAYMENT_METHOD',
    details: 'Prefiero otro medio de pago'
  },
  {
    type: 'PROBLEMS_WITH_OPERATION',
    details: 'Tuve problemas con el funcionamiento'
  },
  {
    type: 'PROBLEMS_WITH_PAYMENT',
    details: 'Tuve problemas con el pago'
  },
  {
    type: 'NO_LONGER_REQUIRE_SERVICE',
    details: 'Ya no requiero el servicio'
  }
]; 

export interface IReason {
  type: string;
  details: string;
}

export interface IRemoveModalProps {
  onContinue: (reason?: IReason) => void;
  onCancel: () => void;
}

interface IState {
  selected_reason?: string;
}

export default class RemoveModal extends React.Component<IRemoveModalProps, IState> {
  state: IState = {

  }

  onChangeReason = (e: any) => {
    this.setState({ selected_reason: e.detail.value });
  }

  onClickContinue = () => {
    this.props.onContinue(reasons.find((reason) => reason.type === this.state.selected_reason));
  }

  onClickCancel = () => {
    this.props.onCancel();
  }

  render() {

    return (
      <ErrorModal
        cssClass="remove-modal"
        title="Dar de baja el servicio"
        message="Lamentamos saber que deseas darte de baja del servicio. En búsqueda de seguir mejorando, por favor cuéntanos tu motivo a continuación:"
        content={(
          <div className="select">
            <img src={commentImg} alt="comment" />
            <IonSelect interface="action-sheet" value={this.state.selected_reason} placeholder="Selecciona un motivo" cancelText="Cerrar" onIonChange={this.onChangeReason}>
              {reasons.map((reason) => (
                <IonSelectOption key={reason.type} value={reason.type}>{reason.details}</IonSelectOption>
              ))}
            </IonSelect>
          </div>
        )}
        retryMessage="Continuar"
        onRetry={this.onClickContinue}
        onCancel={this.onClickCancel}
      />
    )
  }
}
