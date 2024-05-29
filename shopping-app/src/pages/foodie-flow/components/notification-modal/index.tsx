import { IonButton, IonModal } from "@ionic/react";

import "./index.less"

interface IProps {
  image: string;
  altImage?: string;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const NotificationModal: React.FC<IProps> = ({
  image,
  altImage,
  title,
  description,
  buttonText,
  onClick,
}) => {

  return (
    <IonModal cssClass='notification-modal' isOpen backdropDismiss >
      <header>
        <img src={image} alt={altImage ?? "notification modal image"} />
      </header>
      <section>
        <h3>{title}</h3>
        <p>{description}</p>
      </section>
      <footer>
        <IonButton onClick={onClick}>{buttonText}</IonButton>
      </footer>
    </IonModal>
  );
};

export default NotificationModal;
