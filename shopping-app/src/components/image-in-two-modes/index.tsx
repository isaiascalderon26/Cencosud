import React from "react";

interface IProps {
  srcLight: any;
  srcDark: any;
  alt: string;
}

export default class ImageInTwoMode extends React.Component<IProps, {}>  {
  media = window.matchMedia('(prefers-color-scheme: dark)');

  onMediaChangeHandler = () => {
    this.forceUpdate();
  }

  componentDidMount = () => {
    this.media.addEventListener('change', this.onMediaChangeHandler);
  }

  render() {
    const { srcLight, alt } = this.props;

    return <img src={ srcLight} alt={alt} />;
  }
}
