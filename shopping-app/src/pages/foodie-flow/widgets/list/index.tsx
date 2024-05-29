
/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { IonIcon, IonList } from '@ionic/react';

/**
 * Components
 */
import ListItem from './components/list-item';
import ILocal from '../../../../models/foodie/ILocal';
import merchantHeaderIcon from './../../../../assets/media/svg/illustrated/merchant-header-icon.svg';



interface IProps {
  locals: ILocal[];
  onShowStoreDetail: () => void;
  onSelectedLocal: (local: ILocal) => void;
}

const ListWidget: React.FC<IProps> = ({
  locals,
  onSelectedLocal,
  onShowStoreDetail
}) => {

  const localsSorts: ILocal[] = locals.sort((a, b) => {
    // Comparamos los valores de local.state
    if (a.state === 'CLOSED' && b.state !== 'CLOSED') {
      return 1; // 'CLOSED' se coloca al final
    } else if (a.state !== 'CLOSED' && b.state === 'CLOSED') {
      return -1; // 'CLOSED' se coloca al final
    } else {
      return 0; // Mantenemos el orden original
    }
  });
  
  return (
    <div className="container">
      <div>
        <h3 className="font-bold section-title">
          <IonIcon
            size="22"
            className="carousel-header-icon"
            src={merchantHeaderIcon}
          />
          Restaurantes
        </h3>
      </div>
      <IonList className="list">
        {localsSorts.map((local) => (
          <ListItem
            local={local}
            onSelectedLocal={onSelectedLocal}
            onShowStoreDetail={onShowStoreDetail}
          />
        ))}
      </IonList>
    </div>
  );
};

export default ListWidget;
