import React , { useEffect, useState } from 'react';

export interface IProps  {
    style: React.CSSProperties;
    className: string;
    value: number ;
    onFinish: () => void;
}
const Countdown: React.FC<IProps> = (props) => {

    const [countdown, setCountdown] = useState(props.value);

    useEffect(() => {
        const interval = setInterval(() => {
            if (countdown > 0) {
                setCountdown(countdown - 1);
            } else {
                clearInterval(interval);
                props.onFinish();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [countdown]);

    return (
        <div className={props.className} style={props.style}>
            {countdown}
        </div>
    );

    
}
export default Countdown;
