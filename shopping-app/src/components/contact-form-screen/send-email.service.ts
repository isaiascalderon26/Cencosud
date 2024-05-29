import EmailClient from '../../clients/EmailClient';
import UserClient from '../../clients/UserClient';
import EurekaConsole from '../../lib/EurekaConsole';

const eureka = EurekaConsole({ label: 'faq' });

interface IEmailMessage {
  phone: string;
  subject: string;
  message: string;
  user_email?: string;
  user_fullname: string;
  user_phone: string;
}

const validPhoneNumberFormat = /^(\+\d{2})*\d{9}$/;

function EmailService() {
  return {
    isValidMessage(
      message: IEmailMessage,
      phone_enable?: boolean
    ): { success: boolean; errors: any | null } {
      let errors: any = {};

      if (phone_enable && !validPhoneNumberFormat.test(message.phone)) {
        errors['phone_error'] = true;
      }

      if (!message.subject) {
        errors['subject_error'] = true;
      }
      if (!message.message) {
        errors['message_error'] = true;
      } 

      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          errors,
        };
      } else {
        return {
          success: true,
          errors: {},
        };
      }
    },
    send: async (message: IEmailMessage, phone_enable?: boolean) => {
      try {
        //service send email
        const full_name = message.user_fullname;
        const email = message.user_email;
        const phone = phone_enable ? message.phone : message.user_phone;

        if (phone_enable) {
          UserClient.update('phone', phone);
        } 
        await EmailClient.create({
          full_name: full_name,
          email: email,
          phone: phone,
          subject: message.subject,
          message: message.message,
        });

        return {
          success: true,
        }; 
        
      } catch (error) {
        eureka.debug(error as string);
        return {
          success: false,
        };
      }
    },
  };
}

export default EmailService();
