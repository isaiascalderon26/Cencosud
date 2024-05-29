import React, { Fragment, useEffect, useState } from 'react';
import { IonHeader, IonIcon, IonPage } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { arrowBack } from 'ionicons/icons';
import { AxiosError } from 'axios';
import moment from 'moment';
//scanner
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
/**
* Style
*/
import './index.less';

/**
* Assets
*/
import qrLens from '../../assets/media/qr_scanner.svg';
/**
* Components
*/
import BackdropLoading from '../../components/backdrop-loading';
import Page, { DefaultHeader } from '../../components/page';
import ScreenCoupon from './components/screen-coupon';
import Coupon from './components/coupon';
import CouponDetail from './components/coupon-detail';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import SeparationLine from '../sky-costanera-flow/components/separation-line';
import HeaderTab from './components/header-tab';
import EmptyDataCoupons from './components/empty-data';
/**
* Clients
*/
import CouponClient from '../../clients/CouponClient';
import DiscountClient from '../../clients/DiscountClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import { IListParams } from '../../clients/RESTClient';
/**
* Models
*/
import { IDiscount } from '../../models/discount/IDiscount';
/**
* Libs
*/
import Expr from '../../lib/Expr';
import EurekaConsole from '../../lib/EurekaConsole';

type IMode = "LOADING" | "HOME" | "SCANNER";

interface IProps extends RouteComponentProps<{}> {};
const QR_TEST = "0001";
const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: "coupons-flow" });

