import React, { Fragment, useEffect, useState } from 'react';
import { arrowBack, close } from 'ionicons/icons';
import { IonModal, IonContent, IonIcon, IonHeader, IonPage } from '@ionic/react';
import { AxiosError } from 'axios';
import moment from 'moment';
//scanner
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
// index
import './index.less';
/**
* Componets
*/
import BackdropLoading from '../backdrop-loading';
import ScreenCoupon from '../../pages/coupons-flow/components/screen-coupon';
import EmptyDataCoupons from '../../pages/coupons-flow/components/empty-data';
import Coupon from '../../pages/coupons-flow/components/coupon';
import CouponDetail from '../../pages/coupons-flow/components/coupon-detail';
import ErrorModal, { IErrorModalProps } from '../error-modal';
/**
* Models
*/
import { IDiscount } from '../../models/discount/IDiscount';
/**
* Libs
*/
import EurekaConsole from '../../lib/EurekaConsole';
import Expr from '../../lib/Expr';
/**
* Clients
*/
import CouponClient from '../../clients/CouponClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import DiscountClient from '../../clients/DiscountClient';
import { IListParams } from '../../clients/RESTClient';

type IMode = "LOADING" | "HOME";
const QR_TEST = "0001";
const ANIMATION_TIME = 200;

const eureka = EurekaConsole({ label: "discount-modal" });

interface IContext {
    paymentFlow: string;
    storeNumber?: string;
    restaurants?: string;
}

export interface IProps {
    cssClass?: string | string[]; //override css class
    context: IContext;
    onScan:() => void;
    onStop:(status:number|undefined) => void;
    onClose:() => void;
    onCouponClick: (discount: IDiscount) => void;
    onStatus?:number;
}

