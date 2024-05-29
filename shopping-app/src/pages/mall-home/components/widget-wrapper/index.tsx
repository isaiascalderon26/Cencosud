/**
 * Style
 */
 import './index.less';

/**
 * Components
 */
import Map from '../../widgets/map';
import Banner from '../../widgets/banner';

import SocialLinks from '../../widgets/social-links';
import CarrouselWidget from '../../widgets/carrousel';

/**
 * Models
 */
import IWidget from '../../../../models/widgets/IWidget';

const UNIQUE_CLASS = 'vdbhylmbse';
interface IProps {
  setHomeState: (params: any) => void
  homeState: any
  widget: IWidget
}

const WidgetWrapper: React.FC<IProps> = (props) => {
  const widgets = () => {
    switch (props.widget.type) {
      case 'BANNER':
        return <Banner widget={props.widget} setHomeState={props.setHomeState} homeState={props.homeState} />
      
      case 'MAP':
        return <Map widget={props.widget} setHomeState={props.setHomeState} homeState={props.homeState} />
      

      case 'CARROUSEL':
        return <CarrouselWidget widget={props.widget} homeState={props.homeState} />;
      
      case 'SOCIAL_LINKS':
        return <SocialLinks { ...props.widget} />

      default:
        return null
    }
  }

  return (
    <div className={`${UNIQUE_CLASS} widget`}>
      { widgets() }
    </div>
  );
}

export default WidgetWrapper;