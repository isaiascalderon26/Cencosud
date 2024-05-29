import React from 'react';
import styled from 'styled-components';

/**
 * Style
 */
import './index.less';
import { DefaultHeader } from '../../../../components/page';

/**
 * Components
 */


/**
 * Models
 */

export interface IHeaderBackgroundImageProps {
  background_image: string;
  background_height: number;
  onBack: () => void;
}

const HeaderBackgroundImage: React.FC<IHeaderBackgroundImageProps> = ({ background_image, background_height, onBack }) => {

  const DivContainer = styled.div`
      height: ${background_height}px
  `;

  const DivContainerBackgroundImage = styled.div`
      background-image: linear-gradient(360deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 80.17%), url(${background_image});
      background-repeat: no-repeat;
      background-size: cover !important;
      height: ${background_height}px;
      width: 100%;
      position: absolute;
      top: 0;
      z-index: -1;
  `;
  
  const renderContent = () => {
    return (
        <>
          <DivContainerBackgroundImage />
          <DefaultHeader onBack={onBack} />
        </>
    )
  }

  return (
    <DivContainer>
      {renderContent()}
    </DivContainer>
  )
  
}

export default HeaderBackgroundImage;
