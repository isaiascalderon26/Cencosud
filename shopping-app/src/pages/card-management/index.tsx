import {
  withIonLifeCycle,
  IonPage,
} from '@ionic/react';
import { AxiosError } from 'axios';
import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';

// style
import './index.less';
// components
import AddCard from './components/add-card';
import CardList from './components/card-list';
import Page, { DefaultHeader } from '../../components/page';
import BackdropLoading from '../../components/backdrop-loading';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
// lib
import Expr from '../../lib/Expr';
import EurekaConsole from '../../lib/EurekaConsole';
import EventStreamer from '../../lib/EventStreamer';
// clients
import CardClient from '../../clients/CardClient';
// models
import ICard from '../../models/cards/ICard'
// assets
import oneClickImg from '../../assets/media/oneclick.svg';

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: "card-management" });

const resolveSelectedCardId = (cards: ICard[], selected?: string) => {
  // state selected has priority
  if (selected) {
    const match = cards.find((card) => card.id === selected);
    if (match) {
      return selected;
    }
  }

  const active = cards.find((card) => card.active || card.default);
  if (active) {
    return active.id;
  }

  if (cards.length > 0) {
    return cards[0].id;
  }
}

interface IProps extends RouteComponentProps<{}> {
}

type IMode = 'LOADING' | 'CARDS' | 'REGISTER_CARD_IN_PROGRESS';

interface IState {
  mode: IMode,
  loading_message?: string,
  cards?: ICard[],
  selected_card?: string,
  error_modal?: IErrorModalProps,
}

/**
 * 
 * This class emit 'CARD_SELECTED' event
 * Listen to this event to update the selected card
 * 
 * Note: selected card can be undefined
 * 
 * @CardManagementPage
 */
