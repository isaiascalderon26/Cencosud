import React from 'react';
import './index.less';

interface IProps {
  message: string
}
interface IState { }

export default class BackdropLoading extends React.Component<IProps, IState> {
  state: IState = {}

  render() {
    const { message } = this.props;
    return (
      <div className='content-loader' style={{zIndex: 10}}>
        <div className="loader"/>
        <div className="text-inside">
          <p>{message}</p>
        </div>
      </div>
    )
  }
}
