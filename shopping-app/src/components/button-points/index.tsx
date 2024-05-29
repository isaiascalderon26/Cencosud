import React from "react";
import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
// styles
import "./index.less";
//assets
import iconPoints from "./../../assets/media/icon-points.svg";

interface IProps {
  title: string;
  subtitle?: string;
  onClick: () => void;
}

const ButtonPoints: React.FC<IProps> = (props) => {
  const onClickButton = () => {
    props.onClick();
  };

  return (
    <div className="component-button-points" onClick={onClickButton}>
      <img src={iconPoints} alt="icon-points" />
      <div className="points">
        <div className="points-title">
          <h3>{props.title}</h3>
        </div>
        <div className="points-description">
          {props.subtitle ? props.subtitle : ""}
        </div>
      </div>
      <div className="arrow">
        <IonIcon icon={chevronForward} />
      </div>
    </div>
  );
};

export default ButtonPoints;
