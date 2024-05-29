import React, { Fragment } from "react";
import ItemChallenge from "../item-challenge";
/* index */
import './index.less';
/** models  */
import IChallenge from "../../../../models/challenges/IChallenge";
/** components */
import SeparationLine from "../../../sky-costanera-flow/components/separation-line";
import moment from "moment";
interface IProps {
  challenges: IChallenge[];
  onSelectChallenge?: (id:string) => void;
}

interface IState {

}

export default class ListChallenges extends React.Component<IProps, IState> {

  render() {
    const { challenges } = this.props;

    return (
      challenges.map((item: IChallenge) => {
        return (
          <Fragment key={item.id}>
            <div className="component-list-rewards">
              <ItemChallenge challenge={item} onSelect = {this.props.onSelectChallenge}/>
              <SeparationLine marginTop="10px" marginBottom="10px" darkBackground="rgba(255, 255, 255, 0.1)" background="#FAFAFA" height="3px"/>
            </div>
          </Fragment>
        )
      }) 
    )
  }

}
