import sc from 'styled-components';



interface IProps {
    text: string,
    textColor?: string,
    bagroundColor?: string,
    size: 'small' | 'medium' | 'large',
    status: 'active' | 'inactive' ,
    borderType: 'flat' | 'rounded' 
}

const Badge: React.FC<IProps> = (props) => {

    const size = props.size === 'small' ? '12px' : props.size === 'medium' ? '16px' : '20px';
    const color = props.textColor ? props.textColor : '#ffffff';
    const backgroundColor = props.bagroundColor ? props.bagroundColor : '#000000';
    const borderType = props.borderType === 'flat' ? '0px' : '20px';
    const opacity = props.status === 'active' ? '1' : '0.5';

    const BadgeBody = sc.div`
        display: flex;  
        flex-direction: row;
        align-items: flex-start;
        padding: 10px 5px 20px 5px;
        gap: 8px;
        
        height: ${size};
        border-radius: ${borderType};
        background: ${backgroundColor};
        color: ${color};

        opacity: ${opacity};
    `;

    const BadgeText = sc.div`
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: 600;
        font-size: ${size};
        line-height: 12px;
        
        display: flex;
        text-align: center;
        letter-spacing: 0.05em;
    `;

    return (
        <BadgeBody>
            <BadgeText>  {props.text} </BadgeText>
          
        </BadgeBody>
    );
}

export default Badge;
