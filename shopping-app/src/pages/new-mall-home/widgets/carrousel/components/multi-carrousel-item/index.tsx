import { IonBadge } from '@ionic/react';

/**
 * Components
 */


/**
 * Models
 */
import { ICarrouselItem, ICarrouselWidget } from '../../../../../../models/widgets/IWidget';

/**
 * Assets
 */
import RestaurantDummy from '../../../../../../assets/media/dummy/rest-background.png';
import { Fragment, useState } from 'react';
import MerchantDetailModal from '../../../../../../components/merchant_detail_modal';
import { useParams } from 'react-router';
import { generateCallback } from '../../../utils/callbackUtils';
import { logEventCarrouselWidgetAnalytics } from '../../../utils/registerAnalyticsUtils';
import Expr from '../../../../../../lib/Expr';

interface IProps {
  item: ICarrouselItem,
  index: number,
  homeState: any,
  widget: ICarrouselWidget
}

const MultiCarrouselItem:React.FC<IProps> = ({ item, index, homeState, widget }) => {
  
  let image = item.media.url.split(',');
  const [modalOpen, setModalOpen] = useState(false);
  const [metadata, setMetadata] = useState<any>();
  const routeParams = useParams<any>();
  
  const scope = {
    onOpenActivityModalHandler: (data:any) => {
      setMetadata(data)
      setModalOpen(true)
    }
  }

  const onCloseModalHandler = () => {
    setModalOpen(false);
  }

  const onClickButton = () =>{
    Expr.whenInNativePhone(async () => {
      logEventCarrouselWidgetAnalytics(widget, homeState?.user?.email,item, homeState.site.name)
    })
    
    generateCallback(item.callback, scope)();
    
  }

  if(image[0]) {
    return (
      <Fragment>
        <div className={`carrousel-multi-rows-box`} onClick={ onClickButton } key={index}>
          <div className="restaurant-box">
            <img className="restaurant-dummy" src={RestaurantDummy}/>
            <img className="restaurant-bg" src={homeState.site?.web + image[0]} onError={(event) => event.currentTarget.style.display = 'none'} />
            <div className="restaurant-shadow"></div>
            { item.badgeText && <IonBadge color="dark">{item.badgeText}</IonBadge> }
            { item.bodyText && <p dangerouslySetInnerHTML={{ __html: item.bodyText }}></p> }
          </div>
        </div>
        {modalOpen 
          ? <MerchantDetailModal onClose={onCloseModalHandler} 
                        merchant={metadata}
                        store={routeParams.id} /> 
          : null}
      </Fragment>
    )
  }

  return null;

}

export default MultiCarrouselItem;