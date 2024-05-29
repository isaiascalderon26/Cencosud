import { useState } from 'react';
import { close } from 'ionicons/icons';
import { IonButton, IonIcon, IonImg, IonSlide, IonSlides, IonSpinner } from "@ionic/react";
/**
 * Components
 */
import StarSelector from '../star-selector';

/**
 * Models
 */
import { ICalificationUnsaved } from '../../../../models/calification/ICalification';

/**
 * Assets
 */
import endStepImg from '../../../../assets/media/calification/end-step-image.svg';

interface IProps {
  mainContent?: React.ReactNode
  centerContent: React.ReactNode
  cancelButtonText?: string
  initialPageConfig?: {
    mainImage?: string
    mainText: string
  }

  isLoading: boolean
  isSaving: boolean
  califications: ICalificationUnsaved[]
  handleClose: () => void
  handleCalification: (questionId: string, calification: number) => void
  handleComment: (questionId: string, comment: string) => void
  handleSendCalification: () => Promise<void>
  isDisabledOnboarding?: boolean
}

const CalificationSlide: React.FC<IProps> = ({ initialPageConfig, centerContent, mainContent, cancelButtonText, isLoading, isSaving, califications, handleClose, handleCalification, handleComment, handleSendCalification, isDisabledOnboarding }) => {

  const [slideIndex, setSlideIndex] = useState(isDisabledOnboarding === true ? 1 : 0);

  const nextSlide = (isLast?: boolean) => {
    if(isLast){
      handleSendCalification();
    }
    setSlideIndex(state => {
      if (state < califications.length + 1) {
        return state + 1;
      } else {
        return state;
      }
    });
  }

  

  const slides = [(
    <div className='slide-body'>
      {
        initialPageConfig ?
          <>
            <div className='header'>
              {initialPageConfig.mainImage && <IonImg src={initialPageConfig.mainImage} />}
            </div>
            <div className='title'>{initialPageConfig.mainText}</div>

            <div className='center-region flex-space-between text-secondary'>
              {centerContent}
            </div>
          </>
          : mainContent
      }
      <div>
        <IonButton onClick={() => nextSlide()}>
          Calificar experiencia
        </IonButton>
        {cancelButtonText && <IonButton className='secondary-btn white' onClick={handleClose}>{cancelButtonText}</IonButton>}
      </div>
    </div>
  ), ...califications?.map((calification, idx, arr) => {
    const isLast = idx === arr.length - 1;

    return (
      <div className='slide-body' key={idx}>
        <div className='header'>
          <div className='inner-header-wrapper'>
            <div className='title'>{calification.calification_question.question}</div>
            <div className='text-secondary'>Por favor, elige un nivel de estrella</div>
          </div>
        </div>
        <StarSelector quantitySelected={calification.calification || 0} maxStars={calification.calification_question.max} onSelect={(n) => handleCalification(calification.calification_question.id, n)} />
        <div className='center-region flex-space-between'>
          <textarea
            style={
              { ...(calification.calification === 0 && { display: 'none' }) }
            }
            className={`comment`}
            placeholder="Deja un comentario para explicar tu opinión"
            value={calification.comment}
            onChange={(e) => handleComment(calification.calification_question.id, e.target.value)}
            maxLength={140}
            rows={4}
          />
        </div>
        <div className='footer'>
          <IonButton
            {...(calification.calification === 0 && { disabled: true })}
            onClick={() => nextSlide(isLast) }
          >
            {
              isSaving
                ? <IonSpinner name="crescent" />
                : isLast ? 'Enviar opinion' : 'Siguiente'
            }
          </IonButton>
        </div>
      </div>

    )
  }), (
    <div className='slide-body'>
      <div className='header'>
        {<IonImg src={endStepImg} />}
      </div>
      <div className='title'>¡Gracias por tu tiempo!</div>

      <div className='center-region text-secondary'>
        <div style={{ marginTop: '8px', marginBottom: '24px' }}>Tu opinión será revisada y considerada por el equipo para brindarte una mejor experiencia.</div>
        <div className='text-cencosud'>
          <div>¡Muchas gracias!</div>
        </div>
      </div>

      <div>
        <IonButton onClick={handleClose}>Finalizar</IonButton>
      </div>
    </div>
  )];

  
    if(isLoading){
      return (
        <div>
          {!isSaving && <IonIcon src={close} onClick={handleClose} className="close-icon"/> }
          <div className='text-align-center'>
              <div className='slide-body'>
            {
              initialPageConfig ?
                <>
                  <div className='header'>
                    {initialPageConfig.mainImage && <IonImg src={initialPageConfig.mainImage} />}
                  </div>
                  <div className='title'>{initialPageConfig.mainText}</div>
                  
                  <div className='center-region flex-space-between text-secondary'>
                    {centerContent}
                  </div>
                </>
                : mainContent
            }
                <div>
                  <IonButton>
                    <IonSpinner name="crescent" />
                  </IonButton>
                  { cancelButtonText && <IonButton className='secondary-btn white' onClick={handleClose}>{cancelButtonText}</IonButton> }
                </div>
              </div>
          </div>
        </div>
      );
    }
  
  return (
    <div>
      <IonIcon src={close} onClick={handleClose} className="close-icon" />

      {slides[slideIndex]}

    </div>
  )

}

export default CalificationSlide;