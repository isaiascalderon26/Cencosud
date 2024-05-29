import { createAnimation } from "@ionic/react";

class ComponentAnimation {
	enterAnimation = (baseEl: any) => {
        const wrapperAnimation = createAnimation()
          .addElement(baseEl.querySelector('.modal-wrapper')!)
          .keyframes([
            { offset: 0, transform: 'translateX(100vh)' },
            { offset: 1, transform: 'translateX(0vh)' }
          ]);
    
        return createAnimation()
          .addElement(baseEl)
          .easing('ease-out')
          .duration(400)
          .addAnimation(wrapperAnimation);
      }

      leaveAnimation = (baseEl: any) => {
        const wrapperAnimation = createAnimation()
          .addElement(baseEl.querySelector('.modal-wrapper')!)
          .keyframes([
            { offset: 0, transform: 'translateX(0vh)' },
            { offset: 1, transform: 'translateX(100vh)' }
          ]);
    
        return createAnimation()
          .addElement(baseEl)
          .easing('ease-out')
          .duration(400)
          .addAnimation(wrapperAnimation);
      }
}

export default new ComponentAnimation();