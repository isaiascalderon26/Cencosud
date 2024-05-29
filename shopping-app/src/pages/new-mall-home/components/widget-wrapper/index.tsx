/**
 * Components
 */
import Map from '../../widgets/map';
import Banner from '../../widgets/banner';
import SocialLinks from '../../widgets/social-links';
import CarrouselWidget from '../../widgets/carrousel';
import StoreList from '../../widgets/carrousel';

/**
 * Models
 */
import IWidget from '../../../../models/widgets/IWidget';
interface IProps {
  setHomeState: (params: any) => void
  homeState: any
  widget: IWidget
  store?: string;
}

const WidgetWrapper: React.FC<IProps> = (props) => {
  const widgets = () => {
    switch (props.widget.type) {
      case 'BANNER':
        return <Banner store={props.store} widget={props.widget} setHomeState={props.setHomeState} homeState={props.homeState} />

      case 'MAP':
        return <Map widget={props.widget} setHomeState={props.setHomeState} homeState={props.homeState} />


      case 'CARROUSEL':
        return <CarrouselWidget widget={props.widget} homeState={props.homeState} />;

      case 'SOCIAL_LINKS':
        return <SocialLinks widget={props.widget} homeState={props.homeState} /> 

      default:
        return null
    }
  }

  return (
    <div>
      {widgets()}
    </div>
  );
}

export default WidgetWrapper;