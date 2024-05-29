import React, { FC, ForwardRefRenderFunction, useState } from "react";
import { LikedButtonProps } from "./types";
import { LikedButtonStyle } from "./style";
import { Icon } from "../../display-data/Icon";


const InnerLikedButton: ForwardRefRenderFunction<HTMLButtonElement, LikedButtonProps> = ({
    liked,
    ...others
}, ref) => {
    const [checked, setChecked] = useState(liked)
    return (
        <LikedButtonStyle ref={ref} {...others} onClick={evt => setChecked(!checked)}>
            <Icon name="like" variant={checked ? "solid" : "lined"} />
        </LikedButtonStyle>
    )
}

const LikedButton = React.forwardRef<HTMLButtonElement, LikedButtonProps>(InnerLikedButton);

export default LikedButton;