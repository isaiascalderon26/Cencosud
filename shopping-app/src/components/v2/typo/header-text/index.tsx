import React, { FC } from 'react'
import { Icon } from '../../display-data/Icon'
import { HeaderTextProps } from './types'
import HeaderTextStyle from './style';

const HeaderText: FC<HeaderTextProps> = ({
    text,
    icon,
    iconForegroundColor = "#fff"
}) => {
    return (
        <HeaderTextStyle className='mi-mall-header-text' foregroundColor={iconForegroundColor}>
            {icon && <span className='mi-mall-header-text-icon'> <Icon name={icon} variant="illustrated" /></span>}
            <span className='mi-mall-header-text-body'>{text}</span>
        </HeaderTextStyle>
    )
}

export default HeaderText