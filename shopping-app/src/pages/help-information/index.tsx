import {
    withIonLifeCycle,
    IonPage,
    IonContent,
    IonIcon,
    IonFooter,
    IonHeader,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
  } from '@ionic/react';
import React, { Fragment } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import FAQDetailPage from '../../components/faq-detail';
import { IUser } from '../../models/users/IUser';
import UserClient from '../../clients/UserClient';
import ComponentAnimations from '../../lib/Animations/ComponentAnimations';

interface IProps extends RouteComponentProps<{
    id: any,
  }> { }
  
type IMode = '';
  
interface IState {
    mode: IMode,
    user?: IUser
}

export default withRouter(class HelpInformationPage extends React.Component<IProps, IState> {

    componentDidMount = async () => {
        //console.log(this.props.match.params.id)
        await this.getInfo();
    }

    getInfo = async () => {
        const user = await UserClient.me();
    }

    /**
     * Main render
     */
    render() {
        return (
            <IonModal enterAnimation={ComponentAnimations.enterAnimation} leaveAnimation={ComponentAnimations.leaveAnimation} swipeToClose={false} backdropDismiss={false} cssClass="faq-details" isOpen={true}>
                <FAQDetailPage active_mode='sky_costanera' from_another_page={true} history={this.props.history} store={this.props.match.params.id} onClose={()=>{}}></FAQDetailPage>
            </IonModal>
        )
    }

})