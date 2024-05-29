import styled from "styled-components";

interface Props { 
    foregroundColor: string;
  }

const HeaderTextStyle = styled.div<Props>`
& {
  display: flex;
  align-items: center;

  .mi-mall-header-text-icon {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;

    background: ${p => p.foregroundColor};
    border-radius: 8px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
  .mi-mall-header-text-body {
    font-weight: 700;
    font-size: 16px;
    line-height: 100%;
  }
}

`

export default HeaderTextStyle;