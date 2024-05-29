import { IonLabel } from '@ionic/react';
import IProduct from '../../../../../../../../models/foodie/IProduct';
import Price from '../../../../../price';

/**
 * Styles
 */
import './index.less';

const UNIQUE_CLASS = 'fwuuxjupjr';

interface IProps {
  main?: {
    title: string;
    description?: string;
  }
  secondary?: {
    text: string;
    cmp?: React.ReactElement;
    style?: React.CSSProperties;
  }
  shadowText?: string;
  style?: React.CSSProperties;
  id?: string;
  data?: IProduct
}

const Section:React.FC<IProps> = ({main, secondary, shadowText, children, style, id, data}) => {

  const mainArea = main ? (
    <>
      <div className='fw-bold title line-clamp-2'>{main.title}</div>
      { main.description &&
        <div className='fw-light description'>
            {main.description}
        </div>
      }
      {data && <Price data={data}/>}
    </>
  ) : null;

  const secondaryArea = secondary ? (
    <div className={`section-header margin-bottom2`} style={secondary.style && {...secondary.style}}>
      <IonLabel className='semi margin-right-16 line-clamp-2'>{secondary.text}</IonLabel>
      {secondary.cmp}
    </div>
  ) : null;

  const shadowArea = shadowText ? (
    <div className='light margin-bottom'>{shadowText}</div>
  ): null;

  return (
    <div className={`section-${UNIQUE_CLASS}`} style={style && {...style}} id={id}>
      {mainArea}
      {secondaryArea}
      {shadowArea}
      {children}
    </div>
  )

}

export default Section;