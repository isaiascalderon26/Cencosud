import moment from 'moment';
import memoize from 'fast-memoize';
import { ContentRect } from 'react-measure';
import { useScroll } from 'react-use-gesture';
import { IonChip, IonIcon, IonLabel, IonSkeletonText, isPlatform } from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */
import Image from '../image';
import Tab from './components/tab';
import CartButton from '../cart-button';
import ProductItem from './components/product-item';
import SectionTitle from './components/section-title';
import { DefaultHeader } from '../../../../components/page';
import ProductItemSeparator from './components/product-item-separator';

/**
 * Models
 */
import ISection from '../../../../models/foodie/ISection';
import IProduct from '../../../../models/foodie/IProduct';
import ICategory from '../../../../models/foodie/ICategory';
import ILocal, { IOpeningHours } from '../../../../models/foodie/ILocal';
import { arrowBack, cartOutline } from 'ionicons/icons';
import ShoppingCartClient from '../../../../clients/ShoppingCartClient';

const TAB_MARGIN_RIGHT = 8;
const HEADER_HEIGHT = isPlatform('ios') ? 113 : 97;
const SCROLL_OFFSET = 8;
const CHECK_ICON_SIZE = 24;
const END_ZONE_HEIGHT = 600;
const UNIQUE_CLASS = 'oglizftkna';

const getCloseHour = (opening_hours: IOpeningHours[]): number | undefined => {
  const day = moment().day();
  const opening_hour = opening_hours.find(o => o.day === day);
  const lastCloseTime = opening_hour?.hours.reduce((max:number, h) => {
    if(h.close > max){
      return h.close;
    }
    return max;
  }, 0)

  return lastCloseTime;
} 

const convertToCategories = (products?: IProduct[]): ICategory[] => {
  if (!products) {
    return []
  }

  let current: ICategory | undefined;
  const categories: ICategory[] = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (product.category.id !== current?.id) {
      current = product.category;
      categories.push(current);
    }
  }

  return categories;
}

const convertToSections = (products?: IProduct[]): ISection[] => {
  if (!products) {
    return []
  }

  let current: ISection | undefined;
  const sections: ISection[] = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (product.category.id !== current?.category.id) {
      current = { category: product.category, products: [] };
      sections.push(current);
    }

    current!.products.push(product);
  }

  return sections;
}

const getCumulativeTabWidths = memoize((tabWidths: number[]) => {
  
  return tabWidths.map((_, i) =>
    tabWidths.reduce(
      (acc, curr, j) => (j < i ? acc + curr + TAB_MARGIN_RIGHT - 12: acc),
      0
    )
  )
});

const getSpaceElementToBottom = (objId: string) => window.innerHeight - HEADER_HEIGHT - (document.getElementById( objId )?.offsetHeight || 0) + SCROLL_OFFSET;

/**
 * Native scrollTo with callback
 * @param posX - offset to scroll to
 * @param posY - offset to scroll to
 * @param callback - callback function
 */
 function scrollTo(ref: any, posX?: number, posY?: number, callback?: () => void, delay = 50) {

  let scrollTimeOut: any;
  const onScroll = function () {
    if (scrollTimeOut) {
      clearTimeout(scrollTimeOut)
    }
    scrollTimeOut = setTimeout(() => {
      ref.removeEventListener('scroll', onScroll)
      callback && callback();
    }, delay);
  }


  ref.addEventListener('scroll', onScroll)
  onScroll()
  ref.scrollTo({
    left: posX,
    top: posY,
    behavior: 'smooth'
  })
}

export interface IStoreViewProps {
  local: ILocal;
  products?: IProduct[];
  fetching_more: boolean;
  onBack: () => void;
  openCart: () => void,
  onClickProduct: (product: IProduct) => void;
  onClickCartButton: () => void;
  onFetchMoreProducts: () => void;
}

