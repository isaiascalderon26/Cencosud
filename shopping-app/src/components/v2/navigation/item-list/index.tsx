import React, { FC } from 'react'
import ItemListStyle from './ItemList.style'
import ItemListItem, { ItemListItemProps } from './item-list-item'
import HeaderText from '../../typo/header-text'

export interface ItemListProps {
    items: ItemListItemProps[];
}

const ItemList: FC<ItemListProps> = ({
    items
}) => {

    return (
        <div>
            <HeaderText icon='popcorn-bucket' text='Mis servicios' iconForegroundColor='#F1747533' />
            <ItemListStyle>
                {
                    items.map((item: ItemListItemProps, index: number) => <ItemListItem key={index} {...item} />)
                }
            </ItemListStyle>
        </div>
    )
}

export default ItemList