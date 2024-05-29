import { addCircleOutline } from 'ionicons/icons';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { Fragment } from 'react';
import { IonBadge, IonIcon, IonSlide, IonSlides } from '@ionic/react';
import { ICarrouselItem, ICarrouselWidget } from "../../../../models/widgets/IWidget";

/**
 * Components
 */
import CarrouselItem from "./components/carrousel-item";
import { generateCallback } from '../utils/callbackUtils';

/**
 * Assets
 */
import MultiCarrouselItem from './components/multi-carrousel-item';

const UNIQUE_CLASS = "pmgizaogtb";

interface IProps {
  widget: ICarrouselWidget,
  homeState: any 
}

const CarrouselWidget:React.FC<IProps> = (props) => {

  console.log(props);

  const slideOpts = {
    slidesPerView: 'auto',
    zoom: false,
    grabCursor: true
  };

  const scope = {
    
  }

  const onClickSeeMore = props.widget.see_more && generateCallback(props.widget.see_more?.callback, scope);

  const seeMoreStylesVertical = { width: '119px', height: 'auto', margin: '0 8px' }
  const seeMoreStylesHorizontal = { width: '232px', height: 'auto', marginTop: '0px', marginLeft: '8px' }
  
  
  return (
    <div className={`${UNIQUE_CLASS} carrousel`}>
      <div>
        <h3 className="font-bold">{props.widget.title}</h3>
      </div>
      {props.widget.rows && props.widget.rows > 1 
        ? 
          <div className='carrousel-multi-row'>
            <div style={{width: 320*props.widget.items.length/props.widget.rows}}>
              { props.widget.items.map((item, index) => <MultiCarrouselItem item={item} index={index} key={index} homeState={props.homeState} /> )}
              </div>
          </div>
        :
          <IonSlides options={slideOpts}>
            { props.widget.items.map((item, index) => <CarrouselItem key={index} item={item} homeState={props.homeState} orientation={props.widget.orientation} />) }
            { props.widget.see_more && 
              <IonSlide style={ props.widget.orientation === 'VERTICAL' ? seeMoreStylesVertical : seeMoreStylesHorizontal} className='extend-info' onClick={ onClickSeeMore }>
                <div>
                  <IonIcon icon={addCircleOutline}></IonIcon>
                  <h3 className='font-bold'>Ver más</h3>
                </div>
              </IonSlide>
            }
          </IonSlides>
      }
    </div>
  )
    
}

export default CarrouselWidget;