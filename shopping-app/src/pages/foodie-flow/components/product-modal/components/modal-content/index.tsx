import { cartOutline, closeOutline } from 'ionicons/icons';
import { Fragment, useCallback, useState, useRef } from 'react';
import { IonIcon, IonContent, IonSkeletonText, IonHeader } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { IModifiersGroup } from './components/modifiers-section';
import IModifier from '../../../../../../models/foodie/IModifier';
import IItem, { isIItem } from '../../../../../../models/foodie/IItem';
import IProduct, { resolveImage } from '../../../../../../models/foodie/IProduct';

/**
 * Clients
 */
import ShoppingCartClient from '../../../../../../clients/ShoppingCartClient';
import NumberFormatter from '../../../../../../lib/formatters/NumberFormatter';

/**
 * Components
 */
import Footer from '../../../footer';
import Banner from './components/banner';
import Section from './components/section';
import CounterSection from './components/counter-section';
import CommentSection from './components/comment-section';
import ModifierSection from './components/modifiers-section';


const UNIQUE_CLASS = 'fsafxovveb';

interface IProps {
  data: IProduct | IItem;
  onClose: () => void;
  onAddToCart: (newItem: IItem) => void;
  possiblesModifiers?: IModifiersGroup;
}

const parseToItem = (data: IProduct | IItem): IItem => {
  if (isIItem(data)) return data;
  return { product_id: data.id, quantity: 1, comment: '', ...data, selected_modifiers: [] }
}

/**
 * Native scrollTo with callback
 * @param posY - offset to scroll to
 * @param callback - callback function
 */
function scrollTo(ref: any, posY: number, callback: () => void) {

  let scrollTimeOut: any;
  const onScroll = function () {
    if (scrollTimeOut) {
      clearTimeout(scrollTimeOut)
    }
    scrollTimeOut = setTimeout(() => {
      ref.removeEventListener('scroll', onScroll)
      callback();
    }, 50);
  }


  ref.addEventListener('scroll', onScroll)
  onScroll()
  ref.scrollTo({
    top: posY,
    behavior: 'smooth'
  })
}

const ModalContent: React.FC<IProps> = ({ onClose, onAddToCart, data, possiblesModifiers }) => {

  const [itemDraft, setItemDraft] = useState<IItem>(parseToItem(data));
  const [selections, setSelections] = useState<IModifier[]>(itemDraft.selected_modifiers);
  const [shakeId, setShakeId] = useState<string>();
  const contentRef = useRef<any>();


  const onCheckModifier = useCallback((mod: IModifier) => {
    if(data.enable){
      setSelections(sel => ([...sel, mod]))
      setItemDraft(draft => ({ ...draft, selected_modifiers: [...draft.selected_modifiers, mod] }))
    }
  }, [data.enable]);

  const onUncheckModifier = useCallback((mod: IModifier) => {
    if(data.enable){
      setSelections(sel => sel.filter(s => s.id !== mod.id))
      setItemDraft(draft => ({ ...draft, selected_modifiers: draft.selected_modifiers.filter(s => s.id !== mod.id) }))
    }
  }, [data.enable]);

  const onPickPModifierFromCategory = useCallback((newMod: IModifier) => {
    if(data.enable){
      setSelections(sel => ([...sel.filter(e => e.category.id !== newMod.category.id), newMod]))
      setItemDraft(draft => ({
        ...draft,
        selected_modifiers: draft.selected_modifiers
          .filter(e => e.category.id !== newMod.category.id)
          .concat([newMod])
      }))
    }
  }, [data.enable]);

  const setQuantity = useCallback((quantity: number) => {
    setItemDraft(draft => ({ ...draft, quantity }))
  }, []);

  const setComment = useCallback((comment: string) => setItemDraft(draft => ({ ...draft, comment: comment })), []);

  const addToCart = useCallback(() => {
    if (possiblesModifiers) {
      // Gets mandatory modifiers that are not selected
      const mandatoryModifiers = Object.values(possiblesModifiers)
        .filter(modifier => modifier.modifierCategory.min > 0 && modifier.products.length > 0)
        .filter(modifier =>  modifier.products.filter(p => itemDraft.selected_modifiers.some(sm => sm.id === p.id)).length < modifier.modifierCategory.min)
      if (mandatoryModifiers.length > 0) {

        let yPos = document.getElementById(mandatoryModifiers[0].modifierCategory.id)?.offsetTop;
        const parentHeight = document.getElementById('banner-image')?.offsetHeight || 0;

        if (yPos) {
          yPos += parentHeight;
          scrollTo(contentRef.current, yPos, () => {
            setShakeId(mandatoryModifiers[0].modifierCategory.id);
            setTimeout(() => {
              setShakeId(undefined);
            }, 1000)
          })
        }
        return;
      }
    }
    onAddToCart(itemDraft);
  }, [possiblesModifiers, itemDraft, onAddToCart]);

  const image = resolveImage(itemDraft.images)

  if (!possiblesModifiers) {
    return <Skeleton />
  }

  return (
    <Fragment>
      <IonHeader className={`ion-header-${UNIQUE_CLASS}`} style={{overflow: 'auto', height: '100%', zIndex: 1}} ref={contentRef}>
        <div id="banner-image">
          <Banner image={image} />
        </div>
        <IonContent style={{ overflow: 'visible' }} id="product-modal-content" >
          <Section main={{ title: itemDraft.name, description: itemDraft.description }} style={{ marginTop: 0 }} data={data}/>
          {data.enable && <CounterSection value={itemDraft.quantity} setValue={setQuantity} /> }
          <ModifierSection shakeId={shakeId} selections={selections} modifiersGroup={possiblesModifiers} onCheckModifier={onCheckModifier} onUncheckModifier={onUncheckModifier} onPickPModifierFromCategory={onPickPModifierFromCategory} disabled={ data.enable === false } />
          <CommentSection value={itemDraft.comment} setValue={setComment} disabled={ data.enable === false } />
        </IonContent>
      </IonHeader>
      <IonIcon icon={closeOutline} size="small" onClick={onClose} className={`close-icon-${UNIQUE_CLASS}`}/>
      <Footer
        onClick={() => addToCart()}
        btnText={isIItem(data) ? 'Modificar pedido' : 'Agregar producto'}
        startElement={<IonIcon className={`footer-btn-cart-icon-${UNIQUE_CLASS}`} icon={cartOutline} />}
        endElement={<div className={`footer-btn-price-${UNIQUE_CLASS}`}>{`${NumberFormatter.toCurrency(ShoppingCartClient.calculateItemStats(itemDraft).amount)}`}</div>}
        disabled={ data.enable === false }
      />
    </Fragment>
  )
}

const Skeleton: React.FC = () => {
  return (
    <div className={`modal-skeleton-${UNIQUE_CLASS}`}>
      <IonSkeletonText className='skeleton-image' animated />
      <IonSkeletonText className='skeleton-title' animated />
      <IonSkeletonText className='skeleton-sub-title' animated />
      <IonSkeletonText className='skeleton-body-part' animated />
      <IonSkeletonText className='skeleton-body-part' animated />
      <IonSkeletonText className='skeleton-body-part' animated />
    </div>
  )
}

export default ModalContent;

