import React from 'react';
import { IonModal } from '@ionic/react';

/**
 * Style
 */
 import './index.less';

/**
 * Components
 */
import ModalContent from './components/modal-content';
import ErrorModal, { IErrorModalProps } from '../../../../components/error-modal';

/**
 * Libs
 */
import EurekaConsole from '../../../../lib/EurekaConsole';

/**
 * Models
 */
import IProduct from '../../../../models/foodie/IProduct';
import IItem, { isIItem } from '../../../../models/foodie/IItem';
import { IModifiersGroup } from './components/modal-content/components/modifiers-section';
import ILocal from '../../../../models/foodie/ILocal';

/**
 * Clients
 */
import FoodieClient from '../../../../clients/FoodieClient';
import ShoppingCartClient from '../../../../clients/ShoppingCartClient';


const ANIMATION_TIME = 200;
const UNIQUE_CLASS = 'merdbpfzed';
const eureka = EurekaConsole({ label: "foodie-product-detail-modal" });


interface IProps {
  onClose: () => void;
  sourceRef?: React.RefObject<HTMLElement>
  data: IProduct | IItem;
  local: ILocal | undefined;
}

interface IState {
  possiblesModifiers?: IModifiersGroup,
  error_modal?: IErrorModalProps
}

export default class ProductModal extends React.Component<IProps, IState> {
  
  state: IState = {
    possiblesModifiers: undefined,
  }

  componentDidMount() {
     this.setContext()
  }

  getModifiersProducts = async () => {
    let modifiersMap:IModifiersGroup = {};
    const modifiersIds:string[] = [];
    
    this.props.data.modifiers.forEach((modifier) => {
      if (modifier.enable) {
        modifiersMap[modifier.id] = {modifierCategory: modifier, products: []};
        modifiersIds.push(modifier.id);
      }
    });

    const productModifiers = await FoodieClient.listProducts({
      query:{
        is_modifier_is: true,
        "enable_is":true,
        "category.id.keyword_is_one_of": modifiersIds,
        "local_id.keyword_is": this.props.local?.id
      },
      limit: 50,
      sort: {
        'sort': 'asc',
        'created_at': 'desc'
      }
    });

    productModifiers.data.forEach((prod) => {
      if(modifiersMap.hasOwnProperty(prod.category.id)) {
        modifiersMap[prod.category.id].products.push(prod);
      }
    })

    this.setState({
      possiblesModifiers: modifiersMap
    })
  }

  setContext = async () => {
    try {
      
      await this.getModifiersProducts();
      
    } catch (error) {
      eureka.error('Unexpected error setting context', error);

      this.setState({
        error_modal: {
          title: "Ocurrió un problema",
          message: "No pudimos cargar la información. ¿Deseas reintentar?",
          onRetry: () => {
              this.setState({ error_modal: undefined });
  
              setTimeout(() => {
                this.setContext();
              }, ANIMATION_TIME);
          },
          onCancel: () => {
              this.setState({ error_modal: undefined });
  
              // go to before page
              this.props.onClose();
          }
        }
      });
    }
  }
  
  onCloseModalHandler = async () => {
    this.props.onClose();
  }

  onAddToCart = (newItem: IItem) => {
    if(newItem.enable === true){
      const localId = this.props.data.local_id;
      if(isIItem(this.props.data)){
        ShoppingCartClient.updateItem(localId, newItem)
      } else {
        ShoppingCartClient.addItem(localId, newItem);
      }
      this.props.onClose();
    }
  }

  render() {
    const { error_modal, possiblesModifiers } = this.state;

    return (
      <IonModal 
        presentingElement={this.props.sourceRef as unknown as HTMLElement}
        isOpen={true}
        cssClass={`product-modal-${UNIQUE_CLASS}`} 
        swipeToClose={true}
        mode='ios'
        showBackdrop={false} 
        onWillDismiss={() => this.props.onClose()}
      >
        <ModalContent
          onClose={this.props.onClose}
          onAddToCart={this.onAddToCart}
          data={this.props.data}
          possiblesModifiers={possiblesModifiers}
        />
        {error_modal && <ErrorModal title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
      </IonModal>
    )
  }
};