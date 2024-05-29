import { FC } from 'react';
import { Icon } from '../../display-data/Icon';
import './index.less';

interface IProps {
  items: Items[];
  cssClass?: string | string[];
  marginLeft?: string;
  marginRight?: string;
  marginTop?: string;
  marginBottom?: string;
  width?: string;
  height?: string;
}

interface Items {
  icon: string;
  text: string;
  onClick?: () => void;
}

export const ProfileOptions: FC<IProps> = (props) => {
  const _cssClass = ['component-profile-options-jqhwejkqh'];
  if (props.cssClass) {
    _cssClass.push(
      ...(typeof props.cssClass === 'string'
        ? [props.cssClass]
        : props.cssClass)
    );
  }

  const marginTop = props.marginTop || '0px';
  const marginBottom = props.marginBottom || '0px';
  const marginLeft = props.marginLeft || '0px';
  const marginRight = props.marginRight || '0px';
  const width = props.width || '327px';
  const height = props.height || '106px';

  return (
    <div className={`component-profile-options-jqhwejkqh ${ props.cssClass ? props.cssClass : ''}`} 
          style={{
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
            marginRight: marginRight,
            width: width,
            height: height
          }}
    >
      {props.items.map((item, key) => {
        return (
          <div key={key} className="component-profile-options-item" onClick={ item.onClick }>
            <div className="component-profile-options-item-icon">
              <Icon name={item.icon} variant='solid' />
            </div>
            <div className="component-profile-options-item-text">
              <p>{item.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
