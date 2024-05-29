import React, { Fragment } from 'react';
import { RouteComponentProps, withRouter, Redirect } from 'react-router';
import EventStreamer from '../../lib/EventStreamer';

interface IProps extends RouteComponentProps { }

interface IState {
  current_url?: string
}
/**
 * Because Ionic React doesnt support to implement my own history management
 * This class should fix the "how to navigate in a non class component",
 * When a route event has "emitted", this class make the "navigation thing"
 * in order to patch the issue for custom history
 *
 * ISSUE: https://github.com/ionic-team/ionic/issues/20297
 * @export
 * @class HistoryManager
 * @extends {React.Component<IProps, IState>}
 */
export default withRouter(class HistoryManager extends React.Component<IProps, IState> {
  state: IState = {}

  componentDidMount() {
    EventStreamer.on("NAVIGATE_TO", this.onNavigateToHandler);
    EventStreamer.on("NAVIGATE_TO_PUSH", this.onNavigateToPushHandler);
  }

  componentWillUnmount() {
    EventStreamer.off("NAVIGATE_TO", this.onNavigateToHandler);
    EventStreamer.off("NAVIGATE_TO_PUSH", this.onNavigateToPushHandler);
  }

  onNavigateToHandler = (url: string) => {
    this.props.history.replace(url)
  }

  onNavigateToPushHandler = (url: string) => {
    this.props.history.push(url)
  }

  shouldComponentUpdate(nextProps: IProps, nextState: IState) {
    if (this.props.location.pathname !== nextState.current_url) {
      return true;
    }
    return false;
  }

  render() {
    const { current_url } = this.state;

    if (current_url) {
      return <Redirect to={current_url} />;
    }

    return <Fragment></Fragment>;
  }
});
