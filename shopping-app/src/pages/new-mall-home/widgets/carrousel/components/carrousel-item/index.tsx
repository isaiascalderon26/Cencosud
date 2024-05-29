import React, { useState } from 'react';
import { IonBadge, IonSlide } from '@ionic/react';

/**
 * Components
 */
import MovieDetailModal from '../../../../../../components/movie_detail_modal';
import VideoDetailModal from '../../../../../../components/video_detail_modal';
import PromotionDetailModal from '../../../../../../components/promotion_detail_modal';

/**
 * Lib
 */
import { generateCallback } from '../../../utils/callbackUtils';

/**
 * Models
 */
import { ICarrouselItem, ICarrouselWidget } from '../../../../../../models/widgets/IWidget';

/**
 * Assets
 */
import VideoDummy from '../../../../../../assets/media/dummy/background-dummy.png';
import { logEventCarrouselWidgetAnalytics } from '../../../utils/registerAnalyticsUtils';
import Expr from '../../../../../../lib/Expr';

interface IProps {
  item: ICarrouselItem,
  homeState: any,
  orientation: 'VERTICAL' | 'HORIZONTAL'
  widget: ICarrouselWidget;
}

const CarrouselItem: React.FC<IProps> = ({ item, homeState, orientation, widget }) => {

  const callbackDetails = item.callback.details as any;

  const [movieOpen, setMovieOpen] = useState<boolean>(false);
  const [videoOpen, setVideoOpen] = useState<boolean>(false);
  const [imageOpen, setImageOpen] = useState<boolean>(false)
  const [metadata, setMetadata] = useState<any>();


  const scope = {
    /*onOpenActivityModal: (activity: { url: string }) => {
      console.log('Activity opened', activity);
    },*/
    onOpenActivityModalHandler: (metadataArgs: any) => {
      setMetadata(metadataArgs);

      switch (item.media.type) {
        case 'MOVIE':
          setMovieOpen(true);
          break;
        case 'VIDEO':
          setVideoOpen(true);
          break;
        case 'IMAGE':
          setImageOpen(true);
          break;

        default:
          break;
      }

    }
  }

  const onClickButton = () => {
    Expr.whenInNativePhone(async () => {
      logEventCarrouselWidgetAnalytics(widget, homeState?.user?.email, item, homeState.site.name)
    })
    generateCallback(item.callback, scope)();
  }

  const onVideoLoad = async (video: HTMLVideoElement) => {
    try {
      video.setAttribute('class', 'video-loading');
    } catch (error) {
      console.log(error);
    }
  }

  const getImgUrl = (partialUrl: string) => {
    if (!partialUrl.includes('http')) {
      return `${homeState.site.web}${partialUrl}`
    } else {
      return partialUrl;
    }
  }

  let slideStyles = {
    "VERTICAL": { width: '76px' },
    "HORIZONTAL": { width: '232px', paddingLeft: '8px' },
  };
  let innerElStyles = {
    "VERTICAL": {
      "MOVIE": { width: '128px', borderRadius: '16px' },
      "VIDEO": { objectFit: 'cover', borderRadius: '16px' },
      "IMAGE": { width: '128px', paddingLeft: '8px' }
    },
    "HORIZONTAL": {
      "MOVIE": { borderRadius: '16px', width: 'auto', maxWidth: '100%', height: '112px', maxHeight: '100%' },
      "VIDEO": { objectFit: 'cover', borderRadius: '16px' },
      "IMAGE": { borderRadius: '16px', width: 'auto', maxWidth: '100%', height: '112px', maxHeight: '100%' }
    },
  };

  const onUpdateRut = (rut: string) => {
    homeState.onUpdateRut!(rut)
  }


  return (
    <React.Fragment>
      {
        item.media.type === 'MOVIE' &&
        <IonSlide style={slideStyles[orientation]} onClick={onClickButton}>
          <div className='film-image-poster ion-slide-cover-image'>
            <img style={innerElStyles[orientation][item.media.type]} src={item.media.url}></img>
          </div>
          <div className="ion-slide-content">
            <label className='ion-slide-content_title'>{callbackDetails.callback_args?.[0]?.title?.trim()}</label>
            <label className='ion-slide-content_subtitle'>{callbackDetails.callback_args?.[0]?.synopsis?.replace(/\s+/g, " ")}</label>
          </div>
        </IonSlide>
      }
      {
        item.media.type === 'VIDEO' &&
        <IonSlide class='ion-slide-video' style={slideStyles[orientation]} onClick={onClickButton}>
          <div className='story-widget'>
            <div>
              <video
                autoPlay={false}
                loop poster={VideoDummy}
                placeholder={VideoDummy}
                playsInline muted
                //id={activity.objectID} // this data is in callback_args
                preload="auto"
                onLoadStart={(e) => onVideoLoad(e.currentTarget)}
                style={{ objectFit: 'cover', borderRadius: '16px' }}
                width={119}
                height={212}
                src={`${item.media.url}#t=1,14`}
                onLoadedData={(e) => e.currentTarget.play()}></video>
            </div>
          </div>
          <label>{callbackDetails.callback_args?.[0]?.title}</label>
        </IonSlide>
      }
      {
        item.media.type === 'IMAGE' && !item.badgeText && !item.bodyText &&
        <IonSlide style={slideStyles[orientation]} onClick={onClickButton} className='ion-slide-promotion'>
          <div className={`cover-image-${orientation.toLowerCase()}`}>
            <img style={innerElStyles[orientation][item.media.type]} src={getImgUrl(item.media.url)} />
          </div>
          <div className='promotions-data'>
              <label className='store-name'>{callbackDetails.callback_args?.[0]?.brand_name}</label>
              <label className='promotion-description'>{callbackDetails.callback_args?.[0]?.title}</label>
          </div>
        </IonSlide>
      }





      {movieOpen && item.media.type === "MOVIE" && <MovieDetailModal onClose={() => { setMovieOpen(false) }} movie={metadata} />}
      {videoOpen && item.media.type === "VIDEO" && <VideoDetailModal onClose={() => { setVideoOpen(false) }} activity={metadata} />}
      {imageOpen && item.media.type === "IMAGE" && <PromotionDetailModal onClose={() => { setImageOpen(false) }} promotion={metadata} site={homeState.site} onUpdateRut={onUpdateRut} />}
    </React.Fragment>

  );
}

export default CarrouselItem;