const DiscountModal: React.FC<IProps> = (props) => {
    
    const [mode, setMode] = useState<IMode>("LOADING");
	const [loadingMessage, setLoadingMessage] = useState<string>("Cargando ...");
    const [discounts, setDiscounts] = useState<IDiscount[]>([]);
    const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
    const [discountSelected, setDiscountSelected] = useState<string>();	
    const [isOpen, isSetOpen] = useState<boolean>(true);
    const { cssClass } = props;

    const _cssClass = ['discount-modal'];
    if (cssClass) {
        _cssClass.push(...(typeof cssClass === 'string' ? [cssClass] : cssClass));
    }

    const onStatusHandler = (statusCode:number):void => {

        if(statusCode === 201) {
            setStateErrorModal({ 
                title: "¡Todo listo!",
                message: "El cupón se registro con éxito",
                retryMessage: "Continuar",
                onRetry: () => {
                    props.onStop(undefined);
                    onCloseHandler();
                },
            });
            return
        }

        if(statusCode === 404) {
            setStateErrorModal({
                title: "Algo salió mal",
                message: "El cupón no existe",
                cancelMessage: "Entiendo",
                cssClass: 'scanner-error-modal',
                onCancel: () => {
                    setStateErrorModal(undefined);
                    setMode("HOME");
                    props.onStop(undefined)
                }
            });
            return
        }

        if(statusCode === 409) {
            setStateErrorModal({
                title: "Algo salió mal",
                message: "Lo sentimos, este cupón ya ha sido utilizado",
                cancelMessage: "Entiendo",
                cssClass: 'scanner-error-modal',
                onCancel: () => {
                    setStateErrorModal(undefined);
                    setMode("HOME");
                    props.onStop(undefined)
                }
            });
            return
        }

        setMode("HOME");
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
                        //only add to state if they belong to the same or flow or all
                        newDiscounts = onFilterDiscount(newDiscounts);
                        eureka.info("newDiscounts:", newDiscounts);
                        setDiscounts(newDiscounts);
                        //update discount without clicking, if it´s from the same flow
                        if(onFilterDiscount([response]).length > 0){
                            props.onCouponClick(response);
                        }
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
                let newDiscounts = [...discounts, response];
                newDiscounts = newDiscounts.map(discount => ({ ...discount, state_name: 'AVALAIBLE' })) as IDiscount[];
                //only add to state if they belong to the same or flow or all
                newDiscounts = onFilterDiscount(newDiscounts);

                eureka.info("newDiscounts:", newDiscounts);
                setDiscounts(newDiscounts);
                //update discount without clicking, if it´s from the same flow
                if(onFilterDiscount([response]).length > 0){
                    props.onCouponClick(response);
                }
                onStopScanner(201)
            }

		}catch(error) {
			eureka.error(`An error has ocurred trying to scan: ${error}`);
			if((error as AxiosError).response?.status === 404) {    
                onStopScanner(404)
			}

            if((error as AxiosError).response?.status === 409) {
                onStopScanner(409)
			}
            
		}
	}

    const onFilterDiscount = (discounts:IDiscount[]) => {
        const discountsFilter = discounts.filter(discount => 
            (discount.apply_to.payment_flows as Array<string>).includes(props.context.paymentFlow) || 
            (discount.apply_to.payment_flows as Array<string>).includes('*')
        );
        return discountsFilter;
    }

    const onScan = () => {
        props.onScan();
    }

    const onQRCodeScanHandler = async () => {
    
        Expr.whenInNativePhone(async () => {
            try {
                eureka.log("Scanning code ...");
                onScan();
                isSetOpen(false);
    
				setStateErrorModal(undefined);
                // make background of WebView transparent
                BarcodeScanner.hideBackground();

                // trick to hide the webview
                document.body.style.backgroundColor = "transparent";

                const result = await BarcodeScanner.startScan();

                eureka.debug("BarcodeScanner result", result);

                // if the result has content
                if (result.hasContent) {
                    const code = result.content as string;
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
                            setMode("HOME");
                        }, 500)
                    }
                });
            }
        });

        Expr.whenNotInNativePhone(() => {
        	onQRCodeScanHandler();
        });
    };

    const onStopScanner = (status:number) => {
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
        props.onStop(status);
        eureka.info("Stop set mode")
        //setMode("HOME");
    }

    const onSelectedDiscount = (id:string): void => {
		setDiscountSelected(id);
        eureka.info(`Discount selected: ${id}`);
        const discount = discounts.find(d => d.id === id) as IDiscount;
        props.onCouponClick(discount);
	}

    const onCloseHandler = () => {
        isSetOpen(false);
        props.onClose();
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
            'selectable_is': true
        });

        const context: Record<string, any> = {
            "user_ids": AuthenticationClient.getInfo().primarysid,
            "payment_flows": props.context.paymentFlow,
            "stores": props.context.storeNumber
        }

        if(props.context.restaurants){
            context.restaurants = props.context.restaurants;
        }
        eureka.log("query", {context, ...queryParams});
         
        //all discounts
        const response = await DiscountClient.listContext({context, ...queryParams});

		return response.data;
    }

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

            let discount = discounts.map(discount => ({ ...discount, state_name: 'AVALAIBLE' })) as IDiscount[];
            eureka.log("discounts", discount);
			setDiscounts(discount);

            eureka.info("status inside component", props.onStatus)
            onStatusHandler(props.onStatus!);
		
            //setMode("HOME");
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
						setMode("HOME");
					}, ANIMATION_TIME)
				}
            });
        }
    }

    const renderLOADING = () => {
		return (
			<Fragment>
				<BackdropLoading message={loadingMessage!} />
		  	</Fragment>
		)
	}

    const renderHOME = () =>  {
        return (
            <IonModal swipeToClose={false} backdropDismiss={false} cssClass={_cssClass} isOpen={isOpen}>
                <IonHeader>
                    <div className="header">
                        <div className="close-button">
                            <IonIcon icon={close} onClick={onCloseHandler} />
                        </div>
                    </div>
                </IonHeader>
                <IonContent>
                    <div className="content">
                        <div className="body-content-discount">
                            <h2 className="title">Cupones y Descuentos</h2>
                            <h3 className="subtitle">
                                Encuentra aquí toda la información referente a tus cupones y descuentos.
                            </h3>
                        </div>
                        <div className="screen-coupon">
                            <ScreenCoupon 
                                onClickScan={grantCameraPermission}
                                onClickCoupon={onAddCoupon}
                            />
                        </div>
                        <div className="text-avalaible">
                            <h1>Disponibles para está compra</h1>
                        </div>
                        <div className="display-coupon">
                            {discounts.length === 0
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
                    </div>
                </IonContent>
            </IonModal>
        )
    }

    const renders: Record<typeof mode, () => JSX.Element> = {
		LOADING: renderLOADING,
		HOME: renderHOME,
	};

    /**
     * Main Render
     */
     const render = (mode:IMode) => {
        return (
        	<div className={`discount-modal-flow ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
            	{(() => {
              		const customRender = renders[mode];
              		if (!customRender) {
                		return <Fragment>{mode}</Fragment>;
              		}
              		return customRender();
            	})()}
				{error_modal && <ErrorModal cssClass={error_modal.cssClass} icon={error_modal.icon} title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
          	</div>
        )
    }

	return render(mode);
};

export default DiscountModal;
