import { IonIcon } from '@ionic/react';
import Lottie, {LottieProps} from 'react-lottie';
import { ellipsisHorizontal } from 'ionicons/icons';

/**
 * Assets
 */
 import readyStepperImg from '../../../../../../../../../../assets/media/foodie/stepper-2.svg';
 import spoonStepperAnimation from '../../../../../../../../../../assets/media/foodie/lottie-animations/stepper-1.json';
 import preparingOrderAnimation from '../../../../../../../../../../assets/media/foodie/lottie-animations/stepper-2.json';


const getLootieProps = (animationJson:any):LottieProps => {
  return {
    width: 40,
    height: 40,
    options: {
      loop: true,
      autoplay: true,
      animationData: animationJson,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
        
      }
    }
  } 
}

 interface IStepUnitProps {
  completed?: boolean,
  isFirst?: boolean,
  isLast?: boolean,
  text: string
  type?: 'SPOON' | 'COOKING' | 'READY'
}

const StepUnit: React.FC<IStepUnitProps> = ({ isFirst, isLast, text, type, completed }) => {

  return (

    <div className='step-wrapper'>
      <div className='step-bg'>
        {!isFirst ? <div className={`line ${type && 'step-line-ok'}`} /> : <div className='step-side step-start' />}
        
        {!type && <EmptyStep />}
        {type === 'SPOON' && <SpoonStep />}
        {type === 'COOKING' && <CookingStep />}
        {type === 'READY' && <ReadyStep />}
        
        {!isLast ? <div className={`line ${completed && 'step-line-ok'}`} /> : <div className='step-side step-end' />}
      </div>
      <div className={`text step-text`}>
        {text}
      </div>
    </div>
  )
}

const EmptyStep:React.FC = () => {
  return (
    <div className={`step step-not-active`}>
      <IonIcon icon={ellipsisHorizontal} className="step-empty"/>
    </div>
  )
} 
const SpoonStep:React.FC = () => {
  return (
    <div>
      <Lottie {...getLootieProps(spoonStepperAnimation)}/>
    </div>
  );
}

const CookingStep:React.FC = () => {
  return (
    <div>
      <Lottie {...getLootieProps(preparingOrderAnimation)}/>
    </div>
  );
}

const ReadyStep:React.FC = () => {
  return (
    <IonIcon src={readyStepperImg} className="step-full-icon"/>
  )
}

export default StepUnit;