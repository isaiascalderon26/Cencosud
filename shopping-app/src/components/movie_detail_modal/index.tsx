import React, { Fragment } from 'react';
import './index.less';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import Expr from '../../lib/Expr';
import { closeCircleSharp } from 'ionicons/icons';
import BackgroundDummy from './../../assets/media/dummy/background-dummy-1.png';
import Calendar from './../../assets/media/movies/calendar.svg';
import Timer from './../../assets/media/movies/timer.svg';
import BackdropLoading from '../backdrop-loading';
import { ISessions } from '../../models/store-data-models/ISessions';
import moment from 'moment';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import FirebaseAnalytics from "../../lib/FirebaseAnalytics";
interface IProps {
  onClose: (action: "close") => void;
  movie?: any;
}

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  displayDetail: boolean,
  displaySchedule: boolean,
  filmFunctions?: any,
}

export default class MovieDetailModal extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
    displayDetail: true,
    displaySchedule: false
  }

  componentDidMount = () => {
    FirebaseAnalytics.customLogEvent("ionic_app", "cine");

    setTimeout(async () => {
      await this.onDetailMovie();
      const films_functions = (this.props.movie.meta_data.film_functions || []).filter((f:Record<string,any>) => f.date ===  moment().format('YYYY-MM-DD'));
      const { versions }  = films_functions[0] || {};

      let Sessions:Array<ISessions> = [];
      if(versions){
        versions.forEach((element:Record<string,any>) => {
          const { type, hour } = element;
          hour.forEach((hour:string) => {
            const range_hour = moment().format('HH:mm');
            const format_hour = moment(hour, 'HH:mm').format('HH:mm');
            if(range_hour < format_hour){
              Sessions.push({
                type: type,
                hour: hour,
                film_id: this.props.movie.meta_data.corporate_film_id,
                title: this.props.movie.meta_data.title,
                cinema: this.props.movie.cinema
              })
            }
          });
        });
      }

      this.setState({
        filmFunctions: Sessions
      })

    }, 700)
  }

  onDetailMovie = async () => {
    this.setState({
      mode: 'PAGE_LOADED'
    });
  }

  onCloseModalHandler = async () => {
    this.props.onClose("close");
  }

  onDisplayDetail = () => {
    this.setState({
      displayDetail: true,
      displaySchedule: false
    });
  }

  onDisplaySchedule = () => {
    this.setState({
      displayDetail: false,
      displaySchedule: true
    });
  }

  onOpenSession = (item:ISessions) => {
    let url = "";
    if(item.cinema === "CINEMARK"){
      url = `https://www.cinemark.cl/pelicula?tag=${this.props.movie.code_store}&corporate_film_id=${item.film_id}&pelicula=${item.title?.toLocaleLowerCase().replaceAll(" ", "-")}`;
    }

    if(item.cinema === "CINEPLANET"){
      //remove special characters
      let title = item.title?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") as string;
      title = title.toLocaleLowerCase().replaceAll(" ", "-");
      url = `https://www.cineplanet.cl/peliculas/${title}`;
    }

    Expr.whenInNativePhone(async () => {
     let inAppBrowserRef = InAppBrowser.create(url, '_blank', { location: 'no' });
      inAppBrowserRef.show()
    });
    Expr.whenNotInNativePhone(() => {
      window.open(url, "_blank")
    })
  }

  firstLetterUpper = (str:string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  render() {
    const { mode } = this.state;
    return <IonModal swipeToClose={false} onDidDismiss={this.onCloseModalHandler} backdropDismiss={true} cssClass={`movie-detail-modal ${mode.replaceAll("_", "-").toLocaleLowerCase()}`} isOpen={true}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </IonModal>
  }

  renderINITIAL_STATE = () => {
    return <Fragment>
      <BackdropLoading message='Cargando...'> </BackdropLoading>
    </Fragment>
  }

  renderPAGE_LOADED = () => {
    const { movie } = this.props
    let url;
    let hours;
    let minutes;

    if (movie.trailer) {
      const trailer = movie.trailer.split('/');
      const idYoutube = trailer[trailer.length - 1]

      url = `https://www.youtube.com/embed/${idYoutube}`
      url = url.replace('watch?v=', '');
    }

    if (movie.runtime) {
      hours = Math.floor(movie.runtime / 60);
      minutes = movie.runtime % 60;
    }

    return <Fragment>
      <div className='background-modal' style={{ backgroundImage: `url(${movie.posterUrl})` }}></div>
      <IonContent >
        <div onClick={this.onCloseModalHandler}>
          <IonIcon icon={closeCircleSharp}></IonIcon>
        </div>
        {url ?
          <iframe placeholder={BackgroundDummy} title={movie.title} src={url} width="100%" height="208" allowFullScreen={true}></iframe>
          :
          <img src={movie.posterUrl} width="100%" height="208" alt=''></img>
        }
        <div >
          <h1>{movie.title.toLocaleLowerCase()}</h1>
          <p>
            <span>{movie.ratingDescription}</span>
            {movie.runtime ? <span>    {hours} HR {minutes} MIN </span> : ' '}
            <span>{movie.genre}</span>
          </p>
        </div>
        <div>
          {<span className={this.state.displayDetail ? 'active' :  ''} onClick={() => this.onDisplayDetail()}>Detalles</span>}
          {<span className={this.state.displaySchedule ? 'active' :  ''} onClick={() => this.onDisplaySchedule()}>Horarios</span>}
        </div>
        {this.state.displayDetail ? <>
          <div>
            <h1>Sinopsis</h1>
            <p>{movie.synopsis}</p>
          </div>
          <div></div>
        </> : null}

        {this.state.displaySchedule && this.state.filmFunctions.length > 0  ?
        <Fragment>
          <div>
            <h1>Horarios disponibles</h1>
            <div className="cinema-subtitle-body">
              <IonIcon icon={Calendar}></IonIcon>
              <span className="cinema-subtitle">
                {this.firstLetterUpper(moment().format('dddd'))}, {moment().format('DD')} de {this.firstLetterUpper(moment().format('MMMM'))}
              </span>
            </div>
          </div>
          {this.state.filmFunctions.map((item:ISessions, index:number) => {
            return (
              <div className="cinema-schedule" key={item.type+index.toString()}>
                <div className="body-cinema-schedule" onClick={() => this.onOpenSession(item)}>
                  <IonIcon icon={Timer}></IonIcon>
                  <span className="text-cinema">{moment(item.hour, 'HH:mm').format('HH:mm')} | {item.type}</span></div>
              </div>
            )
          })}
          </Fragment>
        : this.state.displaySchedule && this.state.filmFunctions.length === 0 ?
        <div>
          Para más información ingresa al sitio web de tu cine favorito.
        </div> : null }
      </IonContent>
    </Fragment>
  }
};
