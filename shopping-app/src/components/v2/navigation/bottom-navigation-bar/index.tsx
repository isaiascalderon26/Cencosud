import React, { FC, useEffect, useRef, useState } from 'react';
import { ButtonNavigationBarProps } from './types';
import './index.less'
import { Icon } from '../../display-data/Icon';

const BottomNavigationBar: FC<ButtonNavigationBarProps> = ({
  items,
  indicatorPosition = "top",
  initialIndex = 0,
  onIndexChanged,
  className
}) => {

  const limitedItems = items.slice(0, 5);

  const firstRender = useRef(true);

  const BAR_INDICATOR_WIDTH = 38;

  const navRef = useRef<HTMLDivElement>(null);

  const [separatorWidth, setSeparator] = useState(20);

  const [indexSelected, setIndexSelected] = useState(initialIndex);

  const initStyles = () => {
    if (navRef !== null) {
      const { width } = navRef.current!.getBoundingClientRect();
      setSeparator(((width - 32) / limitedItems.length))
    }
  }

  useEffect(() => {
    if (!firstRender.current) {
      onIndexChanged?.(indexSelected);
    }
  }, [indexSelected])

  useEffect(() => {
    setIndexSelected(initialIndex);
  }, [initialIndex])

  useEffect(() => {
    initStyles();
    setTimeout(initStyles, 300);
    if (firstRender.current) {
      firstRender.current = false;
    }
  }, []);

  const wrapperClassName = `mi-mall-button-navigation-bar indicator-${indicatorPosition} ${className}`;

  return (
    <div className={wrapperClassName} ref={navRef}>
      {/* <div className='button-indicator' style={{
        left: (indexSelected * separatorWidth) + 16 + ((separatorWidth - BAR_INDICATOR_WIDTH) / 2) - 4,
        width: BAR_INDICATOR_WIDTH
      }}></div> */}
      {limitedItems.map((item, key) => (
        <button key={key}
          onClick={() => setIndexSelected(key)}
          className={`mi-mall-button-navigation-bar-item ${indexSelected === key && 'mi-mall-button-navigation-bar-item--active'}`}
        >
          <div className='button-indicator'></div>
          {
            item.icon && <Icon name={item.icon} variant={indexSelected === key ? 'gradate' : 'lined'} />
          }
          <label className={`${indexSelected === key && 'text-gradient'} item-text`}>
            {item.text}
          </label>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigationBar;
