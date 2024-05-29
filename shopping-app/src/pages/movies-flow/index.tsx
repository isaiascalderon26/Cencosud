import React, { Fragment } from 'react';
import { arrowBack } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { withIonLifeCycle, IonPage, IonContent, IonIcon, IonSkeletonText, IonHeader, IonGrid, IonRow, IonCol } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import MovieClient from '../../clients/MovieClient';

/**
 * Models
 */
import { IMovie } from '../../models/store-data-models/IMovie';

/**
 * Components
 */
import MovieDetailModal from '../../components/movie_detail_modal';

//import RemoteConfigClient from '../../clients/RemoteConfigClient';
//import AlgoliaSearch from '../../lib/AlgoliaSearch';
interface IProps extends RouteComponentProps<{
  id: string
}> { }

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  movies?: Array<IMovie>,
  movie?: IMovie,
  movie_modal: boolean;
}

export default withIonLifeCycle(class MoviesPage extends React.Component<IProps, IState> {

  state: IState = {
    mode: "INITIAL_STATE",
    movie_modal: false
  }

  componentDidMount = async () => { 
    await this.onGetMerchantActivities();
  }

  onGetMerchantActivities = async () => {
    const name = this.props.match.params.id;
    let movies: Array<IMovie> = [];
    let cineId;

    const sites = await UserClient.getSites();

    sites.data.map((site: any) => {
      if (site.name === name) {
        cineId = site.meta_data.cineId;
      }
    })
    try {
      if (cineId) {
        // const index = RemoteConfigClient.get('ALGOLIA_INDEX_SHOPPING_MOVIES_INFO', process.env.REACT_APP_ALGOLIA_INDEX_SHOPPING_MOVIES_INFO);
        // movies = await AlgoliaSearch.searchExact(cineId, [`code_store:${cineId}`], 30, index) || [];

        const moviesResp = await MovieClient.list({
          offset: 0,
          limit: 30,
          query: {
            "code_store.keyword_is": cineId
          }
        });

        movies = moviesResp.data;
      }
      this.setState({
        mode: 'PAGE_LOADED',
        movies
      })
    } catch (error) {
      console.log(error);
    }
  }

  onOpenMovieHandler(movie: IMovie) {
    this.setState({
      movie_modal: true,
      movie
    })
  }
  onCloseModalHandler() {
    this.setState({
      movie_modal: false
    })
  }

  render() {
    const { mode, movie_modal } = this.state;
    return <IonPage className={`cartelera-cines-flow ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
      {movie_modal ? <MovieDetailModal
        onClose={() => { this.onCloseModalHandler() }}
        movie={this.state.movie}></MovieDetailModal> : null}
    </IonPage>
  }
  renderINITIAL_STATE = () => {
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.props.history.goBack() }} >
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '0 24px', width: '100%' }}>
          <IonSkeletonText style={{ height: "32px", width: "75%", borderRadius: "12px", marginTop: "24px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "164px", width: "100%", borderRadius: "12px", marginTop: "32px" }} animated={true}></IonSkeletonText>
          <IonSkeletonText style={{ height: "164px", width: "100%", borderRadius: "12px", marginTop: "16px" }} animated={true}></IonSkeletonText>
        </div>
      </IonContent>
    </Fragment>
  }
  renderPAGE_LOADED = () => {
    const { movies } = this.state
    const { id } = this.props.match.params
    return <Fragment>
      <IonHeader>
        <div onClick={() => { this.props.history.goBack() }} >
          <IonIcon icon={arrowBack}></IonIcon>
        </div>
      </IonHeader>
      <IonContent className='activities-init'>
        <div>
          <h1>La mejores<br />películas para ti</h1>
        </div>
        <div>
          <IonGrid>
            <IonRow>
              {movies?.map((movie: IMovie) => {
                return (
                  <IonCol size="6" size-sm key={movie.objectID} onClick={() => this.onOpenMovieHandler(movie)}>
                    <div className='movie-card'>
                      <div className='poster'>
                        <img src={movie.posterUrl}></img>
                      </div>
                      <div className='movie-text'>
                         <h3>{movie.title}</h3>
                         <p>{movie.synopsis}</p>
                      </div>
                    </div>
                  </IonCol>
                )
              })}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </Fragment >
  }
})
