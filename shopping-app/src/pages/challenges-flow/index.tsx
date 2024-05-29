import React, { Fragment } from 'react';
import {
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  withIonLifeCycle,
} from '@ionic/react';
import {
  arrowBack,
  checkmarkCircleOutline,
  ellipsisHorizontalOutline,
} from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import moment from 'moment';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { RefresherEventDetail } from '@ionic/core';

/* styles */
import './index.less';

/* components */
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import BackdropLoading from '../../components/backdrop-loading';
import TermsModal from '../../components/terms-condition';
import Page, { DefaultFooter, DefaultHeader } from '../../components/page';
import ParagraphPage from '../../components/paragraph-page';
import ButtonOnboarding from './components/button-onboarding';
import BirthdayUser from './components/birthday-user';
import ButtonLightPlus from './components/button-light-plus';
import Info from '../autopass-flow/components/info';
import RegisterModal from '../../components/register_modal';
import RutScreen from '../../components/rut-screen';

/* libs */
import EurekaConsole from '../../lib/EurekaConsole';
import { IListParams } from '../../clients/RESTClient';
import ListChalleges from './components/list-challenges';
import Expr from '../../lib/Expr';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { AxiosError } from 'axios';

/* clients */
import SettingsClient from '../../clients/SettingsClient';
import PlayerClient from '../../clients/PlayerClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import ChallengesClient from '../../clients/ChallengesClient';
import ChallengeTablePointsClient from '../../clients/ChallengeTablePointsClient';
import Rewards from '../../clients/Rewards';
import AwardClient from '../../clients/AwardClient';
/* models */
import { IUser } from '../../models/users/IUser';
import IPlayer from '../../models/challenges/IPlayer';
import IChallenge from '../../models/challenges/IChallenge';
import IReward from '../../models/challenges/IReward';
import IChallengeTablePoints from '../../models/challenges/IChallengeTablePoints';
import IAward, { IDescription } from '../../models/challenges/IAward';
/* assets */
import LogoInfo from '../../assets/media/info.svg';
import startOutlineLight from '../../assets/media/start-outline-light.svg';
import LogoPlay from '../../assets/media/challenge/onboarding/play.svg';
import HelpRegisterModal from '../../components/help-register-modal';
import UserClient from '../../clients/UserClient';
import PlayerScore from './components/player-score';
import ContainerAwards from './components/container-awards';
import flash from '../../assets/media/flash.svg';
import iconReward from '../../assets/media/challenge/reward.svg';
import iconPlus from '../../assets/media/challenge/plus.svg';
import iconPlusWhite from '../../assets/media/challenge/plus-white.svg';
import qrLens from '../../assets/media/qr_scanner.svg';
import iconHappy from '../../assets/media/challenge/happy.svg';
import iconHappyWhite from '../../assets/media/challenge/happy-white.svg';
import iconSad from '../../assets/media/challenge/sad.svg';
import iconSadWhite from '../../assets/media/challenge/sad-white.svg';
import TopPositions from './components/top-positions';
import SeparationLine from '../sky-costanera-flow/components/separation-line';
import ListRankingItem, { RankingItem } from './components/list-ranking-item';
import iconHappyScanner from '../../assets/media/challenge/happy-scanner.svg';
import iconHappyeScannerWhite from '../../assets/media/challenge/happy-scanner-white.svg';
import iconOnboardingStep1 from '../../assets/media/challenge/onboarding/step-1.svg';
import iconOnboardingStep2 from '../../assets/media/challenge/onboarding/step-2.svg';
import iconOnboardingStep3 from '../../assets/media/challenge/onboarding/step-3.svg';
import iconOnboardingStep4 from '../../assets/media/challenge/onboarding/step-4.svg';
import iconCalendar from '../../assets/media/challenge/icon-calendar.svg';
import IAwardExchangeInformation from '../../models/challenges/IAwardExchangeInformation';
import iconGoldMetal from '../../assets/media/challenge/gold-medal.svg';
import FirebaseAnalytics from '../../lib/FirebaseAnalytics';

interface IAccessibility {
  key: string;
  description: string;
}

interface IProps
  extends RouteComponentProps<{
    id: string;
  }> {}

type IMode =
  | 'LOADING'
  | 'LANDING'
  | 'ON_BOARDING_TERM_CONDITIONS'
  | 'ON_BOARDING_RUT'
  | 'ON_BOARDING_BIRTHDAY'
  | 'ON_BOARDING_SUCCESS'
  | 'HOME'
  | 'ACCESSIBILITY_DESCRIPTION'
  | 'LIST_CHALLENGES'
  | 'LIST_REWARDS'
  | 'LIST_AWARDS'
  | 'EXCHANGE_AWARD'
  | 'RANKING'
  | 'SCANNER'
  | 'SCANNER_SUCCESS';