const CouponsPage: React.FC<IProps> = (props) => {
	
	const [mode, setMode] = useState<IMode>("LOADING");
	const [loadingMessage, setLoadingMessage] = useState<string>("Cargando ...");
	const [navHistory, setNavHistory] = useState<IMode[]>([]);
	const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
	const [discounts, setDiscounts] = useState<IDiscount[]>([]);
	const [discountSelected, setDiscountSelected] = useState<string>();	
    const [tabState, setTabState] = useState<number>(1);

	useEffect(() => {
		async function fetchData() {
			await fetchAll();
		}
		fetchData();
	}, []);

	const fetchAll = async () => {
        try {
			setMode("LOADING");
			setLoadingMessage("Cargando...");

            const [discounts] = await Promise.all([
				fetchDiscounts(),
            ]);
			setMode("HOME");
			
            let discount = discounts.map(discount => ({ ...discount, state_name: 'AVALAIBLE' })) as IDiscount[];
            eureka.log("discounts", discount);
			setDiscounts(discount);
        }
        catch (error) {
            eureka.error('Unexpected error fetching all', error);

            setStateErrorModal({
				title: "Hubo un problema",
				message: "No pudimos cargar toda la información. ¿Deseas reintentar?",
				onRetry: () => {
					setStateErrorModal(undefined);
					setTimeout(async() => {
						await fetchAll();
					}, ANIMATION_TIME);
				},
				onCancel: () => {
					setStateErrorModal(undefined);
					setTimeout(() => {
						onbackHistory(true);
					}, ANIMATION_TIME)
				}
            });
        }
    }

	const fetchDiscounts = async () => {

        let queryParams:IListParams = {
            offset: 0,
            limit: 10,
            query: {},
            sort: {
                created_at: 'desc'
            },
        };

        //disponibles default 
        queryParams.query = Object.assign({}, queryParams.query, {
            'apply_to.user_ids.keyword_is_one_of': ['*', AuthenticationClient.getInfo().primarysid],
            'selectable_is': true,
            'validity.end_at_range_gte': moment(),
            'script': JSON.stringify({
                script: {
                    script: "doc['stats.total_burned'].value < doc['max_to_burn'].value",
                }
            }),
        });

        eureka.log("query", queryParams);
        
        //all discounts
        const response = await DiscountClient.list(queryParams);

		return response.data;
    }

	/**
	* all on functions
	*/
	const onbackHistory = (navigate = true): void => {
		navHistory.pop();
        if (navigate) {
        	if (!navHistory.length) {
                props.history.goBack();
                return;
            }
			setMode(navHistory[navHistory.length - 1]);
        }
	}

	const onSelectedDiscount = (id:string): void => {
		setDiscountSelected(id);
	}

	const onAddCoupon = async (coupon:string): Promise<boolean|AxiosError> => {
		try {
			const response = await CouponClient.activate(coupon);
            if(response){
                //success avalaible discount
                setStateErrorModal({ 
                    title: "¡Todo listo!",
                    message: "El cupón se registro con éxito",
                    retryMessage: "Continuar",
                    onRetry: () => {
                        setStateErrorModal(undefined);
                        let newDiscounts = [...discounts, response];
                        newDiscounts = newDiscounts.map(discount => ({ ...discount, state_name: 'AVALAIBLE' })) as IDiscount[];
                        setDiscounts(newDiscounts);
                    },
                });
                return true;
            }
            return false;
		}catch(error) {
			eureka.error(`An error has occurred while adding coupon: ${error}`);
			const error_status = (error as AxiosError);
			return error_status;
		}
	}

	const onReadCode = async (coupon:string): Promise<void> => {
        eureka.info(`Reading code: ${coupon}`);
		try {
			const response = await CouponClient.activate(coupon);
            if(response){
                onStopScanner();
                //success avalaible discount
                setStateErrorModal({ 
                    title: "¡Todo listo!",
                    message: "El cupón se registro con éxito",
                    retryMessage: "Continuar",
                    onRetry: () => {
                        setStateErrorModal(undefined);
                        let newDiscounts = [...discounts, response];
                        newDiscounts = newDiscounts.map(discount => ({ ...discount, state_name: 'AVALAIBLE' })) as IDiscount[];
                        eureka.info("newDiscounts:", newDiscounts);
                        setDiscounts(newDiscounts);
                        
                    },
                });
            }

		}catch(error) {
            onStopScanner();
			eureka.error(`An error has ocurred trying to scan: ${error}`);
			if((error as AxiosError).response?.status === 404) {
				setStateErrorModal({
                        title: "Algo salió mal",
                        message: "El cupón no existe",
                        cancelMessage: "Entiendo",
						cssClass: 'scanner-error-modal',
                        onCancel: () => {
							setStateErrorModal(undefined);
							setMode("HOME");
                        }
                });
			}

            if((error as AxiosError).response?.status === 409) {
				setStateErrorModal({
                        title: "Algo salió mal",
                        message: "Lo sentimos, este cupón ya ha sido utilizado",
                        cancelMessage: "Entiendo",
						cssClass: 'scanner-error-modal',
                        onCancel: () => {
							setStateErrorModal(undefined);
							setMode("HOME");
                        }
                });
			}
		}
	}

	const onQRCodeScanHandler = async () => {

        Expr.whenInNativePhone(async () => {
            try {
				setMode("SCANNER");
				setStateErrorModal(undefined);
                // make background of WebView transparent
                BarcodeScanner.hideBackground();

                // trick to hide the webview
                document.body.style.backgroundColor = "transparent";

                const result = await BarcodeScanner.startScan();

                eureka.debug("BarcodeScanner result", result);

                // if the result has content
                if (result.hasContent) {
                    const code = result.content?.toUpperCase() as string;
                    eureka.debug("BarcodeScanner code", code);
                    onReadCode(code);
                }

                eureka.info(`Bar code scanned successfuly`, JSON.stringify(result));
            } catch (ex) {
                eureka.error('An error has ocurred trying to read the ticket qr');
                eureka.error((ex as Error).message, ex);

                // show error modal
                setStateErrorModal({
                    title: "Hubo un problema",
                    message: "No pudimos leer el código QR. ¿Deseas reintentar?",
                    onRetry: () => {
                        setStateErrorModal(undefined);
                            setTimeout(() => {
                                onQRCodeScanHandler();
                            }, 1000);
                        },
                        onCancel: () => {
							setStateErrorModal(undefined);
							setMode("HOME");
                        }
                    }
                );
            } finally {
                document.body.style.backgroundColor = "";
            }
        })

        Expr.whenNotInNativePhone(() => {
            //when test locally
			onReadCode(QR_TEST);
        })
    }

	const grantCameraPermission = async () => {
        const showOpenNativeSettingsModal = () => {
            setStateErrorModal({ 
                title: "Hubo un problema",
                message: "Debes activar los permisos de tu cámara. Ingresa a la configuración de tu teléfono.",
                retryMessage: "Ir a configuración",
                onRetry: () => {
					setStateErrorModal(undefined);
					setTimeout(() => {
						OpenNativeSettings.open('application_details');
					}, 500);
				},
                onCancel: () => {
					setStateErrorModal(undefined);
                }
            });
        }

        Expr.whenInNativePhone(async () => {
            try {
                const status = await BarcodeScanner.checkPermission({ force: false });

                if (status.granted) {
                    eureka.info('User already granted camera permission');
                    onQRCodeScanHandler();
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
                const statusRequest = await BarcodeScanner.checkPermission({ force: true });

                if (statusRequest.asked) {
                    // system requested the user for permission during this call
                    // only possible when force set to true
                }

                if (statusRequest.granted) {
                    // the user did grant the permission now
                    eureka.info('User granted the permission');
					setMode("SCANNER");
					setStateErrorModal(undefined);
                    return;
                }

                // user did not grant the permission, so he must have declined the request
                showOpenNativeSettingsModal();
                return;
            } catch (error) {
                eureka.error('An error has ocurred trying to grant camera permission', error);

                // show error modal
                setStateErrorModal({ 
                    title: "Hubo un problema",
                    message: "No pudimos cargar la información de tu cámara. ¿Deseas reintentar?",
                    onRetry: () => {
                        setStateErrorModal(undefined);
                        setTimeout(() => {
                            grantCameraPermission();
                        }, 1000);
                    },
                    onCancel: () => {
						setStateErrorModal(undefined);
                    	setTimeout(() => {
                            onbackHistory(true);
                        }, 500)
                    }
                });
            }
        });

        Expr.whenNotInNativePhone(() => {
        	onQRCodeScanHandler();
        });
    };

	const onStopScanner = () => {
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
        setMode("HOME");
    }

    const onSelectedTab = async (tab:number) => {
        setDiscounts([]);
        setTabState(tab);
        setMode("LOADING");
		setLoadingMessage("Cargando...");

        //1 = Disponibles, 2 = Canjeados , 3 = Expirados 
        
        let queryParams:IListParams = {
            offset: 0,
            limit: 10,
            query: {},
            sort: {
                //priority: 'asc', 
                //updated_at: 'desc'
                created_at: 'desc'
            },
        };

        //base query list
        queryParams.query = Object.assign({}, queryParams.query, {
            'apply_to.user_ids.keyword_is_one_of': ['*', AuthenticationClient.getInfo().primarysid],
        });

        let status_name = "";
        if(tab === 1) {
            //disponibles 
            queryParams.query = Object.assign({}, queryParams.query, {
                'selectable_is': true,
                'validity.end_at_range_gte': moment(),
                'script': JSON.stringify({
                    script: {
                        script: "doc['stats.total_burned'].value < doc['max_to_burn'].value",
                    }
                })
            });

            status_name = "AVALAIBLE";

        }
        if(tab === 2) {
            //canjeados
            queryParams.query = Object.assign({}, queryParams.query, {
                'selectable_is': true,
                'script': JSON.stringify({
                    script: {
                        script: "doc['stats.total_burned'].value === doc['max_to_burn'].value"
                    }
                })
            });
            

            status_name = "REDEEMED";

        }
        if(tab === 3) {
            //expirados
            queryParams.query = Object.assign({}, queryParams.query, {
                'selectable_is': true,
                'validity.end_at_range_lt': moment(),
                'script': JSON.stringify({
                    script: {
                        script: "doc['stats.total_burned'].value < doc['max_to_burn'].value",
                    }
                })
            });

            status_name = "EXPIRED";
        } 

        eureka.log("query tabs::", queryParams);
                
        let response = await DiscountClient.list(queryParams);
        if (!response.data.length) {
            setDiscounts([]);
        }

        let discount = response.data.map(discount => ({ ...discount, state_name: status_name })) as IDiscount[];
		setDiscounts(discount);
        setMode("HOME");
    }

	/**
	 * Loading Render
	 */
	 const renderLOADING = () => {
		return (
			<Fragment>
				<BackdropLoading message={loadingMessage!} />
		  	</Fragment>
		)
	}

	/**
	* Home Render
	*/
	const renderHOME = () => {
		const header = <DefaultHeader onBack={() => onbackHistory(true)}/>;

		const content = (
			<div className="body-home">
				<div className="body-home-content">
					<div className="home-header">
						<h2 className="title">Cupones y Descuentos</h2>
						<h3 className="subtitle">
							Encuentra aquí toda la información referente a tus cupones y descuentos.
						</h3>
					</div>
					<div className="body-home-screen-coupon">
						<ScreenCoupon 
							onClickScan={grantCameraPermission}
							onClickCoupon={onAddCoupon}
						/>
					</div>
					<div className="tabs-states">
                        <div>
                            <HeaderTab 
                                id={tabState}
                                onClick={onSelectedTab} 
                            />
                        </div>
						<div>
							<SeparationLine marginTop="20px" marginBottom="10px" darkBackground="rgba(255, 255, 255, 0.1)" background="#DBDBDB" height="8px" />
						</div>
					</div>
					<div className="display-coupon">
                        {discounts.length === 0 && tabState === 1
                            ? <EmptyDataCoupons />
						    : discounts.map((discount:IDiscount) => {
                                return (
                                    <Fragment key={discount.id}>
                                        {discountSelected != discount.id 
                                            ? <Coupon 
                                                discount={discount} 
                                                onSelected={onSelectedDiscount}
                                            />
                                            :<CouponDetail 
                                                discount={discount}
                                            />
                                        }
                                    </Fragment>
                                )
						    })
                        }
					</div>
					<div className="footer-info-text">
						Toca los cupones para obtener más información.
					</div>
				</div>
			</div>
		);
		
		return (
            <Page
                header={header}
                content={content}
            />
        )
	}

	/**
    * Render scanner view
    */
	const renderSCANNER = () => {

        return (
            <Fragment>
                <IonHeader>
                    <div onClick={onStopScanner}>
                        <IonIcon icon={arrowBack} />
                    </div>
                </IonHeader>
                <div className="content">
                    <IonIcon src={qrLens} />
                    <div className="message">Coloca el código en el centro del recuadro para escanear.</div>
                </div>
            </Fragment>
        )
    }

	const renders: Record<typeof mode, () => JSX.Element> = {
		LOADING: renderLOADING,
		HOME: renderHOME,
		SCANNER: renderSCANNER
	};

    /**
     * Main Render
     */
     const render = (mode:IMode) => {
        return (
        	<IonPage className={`coupons-flow ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
            	{(() => {
              		const customRender = renders[mode];
              		if (!customRender) {
                		return <div>{mode}</div>;
              		}
              		return customRender();
            	})()}
				{error_modal && <ErrorModal cssClass={error_modal.cssClass} icon={error_modal.icon} title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
          	</IonPage>
        )
    }

	return render(mode);
}

export default CouponsPage;