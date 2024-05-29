import moment from 'moment';
import { useIonModal } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom'
import lodash from 'lodash';

/**
* Styles
*/
import './index.less';

/**
 * Components
 */
import CalificationSlide from './components/slide/index';

/**
 * Lib
 */
import EurekaConsole from '../../lib/EurekaConsole';

/**
 * Clients
 */
import UserClient from '../../clients/UserClient';
import CalificationClient from '../../clients/CalificationClient';
import CalificationQuestionClient from '../../clients/CalificationQuestionClient';

/**
 * Models
 */
import { IUser } from '../../models/users/IUser';
import { ICalificationFlow } from '../../models/calification/ICalificationFlow';
import ICalificationQuestion from '../../models/calification/ICalificationQuestion';
import ICalification, { ICalificationUnsaved } from '../../models/calification/ICalification';
import { ISite } from '../../models/store-data-models/ISite';


const UNIQUE_CLASS = 'idqxrsbhal';

const eureka = EurekaConsole({ label: "calification" });

const filterByAvailability = (q: ICalificationQuestion, date: string) => {
  const days = moment().diff(moment(date), 'days');
  return q.availability >= days;
}

interface IPropsWhitCustomContent extends IBasicProps {
  /**
   * Customizable react node to put on the first page
   */
 initialPageReactNode: React.ReactNode,
 /**
  * Not necessary
  */
 initialPage?: never
}
interface IPropsWhitoutCustomContent extends IBasicProps {
  /**
   * Configuration for first calification slide (Introduction)
   */
  initialPage: {
    mainImage?: string
    mainText: string
  }
  /**
   * Not necessary
   */
 initialPageReactNode?: never
}
interface IBasicProps {
  flow: ICalificationFlow
  /**
   * Set true for show modal
   */
  show: boolean,
  /**
   * Optional text for a secondary button of the first page.
   * If does not have value, the button will not appear.
   */
  cancelButtonText?: string


  /**
   * Data needed for calification backend
   * 
   * Its always used and is Optionally becouse if it isnt passed 
   * the component load the user data by its own  
   */
  user?: IUser
  /**
   * Data needed for calification backend 
   */
  payment_intention_id: string
  /**
   * This field is used to filter/load only the questions
   * that fulfill the condition of "availability".
   * payment_date - actual_date < question.availability
   */
  payment_date: string
  /**
   * If you previously load the questions, you can pass it through here avoiding to load again in the component.
   */
  fixed_questions?: ICalificationQuestion[]
  /**
   * Metadata needed on backend, it varies from flow to flow.
   */
  metadata: Record<string, string>
  /**
   * This method is executed when the modal dismiss (should set the show state to false)
   */
  onClose: () => void

  /**
   * This method executes when the calification is saved on backend
   */
  onSaveCalification: (califications: ICalification[] | ICalification) => void
  /**
  * returns if there are questions to evaluate
  */
  hasQuestions?: (questions:boolean) => void

  /**
   * check if the first onboarding screen should be visible
   */
  isDisabledOnboarding?: boolean
}

type IProps = IPropsWhitCustomContent | IPropsWhitoutCustomContent;

