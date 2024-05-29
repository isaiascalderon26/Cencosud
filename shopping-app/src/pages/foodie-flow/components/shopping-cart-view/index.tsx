import React, { Fragment } from "react";
import { addOutline } from "ionicons/icons";
import {  IonContent, IonIcon, IonImg, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList } from "@ionic/react";

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import IItem from "../../../../models/foodie/IItem";
import ILocal from "../../../../models/foodie/ILocal";

/**
 * Components
 */
import Image from "../image";
import Accordion from "../accordion";
import CartButton from "../cart-button";
import ShoppingCartItem from "../shopping-cart-item";
import { DefaultHeader } from "../../../../components/page";

/**
 * Assets
 */
import ShopIcon from '../../../../assets/media/foodie/shop-icon.svg'
import EmptyCart from '../../../../assets/media/foodie/empty-cart.svg';
import ShopIconDark from '../../../../assets/media/foodie/shop-icon-dark.svg'
import EmptyCartDark from '../../../../assets/media/foodie/empty-cart-dark.svg';

const UNIQUE_CLASS = 'qaorgsakht';

interface IProps {

  data: {
    items: IItem[],
    local: ILocal
  }[],
  goToStore: (local: ILocal) => void,
  goBack: () => void,
  clearShoppingCart: () => void,
  onClickCartItem: (data:IItem) => void,
  onRemoved: () => void,
  onAddMoreToShoppingCart: () => void,
  onOpenCheckout: () => void,
  onDeleteItem: (data:IItem, localId: string) => void,
}

const ShoppingCartView:React.FC<IProps> = ({data, goToStore, goBack, clearShoppingCart, onClickCartItem, onRemoved, onAddMoreToShoppingCart, onOpenCheckout, onDeleteItem }) => {

  const isEmpty = data.filter(d => d.items.length > 0).length === 0;
  const isDarkMode = false;

  const canContinue = () => {
    if (data.some(d => d.items.some(it => it.enable === false)) 
    || data.some(d => d.local.state === 'CLOSED')){
      return false;
    }
    return true;
  }

  const handleGoBack = () => {
    if(canContinue()){
      goBack();
    }
  }

  const header = (
    <div className={`header-content-${UNIQUE_CLASS}`}>
      <DefaultHeader onBack={handleGoBack}/>
      <div className='clean-button' onClick={!isEmpty ? clearShoppingCart : () => {}}>
        <span className={isEmpty ? 'disabled' : '' }>Vaciar</span>
      </div>
    </div>
  );

  const content = (
        <div>
            <div className='header-list'>
              <h1 className="title">Tu carrito</h1>
              <p className='message'>Revisa a continuación tu pedido.</p>
            </div>

            <div className='divider'/>

            {isEmpty
            ?
              <div className='empty-content'>
                <IonImg src={!isDarkMode ? EmptyCart : EmptyCartDark} alt='Carrito vacio'/>
                <div className='main-text'>Carrito Vacío</div>
                <div className='secondary-text'>Aún no tienes productos en tu carrito</div>
              </div>
            : 
              data.map(({items, local}) => {
                if(items.length > 0){
                  return <Accordion 
                    key={local.id}
                    headerClick={() => goToStore(local)}
                    headerImage={<Image type="STORE" src={local.logo} alt="Image" />}
                    headerSecondaryText={local.state === 'CLOSED' ? "Cerrado: Volver a la tienda" : "Volver a la tienda"}
                    headerTitle={local.name}
                    closed={local.state === 'CLOSED'}
                  >
                    <IonList lines="none">
                      {items.map((item, index) => {
                        return (
                          <Fragment key={`${item.id}-${index}`}>
                            <IonItemSliding >
                              <IonItem className='shopping-cart-item'>
                                <ShoppingCartItem local={local} data={item} onClick={onClickCartItem} onRemoved={onRemoved}/>
                              </IonItem>
                              <IonItemOptions side="end">
                                <IonItemOption onClick={() => onDeleteItem(item, local.id) }>Eliminar</IonItemOption>
                              </IonItemOptions>
                            </IonItemSliding>
                            <div className='divider with-margin' />
                          </Fragment>
                        );
                      })}
                    </IonList>
                  </Accordion>
                } else {
                  return null;
                }
              })
            }

            <div className='add-button'>
                <div className='content' onClick={onAddMoreToShoppingCart}>
                  {isEmpty 
                    ? <IonIcon src={!isDarkMode ? ShopIcon : ShopIconDark} className="icon" />
                    : <IonIcon icon={addOutline} className="icon" />
                  }
                  
                  <span className='text'>Buscar otros productos</span>
                </div>
            </div>

          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
        </div>
      );
  const footer = (
    <CartButton
      buttonText='Continuar'
      locals={data.map(d => d.local.id)}
      hideIfNotData={true}
      onClick={onOpenCheckout}
      disabled={!canContinue()}
      />
    );

  return (
    <Fragment>
      {header}
      <IonContent className={`page-content-${UNIQUE_CLASS}`}>
        {content}
      </IonContent>
      {footer}
    </Fragment>
  )
}

export default ShoppingCartView;