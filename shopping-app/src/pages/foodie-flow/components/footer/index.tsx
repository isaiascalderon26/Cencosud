import { IonFooter, IonButton } from '@ionic/react'

/**
 * Style
 */
import './index.less';

const UNIQUE_CLASS = 'lltitapwwm';

interface IProps {

  /**
   * Previus elemento that goes before main button
   */
  prevElement?: React.ReactNode,
  
  /**
   * @description
   * onClick handler. Action to execute when the button is clicked.
   */
  onClick: () => void;
  
  /**
   * @optional
   * @description Element to be displayed in the left corner of the button's footer (icon, text, etc).
   */
  startElement?: JSX.Element;
  
  /**
   * @optional
   * @default 'Continuar'
   * @description Text to display on the center of the button.
   */
  btnText?: string;
  
  /**
   * @optional
   * @description Element to be displayed in the rigth corner of the button's footer (icon, text, etc).
   */
  endElement?: JSX.Element;

  /**
   * @optional
   * @description
   * - If set to 'true', the button will be hidden and when the prop change to 'false' it will show up (Animated).
   * - If set to 'false', the button will shou up (Animated) when view is mounted, and when prop change to 'true' it will hide.
   * - If not set the button will be on the footer from the beginning with no animation, if prop chages to 'true' it will hide.
   */
  btnHidden?: boolean;

  /**
   * @optional
   * @description Custom Class name
   */
  className?: string;

  /**
   * @optional
   * @description Custom Style
   */
  style?: React.CSSProperties;

  /**
   * @optional
   * @description Disabled button
   */
  disabled?: boolean
}

const Footer: React.FC<IProps> = ({prevElement, startElement, btnText, endElement, onClick, btnHidden, children, className, style = {}, disabled}) => {

  const buttonStyles = `footer-button ${endElement ? 'space-between' : ''}`;
  
  const btnStyles = [];
  if (btnHidden) btnStyles.push('pad-buttons');
  if (btnHidden === false) btnStyles.push('pad-buttons-animation');

  let customClassName = `footer-${UNIQUE_CLASS}`;
  if (className) {
    customClassName += ` ${className}`;
  }

  return (
    <IonFooter className={customClassName} style={style}>
      {prevElement}
      <IonButton onClick={disabled ? () => {} : onClick} className={btnStyles.join(' ')} color={disabled ? 'medium' : 'dark'}>
        <div className={buttonStyles}>
          {startElement && startElement }
          <div>{btnText ? btnText : 'Continuar'}</div>
          {endElement && endElement}
        </div>
      </IonButton>
      {children}
    </IonFooter>
  )
}

export default Footer;