import React from 'react';
import ErrorHandlerModal from '../error-handler/modal';
import ErrorIcon from '../../assets/media/error-icon.svg';

interface Props {
  onBack: () => void;
  height?: string;
}

function MissingPlaceError({ onBack, height = '350px' }: Props) {
  return (
    <ErrorHandlerModal
      title={'¡Ups, lo sentimos!'}
      message="La ubicación de la tienda no se encuentra disponible en este momento, intentalo más tarde."
      okText="Volver"
      icon={ErrorIcon}
      height={height}
      onBack={onBack}
    ></ErrorHandlerModal>
  );
}

export default MissingPlaceError;
