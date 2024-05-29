import React, { Fragment } from 'react';
import { IonCol, IonIcon, IonRow } from '@ionic/react';
/** 
* styles 
*/
import './index.less';
/** 
* assets 
*/
import iconGoldMetal from '../../../../assets/media/challenge/gold-medal.svg';
import iconGoldMetalOpaque from '../../../../assets/media/challenge/gold-medal-opaque.svg';

/** 
* models 
*/
import IAward, { IDescription } from '../../../../models/challenges/IAward';
/**
* libs
*/
import NumberFormatter from '../../../../lib/formatters/NumberFormatter';
export interface IContainerAwardsProps {
  awards: Array<IAward>,
  show_details: (title: string, description: Array<IDescription>) => void,
  points: number
}

export default class ContainerAwards extends React.Component<IContainerAwardsProps, {}> {
  render() {
    return (
      <Fragment>
        <div className="container-awards">
          <IonRow>
            {
              this.props.awards.map((award, index) => {
                return (
                  <IonCol key={index} size="6" size-sm onClick={ () => this.props.show_details(award.title, award.description)}>
                    <ItemAward award={award} points={this.props.points}/>
                  </IonCol>
                )
              })
            }
          </IonRow>
        </div>
      </Fragment>
    )
  }
}

export interface IItemAwardProps {
  award: IAward,
  points: number
}

class ItemAward extends React.Component<IItemAwardProps, {}> {
  render() {
    const {award, points} = this.props;
  
    return (
      <div className="item-award">
          <div className={`container-item-award ${award.points_from >= points ? 'inactived' : 'actived'}`}>
            <h3>{award.title}</h3>
            <div className="description">
              <ul>
              {award.description.map((element, index) => {
                return (
                  <li key={index}>{element.title}</li>
                )
              })}
              </ul>
            </div>
            <div className="points">
              <div className={`label ${award.points_from >= points && 'inactived'}`}>
                 {NumberFormatter.toNumber(award.points_from)} - {NumberFormatter.toNumber(award.points_to)}  <span><IonIcon icon={award.points_from >= points ? iconGoldMetalOpaque : iconGoldMetal} /></span>
              </div>
            </div>
          </div>
      </div>
    )
  }
}
export {ItemAward}


