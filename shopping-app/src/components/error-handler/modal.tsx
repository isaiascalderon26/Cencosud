import React, { PropsWithChildren } from 'react';
import EmptyModal, { EmptyModalProps } from '../empty-modal';
import sc from 'styled-components';

interface Props
  extends Omit<EmptyModalProps, 'onOkClick' | 'onClose' | 'description'> {
  onBack: () => void;
  message: string;
}

const Message = sc.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: rgba(0, 0, 0, 0.6);
  padding: 16px 0;
`;

function ErrorHandlerModal({
  onBack,
  okText = 'Volver',
  children,
  cssClass,
  message,
  height = '350px',
  ...props
}: PropsWithChildren<Props>) {
  return (
    <EmptyModal
      okText={okText}
      onOkClick={onBack}
      marginX="24px"
      marginT="24px"
      height={height}
      {...props}
    >
      <Message>{message}</Message>
    </EmptyModal>
  );
}

export default ErrorHandlerModal;