const CalificationModal: React.FC<IProps> = ({ flow, show, children, initialPageReactNode, initialPage, cancelButtonText, user: user_props, payment_intention_id, payment_date, fixed_questions, metadata, onClose, onSaveCalification, hasQuestions, isDisabledOnboarding }) => {
  const params = useParams()
  const slideRef = useRef<HTMLIonSlidesElement>(null);
  const [califications, setCalifications] = useState<ICalificationUnsaved[]>([])
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const initQuestions = async () => {
    setLoading(true);
    let califications: ICalificationUnsaved[] = [];

    const [questions, userData] = await Promise.all([
      fetchQuestions(fixed_questions),
      fetchUser(user_props)
    ])

    califications = mapQuestionToUnsaved(questions, userData);

    setCalifications(califications);
    setLoading(false);
  }

  const fetchQuestions = async (questions?:ICalificationQuestion[]) => {
    if(questions){
      return questions.filter(q => filterByAvailability(q, payment_date))
    } else {
      const days = moment().diff(moment(payment_date), 'days');
      const questions = await CalificationQuestionClient.list({
        offset: 0,
        limit: 5,
        query: {
          "flow.keyword_is": flow,
          "enabled_is": true,
          "availability_range_gte": days
        },
        sort: {
          "priority": "asc"
        }
      });
      console.log(questions.data, 'questions loaded');
      hasQuestions && hasQuestions(questions.data.length > 0 ? true : false);
      
      return questions.data;
    }
  }
  const fetchUser = async (user_param?: IUser): Promise<IUser> => {
    if(user_param){
      return user_param;
    } else {
      const user = await UserClient.me() as IUser;
      console.log(user, 'me');
      
      return user;
    }
  }

  const mapQuestionToUnsaved = (questions: ICalificationQuestion[], user: IUser): ICalificationUnsaved[] => {
    return questions.map((question) => {
      return {
        calification: 0,
        calification_question: {
          flow: question.flow,
          question: question.question,
          id: question.id,
          max: question.max,
          availability: question.availability
        },
        calificator: {
          email: user.email,
          name: user.full_name,
          id: user.primarysid
        },
        payment_intention_id: payment_intention_id,
        metadata: metadata
      }
    });

  }

  const handleCalification = (questionId: string, calification: number) => {
    setCalifications(state => {
      return state?.map(calificationObj => {
        if (calificationObj.calification_question.id === questionId) {
          return {
            ...calificationObj,
            calification: calification
          }
        }
        return calificationObj;
      })
    })
  }

  const handleComment = (questionId: string, comment: string) => {
    setCalifications(state => {
      return state?.map(calificationObj => {
        if (calificationObj.calification_question.id === questionId) {
          return {
            ...calificationObj,
            comment: comment
          }
        }
        return calificationObj;
      })
    })
  }

  const handleSendCalification = async () => {
    setSaving(true);
    const sites = await UserClient.getSites();
    let site = sites.data.find((site: ISite) => { return site.name === lodash.get(params, 'id') });
    if (!site) {
      site = sites.data.find((site: ISite) => { return lodash.get(site, 'meta_data.facilityNumber') == lodash.get(metadata, 'mall_id') });
    }
    try {
      if (califications.length > 1) {
        if (site) {
          califications.forEach((calification) => {
            calification.mall_info = site
          })
        }
        const resp = await CalificationClient.bulkCreate(califications);
        onSaveCalification(resp.data);
      } else if (califications.length > 0) {
        if (site) {
          califications[0].mall_info = site;
        }
        const calification = await CalificationClient.create(califications[0])
        onSaveCalification(calification);
      }
    } catch (error) {
      eureka.error('Unexpected error while saving califications', error)
    } finally {
      setSaving(false);
    }
  }


  const handleClose = () => {
    if (!saving) {
      dismiss();
    }
  }
  const [present, dismiss] = useIonModal(
    CalificationSlide, {
      mainContent: initialPageReactNode,
      centerContent: children,
      ...(initialPage && {initialPageConfig:{
        mainImage: initialPage?.mainImage,
        mainText: initialPage?.mainText,
      }}),
      cancelButtonText: cancelButtonText,
      isLoading: loading,
      isSaving: saving,
      califications: califications,
      slideRef: slideRef,
      handleClose: handleClose,
      handleCalification: handleCalification,
      handleComment: handleComment,
      handleSendCalification: handleSendCalification,
      isDisabledOnboarding: isDisabledOnboarding
    }
  )

  useEffect(() => {
    if (show) {
      present({
        cssClass: `calification-${UNIQUE_CLASS}`,
        swipeToClose: false,
        onDidDismiss: () => onClose()
      });
    }
  }, [show])

  useEffect(() => {
    (async () => {
      await initQuestions();
    })()
  }, [])

  return (<></>);
}



export default CalificationModal;