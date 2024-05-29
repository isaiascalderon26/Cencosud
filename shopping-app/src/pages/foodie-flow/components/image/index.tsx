import { IonImg } from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lib
 */
import EurekaConsole from "../../../../lib/EurekaConsole";

/**
 * Assets
 */
import storeImg from "../../../../assets/media/foodie/store-generic.svg";
import productImg from "../../../../assets/media/foodie/product-generic.svg";

const eureka = EurekaConsole({ label: 'foodie-image' });

const getGenericImage = (type: 'PRODUCT' | 'STORE') => {
    if (type === 'PRODUCT') {
        return productImg;
    }

    return storeImg;
}

export interface IImageProps {
    src?: string;
    alt?: string;
    styles?: React.CSSProperties;
    type: 'PRODUCT' | 'STORE'
}

const Image: React.FC<IImageProps> = ({ src, alt, type, styles }) => {
    const [source, setSource] = useState(() => {
        if (!src) {
            return getGenericImage(type);
        }
        return src;
    });
    const imgRef = useRef<HTMLIonImgElement>(null);

    const onIonError = useCallback(() => {
        setSource(getGenericImage(type));
    }, []);

    useEffect(() => {
        if (!imgRef.current) {
            eureka.error('Image ref not initialized');
            return;
        }

        imgRef.current.addEventListener('ionError', onIonError);
    }, [])

    return (
        <IonImg ref={imgRef} src={source} alt={alt} style={styles} />
    )
}

export default Image;