import { addCircleOutline } from 'ionicons/icons';

/**
 * Styles
 */
import './index.less';

import { IonIcon, IonSlide, IonSlides } from '@ionic/react';
import { ICarrouselWidget } from "../../../../models/widgets/IWidget";

/**
 * Components
 */
import CarrouselItem from "./components/carrousel-item";
import { generateCallback } from '../utils/callbackUtils';

import merchantHeaderIcon from './../../../../assets/media/svg/illustrated/merchant-header-icon.svg';
import moviesHeaderIcon from './../../../../assets/media/svg/illustrated/movies-header-icon.svg';
import promotionsHeaderIcon from './../../../../assets/media/svg/illustrated/promotions-header-icon.svg';

import MerchantItem from './components/merchant-item';

const UNIQUE_CLASS = "pmgizaogtb";

interface IProps {
  widget: ICarrouselWidget,
  homeState: any
}

const CarrouselWidget: React.FC<IProps> = (props) => {

  const slideOpts = {
    slidesPerView: 'auto',
    zoom: false,
    grabCursor: true
  };

  const onClickSeeMore = props.widget.see_more && generateCallback(props.widget.see_more?.callback, {});

  const seeMoreStylesVertical = { width: '119px', height: 'auto', margin: '0 8px' }
  const seeMoreStylesHorizontal = { width: '232px', height: 'auto', marginTop: '0px', marginLeft: '8px' }

  const iconNamesMap: Record<string, string> = {
    "promotions": promotionsHeaderIcon,
    "movies": moviesHeaderIcon,
    "merchant": merchantHeaderIcon
  }

  const iconName = iconNamesMap[props.widget.source?.toLocaleLowerCase() ?? "movies"];

  return (
    <div className={`${UNIQUE_CLASS} carrousel`}>
      {
        props.widget.source !== "ACTIVITIES" && <div>
          <h3 className="font-bold section-title" data-header-source={props.widget.source?.toLocaleLowerCase()}>
            <IonIcon
              size="22"
              className="carousel-header-icon"
              src={iconName}
            />
            {props.widget.title}
          </h3>
        </div>
      }

      {props.widget.rows && props.widget.rows > 1
        ?
        <IonSlides options={{
          ...slideOpts
        }} className={props.widget.source?.toLocaleLowerCase() + "-slider_widget"} style={{ padding: "10px", display: "flex" }}>
          {props.widget.items.map((item, index) => <MerchantItem item={item} index={index} key={index} homeState={props.homeState} widget={props.widget}>{item.callback.details}</MerchantItem>)}
        </IonSlides>
        :
        <IonSlides options={{
          ...slideOpts
        }} className={props.widget.source?.toLocaleLowerCase() + "-slider_widget"} style={{ padding: "10px", display: "flex" }}>
          {props.widget.items.map((item, index) => <CarrouselItem key={index} item={item} homeState={props.homeState} orientation={props.widget.orientation} widget={props.widget} />)}
          {(
            props.widget.see_more && props.widget.source !== "ACTIVITIES"
          ) &&
            <IonSlide style={props.widget.orientation === 'VERTICAL' ? seeMoreStylesVertical : seeMoreStylesHorizontal} className='extend-info' onClick={onClickSeeMore}>
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