import React, { Fragment } from 'react';
import './index.less';
import i18n from '../../../../lib/i18n';
import locales from './locales';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import IconGoogleMaps from '../../../../assets/media/icon-google-maps.svg';
import IconWaze from '../../../../assets/media/icon-waze.svg';
import IconMetroApp from '../../../../assets/media/icon-metro-app.svg';
import IconMoovit from '../../../../assets/media/icon-moovit.svg';
import { close } from 'ionicons/icons';
const localize = i18n(locales);

interface IProps {
  modal_is_open: boolean;
  onClose: (action: "close") => void;
  site: any;
  icons_share_location?: Array<{type:string,state:boolean,url:string}>;
}

interface IState {
  open_modal: boolean;
}

export default class ModalMapDetail extends React.Component<IProps,IState> {;
    state: IState = {
        open_modal: this.props.modal_is_open
    }

    onCloseModalHandler = () => {
        this.props.onClose("close");

        let site = this.props.site.name;
        if(site) {
            window.history.pushState('', '', `/mall-home/${site}`);
        }
    }

    capitalizeString = (str:string) => {
        return str.replace(/\b\w/g, function(l){ return l.toUpperCase() })
    }

    componentDidMount() {
        let site = this.props.site.name;
        if(site) {
            window.history.pushState('', '', `/drive-map/${site}`);
        }
    }
    decorate = (id: string) => {
        switch(id) {
          case 'portal florida': return 'florida center';
          case 'portal dehesa': return 'portal la dehesa';
          case 'portal nunoa': return 'portal ñuñoa';
        }
        return id;
      }

    render() {
        const { tiendas } = this.props.site.meta_data.schedules;

        const date = new Date().toISOString().split('T')[0];
        const openSchedule = tiendas[0];
        const closeSchedule = tiendas[1];
        const newDate = new Date(`${date} ${new Date().getHours()}:${new Date().getMinutes()}:00`.replace(/-/g, "/"));

        let IsOpen = newDate > new Date(`${date} ${openSchedule}:00`.replace(/-/g, "/")) && newDate < new Date(`${date} ${closeSchedule}:00`.replace(/-/g, "/"));
       
        return <Fragment>
            <div className='modal-icons-share'>
                <IonModal swipeToClose={false} onDidDismiss={this.onCloseModalHandler} cssClass={'icons-share'} isOpen={this.state.open_modal}>
                <IonContent>
                    <div>
                        <IonIcon icon={close} onClick={this.onCloseModalHandler} />
                    </div>
                    <div>
                        <h3>{localize('TITLE')}</h3>
                        <h1>{this.decorate(this.props.site.name)}</h1>
                    </div>
                    <div className='text-body'>
                        { IsOpen ? <p><span style={{color: '#1bb542'}}>Abierto</span> · Cierra a las {closeSchedule} hrs.</p>
                        : <p><span style={{color: '#FF3B30'}}>Cerrado</span> · Abre a las {openSchedule} hrs.</p> 
                        }
                        <p>{localize('TEXT_BODY')}</p>
                    </div>
                    <div className='social-icons'>
                        {this.props.icons_share_location!.map((value:Record<string,any>, i) => {
                            const { type, state, url } = value;
                            return ( 
                                <Fragment key={i+type}>
                                    {type === 'google-maps' &&  state ? <span><a href={url} target="_blank"><img src={IconGoogleMaps} alt='Google Maps' /><span>Google Maps</span></a></span> : null}
                                    {type === 'waze' && state ? <span><a href={url} target="_blank"><img src={IconWaze} alt='Waze' /><span>Waze</span></a></span> : null}
                                    {type === 'metro' && state ? <span><a href={url} target="_blank"><img src={IconMetroApp} alt='Metro App' /><span>Metro</span></a></span>: null}
                                    {type === 'moovit' && state ? <span><a href={url} target="_blank"><img src={IconMoovit} alt='Moovit'/><span>Moovit</span></a></span>: null}
                                </Fragment>
                            )
                        })}
                    </div>
                </IonContent>
                </IonModal>
            </div>
        </Fragment>
    }
};