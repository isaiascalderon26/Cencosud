# Thumb

  

Es un component para generar Thumbs en React ya sea de **Imagen** o **Video**.

  
  

# Atributos

  
| **Nombre**    | **Tipo**                            | **Default** | **Descripción**                                                                                           |
|---------------|-------------------------------------|-------------|------------------------------------------------------------------------------------------------------------|
| text          | string                              | -           | El texto que se mostrará en el Atributo.                                                                  |
| textColor     | string                              | "#000"      | El color del texto que se mostrará en el Atributo.                                                        |
| backgroundColor | string                              | "#fff"      | El color de fondo del Atributo.                                                                           |
| size          | 'small' &#124; 'medium' &#124; 'large' | -    | El tamaño del Atributo.                                                                                   |
| status        | 'active' &#124; 'inactive'            | -   | El estado del Atributo. Si el Atributo está en estado "inactive", se aplicará una opacidad media.                                                                                 |
| borderType    | 'flat' &#124; 'rounded'               | -     | El tipo de borde que tendrá el Atributo. Si se selecciona "rounded", el Atributo tendrá bordes redondeados. |

  


#  Ejemplo

  

```

<Badge  
	text='-10%'  
	size='large'  
	status='inactive'  
	borderType='rounded'  
	bagroundColor='red'  
	textColor='yellow'  
/>

````
