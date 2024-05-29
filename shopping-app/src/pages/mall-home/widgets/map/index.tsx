import { useState } from 'react';

import { generateCallback } from '../utils/callbackUtils';

/**
 * Style
 */
 import './index.less';

/**
 * Components
 */
 import ModalMapDetail from '../../components/modal-map';

/**
 * Models
 */
import {IMapWidget} from '../../../../models/widgets/IWidget';

const UNIQUE_CLASS = 'apfcahfjcn';

interface IProps {
  setHomeState: (param: any) => void
  widget: IMapWidget
  homeState: any
}

const Map: React.FC<IProps> = (props) => {

  const [openMapModal, setOpenMapModal] = useState<boolean>(false);
  const [modalArgs, setModalArgs] = useState<any>();

  const scope = {
    onClickMap: ( data: any) => {
      setModalArgs(data);
      setOpenMapModal(true);
    }
  }

  const onClickButton = generateCallback(props.widget.callback, scope);
  
  return (
    <div className={`${UNIQUE_CLASS} map`}>
      <h3 className="font-bold">{props.widget.title}</h3>
      <div className='map-box'>
        <div className='map' style={{backgroundImage: `url(${props.widget.image})`}} onClick={onClickButton} >
          <div className="button">Más información</div>
        </div>
      </div>
      {openMapModal && <ModalMapDetail onClose={() => setOpenMapModal(false)} modal_is_open={openMapModal} 
        site={modalArgs.site} 
        icons_share_location={modalArgs.icons_share_location} 
      />}
    </div>
  )
}

export default Map;