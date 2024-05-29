import { useState } from 'react';
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
import { ICarrouselItem } from '../../../../../../models/widgets/IWidget';

/**
 * Assets
 */
import VideoDummy from '../../../../../../assets/media/dummy/background-dummy.png';

interface IProps {
  item: ICarrouselItem,
  homeState: any, 
  orientation: 'VERTICAL' | 'HORIZONTAL'
}

const CarrouselItem:React.FC<IProps> = ({ item, homeState, orientation }) => {
  
  const [ movieOpen, setMovieOpen ] = useState<boolean>(false);
  const [ videoOpen, setVideoOpen ] = useState<boolean>(false);
  const [ imageOpen, setImageOpen] = useState<boolean>(false)
  const [metadata, setMetadata] = useState<any>();


  const scope = {
    // TODO not actions in page found yet
    onOpenActivityModal: (activity: { url: string }) => {
      console.log('Activity opened', activity);
    },
    onOpenActivityModalHandler: (metadataArgs:any) => {
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

  const onClickButton = generateCallback(item.callback, scope);

  const onVideoLoad = async (video: HTMLVideoElement) => {
    try {
      video.setAttribute('class', 'video-loading');
    } catch (error) {
      console.log(error);
    }
  }

  const getImgUrl = (partialUrl: string) => {
    if(!partialUrl.includes('http')) {
      console.log(`${homeState.site.web}${partialUrl}`);
      
      return `${homeState.site.web}${partialUrl}`
    } else {
      return partialUrl;
    }
  }

  let slideStyles = {
    "VERTICAL": { width: '128px', paddingLeft: '8px' },
    "HORIZONTAL": { width: '232px', paddingLeft: '8px' },
  };
  let innerElStyles = {
    "VERTICAL": {
      "MOVIE": { width: '128px', borderRadius: '16px' },
      "VIDEO": { objectFit: 'cover', borderRadius: '16px' },
      "IMAGE": { width: '128px', paddingLeft: '8px' }
    },
    "HORIZONTAL": {
      "MOVIE": { borderRadius: '16px', width: 'auto', maxWidth: '100%', height: '112px', maxHeight: '100%'},
      "VIDEO": { objectFit: 'cover', borderRadius: '16px' },
      "IMAGE": { borderRadius: '16px', width: 'auto', maxWidth: '100%', height: '112px', maxHeight: '100%'}
    },
  };

  const onUpdateRut = (rut:string) => {
    homeState.onUpdateRut!(rut)
  }
  

  return (
    <>
      {
        item.media.type === 'MOVIE' && 
        <IonSlide style={slideStyles[orientation]} onClick={onClickButton}>
          <img style={innerElStyles[orientation][item.media.type]} src={item.media.url}></img>
        </IonSlide> 
      }
      {
        item.media.type === 'VIDEO' && 
        <IonSlide style={slideStyles[orientation]} onClick={onClickButton}>
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
        </IonSlide>
      }
      {
        item.media.type === 'IMAGE' && !item.badgeText && !item.bodyText &&
        <IonSlide style={slideStyles[orientation]} onClick={onClickButton}>
            <img style={innerElStyles[orientation][item.media.type]} src={getImgUrl(item.media.url)} />
        </IonSlide> 
      }
      
          
          
          
      
      { movieOpen && item.media.type === "MOVIE" && <MovieDetailModal onClose={() => { setMovieOpen(false)}} movie={metadata} /> }
      { videoOpen && item.media.type === "VIDEO" && <VideoDetailModal onClose={() => { setVideoOpen(false) }} activity={metadata} /> }
      { imageOpen && item.media.type === "IMAGE" && <PromotionDetailModal onClose={() => { setImageOpen(false) }} promotion={metadata} site={homeState.site} onUpdateRut={onUpdateRut} /> }
    </>

  );
}

export default CarrouselItem;