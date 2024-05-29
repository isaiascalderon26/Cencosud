import { IonSlide, IonSlides } from '@ionic/react';
import React from 'react';
import { Step } from './types';
import sc from 'styled-components';
import { StepIcon } from './instructions/step-icon';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
  steps: Step[];
  currentStep: number;
}

const Slides = sc(Swiper)`
    margin-bottom: 28px;


`;

const Slide = sc(SwiperSlide)<any>`
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  width: calc(100% - 40px) !important;
  padding: 20px 24px 28px 24px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 108px;
  // margin-left: 10px;

  // &.swiper-slide-active {
  //   margin-left: ${({ 'data-step-index': i }) => `${i * 10 + 5}px`};
  // }

  > div:first-child {
    background-color: white;
    border-radius: 100px;
    width: 54px;
    height: 54px;
    padding: 10px;

    ion-icon {
      width: 100%;
      height: 100%;
    }

  }

  span {
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    color: white;
    flex: 1;
  }

  &[data-current-step='false']{
    background: #909090;
  }

  &[data-current-step='true']{
    background: #000000;       
    color: white;   
  }

`;

function RoutingSteepsCarrousel({ currentStep, steps }: Props) {
  return (
    <Slides
      slidesPerView={'auto'}
      spaceBetween={10}
      centeredSlides={true}
      initialSlide={currentStep}
    >
      {steps.map(({ plain_instructions, maneuver }, index) => (
        <Slide data-current-step={currentStep === index} key={index} >
          <StepIcon maneuver={maneuver!} />
          <span>{plain_instructions}</span>
        </Slide>
      ))}
    </Slides>
  );
}

export default RoutingSteepsCarrousel;
