import React, { FC } from 'react'
import { Icon } from '../../display-data/Icon'
import { IconButtonProps } from './types'
import { IconButtonStyle } from './style'

const IconButton: FC<IconButtonProps> = (props) => {
  return (
    <IconButtonStyle {...props}>
      <Icon name={props.icon} variant="solid" />
    </IconButtonStyle>
  )
}

export default IconButton