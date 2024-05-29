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
import { IBannerWidget } from '../../../../models/widgets/IWidget';
import { logEventBannerWidgetAnalytics } from '../utils/registerAnalyticsUtils';
import EventStreamer from '../../../../lib/EventStreamer';

const UNIQUE_CLASS = 'pbigkzphpe';

interface IProps {
  setHomeState: (param: any) => void;
  widget: IBannerWidget;
  store?: string;
  homeState: any;
}

const Banner: React.FC<IProps> = (props) => {
  const scope = {
    OnComidaBannerHandler: (metadata: any) => {
      EventStreamer.emit(
        'NAVIGATE_TO_PUSH',
        `/foodie/${props.store}`
      );
    },

    onBannerhandler: (metadata: any) => {
      const dni = props.homeState.user?.document_number;

      if (props.homeState?.user?.email != 'invited') {
        if ((dni && dni != '') || props.homeState?.dni_is_valid) {
          const url = metadata.url;
          const redirect_url = metadata.hasOwnProperty('query_param')
            ? `${url}?${metadata.query_param}=${props.homeState?.user?.primarysid}`
            : url;

          window.open(redirect_url, '_blank');
        } else {
          props.setHomeState({
            mode: 'RUT_SCREEN',
          });
        }
      } else {
        props.setHomeState({
          menu_is_open: true,
        });
      }
    },
  };

  const onClickButton = () => {
    Expr.whenInNativePhone(async () => {
      logEventBannerWidgetAnalytics(
        props.widget,
        props.homeState?.user?.email,
        props.homeState.site.name
      );
    });
    generateCallback(props.widget.callback, scope)();
  };

  return (
    <div className={`${UNIQUE_CLASS} banner`}>
      <div
        onClick={() => {
          onClickButton();
        }}
      >
        <div className="banner-box">
          <img className="banner-img" src={props.widget.image} />
        </div>
      </div>
    </div>
  );
};

export default Banner;
