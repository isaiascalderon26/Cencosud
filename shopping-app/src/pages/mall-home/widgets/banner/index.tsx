import { useState } from 'react';

import Expr from '../../../../lib/Expr';
import { generateCallback } from '../utils/callbackUtils';
import Analytics from '../../../../lib/FirebaseAnalytics';

/**
 * Style
 */
 import './index.less';

/**
 * Clients
 */
import { IBanner } from '../../../../clients/BannerClient';

/**
 * Models
 */
import {IBannerWidget} from '../../../../models/widgets/IWidget';

const UNIQUE_CLASS = 'pbigkzphpe';

interface IProps {
  setHomeState: (param: any) => void
  widget: IBannerWidget
  homeState: any
}

const Banner: React.FC<IProps> = (props) => {

  const scope = {
    // TODO not actions in page found yet
    onOpenActivityModal: (activity: { url: string }) => {
      console.log('Activity opened', activity);
    },

    onBannerhandler: (metadata: any) => {
      const dni = props.homeState.user?.document_number
      const site = props.homeState.site;
      
      if(props.homeState?.user?.email != 'invited'){
        if((dni && dni != '') || props.homeState?.dni_is_valid ) {
          const url = metadata.url;
          Expr.whenInNativePhone(async () => {
            Analytics.customLogEventName("banner", metadata.title, site?.name ? site?.name : "", "home", "activaciones");
            window.open(url, "_blank")
          });
          Expr.whenNotInNativePhone(() => {
            window.open(url, "_blank")
          })
        }else{
          props.setHomeState({
            mode: "EDIT_RUT"
          });
        }
      }else{
        props.setHomeState({
          menu_is_open: true
        });
      }
    }
  }

  const onClickButton = generateCallback(props.widget.callback, scope);
  
  return (
    <div className={`${UNIQUE_CLASS} banner`}>
      <div onClick={onClickButton}>
        <h3 className="font-bold">{props.widget.title}</h3>
        <div className="banner-box">
          <img className="banner-img" src={props.widget.image} />
        </div>
      </div>
    </div>
  )
}

export default Banner;