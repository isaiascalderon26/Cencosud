import { PropsWithChildren } from 'react';
import Handler from './handler';
import ErrorHandlerModal from './modal';
import { useErrorContext } from './store/hooks';
import ErrorProvider from './store/provider';

export * from './store/context';
export * from './store/hooks';
export * from './store/provider';

function ErrorHandler({ children }: PropsWithChildren<{}>) {
  return (
    <ErrorProvider>
      {children}
      <Handler />
    </ErrorProvider>
  );
}

export default ErrorHandler;
