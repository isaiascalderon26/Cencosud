import React from 'react';
import sc from 'styled-components';

export interface IProps {
    height?: string;
    marginLeft?: string;
    marginRight?: string;
    marginTop?: string;
    marginBottom?: string;
    backgroundColor?: string;
    scrollXVisible?: boolean;
    paddingLeft?: string;
    paddingRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
    content: React.ComponentElement<string, any>;
    gapContent?: string;
}

const CarouselBody = sc.div`
    height: ${(props: IProps) => props.height ? props.height : '100%'};
    margin-left: ${(props: IProps) => props.marginLeft ? props.marginLeft : '0px'};
    margin-right: ${(props: IProps) => props.marginRight ? props.marginRight : '0px'};
    margin-top: ${(props: IProps) => props.marginTop ? props.marginTop : '0px'};
    margin-bottom: ${(props: IProps) => props.marginBottom ? props.marginBottom : '0px'};
    background-color: ${(props: IProps) => props.backgroundColor ? props.backgroundColor : '#fff'};
    padding-left: ${(props: IProps) => props.paddingLeft ? props.paddingLeft : '0px'};
    padding-right: ${(props: IProps) => props.paddingRight ? props.paddingRight : '0px'};
    padding-top: ${(props: IProps) => props.paddingTop ? props.paddingTop : '0px'};
    padding-bottom: ${(props: IProps) => props.paddingBottom ? props.paddingBottom : '0px'};
    display: flex;
    flex-direction: row;
`;

 const CarouselItem = sc.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow-x: ${(props: IProps) => props.scrollXVisible ? 'scroll' : 'hidden'};
    &::-webkit-scrollbar {
        display: none;
    }
`;

const CarouselItemContent = sc.div`
        display: flex;
        gap: ${(props: IProps) => props.gapContent ? props.gapContent : '0px'};
`;

export default function Carousel(props: IProps) {
    return (
      <>
        {/*<CarouselBody {...props}>
            <CarouselItem {...props}>
                <CarouselItemContent {...props}>
                    {props.content}
                </CarouselItemContent>
            </CarouselItem>
    </CarouselBody>*/}
      </>
    );
}
