import React, { Fragment, useState } from 'react';
/**
* Styles
*/
import './index.less';
/**
* Assets
*/
import InfoImg from './../../assets/media/info-blue.svg';
/**
* Components
*/
import Page, { DefaultFooter, DefaultHeader } from '../page';
import HelpRegisterModal from '../help-register-modal';

export interface IData {
    image: string;
    title: string;
    description: string;
}

export interface IProps {
    imageTitle: string;
    imageUnder?: string;
    title: string;
    subtitle?: string;
    textBody?: string; //text in format encode html
    onBack: () => void;
    onContinue: () => void;
    textContinue: string;
    onBoarding?: IData[];
    cssClass?: string | string[];
    imageInfoOnboarding?: string;
}

const Landing: React.FC<IProps> = (props) => {
    
    const { imageTitle, imageUnder, title, subtitle, textBody, textContinue, onBoarding, cssClass } = props;

    const imgInfo = props.imageInfoOnboarding ? props.imageInfoOnboarding : InfoImg;

    const _cssClass = ['component-landing'];
    if (cssClass) {
        _cssClass.push(...(typeof cssClass === 'string' ? [cssClass] : cssClass));
    }

    const [modalIsOpen, setStateModalIsOpen] = useState<boolean>(false);

    const onOnBack = () => {
        props.onBack();
    }

    const onOnContinue = () => {
        props.onContinue();
    }

    const htmlDecode = (input: string): string => {
        const _input = input || '';
        const doc = new DOMParser().parseFromString(_input, "text/html");
        return doc.documentElement.textContent || '';
    }

    return (
        <Page
            header={
                <Fragment>
                    <div className={`header-landing ${cssClass}`}>
                        <div className="component-landing-image-title" style={{ 'backgroundImage': `url(${imageTitle})` }} ></div>
                        <DefaultHeader onBack={onOnBack} />
                        {imageUnder &&
                            <div className="component-landing-image-under">
                                <div className="image-under">
                                    <img src={imageUnder} />
                                </div>
                            </div>
                        }
                    </div>
                </Fragment>
            }
            content={
                <div className={`component-landing`}>
                    <div className="title">
                        <h1>{title}</h1>
                    </div>
                    {
                        subtitle && <div className="sub-title">
                            <h4>{subtitle}</h4>
                        </div>
                    }
                    <div className="text-body">
                        <div dangerouslySetInnerHTML={{ __html: htmlDecode(textBody || '') }}></div>
                    </div>
                    {onBoarding &&
                        <Fragment>
                            <div className="onboarding">
                                <button className="more-info-onboarding listing-onboarding" onClick={() => { setStateModalIsOpen(true) }}>
                                    <div className="logo-onboarding">
                                        <img src={imgInfo} alt="info" />
                                    </div>
                                    <div className="text-onboarding" dangerouslySetInnerHTML={{ __html: 'Conoce más de Puntos Cencosud' }}></div>
                                </button>
                            </div>
                            {modalIsOpen &&
                                <Fragment>
                                    <HelpRegisterModal
                                        onClose={() => { setStateModalIsOpen(false) }}
                                        modal_is_open={modalIsOpen}
                                        content={onBoarding}
                                        cssClass="cencosud-points-modal-onboarding"
                                    />
                                </Fragment>
                            }
                        </Fragment>
                    }
                </div>
            }
            footer={(
                <DefaultFooter
                    mainActionText={textContinue}
                    onClickMainAction={onOnContinue}
                />
            )}
        />

    )
}

export default Landing;
