import React from 'react';
import sc from 'styled-components';
import StringFormatter from '../../../../lib/formatters/StringFormatter';

interface IBorderStyle {
    border?: string;
    background?: string;
}

interface IText {
    value?: string;
    size?: string;
    color?: string;
    shortText?: number;
}

interface IVideo {
    autoplay?: boolean;
    preload?: "auto" | "metadata" | "none";
    heigth: string;
    width: string;
}

interface IProps {
    height: string;
    width: string;
    borderRadius?: string;
    gradient?: IBorderStyle;
    resourceType: "image" | "video";
    resourceUrl: string;
    text?: IText;
    active?: boolean;
    video?: IVideo;
    onClick?: () => void; 
}

const ThumbBody = sc.div`
    height: ${(props: IProps) => props.height};
    width: ${(props:IProps) => props.width};
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column
`;

const ContentResource = sc.div`
    border-radius: ${(props:IProps) => props.borderRadius ? props.borderRadius : '50%'};
    overflow: hidden;
    ${(props:IProps) => props.gradient?.background ? `background: ${props.active ?  props.gradient?.background : '#c9c5c5'} ;`: ''}
    ${(props:IProps) => props.gradient?.border ? `border: ${props.gradient.border};`: ''}
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${(props:IProps) => props.active ? '1' : '0.8'};
`;

const ThumbImage = sc.img`
    height: 100%;
    width: 100%;
    border-radius: ${(props:IProps) => props.borderRadius ? props.borderRadius : '50%'};
    border: 4px solid #ffffff;
`;

const ThumbVideo = sc.video`
    height: ${(props:IProps) => props.video?.heigth};
    width: ${(props:IProps) => props.video?.width};
    border-radius: ${(props:IProps) => props.borderRadius ? props.borderRadius : '50%'};
    border: 4px solid #ffffff;
    outline:none;
`;

const ThumbSpan = sc.span`
    display: block; 
    text-align: center;
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 300;
    font-size: ${(props:IProps) => props.text?.size ? props.text.size : '14px'};
    line-height: 100%;
    text-align: center;
    letter-spacing: -0.05em;
    color: ${(props:IProps) => props.text?.color ? props.text.color : '#000000'};
    padding-top: 3px;
`;

const Thumb: React.FC<IProps> = (props: IProps) => {

    const text = props.text?.shortText ? StringFormatter.shortText(props.text.value!,10, props.text.shortText) : props.text?.value;
    const autoplay = props.video?.autoplay ? props.video.autoplay : false;    

    return (
        <ThumbBody {...props}>
            {props.resourceType === "image" ? 
                <ContentResource {...props}>
                    <ThumbImage {...props}
                        src={props.resourceUrl}
                        onClick={props.onClick && props.onClick} 
                    />
                </ContentResource> 
            : null}
            {props.resourceType === "video" ? 
                <ContentResource {...props}>
                    <ThumbVideo 
                        {...props}
                        src={props.resourceUrl} 
                        autoPlay={autoplay} 
                        preload={props.video?.preload}
                        loop
                        onClick={props.onClick && props.onClick} 
                    />
                </ContentResource> 
            : null}
            {props.text?.value ? <ThumbSpan {...props}>{text}</ThumbSpan> : null}
        </ThumbBody>
    )
}

export default Thumb;