interface IState {
  mode: IMode;
  user?: IUser;
  loading_message?: string;
  error_modal?: IErrorModalProps;
  style_mode_dark: boolean;
  accessibility_text: IAccessibility[];
  onboarding_modal: boolean;
  document_number: string;
  isValidStatesInputs: {
    document_number: boolean;
  };
  document_number_actived: boolean;
  player?: IPlayer;
  player_ranking?: number;
  players: IPlayer[];
  birthday_valid?: boolean;
  birthday: string;
  birthday_actived: boolean;
  birthday_continue?: boolean;
  challenges: IChallenge[];
  rewards_challenge_complete: IChallenge[];
  reward_selected?: string;
  awards: IAward[];
  register_is_open: boolean;
  term_conditions: string[];
  info_bar?: IChallengeTablePoints;
  info_award_challenge?: IAwardExchangeInformation;
}

interface IModalOnboarding {
  image: string;
  title: string;
  description: string;
}

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: 'challenge-flow' });

export default withIonLifeCycle(
  class ChallengePage extends React.Component<IProps, IState> {
    QR_TEST = '5yQ0Y4sBrxNoS5ayN8FV';
    media = window.matchMedia('(prefers-color-scheme: dark)');
    navHistory: IMode[] = [];
    state: IState = {
      mode: 'LOADING',
      loading_message: 'Cargando...',
      onboarding_modal: false,
      document_number: '',
      isValidStatesInputs: {
        document_number: false,
      },
      document_number_actived: true,
      style_mode_dark: false,
      accessibility_text: [],
      birthday: '',
      birthday_actived: true,
      challenges: [],
      rewards_challenge_complete: [],
      players: [],
      awards: [],
      register_is_open: false,
      term_conditions: [],
    };

    async componentDidMount() {
      await this.fetchAll();
      await FirebaseAnalytics.customLogEvent('ionic_app', 'juego');
    }

    /** all fetch functions */
    fetchAll = async (hiddenLoading?: boolean) => {
      try {
        if (!hiddenLoading) {
          this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });
        }

        const [
          user,
          player,
          players,
          accessibility_text,
          challenges,
          rewards_challenge_complete,
          awards,
          term_conditions,
          info_award_challenge,
        ] = await Promise.all([
          this.fetchUser(),
          this.fetchPlayer(),
          this.fetchPlayers(),
          this.fetchAccessibilityText(),
          this.fetchChallenges(),
          this.fetchRewardsChallengeCompletes(),
          this.fetchAwards(),
          this.fetchTermAndConditions(),
          this.fetchAwardExchangeInformation(),
        ]);

        let mode: IMode = 'HOME';

        if (!player) {
          mode = 'LANDING';
          this.setState({
            user,
            challenges,
            rewards_challenge_complete,
            accessibility_text,
            awards,
            mode,
          });
          return;
        }

        let player_ranking = await this.fetchPlayerRanking();

        const info_bar = await this.fetchInfoBar(player.stats.total_rewards);
        this.setState({
          user,
          challenges,
          rewards_challenge_complete,
          accessibility_text,
          mode,
          players,
          player_ranking,
          awards,
          player,
          term_conditions,
          info_bar,
          info_award_challenge,
        });
      } catch (error) {
        eureka.error('Unexpected error fetching all', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message:
              'No pudimos cargar toda la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.fetchAll();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onGoBackHandler();
              }, ANIMATION_TIME);
            },
          },
        });
      }
    };

    checkCameraPermission = async (): Promise<void> => {
      try {
        let isNativePhone = false;
        Expr.whenInNativePhone(() => {
          isNativePhone = true;
        });

        if (!isNativePhone) {
          this.setState({ mode: 'HOME' });
          return;
        }

        const status = await BarcodeScanner.checkPermission({ force: false });

        const granted = !!status.granted;
        if (granted) {
          this.setState({ mode: 'HOME' });
        } else {
          await this.grantCameraPermission();
        }
      } catch (error) {
        eureka.error(
          'An error has ocurred trying to check camera permission',
          error
        );

        // show error modal
        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message:
              'No pudimos cargar toda la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(async () => {
                await this.checkCameraPermission();
              }, 1000);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onGoBackHandler();
              }, 500);
            },
          },
        });
      }
    };

    grantCameraPermission = async () => {
      const showOpenNativeSettingsModal = () => {
        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message:
              'Debes activar los permisos de tu cámara. Ingresa a la configuración de tu teléfono.',
            retryMessage: 'Ir a configuración',
            onRetry: () => {
              this.setState({ error_modal: undefined });
              setTimeout(async () => {
                await OpenNativeSettings.open('application_details');
              }, 500);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined });
            },
          },
        });
      };

      Expr.whenInNativePhone(async () => {
        try {
          const status = await BarcodeScanner.checkPermission({ force: false });

          if (status.granted) {
            eureka.info('User already granted camera permission');

            await this.onQRCodeScanHandler();
            return;
          }

          if (status.denied) {
            eureka.info('User denied camera permission');

            showOpenNativeSettingsModal();
            return;
          }

          if (status.restricted || status.unknown) {
            // ios only
            eureka.info('User probably means the permission has been denied');

            showOpenNativeSettingsModal();
            return;
          }

          // user has not denied permission
          // but the user also has not yet granted the permission
          // so request it
          const statusRequest = await BarcodeScanner.checkPermission({
            force: true,
          });

          if (statusRequest.asked) {
            // system requested the user for permission during this call
            // only possible when force set to true
          }

          if (statusRequest.granted) {
            // the user did grant the permission now
            eureka.info('User granted the permission');

            this.setState({ mode: 'SCANNER', error_modal: undefined });
            await this.onQRCodeScanHandler();
            return;
          }

          // user did not grant the permission, so he must have declined the request
          showOpenNativeSettingsModal();
          return;
        } catch (error) {
          eureka.error(
            'An error has ocurred trying to grant camera permission',
            error
          );

          // show error modal
          this.setState({
            error_modal: {
              title: 'Hubo un problema',
              message:
                'No pudimos cargar la información de tu cámara. ¿Deseas reintentar?',
              onRetry: () => {
                this.setState({ error_modal: undefined });

                setTimeout(async () => {
                  await this.grantCameraPermission();
                }, 1000);
              },
              onCancel: () => {
                this.setState({ error_modal: undefined });

                setTimeout(() => {
                  this.onGoBackHandler();
                }, 500);
              },
            },
          });
        }
      });

      Expr.whenNotInNativePhone(async () => {
        await this.onQRCodeScanHandler();
      });
    };

    fetchUser = async (): Promise<IUser> => {
      return await UserClient.me();
    };

    fetchPlayer = async () => {
      const { user } = this.state;
      const response = await PlayerClient.list({
        offset: 0,
        limit: 1,
        query: {
          'id.keyword_is': AuthenticationClient.getInfo().primarysid,
        },
        sort: {
          created_at: 'desc',
        },
      });

      // subscription not found
      if (!response.data.length) {
        return undefined;
      }
      return response.data.pop();
    };

    fetchPlayerRanking = async () => {
      return await PlayerClient.getRankingPositionById(
        AuthenticationClient.getInfo().primarysid
      );
    };

    fetchPlayers = async () => {
      const response = await PlayerClient.list({
        offset: 0,
        limit: 10,
        sort: {
          'stats.total_rewards': 'desc',
        },
      });
      return response.data;
    };

    async fetchAccessibilityText(): Promise<any> {
      try {
        return await SettingsClient.getAccessibilityText();
      } catch (error) {
        console.log(error);
      }
    }

    async fetchChallenges(): Promise<Array<IChallenge>> {
      try {
        return await ChallengesClient.filter(
          AuthenticationClient.getInfo().primarysid,
          this.props.match.params.id
        );
      } catch (error) {
        eureka.error('Unexpected error fetching all challenges', error);
        throw error;
      }
    }

    async fetchRewardsChallengeCompletes(): Promise<Array<IChallenge>> {
      try {
        const userID = AuthenticationClient.getInfo().primarysid;
        return await Rewards.rewardsComplete({
          query: { player_id_is: userID },
          limit: 50,
        });
      } catch (error) {
        eureka.error('Unexpected error fetching all rewards', error);
        throw error;
      }
    }

    async fetchAwards(): Promise<Array<IAward>> {
      try {
        const params: IListParams = {};
        const response = await AwardClient.list(params, this.props.match.params.id);
        return response.data;
      } catch (error) {
        eureka.error('Unexpected error fetching all awards', error);
        throw error;
      }
    }

    async fetchTermAndConditions(): Promise<string[]> {
      try {
        return await SettingsClient.getTermsAndConditionsTopic();
      } catch (error) {
        eureka.error('Unexpected error fetching term and conditions', error);
        throw error;
      }
    }

    async fetchAwardExchangeInformation(): Promise<IAwardExchangeInformation> {
      try {
        return await AwardClient.getAwardsExchangeInformation();
      } catch (error) {
        eureka.error(
          'Unexpected error fetching award exchange information',
          error
        );
        throw error;
      }
    }

    async fetchInfoBar(points: number): Promise<IChallengeTablePoints> {
      try {
        return await ChallengeTablePointsClient.getByPoints(
          points as unknown as string
        );
      } catch (error) {
        eureka.error('Unexpected error fetching info bar', error);
        throw error;
      }
    }

    onGoBackHandler = () => {
      this.props.history.goBack();
    };

    onGoToAccessibilityHandler = () => {
      this.setState({ mode: 'ACCESSIBILITY_DESCRIPTION' });
    };

    onChangeModeHandler = () => {
      this.setState({ style_mode_dark: !this.state.style_mode_dark });
    };

    onCloseModalTermConditionsHandler() {
      this.setState({ mode: 'ON_BOARDING_TERM_CONDITIONS' });
    }

    /** all function on */
    onClickPopupOnboarding = () => {
      this.setState({ onboarding_modal: true });
    };

    onClickViewAwards = () => {
      this.goTo('LIST_AWARDS');
    };

    onCloseModalHandler = (): void => {
      this.setState({
        onboarding_modal: false,
      });
    };

    onShowAllChallenges = () => {
      this.goTo('LIST_CHALLENGES');
    };

    onShowAllRewards = () => {
      this.goTo('LIST_REWARDS');
    };

    onBoardingNextHandler = async () => {
      try {
        const { user, player, birthday_valid } = this.state;
        if (!user?.document_number) {
          this.setState({ mode: 'ON_BOARDING_RUT' });
          return;
        }

        if (!birthday_valid) {
          this.setState({
            mode: 'ON_BOARDING_BIRTHDAY',
            birthday_actived: false,
            birthday_continue: true,
          });
          return;
        }

        if (!player) {
          this.setState({ mode: 'LANDING' });
          return;
        }

        await this.fetchAll();
      } catch (error) {
        eureka.error('Unexcepted error in onboarding next handler', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: 'No pudimos registrar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onBoardingNextHandler();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: 'LANDING' });
            },
          },
        });
      }
    };

    onShowAwardDetailsHandler = (
      name: string,
      description: Array<IDescription>
    ) => {
      this.setState({
        error_modal: {
          icon: startOutlineLight,
          title: name,
          content: description.map((item: IDescription, index: number) => {
            return (
              <div>
                <br />
                <p key={index}>
                  <b>{item.title}</b>
                </p>{' '}
                <p>{item.description}</p>
              </div>
            );
          }),
          cssClass: 'award-detail',
          onRetry: () => {
            this.setState({ error_modal: undefined });
          },
          retryMessage: 'Entiendo',
        },
      });
    };

    onVerifyIfUserExistInTopRanking = (): boolean => {
      const { players, player } = this.state;

      let response: boolean = false;
      players.forEach((p: IPlayer) => {
        if (p.id === player!.id) {
          response = true;
        }
      });

      return response;
    };

    /** utilities */
    goTo = (mode: IMode): void => {
      this.setState({ mode });
    };

    modalDataOnboarding = (): IModalOnboarding[] => {
      let strings: IModalOnboarding[] = [];

      strings.push({
        image: iconOnboardingStep1,
        title: 'Selecciona tu centro comercial, acumula medallas y participa por increíbles premios',
        description:
          'Realiza los retos disponibles, acumula medallas para subir de nivel y participa. Solo podrás jugar en el centro comercial elegido al inicio.',
      });
      strings.push({
        image: iconOnboardingStep2,
        title: 'Revisa los retos disponibles y sus requisitos',
        description:
          'La cantidad de medallas que acumulas es distinta según cada reto. Además, constantemente se estarán sumando nuevos retos. ¡Atento!',
      });
      strings.push({
        image: iconOnboardingStep3,
        title: 'Escanea el código QR',
        description:
          'Ingresa al reto que quieres completar, escanea el código QR relacionado para sumar las medallas.',
      });
      strings.push({
        image: iconOnboardingStep4,
        title: 'Conoce los premios por los que puedes participar',
        description:
          'Al finalizar el juego podrás participar por los premios correspondientes al nivel en el que te encuentras.',
      });

      return strings;
    };

    onChangeBirthday = async (e: any) => {
      const { status, value, actived } = e;

      this.setState({
        birthday_valid: status,
        birthday: value,
        birthday_actived: actived,
      });
    };

    onCreatePlayer = async () => {
      try {
        this.setState({ mode: 'LOADING', loading_message: 'Cargando...' });

        const created = await PlayerClient.create({
          id: this.state.user!.primarysid as string,
          email: this.state.user!.email as string,
          birth_date: this.state.birthday,
          document_number: this.state.user!.document_number as string,
          stats: {
            total_rewards: 0,
          },
          created_at: new Date(),
          updated_at: new Date(),
        });

        this.setState({ player: created });

        // resolve next step
        await this.onBoardingNextHandler();
      } catch (error) {
        eureka.error('Unexpected error in create player handler', error);

        this.setState({
          error_modal: {
            title: 'Hubo un problema',
            message: 'No pudimos registrar la información. ¿Deseas reintentar?',
            onRetry: () => {
              this.setState({ error_modal: undefined });

              setTimeout(() => {
                this.onCreatePlayer();
              }, ANIMATION_TIME);
            },
            onCancel: () => {
              this.setState({ error_modal: undefined, mode: 'LANDING' });
            },
          },
        });
      }
    };

    onSelectChallengeHandler = (id: string): void => {
      const { challenges } = this.state;

      const challenge = challenges.find(
        (challenge) => challenge.id === id
      ) as IChallenge;

      //date text human readable format dd MMMM yyyy
      const date_text = moment(challenge.end).format('DD MMMM YYYY');

      this.setState({
        error_modal: {
          title: challenge?.name,
          retryMessage: 'Escanear QR',
          icon: flash,
          cssClass: 'challenges-flow-list-challenges',
          onRetry:
            challenge.flow === 'QR'
              ? async () => {
                  await this.grantCameraPermission();
                }
              : undefined,
          onCancel: () => {
            this.setState({ error_modal: undefined, mode: 'HOME' });
          },
          displayButtonClose: false,
          content: (
            <div>
              <div className="modal-subtitle-score">
                {challenge?.reward}{' '}
                <IonIcon icon={iconGoldMetal} className="modal-icon-score" />
              </div>
              <div className="modal-date-validate-score">
                <IonIcon icon={iconCalendar} className="modal-icon-calendar" />
                <span className="text-valid">Válido hasta el {date_text}</span>
              </div>
              <div className="modal-description-score">
                {challenge?.description}
              </div>
            </div>
          ),
        },
      });
    };

    onMyChallengesRewardsComplete = (limit?: number) => {
      const { rewards_challenge_complete } = this.state;

      let challengesRewardsComplete = rewards_challenge_complete;
      if (limit && limit > 0) {
        challengesRewardsComplete = challengesRewardsComplete.slice(0, limit);
      }

      return challengesRewardsComplete;
    };

    onMyChallengesList = (limit?: number): IChallenge[] => {
      const { challenges } = this.state;
      return challenges.slice(0, limit);
    };

    onPlayerComplete = async (challengeId: string) => {
      eureka.info('onPlayerComplete');
      try {
        const data = await PlayerClient.complete(
          this.state.player?.id!,
          challengeId
        );
        const reward: IReward = data.reward;
        this.setState({
          mode: 'SCANNER_SUCCESS',
          reward_selected: reward.reward_amount?.toString(),
        });
      } catch (error) {
        eureka.error('Unexpected error in player complete handler', error);
        this.setState({ mode: 'HOME' });
        if ((error as AxiosError).response?.status === 409) {
          const response = (error as AxiosError).response?.data.data;
          eureka.error('Response', response);
          this.setState({
            error_modal: {
              title: 'Algo salió mal',
              message: response.message,
              cancelMessage: 'Continuar',
              onCancel: () => {
                this.setState({ error_modal: undefined, mode: 'HOME' });
              },
            },
          });
          return;
        }
      }
    };

    onQRCodeScanHandler = async () => {
      Expr.whenInNativePhone(async () => {
        try {
          console.log('Scanner');
          this.setState({ mode: 'SCANNER', error_modal: undefined });
          // make background of WebView transparent
          await BarcodeScanner.hideBackground();

          // trick to hide the webview
          document.body.style.backgroundColor = 'transparent';

          const result = await BarcodeScanner.startScan();

          eureka.debug('BarcodeScanner result', result);

          // if the result has content
          if (result.hasContent) {
            const challengeId = result.content as string;
            await this.onPlayerComplete(challengeId);
          }

          eureka.info(`Bar code scanned successfuly`, JSON.stringify(result));
        } catch (ex) {
          eureka.error('An error has ocurred trying to read the ticket qr');
          eureka.error((ex as Error).message, ex);

          // show error modal
          this.setState({
            error_modal: {
              title: 'Hubo un problema',
              message: 'No pudimos leer el código QR. ¿Deseas reintentar?',
              onRetry: () => {
                this.setState({ error_modal: undefined });

                setTimeout(() => {
                  this.onQRCodeScanHandler();
                }, 1000);
              },
              onCancel: () => {
                this.setState({ error_modal: undefined, mode: 'HOME' });
              },
            },
          });
        } finally {
          document.body.style.backgroundColor = '';
        }
      });

      Expr.whenNotInNativePhone(() => {
        //when test local
        this.onPlayerComplete(this.QR_TEST);
      });
    };

    onQRSuccess = async () => {
      await this.fetchAll();
    };

    onStopScanner = async () => {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      this.setState({ mode: 'HOME' });
    };

    onLoginClickHandler = async () => {
      await AuthenticationClient.signOut();
      window.location.reload();
    };

    backHistory = (navigate = true) => {
      this.navHistory.pop();

      if (navigate) {
        if (!this.navHistory.length) {
          this.props.history.goBack();
          return;
        }

        this.setState({ mode: this.navHistory[this.navHistory.length - 1] });
      }
    };

    onRefreshHandler = async (event: CustomEvent<RefresherEventDetail>) => {
      try {
        await this.fetchAll(true);
      } catch (error) {
        eureka.error(
          'An error has occurred trying to refresh the challenges list',
          error
        );
        eureka.debug((error as Error).message);
      } finally {
        event.detail.complete();
      }
    };

    render() {
      const { mode, error_modal } = this.state;

      return (
        <IonPage
          className={`challenges-flow ${mode
            .replace(/_/gi, '-')
            ?.toLowerCase()}`}
        >
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}

          {error_modal && (
            <ErrorModal
              cssClass={error_modal.cssClass}
              title={error_modal.title}
              message={error_modal.message}
              cancelMessage={error_modal.cancelMessage}
              retryMessage={error_modal.retryMessage}
              onRetry={error_modal.onRetry}
              onCancel={error_modal.onCancel}
              icon={error_modal.icon}
              content={error_modal.content}
              displayButtonClose={error_modal.displayButtonClose}
            />
          )}
        </IonPage>
      );
    }

    renderLOADING = () => {
      const { loading_message } = this.state;
      return (
        <Fragment>
          <BackdropLoading message={loading_message!} />
        </Fragment>
      );
    };

    renderACCESSIBILITY_DESCRIPTION = () => {
      const { style_mode_dark, accessibility_text } = this.state;
      const paragraph = accessibility_text
        ? style_mode_dark
          ? accessibility_text[1].description
          : accessibility_text[0].description
        : '';
      const header = (
        <DefaultHeader
          title="¿Qué es Accesibilidad?"
          onBack={() => {
            this.setState({ mode: 'ON_BOARDING_TERM_CONDITIONS' });
          }}
        />
      );
      return (
        <ParagraphPage
          changeMode={this.onChangeModeHandler}
          header={header}
          paragraph={paragraph}
          show_action_buttons={true}
          style_mode_dark={this.state.style_mode_dark}
        />
      );
    };

    renderLANDING = () => {
      const { onboarding_modal, register_is_open, user } = this.state;
      const header = <DefaultHeader onBack={() => this.backHistory(true)} />;
      const content = (
        <div className="body-landing">
          <div className="content-landing">
            <div className="title-landing">
              <div className="image-landing">
                <img src={LogoPlay} alt="logo" />
              </div>
              <h3>Bienvenido a</h3>
              <h1>Juego Mi Mall</h1>
              <p>
                Entérate de los retos que tenemos para ti.{' '}
                <strong>
                  ¡Descúbrelos, gana y participa por increíbles premios!
                </strong>
              </p>
            </div>
            <div>
              <ButtonOnboarding
                text={'Entérate como funciona'}
                onOnClick={this.onClickPopupOnboarding}
                icon={LogoInfo}
              />
              {onboarding_modal ? (
                <Fragment>
                  <HelpRegisterModal
                    onClose={this.onCloseModalHandler}
                    modal_is_open={onboarding_modal}
                    content={this.modalDataOnboarding()}
                    cssClass="challenge-flow-xyzw-modal-onboarding"
                  />
                </Fragment>
              ) : null}
            </div>
          </div>
        </div>
      );

      return (
        <>
          {!register_is_open && (
            <Page
              header={header}
              content={content}
              footer={
                <DefaultFooter
                  mainActionText="Continuar"
                  onClickMainAction={() => {
                    user?.email === 'invited'
                      ? this.setState({ register_is_open: true })
                      : this.onBoardingNextHandler();
                  }}
                />
              }
            />
          )}
          {user?.email === 'invited' && register_is_open && (
            <RegisterModal
              type="NEW"
              userInfo={user}
              onClose={() => {
                this.setState({ register_is_open: false });
              }}
              onClick={async () => {
                await this.onLoginClickHandler();
              }}
            />
          )}
        </>
      );
    };

    renderON_BOARDING_TERM_CONDITIONS = () => {
      const { term_conditions } = this.state;
      //Ojo revisar aquiiii.
      const content = (
        <TermsModal
          termsAndConditionsDescription={term_conditions}
          onClose={() => this.onCloseModalTermConditionsHandler()}
          onAction={(e) => {}}
          mode={''}
        />
      );
      return <Page content={content} />;
    };

    renderON_BOARDING_RUT = () => {
      return (
        <Fragment>
          <RutScreen
            title={'Necesitamos que ingreses tu RUT'}
            subtitle={'Esto es necesario para seguir con el proceso'}
            onBack={() => {
              this.goTo('LANDING');
            }}
            onContinue={() => {
              this.setState({
                mode: 'LOADING',
                loading_message: 'Actualizando...',
              });
            }}
            onValue={(rut: string) => {
              eureka.info('Update rut', rut);
              this.setState((prev: any) => ({
                ...prev,
                user: { ...prev.user, document_number: rut },
              }));
              this.onBoardingNextHandler();
            }}
          />
        </Fragment>
      );
    };

    renderON_BOARDING_BIRTHDAY = () => {
      const { birthday_valid, birthday_actived, birthday_continue } =
        this.state;
      const header = <DefaultHeader onBack={() => this.goTo('LANDING')} />;
      const content = (
        <div className="body-onboarding-birthday">
          <div className="onboarding-birthday-text">
            <h1>Antes de empezar, ingresa tu fecha de cumpleaños</h1>
            <p>Es necesario para asignar las medallas a tu cuenta.</p>
          </div>
          <div className="onboarding-birthday-inputs">
            <BirthdayUser
              onOnClick={this.onChangeBirthday}
              isContinue={birthday_continue}
            />
          </div>
          <div className="onboarding-birthday-inputs-error-validation">
            {!birthday_valid && !birthday_actived
              ? 'Debes ingresar una fecha válida'
              : null}
          </div>
        </div>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Continuar"
              onClickMainAction={async () => await this.onCreatePlayer()}
            />
          }
        />
      );
    };

    renderON_BOARDING_SUCCESS = () => {
      const { user } = this.state;
      const header = <DefaultHeader onBack={() => this.goTo('LANDING')} />;
      const content = (
        <div className="body-onboarding-success">
          <div className="content-success">
            <div>
              <IonIcon icon={checkmarkCircleOutline} />
              <h1 className="font-bold">
                {' '}
                ¡Todo listo <br />
                {user?.full_name}!, Tus datos fueron ingresados.
              </h1>
            </div>
            <h3 className="feature-disclaimer">
              Podrás escanear códigos, sumar puntos y ganar muchos premios.
            </h3>
          </div>
        </div>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Continuar"
              onClickMainAction={this.onBoardingNextHandler}
            />
          }
        />
      );
    };

    renderHOME = () => {
      const { user, player, onboarding_modal, player_ranking, info_bar } =
        this.state;
      const challenge_list = this.onMyChallengesList(5) as IChallenge[];
      const challengesRewardsComplete = this.onMyChallengesRewardsComplete(5);
      const player_data = player as IPlayer;
      const header = <DefaultHeader onBack={() => this.backHistory(true)} />;
      const content = (
        <>
          <IonRefresher slot="fixed" onIonRefresh={this.onRefreshHandler}>
            <IonRefresherContent
              pullingIcon={ellipsisHorizontalOutline}
              refreshingSpinner="dots"
            ></IonRefresherContent>
          </IonRefresher>
          <div className="body-home">
            <div className="content-home">
              <div className="content-home-info-up">
                <div className="content-home-title">
                  <h1 className="font-bold"> ¡Hola {user?.full_name}!</h1>
                  <h3>Conoce tus medallas acumuladas</h3>
                </div>
                <div className="points-home">
                  <PlayerScore player={player_data} info_bar={info_bar!} />
                </div>
                <div className="content-home-buttons">
                  <div className="how-to-work">
                    <ButtonOnboarding
                      text={'Entérate como funciona'}
                      onOnClick={this.onClickPopupOnboarding}
                      icon={LogoInfo}
                    />
                    {onboarding_modal ? (
                      <Fragment>
                        <HelpRegisterModal
                          onClose={this.onCloseModalHandler}
                          modal_is_open={onboarding_modal}
                          content={this.modalDataOnboarding()}
                          cssClass="challenge-flow-xyzw-modal-onboarding"
                        />
                      </Fragment>
                    ) : null}
                  </div>
                  <div className="view-awards">
                    <ButtonOnboarding
                      text={'¡Mira los premios disponibles!'}
                      onOnClick={this.onClickViewAwards}
                      icon={iconReward}
                    />
                  </div>
                </div>
              </div>
              <div>
                <SeparationLine
                  marginTop="10px"
                  marginBottom="8px"
                  darkBackground="rgba(255, 255, 255, 0.1)"
                  background="#FAFAFA;"
                  height="8px"
                />
              </div>
              <div className="content-home-info-down">
                <div className="content-challenges">
                  <div className="content-challenges-title">
                    <h1>Tus Retos</h1>
                    <h3>
                      ¡Estos son los retos que tenemos para ti! ¿Podrás
                      cumplirlos todos?
                    </h3>
                  </div>
                  <div className="content-challenges-list">
                    {challenge_list.length > 0 ? (
                      <ListChalleges
                        challenges={challenge_list}
                        onSelectChallenge={this.onSelectChallengeHandler}
                      />
                    ) : (
                      <Info
                        title={'¡Vas muy bien!'}
                        subtitle={'No tienes nuevos retos'}
                        image={
                          !this.state.style_mode_dark
                            ? iconHappy
                            : iconHappyWhite
                        }
                        opacity={'50'}
                      />
                    )}
                  </div>
                  {challenge_list.length > 0 ? (
                    <div className="button-all-challenges">
                      <ButtonLightPlus
                        text={'Ver más retos'}
                        onOnClick={this.onShowAllChallenges}
                        icon={
                          !this.state.style_mode_dark ? iconPlus : iconPlusWhite
                        }
                      />
                    </div>
                  ) : null}
                  <div className="content-challenges-success">
                    <div className="content-challenges-success-title">
                      <h1>Retos cumplidos</h1>
                      <h3>Este es tu listado de todos los retos cumplidos</h3>
                    </div>
                    <div className="content-challenges-success-list">
                      {challengesRewardsComplete.length > 0 ? (
                        <ListChalleges challenges={challengesRewardsComplete} />
                      ) : (
                        <Info
                          title={'¡Ups!'}
                          subtitle={'Aun no has cumplido ningún reto'}
                          image={
                            !this.state.style_mode_dark ? iconSad : iconSadWhite
                          }
                          opacity={'50'}
                        />
                      )}
                    </div>
                    <div className="button-all-challenges">
                      <ButtonLightPlus
                        text={'Ver todos los retos'}
                        onOnClick={this.onShowAllRewards}
                        icon={
                          !this.state.style_mode_dark ? iconPlus : iconPlusWhite
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );

      return (
        <Page
          header={header}
          content={content}
          footer={
            <DefaultFooter
              mainActionText="Escanear QR"
              onClickMainAction={this.grantCameraPermission}
            />
          }
        />
      );
    };

    /** Render list of awards */
    renderLIST_AWARDS = () => {
      const { player, awards, info_bar } = this.state;
      console.log(
        '🚀 ~ file: index.tsx ~ line 1117 ~ ChallengePage ~ awards',
        awards
      );
      const header = <DefaultHeader onBack={() => this.goTo('HOME')} />;
      const content = (
        <Fragment>
          <div className="content">
            <h1>Premios</h1>
            <p>
              Estos son todos los premios que tenemos disponibles para ti.
              Selecciona uno para poder canjearlo.
            </p>
            <PlayerScore player={player as IPlayer} info_bar={info_bar!} />
          </div>
          <div className="box-awards-points">
            <div>
              <SeparationLine
                marginTop="20px"
                marginBottom="20px"
                darkBackground="rgba(255, 255, 255, 0.1)"
                background="#E1E1E1;"
                height="1px"
              />
            </div>
            <div className="content-awards">
              <div className="title-text-awards">
                Tenemos estos premios para ti:
              </div>
              <ContainerAwards
                awards={awards}
                show_details={this.onShowAwardDetailsHandler}
                points={player?.stats.total_rewards!}
              />
            </div>
          </div>
        </Fragment>
      );
      const footer = (
        <DefaultFooter
          mainActionText="¿Cómo participar? "
          onClickMainAction={() => this.goTo('EXCHANGE_AWARD')}
        />
      );
      return <Page header={header} content={content} footer={footer} />;
    };

    /** Render exchange of award */
    renderEXCHANGE_AWARD = () => {
      const header = <DefaultHeader onBack={() => this.goTo('LIST_AWARDS')} />;
      const { info_award_challenge } = this.state;
      const content = (
        <div className="content">
          <h1>¿Como participar?</h1>
          <h2>{info_award_challenge?.title}</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: info_award_challenge?.description!,
            }}
          />
        </div>
      );
      return <Page header={header} content={content} />;
    };

    renderLIST_CHALLENGES = () => {
      const content = (
        <>
          <div className="body-all-challenges">
            <div className="body-all-challenges-title">
              <h1>Tus retos</h1>
              <h3>Toca los retos para obtener más información.</h3>
            </div>
          </div>
          <div className="body-all-challenges-list">
            <ListChalleges
              challenges={this.onMyChallengesList()}
              onSelectChallenge={this.onSelectChallengeHandler}
            />
          </div>
        </>
      );
      const header = <DefaultHeader onBack={() => this.goTo('HOME')} />;

      return <Page header={header} content={content} />;
    };

    renderLIST_REWARDS = () => {
      const challengesRewardsComplete = this.onMyChallengesRewardsComplete();

      const content = (
        <>
          <div className="body-all-challenges">
            <div className="body-all-challenges-title">
              <h1>Retos cumplidos</h1>
              <h3>
                ¡Felicitaciones! Estos son todos los retos que has completado
                hasta el momento.
              </h3>
            </div>
          </div>
          <div className="body-all-challenges-list">
            <ListChalleges challenges={challengesRewardsComplete} />
          </div>
        </>
      );
      const header = <DefaultHeader onBack={() => this.goTo('HOME')} />;
      return <Page header={header} content={content} />;
    };

    /** Render exchange of award */
    renderRANKING = () => {
      const { players, player, player_ranking } = this.state;
      const header = <DefaultHeader onBack={() => this.goTo('HOME')} />;
      const content = (
        <>
          <div className="content">
            <h1>Ranking</h1>
            <p>Conoce quien domina en la busqueda de estos premios.</p>
            {players.length >= 3 && <TopPositions players={players} />}
          </div>
          <SeparationLine
            marginTop="20px"
            marginBottom="20px"
            darkBackground="rgba(255, 255, 255, 0.1)"
            background="#FAFAFA"
            height="8px"
          />
          <div className="content">
            <h1>Top ranking</h1>
          </div>
          <ListRankingItem
            media={false}
            player_logged={player!}
            players={players}
          />
          {!this.onVerifyIfUserExistInTopRanking() && (
            <>
              <SeparationLine
                marginTop="20px"
                marginBottom="10px"
                darkBackground="rgba(255, 255, 255, 0.1)"
                background="#FAFAFA"
                height="8px"
              />
              <div id="list-ranking-item">
                <IonRow className="player-logged">
                  <RankingItem
                    media={false}
                    player_selected={true}
                    firsts_positions={false}
                    player_ranking={player_ranking}
                    class_name=""
                    player={player!}
                  />
                </IonRow>
              </div>
            </>
          )}
        </>
      );
      return <Page header={header} content={content} />;
    };

    /**
     * Render scanner view
     */
    renderSCANNER = () => {
      return (
        <Fragment>
          <IonHeader>
            <div onClick={this.onStopScanner}>
              <IonIcon icon={arrowBack} />
            </div>
          </IonHeader>
          <div className="content">
            <IonIcon src={qrLens} />
            <div className="message">
              Coloca el código en el centro del recuadro para escanear.
            </div>
          </div>
        </Fragment>
      );
    };

    renderSCANNER_SUCCESS = () => {
      const { user, style_mode_dark } = this.state;
      const icon = !style_mode_dark ? iconGoldMetal : iconGoldMetal;
      const iconSuccess = !style_mode_dark
        ? iconHappyScanner
        : iconHappyeScannerWhite;
      const content = (
        <div className="body-scanner-success">
          <div className="content-scanner-success">
            <div className="icon-scanner-success">
              <IonIcon icon={iconSuccess} />
            </div>
            <div className="text-scanner-success">
              <h1 className="font-bold"> ¡Felicidades, {user?.full_name}!</h1>
              <h3>Acabas de sumar</h3>
              <div className="pts">
                <h1 className="font-bold">{this.state.reward_selected}</h1>
                <IonIcon src={icon} />
              </div>
            </div>
          </div>
        </div>
      );

      return (
        <Page
          content={content}
          footer={
            <DefaultFooter
              mainActionText="¡Excelente!"
              onClickMainAction={this.onQRSuccess}
            />
          }
        />
      );
    };
  }
);
