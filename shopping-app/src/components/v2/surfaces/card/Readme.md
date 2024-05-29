# Card

Display a card with the following information:

### Property

| **Property** | **Type**  | **Default** | **Description** | **Optional** |
| --- | --- | --- | --- | --- |
| **orientation** | `string` | `0` | Indica la orientación del componente, los valores aceptados son: 'vertical', 'horizontal' y 'square' | false |
| **width** | `string`| `0`  | Ancho del card | false |
| **height** | `string`|  `0` | Alto del card | false |
| **title** | `string`|  `0` | Titulo principal que contendrá la card | true |
| **subtitle** | `string`|  `0` | Subtitulo que contendrá la card | true |
| **description** | `string`|  `0` | Descripción que contendrá la card | true |
| **image** | `string`|  `0` | Imagen principal que contendrá la card | true |
| **logo** | `string`|  `0` | Logo de la marca la cual contendrá la card | true |
| **CssClass** | `string or string[]`|  `0` | Clases css que se quieren sobreescribir del componente | true |
| **callback** | `string`|  `0` | callback | true |

# Ejemplo de Card con los 3 tipos de orientación

### Orientación horizontal:

```javascript
<Card
    orientation='horizontal'
    width='158px'
    height='241px'
    description='Descuentos en todo tipo de zapatos '
    title='DBS Beaty Store'
    subtitle='30-40 min'
    image='https://picsum.photos/300/300'
    logo='https://picsum.photos/300/300'
    callback={() => {}}
/>



```

### Orientación vertical

```javascript
<Card
    orientation='vertical'
    width='256px'
    height='176px'
    description='Descuentos en todo tipo de zapatos '
    title='DBS Beaty Store'
    image='https://picsum.photos/300/300'
    logo='https://picsum.photos/300/300'
    callback={() => {  }}
/>
```

### Orientación Square (Solo una imagen de fondo)

```javascript
<Card
    orientation='square'
    image='https://gcdnb.pbrd.co/images/TrjDP9v9mlPZ.png?o=1'
    width='101px'
    height='101px'
    callback={() => {  }}
/>
```
