import React, { Fragment } from 'react';
import { IonFooter } from '@ionic/react';

interface IProps {
    font_zoom: number;
    add_zoom: () => void;
    remove_zoom: () => void;
    change_mode: () => void;
    go_to_accessibility: () => void;
    show_go_to_accessibility: boolean
}
  
interface IState {

}

export default class FooterZoom extends React.Component<IProps, IState> {
    state: IState = {
      
    }

    render() {
        return <IonFooter className="floating">
          <div className="floating-container">
            <div>
              <button className="set-font"  onClick={() => this.props.add_zoom()}>A +</button>
              <button className={`set-font margin-left ${this.props.font_zoom==0?'disabled':''}`}  onClick={() => this.props.remove_zoom()}>A -</button>
              <button className="change-mode margin-left"  onClick={() => this.props.change_mode()}>
                
              </button>
              {this.props.show_go_to_accessibility && <button className="set-font margin-left"  onClick={() => this.props.go_to_accessibility()}>?</button>}
            </div>
            <div></div>
            <div className='background-footer'></div>
          </div>
          
        </IonFooter>
    }
}