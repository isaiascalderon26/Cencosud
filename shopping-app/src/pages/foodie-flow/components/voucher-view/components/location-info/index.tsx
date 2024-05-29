import { IonSkeletonText } from "@ionic/react";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface IProps {
  map_url?: string;
}

const LocationInfo: React.FC<IProps> = ({ map_url }) => {
  return (
    <div className='map-section'>
      <div className='map-section-title'>Recoge tu pedido en:</div>
      {
        map_url && map_url !== '' 
          ? 
            <div className='map'>
              <TransformWrapper
                limitToBounds={true}
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
                >
                <TransformComponent>
                  <img src={map_url} />
                </TransformComponent>
              </TransformWrapper>
            </div> 
          : 
            <IonSkeletonText className='map-skeleton' animated />
      }
    </div>
  );
}

export default LocationInfo;