const StoreView: React.FC<IStoreViewProps> = ({ local, products, fetching_more, onBack, openCart, onClickProduct, onClickCartButton, onFetchMoreProducts }) => {
  
  const [endZone, setEndZone] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const [sections, setSections] = useState(convertToSections(products));
  const [categories, setCategories] = useState(convertToCategories(products));

  const [bindXYScrolls, setBindXYScrolls] = useState(true);
  const tabsRef = useRef<any>()

  const y = useRef(0);
  const contentContainer = useRef<any>(null)
  const tabWidths = useRef(sections.map(_ => 0));
  const scrollAnchors = useRef(sections.map(_ => 0));

  const localsWithItems = ShoppingCartClient.getLocalsIdsWithCartItems();
  const hasItemsFromOtherStores = localsWithItems.filter(l => l !== local.id).length > 0;
  const stats = ShoppingCartClient.calculateMultiOrdersStats();


  let closeTimeText = '';
  if(local.opening_hours){
    const timeToClose = getCloseHour(local.opening_hours)
    closeTimeText = timeToClose ? ` · Cierra a las ${timeToClose.toString().slice(0, 2)}:${timeToClose.toString().slice(2)} hrs` : ''; 
  }

  const bind = useScroll(({ xy }) => {
    y.current = xy[1];

    // detect end of scroll to fetch more
    if (window.innerHeight + xy[1] > contentContainer.current.scrollHeight - END_ZONE_HEIGHT) {
      if (!endZone) {
        setEndZone(true);
      }
    } else {
      if (endZone) {
        setEndZone(false);
      }
    }
    
    const activeIndex = scrollAnchors.current.reduce(
      (acc, curr, i) => xy[1] + HEADER_HEIGHT + SCROLL_OFFSET >= curr ? i : acc,
      0
    );

    // update selected if needed
    if (selected !== sections[activeIndex].category.id && bindXYScrolls) {
      setSelected(sections[activeIndex].category.id);
    }
  })

  const onResizeTab = (index: number, contentRect: ContentRect) => {
    // Removing the size of the check icon only for the selected tab.
    tabWidths.current[index] = contentRect.bounds!.width - (sections.findIndex(s => selected === s.category.id) === index ? CHECK_ICON_SIZE : 0);
  }
  
  const onSectionTitleResize = (index: number, contentRect: ContentRect) => {
    scrollAnchors.current[index] = contentRect.bounds!.top + y.current - SCROLL_OFFSET + (index * 2);
  }

  const onTabClick = (index: number) => {
    if (contentContainer.current) {
      setBindXYScrolls(false);
      setSelected(sections[index].category.id);

      scrollTo(tabsRef.current, getCumulativeTabWidths(tabWidths.current)[index])
      scrollTo(contentContainer.current, undefined, scrollAnchors.current[index] - HEADER_HEIGHT - SCROLL_OFFSET, () => {
        setBindXYScrolls(true);
      })
    }
  }

  const renderContent = () => {
    if (!products) {
      return (
        <>
          <div className='row-skeleton'>
            <IonSkeletonText animated style={{ flex: 1, height: '40px', borderRadius: '8px', marginRight: '16px', marginLeft: '24px' }} />
            <IonSkeletonText animated style={{ flex: 1, height: '40px', borderRadius: '8px', marginRight: '16px' }} />
            <IonSkeletonText animated style={{ flex: 0.5, height: '40px', borderRadius: '8px 0 0 8px' }} />
          </div>
          <div className='skeleton'>
            <IonSkeletonText animated style={{ width: '100%', height: '140px', marginBottom: '25px', borderRadius: '8px' }} />
            <IonSkeletonText animated style={{ width: '100%', height: '140px', marginBottom: '25px', borderRadius: '8px' }} />
            <IonSkeletonText animated style={{ width: '100%', height: '140px', marginBottom: '25px', borderRadius: '8px' }} />
            <IonSkeletonText animated style={{ width: '100%', height: '140px', marginBottom: '25px', borderRadius: '8px' }} />
          </div>
        </>
      )
    }
    
    if (!products.length) {
        return (
            <div></div>
        )
    }
    
    return (
      <div className='content'>
        <div className={`tabs-header ${isPlatform('ios') && 'ios-top-padding'}`}>
          <div className='tabs-content' style={{ width: '100%', overflow: 'auto' }} ref={tabsRef}>
            {categories.map((category, index) => {
                const isSelected = category.id === selected;
                return (
                  <Tab
                    key={category.id}
                    data={category}
                    selected={isSelected}
                    onClick={() => onTabClick(index)}
                    onResize={(content) => onResizeTab(index, content)}
                  />
                )
              })}
          </div>
        </div>

        {sections.map((section, secIndex) => {
          return (
            <div id={section.category.id} key={section.category.id} className={local.state === 'CLOSED' ? "section-closed" : "section"}>
              <SectionTitle onResize={(contentRect) => onSectionTitleResize(secIndex, contentRect)}>
                {section.category.name}
              </SectionTitle>
              {section.products.map((product, prodIndex) => {
                const isNotLast = prodIndex < section.products.length - 1
                return (
                  <div key={`${product.id}-${prodIndex}`}>
                    <ProductItem local={local.id} data={product} onClick={onClickProduct} />
                    {isNotLast && <ProductItemSeparator /> }
                  </div>
                )
              })}
            </div>
          )
        })}
        {
        sections.length > 0 && 
          <div className="section">
            <div style={{height: 50}} />
          </div>
        }
      </div>
    )
  }

  useEffect(() => {
    if (products) {
      setSections(convertToSections(products));
      setCategories(convertToCategories(products));
    }
  }, [products]);

  /**
   * the category selections its managed by scroll or user click
   * if none of that happen I set first category as selected
   */
  useEffect(() => {
    if (categories.length) {
      if (!selected) {
        setSelected(categories[0].id)
      }
    }
  }, [selected, categories]);

  useEffect(() => {
    if (endZone) {
      onFetchMoreProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endZone])


  useEffect(() => {
    if (selected) {
      const posXtoScroll = getCumulativeTabWidths(tabWidths.current)[categories.findIndex(c => c.id === selected)];
      scrollTo(tabsRef.current, posXtoScroll)
    }
  }, [categories, selected])



  return (
    <div {...bind()} ref={contentContainer} className={UNIQUE_CLASS}>
      <div className='buttons-header'>
        { !hasItemsFromOtherStores 
          ? <DefaultHeader onBack={onBack} />
          : <div id="default-header">
              <div className="header-buttons">
                <IonIcon icon={arrowBack} onClick={onBack}/>  
                <IonChip onClick={openCart}>
                  <IonIcon icon={cartOutline} className='white-icon'/>
                  <IonLabel>{stats.quantity}</IonLabel>
                </IonChip>
              </div>
            </div>
        } 
      </div>

      <div className="restaurant-details">
        <div className='logo'>
          <Image src={local.logo} alt="restaurant logo" type="STORE" />
        </div>
        <div className='restaurant-info'>
          <h1 className="title">{local.name}</h1>
          <p className='open-info'>
            <span className={local.state === 'CLOSED' ? 'status-close' : 'status-open'}>
              { local.state === 'CLOSED' ? 'Cerrado' : 'Abierto' }
            </span>
            {closeTimeText}
          </p>
        </div>
      </div>

      {renderContent()}

      <div className='fetching-more'>
        {fetching_more && <span className='indicator'>Cargando...</span>}
      </div>

      <CartButton
        locals={[local.id]} // TODO: Multipedido
        buttonText="Ver mi carrito"
        hideIfNotData={true}
        style={{ display: sections.length ? 'block' : 'none' }}
        onClick={onClickCartButton} />
    </div>
  )
}

export default StoreView;