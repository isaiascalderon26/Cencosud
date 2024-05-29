import ImageHelpCarEnter from '../../../assets/media/service-onboarding/help-car-enter.svg';
import ImageHelpLeaves from '../../../assets/media/service-onboarding/help-leaves.svg';
import ImageHelpPlate from '../../../assets/media/service-onboarding/help-plate.svg';
import ImageHelpReceipt from '../../../assets/media/service-onboarding/help-receipt.svg';
import ImageHelpColorPlate from '../../../assets/media/service-onboarding/help-color-plate.svg';
import ImageHelpCarIn from '../../../assets/media/service-onboarding/help-car-in.svg';
import ImageHelpCarOut from '../../../assets/media/service-onboarding/help-car-out.svg';
import ImageHelpEmail from '../../../assets/media/service-onboarding/help-email.svg';

interface IData {
    image: string;
    title: string;
    description: string;
}

class HelpModal {

    modalDataContent = (id: string): IData[] => {

        let strings:IData[] = [];

        switch(id) {
          case 'register':
            strings.push({
              "image": ImageHelpColorPlate,
              "title": 'Asegúrate que la patente esté siempre visible.',
              "description": 'Nuestro sistema de parking revisará si tu auto tiene activado el servicio.'
            });
            strings.push({
              "image": ImageHelpCarIn,
              "title": 'Ingresa tu auto a la zona de parking.',
              "description": 'Automáticamente reconoceremos tu patente registrada y se abrirá la barrera de acceso.'
            });
            strings.push({
              "image": ImageHelpCarOut,
              "title": 'La salida, será también de manera automática.',
              "description": 'De la misma manera que en el ingreso, sin fricciones ni preocupaciones. ¡Así de fácil!'
            });
            strings.push({
              "image": ImageHelpEmail,
              "title": 'Recibirás un correo con el detalle del cobro',
              "description": 'En tu app Mi Mall podrás ver el detalle del cobro por tu parking.'
            });
          break;

          case 'autopass':
            strings.push({
              "image": ImageHelpPlate,
              "title": 'Asegúrate que la patente esté siempre visible.',
              "description": 'Nuestro sistema de parking revisará si tu auto tiene activado el servicio de Registra tu patente.'
            });
            strings.push({
              "image": ImageHelpCarEnter,
              "title": 'Ingresa tu auto a la zona de parking.',
              "description": 'Automáticamente reconoceremos tu patente registrada y se abrirá la barrera de acceso.'
            });
            strings.push({
              "image": ImageHelpLeaves,
              "title": 'La salida, será también de manera automática.',
              "description": 'De la misma manera que en el ingreso, sin fricciones ni preocupaciones. ¡Así de fácil!'
            });
            strings.push({
              "image": ImageHelpReceipt,
              "title": 'Recibirás una correo con el detalle del cobro',
              "description": 'A través de la app Mi Mall, podrás ver el detalle del cobro por tu parking.'
            });
          break;

        }

        return strings;
    }


}

export default new HelpModal();
