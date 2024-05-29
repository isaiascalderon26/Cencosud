import styled from 'styled-components';

export const LikedButtonStyle = styled.button`
  & {
    display:flex;
    justify-content:center;
    align-items:center;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 0.438462px solid #ffffff;
    border-radius: 4px;
    padding:0;
    overflow:hidden;
    position: relative;

    &:after{
        content: '';
        width:25px;
        height:25px;
        transform: scale(0);
        background: #ffffff61;
        border-radius:50%;
        position:absolute;
        z-index:0;
    }

    &:active {
        &:after{
            transform: scale(4);
            animation: ripple 600ms linear;
            background-color: rgba(255, 255, 255, 0.7);
        }
    }

    &:disabled{
        opacity:0.6;
    }

    svg{
        width: 14px;
        height: 14px;
    }

    @keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
    }

  }
`;
