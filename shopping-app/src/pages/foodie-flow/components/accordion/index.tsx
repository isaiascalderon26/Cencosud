/**
 * Styles
 */
import './index.less';

import { IonIcon } from "@ionic/react";
import { chevronUpOutline } from "ionicons/icons";
import { useRef, useState } from "react";

/**
 * Components
 */

/**
 * Lib
 */

/**
 * Clients
 */

/**
 * Models
 */

/**
 * Assets
 */

interface IProps {
  headerImage: React.ReactNode
  headerTitle: string
  headerSecondaryText?: string
  headerClick: () => void,
  headerStyle?: React.CSSProperties;
  closed?: boolean
}

const UNIQUE_CLASS = "sreefedsxz";

const Accordion:React.FC<IProps> = ({closed, headerImage, headerTitle, headerSecondaryText, headerClick, children, headerStyle}) => {

  const [collapsed, setCollapsed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleCollapse = () => {
    
    if(ref.current){
      if(collapsed){
        ref.current.style.maxHeight = ref.current.scrollHeight + "px";
      } else {
        ref.current.style.maxHeight = '0';
      }
    }
    setCollapsed(!collapsed);
  }

  const arrowCssStyleClass = collapsed ? 'down' : 'up';
  
  return (
    <div>
      {/* Header */}
      <div className={`header-${UNIQUE_CLASS} ${closed && 'local_closed'}`} style={headerStyle}>
        <div className='header-image'>
          {headerImage}
          {/*<Image type="STORE" src={local.logo} alt="Image" />*/}
        </div>
        <div className='header-text'>
          <div className='header-title'>{headerTitle}</div>
          {headerSecondaryText && <div className='header-link' onClick={headerClick}>{headerSecondaryText}</div> }
        </div>
        <div className={`accordion-icon`} onClick={handleCollapse}>
          <IonIcon src={chevronUpOutline} className={`icon ${arrowCssStyleClass}`} />
        </div>
      </div>
      {/* End Header */}

      {/* Body */}
      <div className={`accordion-${UNIQUE_CLASS}`} ref={ref}>
        {children}
      </div>
      {/* End Body */}

    </div>
  );
}

export default Accordion;