import React, { useState, useRef } from "react";
import {
  IonModal,
  IonContent,
  IonButton,
  IonImg,
  IonText,
  IonIcon,
} from "@ionic/react";

import orderImage from "../../assets/media/foodie/ilustration-order.webp";
import loadingSpin from "../../assets/media/icons/loading-spin.svg";

import "./index.less";

interface IProps {
  isOpen: boolean;
  isLoading: boolean;
  hasError: boolean;
  validateCode: (code: string) => void;
}

const CodeValidationModal: React.FC<IProps> = ({
  isOpen,
  isLoading,
  hasError,
  validateCode,
}) => {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const codeRef = useRef(code);

  const showErrorMessage = () => {
    const codeValue = code.join("");
    const codeRefValue = codeRef.current.join("");
    return hasError && codeValue.length === 4 && codeValue === codeRefValue;
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    if (newValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = newValue;
      setCode(newCode);

      if (newValue.length === 1 && index < 3) {
        inputRefs[index + 1].current!.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs[index - 1].current!.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const newValue = event.clipboardData.getData("text");
    if (newValue && newValue.length === 1) {
      const newCode = [...code];
      newCode[0] = newValue;
      setCode(newCode);
      inputRefs[0].current!.focus();
    }
  };

  const handleValidateCode = () => {
    codeRef.current = code;
    validateCode(code.join(""));
  };

  return (
    <IonModal
      cssClass="code-validation-modal"
      isOpen={isOpen}
      backdropDismiss={false}
    >
      <IonContent className="ion-padding">
        <IonImg
          src={orderImage}
          alt="Imagen"
          className="ion-margin-horizontal ion-text-center"
        />
        <IonText>
          <h1>Ingrese el código de seguridad</h1>
        </IonText>
        <IonText>
          <p>
            Acércate directamente al local donde compraste para recibir el
            código y retirar tu pedido
          </p>
        </IonText>
        <div className="register-code-form">
          <div className="code-characters">
            <input
              className={showErrorMessage() ? "error" : ""}
              ref={inputRefs[0]}
              onPaste={handlePaste}
              onKeyUp={(e: any) => handleInputChange(0, e)}
              onKeyDown={(e: any) => handleKeyDown(0, e)}
              maxLength={1}
              disabled={isLoading}
            />
            <input
              className={showErrorMessage() ? "error" : ""}
              ref={inputRefs[1]}
              onKeyUp={(e: any) => handleInputChange(1, e)}
              onKeyDown={(e: any) => handleKeyDown(1, e)}
              maxLength={1}
              disabled={isLoading}
            />
            <input
              className={showErrorMessage() ? "error" : ""}
              ref={inputRefs[2]}
              onKeyUp={(e: any) => handleInputChange(2, e)}
              onKeyDown={(e: any) => handleKeyDown(2, e)}
              maxLength={1}
              disabled={isLoading}
            />
            <input
              className={showErrorMessage() ? "error" : ""}
              ref={inputRefs[3]}
              onKeyUp={(e: any) => handleInputChange(3, e)}
              onKeyDown={(e: any) => handleKeyDown(3, e)}
              maxLength={1}
              disabled={isLoading}
            />
          </div>
          {showErrorMessage() && (
            <p className="error">Debes ingresar un código válido</p>
          )}
        </div>
        <IonButton
          expand="full"
          shape="round"
          color="dark"
          onClick={handleValidateCode}
          className="ion-margin-vertical"
          disabled={isLoading || code.join("").length < 4}
        >
          {isLoading ? (
            <IonIcon icon={loadingSpin}></IonIcon>
          ) : (
            "Valida el código de seguridad"
          )}
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default CodeValidationModal;