export default withIonLifeCycle(class CardManagementPage extends React.Component<IProps, IState> {
  state: IState = {
    mode: 'LOADING',
    loading_message: 'Cargando...',
  }

  ionViewDidEnter = async () => {
    this.fetchAll();
  }

  componentDidUpdate = async (prevProps: IProps, prevState: IState) => {
    if (prevState.selected_card !== this.state.selected_card) {

      // find selected card
      const mach = this.state.cards?.find((card) => card.id === this.state.selected_card);

      // emit card.selected event
      EventStreamer.emit("CARD_SELECTED", mach);
      eureka.info(`Event card selected was emitted; card id ${this.state.selected_card}`);

      this.tryToMarkAsDefault(this.state.cards, this.state.selected_card);
    }
  }

  tryToMarkAsDefault = async (cards?: ICard[], selected?: string) => {
    try {
      const mach = (cards || []).find((card) => card.id === selected);
      if (!mach || mach.default || mach.active) {
        return;
      }

      await CardClient.setDefault(mach.id);
      this.setState((prevState) => ({
        cards: (prevState.cards || []).map((card) => ({ ...card, default: card.id === mach.id, active: card.id === mach.id })),
      }));

      eureka.info(`Card ${mach.id} marked as default`);
    } catch (error) {
      eureka.error('Unexpected error marking card as default', error);
    }
  }

  fetchAll = async () => {
    try {
      this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

      const cards = await this.fetchCards();

      this.setState((prevState) => ({
        mode: 'CARDS',
        cards,
        selected_card: resolveSelectedCardId(cards, prevState.selected_card),
      }));
    } catch (error) {
      eureka.error('Unexpected error fetching cards', error);

      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos cargar la información de las tarjetas. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.fetchCards();
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined });

            setTimeout(() => {
              this.onClickBack();
            }, ANIMATION_TIME)
          }
        }
      });
    }
  }

  fetchCards = async (): Promise<ICard[]> => {
    const cards = await CardClient.getList();
    
    return cards;
  }

  startCardRegistration = async () => {
    const showErrorModal = () => {
      this.setState({
        error_modal: {
          title: "Hubo un problema",
          message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
          onRetry: () => {
            this.setState({ error_modal: undefined });

            // start again card registration
            setTimeout(() => {
              this.startCardRegistration();
            }, ANIMATION_TIME);
          },
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: "CARDS" })
          }
        }
      });
    }

    try {
      // subscribe to deep link
      EventStreamer.on("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
      const links = await CardClient.register();
      const inscriptionUrl = links.find((l: any) => l.rel === "inscription");
      if (!inscriptionUrl) {
        throw new Error("No inscription url found");
      }

      let response_code: string | null = 'exit';

      Expr.whenInNativePhone(async () => {

        let inAppBrowserRef = InAppBrowser.create(inscriptionUrl.href, '_blank', { location: 'no' });

        inAppBrowserRef.show()

        inAppBrowserRef.on('exit').subscribe((evt: InAppBrowserEvent) => {
          if (response_code !== '0')
            EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", { response_code: 'exit' })
        })

        inAppBrowserRef.on("loadstop").subscribe((evt: InAppBrowserEvent) => {
          if (evt.url && evt.url.includes('response_code')) { //url interceptor
            const queryString = evt.url.split('#')[1];
            const urlParams = new URLSearchParams(queryString);
            const code = urlParams.get('response_code');
            response_code = code;
            EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", { response_code: code });
            inAppBrowserRef.close();
          }
        });
      });

      Expr.whenNotInNativePhone(() => {
        let addCard = false;
        const onPopupMessage = async (e: any) => {
          // TODO: change validation to allow localhost
          // e.origin === e.data.origin
          if (!addCard) {
            // Simulate the deeplink process if we were in a mobile
            EventStreamer.emit("DEEPLINK:CARD_ADDED_CALLBACK", e.data)
            addCard = true;
          } else if (!addCard) {
            eureka.error("FATAL ADD CARD ERROR:: Origin missmatch");
          }
        };

        window.addEventListener("message", onPopupMessage);
        const loginPopUp = window.open(
          inscriptionUrl.href,
          "_blank",
          "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=500,height=600"
        );

        // Only in web
        const timer = setInterval(function () {
          if (loginPopUp && loginPopUp.closed) {
            clearInterval(timer);
            window.removeEventListener("message", onPopupMessage);
          }
        }, 500);
      });
    } catch (error) {
      eureka.error('An error has ocurred starting card registration', error);

      showErrorModal();
    }
  }

  onClickBack = () => {
    this.props.history.goBack();
  }

  onClickBackFromRegisterCardInProgress = () => {
    this.setState({ mode: 'CARDS' });

    // unsubscribe from deeplink to avoid unexpected behavior
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);
  }

  onSelectCard = (card: ICard) => {
    // avoid request if the card is already selected
    if (card.id === this.state.selected_card) {
      return;
    }

    this.setState({
      error_modal: {
        title: "Activar tarjeta",
        message: "¿Estás seguro que deseas activar la tarjeta registrada previamente?",
        retryMessage: "Activar",
        onRetry: () => {
          this.setState({ error_modal: undefined });

          setTimeout(() => {
            activeRequest(card);
          }, ANIMATION_TIME);
        },
        onCancel: () => {
          setTimeout(() => {
            this.setState({ error_modal: undefined, mode: "CARDS" });
          }, ANIMATION_TIME);
        }
      }
    });

    const activeRequest = async (card: ICard) => {
      try {
        // show loading
        this.setState({ mode: "LOADING", loading_message: 'Activando...' });

        await CardClient.setDefault(card.id);

        this.setState((prevState) => {
          return {
            ...prevState,
            mode: "CARDS",
            selected_card: card.id
          }
        });
      } catch (error) {
        eureka.error(`Unexpected error activating card ${card.id}`, error);

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos activar la tarjeta. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });
  
              setTimeout(() => {
                activeRequest(card);
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              setTimeout(() => {
                this.setState({ error_modal: undefined, mode: "CARDS" })
              }, ANIMATION_TIME);
            }
          }
        })
      }
    }
  }

  onRemoveCard = (card: ICard) => {
    this.setState({
      error_modal: {
        title: "Eliminar tarjeta",
        message: "¿Estás seguro que deseas eliminar la tarjeta registrada previamente?",
        retryMessage: "Eliminar",
        onRetry: () => {
          this.setState({ error_modal: undefined });

          setTimeout(() => {
            removeRequest(card);
          }, ANIMATION_TIME);
        },
        onCancel: () => {
          setTimeout(() => {
            this.setState({ error_modal: undefined, mode: "CARDS" });
          }, ANIMATION_TIME);
        }
      }
    });

    const removeRequest = async (card: ICard) => {
      try {
        // show loading
        this.setState({ mode: "LOADING", loading_message: 'Eliminando...' });

        await CardClient.removeCard(card.provider, card.id);

        this.setState((prevState) => {
          const filteredCards = prevState.cards!.filter((c) => c.id !== card.id);
          return {
            ...prevState,
            mode: "CARDS",
            cards: filteredCards,
            selected_card: resolveSelectedCardId(filteredCards, prevState.selected_card)
          }
        });
      } catch (error) {
        eureka.error(`Unexpected error deleting card ${card.id}`, error);

        if ((error as AxiosError).response?.status === 409) {
          this.setState({
            error_modal: {
                title: "No es posible eliminar esta tarjeta",
                message: "Actualmente te encuentras estacionado.Es necesario salir primero del estacionamiento para poder eliminarla.",
                onRetry: () => {
                    this.setState({ error_modal: undefined, mode: 'CARDS' });
                },
                retryMessage: 'Entiendo'
            }
          });
          return;
        }

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos eliminar la tarjeta. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });
  
              setTimeout(() => {
                removeRequest(card);
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              setTimeout(() => {
                this.setState({ error_modal: undefined, mode: "CARDS" })
              }, ANIMATION_TIME);
            }
          }
        })
      }
    }
  }

  onAddCard = () => {
    this.setState({ mode: "REGISTER_CARD_IN_PROGRESS" });

    setTimeout(() => {
      this.startCardRegistration();
    }, ANIMATION_TIME);
  }

  onDeepLinkAddCardHandler = (data: any) => {
    // start unsubscribing
    EventStreamer.off("DEEPLINK:CARD_ADDED_CALLBACK", this.onDeepLinkAddCardHandler);

    const updateCards = async () => {
      try {
        this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

        const cards = await this.fetchCards();

        this.setState((prevState) => ({
          mode: 'CARDS',
          cards,
          selected_card: resolveSelectedCardId(cards, prevState.selected_card),
        }));
      } catch (error) {
        eureka.error('An error has ocurred trying to update cards', error);

        // show error modal
        this.setState({
          error_modal: {
            title: "Hubo un problema",
            message: "No pudimos registrar tu tarjeta. ¿Deseas reintentar?",
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                updateCards();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: "CARDS" });
            }
          }
        });
      }
    }

    Expr.whenInNativePhone(() => {
      const { response_code } = data;
      if (response_code === "0") {
        updateCards();
      }
    });

    Expr.whenNotInNativePhone(() => {
      if (data.response_code === 0) {
        updateCards()
      }
    });
  }

  /**
   * Main render
   */
  render() {
    const { mode, error_modal } = this.state;

    return <IonPage className={`card-management ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}

      {error_modal && <ErrorModal title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
    </IonPage>
  }

  /**
   * Render loading view
   */
  renderLOADING = () => {
    const { loading_message } = this.state;

    return (
      <Fragment>
        <BackdropLoading message={loading_message!} />
      </Fragment>
    )
  }

  /**
   * Render cards view
   */
  renderCARDS = () => {
    const { cards, selected_card } = this.state;

    return (
      <Page
        header={(
          <DefaultHeader onBack={this.onClickBack}/>
        )}
        content={(
          (
            <div className='content'>
              <h1>Medios de pago</h1>
              <p>Agrega tarjetas para realizar pagos directamente desde la app.</p>
              <CardList cards={cards} selectedCard={selected_card} onSelectCard={this.onSelectCard} onRemoveCard={this.onRemoveCard}/>
              <AddCard onAddCard={this.onAddCard}/>
            </div>
          )
        )}
        />
      )
  }

  /**
   * Render register card in progress view
   */
  renderREGISTER_CARD_IN_PROGRESS = () => {

    return (
      <Page
        header={(
          <DefaultHeader onBack={this.onClickBackFromRegisterCardInProgress}/>
        )}
        content={(
          <div className="content">
            <h1>Conectando con...</h1>
            <img src={oneClickImg} alt="oneclick" />
            <BackdropLoading message="" />
          </div>
        )}
        />
    )
  }

})
