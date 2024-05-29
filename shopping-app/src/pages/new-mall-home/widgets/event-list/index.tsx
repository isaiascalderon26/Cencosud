import { IonIcon, IonSlide, IonSlides } from "@ionic/react";
import { useEffect, useState } from "react";
import './index.less';
import { IEvents } from "../../../../models/schedules/IEvents";
import UserClient from "../../../../clients/UserClient";
import SchedulesClient from "../../../../clients/SchedulesClient";
import AuthenticationClient from "../../../../clients/AuthenticationClient";
import calendarMnth from './../../../../assets/media/icons/calendar-month.svg';
import { useHistory } from "react-router-dom";
import { addCircleOutline } from 'ionicons/icons';


const EventList: React.FC<any> = ({ }) => {

    const router = useHistory()

    const [stores, setStores] = useState<IEvents[] | null>(null);

    const [activePage, setActivePage] = useState(0);

    const slideOpts = {
        slidesPerView: 'auto',
        zoom: false,
        grabCursor: true
    };

    const handleViewEvent = (item: IEvents) => {
        if (item.type === 'SCHEDULING') {
            router.push(`/schedules/${item.id}`);
        } else if (item.type === 'INSCRIPTION') {
            router.push(`/event-inscription/${item.id}`);
        }
    }

    const loadSites = async () => {
        try {
            const user = await UserClient.me();

            const events = (await SchedulesClient.getEvents({
                user_id: AuthenticationClient.getInfo().primarysid,
                mall_name: window.localStorage.getItem("mall-selected") ?? user.mall_selected?.name
            })) as unknown as IEvents[];

            setStores(events)
        } catch (e) {

        }
    }

    const goEventList = () => {
        router.push(`/events-list`);
    }

    useEffect(() => {
        loadSites();
    }, [])

    if (stores === null) {
        return (
            <div className="mm2-home-event-list">
                <div className="loading-placeholder"></div>
            </div>
        )
    }

    if (stores.length == 0) {
        return (<></>)
    }

    return (
        <div className="mm2-home-event-list">
            <IonSlides
                onIonSlideTransitionEnd={(data) => {
                    let index = (data as any).srcElement.swiper.snapIndex
                    setActivePage(index == stores.length ? index - 1 : index)
                }} options={slideOpts} className={""} style={{ padding: "10px", display: "flex" }}>
                {
                    stores.map((item, index) => (
                        <IonSlide key={item.title} >
                            <img src={item.image} />
                            <div>
                                <h3>{item.title}</h3>
                                <p> <IonIcon
                                    size="22"
                                    className="carousel-header-icon"
                                    src={calendarMnth}
                                />  <span>{item.date.replace("De", "de")}</span></p>
                                <a className="btn-go" onClick={evt => handleViewEvent(item)}>{item.tag}</a>
                            </div>
                        </IonSlide>
                    ))
                }


                <IonSlide className="btn-see-more" key={'btn-see-more'} onClick={goEventList} >
                    <div>
                        <IonIcon icon={addCircleOutline}></IonIcon>
                        <h3 className='font-bold'>Ver más</h3>
                    </div>
                </IonSlide>
            </IonSlides>
            <div className="slides-dots">
                {
                    stores.map((i, index) => <div className={`${activePage == index && 'active'}`} key={i.image}></div>)
                }
            </div>
        </div>
    )
}

export default EventList;