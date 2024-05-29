export interface IconButtonProps extends React.ComponentPropsWithRef<'button'> {
  icon: string;
  variant?: 'lined' | 'solid' | 'gradate';
}
