import { useMemo } from 'react';
import './index.less';

import { IonSlides } from '@ionic/react';
import FoodieCategoryItem from './foodie-category-item';
import { uniqWith } from 'lodash';

import burger from '../../../../assets/media/foodie/categories/burger.png';
import asian from '../../../../assets/media/foodie/categories/asian.png';
import italian from '../../../../assets/media/foodie/categories/italian.png';
import mexican from '../../../../assets/media/foodie/categories/mexican.png';
import veggie from '../../../../assets/media/foodie/categories/veggie.png';
import healty from '../../../../assets/media/foodie/categories/healty.png';
import traditional from '../../../../assets/media/foodie/categories/traditional.png';
import desserts from '../../../../assets/media/foodie/categories/desserts.png';
import cafe from '../../../../assets/media/foodie/categories/cafe.png';
import { IFoodieCategory } from '../../../../models/foodie/IFoodieCategory';

const images: any = {
  'Comida rápida': burger,
  Asiática: asian,
  Italiana: italian,
  Mexicana: mexican,
  'Vegetariana y vegana': veggie,
  Saludable: healty,
  Tradicional: traditional,
  Postres: desserts,
  Cafeterías: cafe,
};

const UNIQUE_CLASS = 'lmiagvikoo';

interface IProps {
  categories: IFoodieCategory[];
  onChooseCategory?: (key: string, value: any) => void;
}

const slideOpts = {
  slidesPerView: 'auto',
  zoom: false,
  grabCursor: true,
};

const FoodieCategoryList: React.FC<IProps> = ({
  categories,
  onChooseCategory,
}) => {
  const mappedCategories: IFoodieCategory[] = useMemo(() => {
    const uniqueCategories = uniqWith(
      categories,
      (initialCategory, otherCategory) =>
        initialCategory.name === otherCategory.name
    );

    return uniqueCategories?.sort((a, b) => a.sort - b.sort) ?? [];
  }, [categories]);

  return (
    <div className={`${UNIQUE_CLASS}`}>
      <h3 className="font-bold section-title">Categorías</h3>

      <IonSlides
        options={slideOpts}
        style={{ padding: '16px 18px', display: 'flex' }}
      >
        {mappedCategories?.map(({ id, name }) => (
          <FoodieCategoryItem
            key={id}
            onClick={() => onChooseCategory?.(name, id)}
            name={name}
            image={images?.[name] || ''}
          />
        ))}
      </IonSlides>
    </div>
  );
};

export default FoodieCategoryList;
