import styled from 'styled-components';

const ItemListItemStyle = styled.li`
  & {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 125%;
    display: flex;
    align-items: center;
    color: #000000;
    height: 56px;
    border-bottom: 1px solid #eeeeee;
    padding-left: 19px;
    padding-right: 14px;
    user-select: none;

    &:active {
      background-color: #efefef;
    }

    & > ion-icon {
      width: 20px;
      height: 20px;
    }

    & > div.item-wrapper {
      
      & > div {
        flex: 1;
        display: flex;
        align-items: center;
      }

      flex: 1;
      display: flex;
      align-items: center;

      .item-badge {
        background: linear-gradient(269.87deg, #00aae4 0.12%, #8255be 99.9%);
        border-radius: 8px;
        padding: 8px;

        font-weight: 700;
        font-size: 12px;
        line-height: 100%;
        color: #ffffff;
      }

      svg {
        margin-right: 8px;
        path {
          fill: #000000;
        }
      }
    }
  }
`;

export default ItemListItemStyle;
