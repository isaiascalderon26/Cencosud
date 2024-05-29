import React, { Fragment, useEffect, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
// index
import './index.less';
/**
* Libs
*/
import Expr from "../../lib/Expr";
import EurekaConsole from '../../lib/EurekaConsole';
/**
* Components
*/
import Page, { DefaultFooter, DefaultHeader } from '../page';
import Countdown from '../countdown';


interface IProps {
    onBack: () => void;
    footerText?: string;
    onContinue: (code: string) => void;
    titleText?: string;
    subtitleText?: string;
    onResend?: () => void;
    txtResend?: string;
    txtResendAction?: string;
    onkeyUp?: () => void;
    txtErrorMessages?: string;
    cssClass?: string | string[];
}

const eureka = EurekaConsole({ label: "component-otp" });

const Otp: React.FC<IProps> = (props) => {

    const Input1 = React.createRef<HTMLInputElement>();
    const Input2 = React.createRef<HTMLInputElement>();
    const Input3 = React.createRef<HTMLInputElement>();
    const Input4 = React.createRef<HTMLInputElement>();
    const Input5 = React.createRef<HTMLInputElement>();
    const Input6 = React.createRef<HTMLInputElement>();

    const _cssClass = ['component-otp'];
    if (props.cssClass) {
        _cssClass.push(...(typeof props.cssClass === 'string' ? [props.cssClass] : props.cssClass));
    }

    const [code, setCode] = useState('');
    const [handlePaste, setHandlePaste] = useState(false);
    const [error, setError] = useState('');
    const [forwardButton, setForwardButton] = useState(true);

    const [disabledLink, setDisabledLink] = useState<boolean>(true);

    useEffect(() => {
        eureka.log("useEffect");
        setError(props.txtErrorMessages!);
    }, [props.txtErrorMessages]);

    const onContinue = (code: string) => {
        props.onContinue(code);
    };

    const handlePasteCode = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        Expr.whenInNativePhone(async () => {
          await Clipboard.write({
            string: e.clipboardData.getData('Text')
          });
    
          const read  = await Clipboard.read();
          setCode(read.value);
          setHandlePaste(true);

          Input1!.current!.value = read.value.substring(0, 1);
          Input2!.current!.value = read.value.substring(1, 2);
          Input3!.current!.value = read.value.substring(2, 3);
          Input4!.current!.value = read.value.substring(3, 4);
          Input5!.current!.value = read.value.substring(4, 5);
          Input6!.current!.value = read.value.substring(5, 6);

        });
    
        Expr.whenNotInNativePhone(() => {
          const value = e.clipboardData.getData('Text').substring(0, 6);
    
          Input1!.current!.value = value.substring(0, 1);
          Input2!.current!.value = value.substring(1, 2);
          Input3!.current!.value = value.substring(2, 3);
          Input4!.current!.value = value.substring(3, 4);
          Input5!.current!.value = value.substring(4, 5);
          Input6!.current!.value = value.substring(5, 6);
          setCode(value);
          setHandlePaste(true);
        });
    }

    const onKeyboardInput = async (
        e: React.KeyboardEvent<HTMLInputElement>, 
        input:React.RefObject<HTMLInputElement>,
        next: React.RefObject<HTMLInputElement> | undefined,
        prev: React.RefObject<HTMLInputElement> | undefined
    ) => {

        setHandlePaste(false);
        props.onkeyUp!();

        if (e.key === 'Backspace') {
          input.current!.value = '';
          if(prev !== undefined) {
            prev.current!.focus();
          }
          setForwardButton(false);
    
        } else {
          input.current!.value = input.current!.value.replace(/[^a-z0-9]/gi,'');
          if(input.current!.value && next !== undefined) {
            next.current!.focus();
          }
        }
    
        if (formValid()) {
            setForwardButton(false);
        }
    
        return;
    }

    const joinCodeInput = () => {
        return [
          Input1!.current!.value,
          Input2!.current!.value,
          Input3!.current!.value,
          Input4!.current!.value,
          Input5!.current!.value,
          Input6!.current!.value,
        ].join('').toUpperCase();
    }

    const formValid = (): boolean => {
        const codeInputs = handlePaste ? code : joinCodeInput();
        eureka.info("code", codeInputs);
        if (codeInputs.length != 6) {
          setForwardButton(true);
          return false;
        }
        setCode(codeInputs);
        return true;
    }

    const onResend = () => {
        setDisabledLink(true);
        props.onResend!();
    }

    return (
        <Page
            header={<DefaultHeader onBack={() => props.onBack() } />}
            content={
                <div className="component-otp">
                    <div className="content">
                        <div className="title">
                            <h1>{props.titleText}</h1>
                        </div>
                        <div className="subtitle">
                            <h3>{props.subtitleText}</h3>
                        </div>
                        <div className="code-char">
                            <input 
                                onPaste={(e) => handlePasteCode(e)}   
                                onKeyUp={(e) => onKeyboardInput(e, Input1, Input2, undefined)} 
                                ref={Input1} 
                                maxLength={1}
                                type="tel"
                            />
                            <input 
                                onKeyUp={(e) => onKeyboardInput(e, Input2, Input3, Input1)} 
                                ref={Input2} maxLength={1} 
                                type="tel"
                            />
                            <input 
                                onKeyUp={(e) => onKeyboardInput(e, Input3, Input4, Input2)} 
                                ref={Input3} maxLength={1} 
                                type="tel"
                            />
                            <input 
                                onKeyUp={(e) => onKeyboardInput(e, Input4, Input5, Input3)} 
                                ref={Input4} maxLength={1} 
                                type="tel"
                            />
                            <input 
                                onKeyUp={(e) => onKeyboardInput(e, Input5, Input6, Input4)} 
                                ref={Input5} 
                                maxLength={1} 
                                type="tel"
                            />
                            <input 
                                onKeyUp={(e) => onKeyboardInput(e, Input6, undefined, Input5)} 
                                ref={Input6} 
                                maxLength={1} 
                                type="tel"
                            />
                        </div>
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            }
            footer={(
                <div className="component-otp-footer">
                    <DefaultFooter  
                        mainActionText={props.footerText || "Continuar"}
                        mainActionIsDisabled={forwardButton}
                        onClickMainAction={() => onContinue(code)}
                    />
                    {props.txtResendAction && (
                        <div className="resend">
                            <h3 className="resend-text">{props.txtResend}</h3>
                            <h3 className={disabledLink ? "resend-action-text-disabled" : "resend-action-text"}   >
                                <a onClick={disabledLink ? async (e) => { e.preventDefault(); } : onResend }>
                                    {props.txtResendAction}
                                </a>
                               {disabledLink ? <Countdown
                                    style={!disabledLink ? { display: 'none' } : { display: 'block' }}
                                    value={59} 
                                    className='countdown'
                                    onFinish={function (): void {
                                        console.log('finish');
                                        setDisabledLink(false);
                                    } } 
                                /> : null}
                            </h3>
                        </div>
                    )}
                </div>
            )}
        />
    );
}

export default Otp;