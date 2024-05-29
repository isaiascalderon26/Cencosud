import { IonSlide, IonSlides } from "@ionic/react";
import { useEffect, useState } from "react";
import './index.less';
import MerchantClient from "../../../../clients/MerchantClient";
import { IMerchant } from "../../../../models/merchants/IMerchant";
import { Icon } from "../../../../components/v2/display-data/Icon";
import { useParams } from "react-router";

type Props = {
    id: string
    web: string
    onSelected: (merchant: IMerchant) => void
}

const StoreList: React.FC<Props> = (props) => {
    const [_merchant, _setMerchant] = useState<IMerchant[]>([]);
    const loadSites = async () => {
        try {
            const res = await MerchantClient.list(props.id);
            _setMerchant(res.data.splice(0, 8) as IMerchant[])
        } catch (e) { }
    }

    useEffect(() => {
        loadSites();
    }, []);

    const onClickButton = (merchant: IMerchant) => {
        props.onSelected(merchant);
    }

    if (_merchant.length === 0) {
        return (<></>)
    }

    return (
        <div className="mm2-home-store-list">
            <h3 className="font-bold section-title">
                <Icon variant="illustrated" name={"stores-header-icon"} key={"store-icon"} />
                ️Descubre algunas de nuestras tiendas
            </h3>
            <IonSlides
                className={""}
                style={{ padding: "10px", display: "flex" }}
                options={{
                    slidesPerView: 'auto',
                    zoom: false,
                    grabCursor: true
                }}
            >
                {
                    _merchant
                        .map(merchant => (
                            <IonSlide
                                key={merchant.id}
                                onClick={() => {
                                    onClickButton(merchant);
                                }}
                            >
                                <img alt="" src={props.web + merchant.logo} />
                            </IonSlide>
                        ))
                }
            </IonSlides>
        </div>
    )
}

export default StoreList;
