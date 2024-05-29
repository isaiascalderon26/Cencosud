import { IonSlide } from '@ionic/react';
import { ICarrouselItem, ICarrouselWidget } from '../../../../../../models/widgets/IWidget';
import { useState } from 'react';
import { useParams } from 'react-router';
import Expr from '../../../../../../lib/Expr';
import { logEventCarrouselWidgetAnalytics } from '../../../utils/registerAnalyticsUtils';
import { generateCallback } from '../../../utils/callbackUtils';
import MerchantDetailModal from '../../../../../../components/merchant_detail_modal';

interface IProps {
  item: ICarrouselItem,
  index: number,
  homeState: any,
  widget: ICarrouselWidget
}

const MerchantItem: React.FC<IProps> = ({ item, index, homeState, widget }) => {

  const callbackDetails = item.callback.details as any;

  let image = item.media.url.split(',');
  const [modalOpen, setModalOpen] = useState(false);
  const [metadata, setMetadata] = useState<any>();
  const routeParams = useParams<any>();

  const scope = {
    onOpenActivityModalHandler: (data: any) => {
      setMetadata(data)
      setModalOpen(true)
      console.log("open")
    }
  }

  const onCloseModalHandler = () => {
    setModalOpen(false);
    console.log("close")
  }

  const onClickButton = () => {
    Expr.whenInNativePhone(async () => {
      logEventCarrouselWidgetAnalytics(widget, homeState?.user?.email, item, homeState.site.name)
    })

    console.log("clicked")
    if (!modalOpen) {
      generateCallback(item.callback, scope)();
    }
  }

  return (
    <IonSlide onClick={onClickButton}>
      <div className='image-wrapper ion-slide-cover-image'>
        { item.media.url?.length ?
          <img src={homeState.site?.web + "/" + item.media.url} />
          :
          <img src={item.media.urlDefault} />
        }
      </div>
      <div className="ion-slide-content merchan-info">
        <div className='logo-content'>
          <img src={homeState.site?.web + "/" + callbackDetails.callback_args?.[0]?.logo} />
        </div>
        <div className='text-content'>
          <label className='ion-slide-content_title' dangerouslySetInnerHTML={{ __html: callbackDetails.callback_args?.[0]?.name }}></label>
          <label className='ion-slide-content_subtitle'>{callbackDetails.callback_args?.[0]?.description}</label>
        </div>
      </div>

      {modalOpen
        ? <MerchantDetailModal onClose={onCloseModalHandler}
          merchant={metadata}
          store={routeParams.id} />
        : null}

    </IonSlide>
  );
}

export default MerchantItem;
