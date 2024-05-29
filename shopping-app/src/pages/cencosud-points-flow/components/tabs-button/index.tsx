import moment, { Moment } from 'moment';
import memoize from 'fast-memoize';
import { ContentRect } from 'react-measure';
import { useScroll } from 'react-use-gesture';
import { IonSkeletonText, isPlatform } from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */
import Tab from './components/tab';

/**
 * Models
 */

import {IExchangeCategory} from '../../../../models/cencosud-points/IExchange';

export interface ITabsButtonProps {
  categories: IExchangeCategory[];
  select: (category: IExchangeCategory) => void;
  selected?: IExchangeCategory
}

const TabsButton: React.FC<ITabsButtonProps> = ({ categories, selected, select }) => {
  
  const tabsRef = useRef<any>()

  const contentContainer = useRef<any>(null)

  const onResizeTab = (index: number, contentRect: ContentRect) => {
    // Removing the size of the check icon only for the selected tab.
  }
  
  const renderContent = () => {
    return (
      <div className={`tabs-header ${isPlatform('ios') && 'ios-top-padding'}`}>
          <div className='tabs-content' style={{ width: '100%', overflow: 'auto' }} ref={tabsRef}>
            {categories.map((category, index) => {
                const isSelected = category.id === selected?.id;
                return (
                  <Tab
                    key={category.id}
                    data={category}
                    selected={isSelected}
                    onClick={() => select(category)}
                    onResize={(content) => onResizeTab(index, content)}
                  />
                )
              })}
          </div>
        </div>
    )
  }

  return (
    <div ref={contentContainer} className="tabs-button">
      {renderContent()}
    </div>
  )
}

export default TabsButton;
