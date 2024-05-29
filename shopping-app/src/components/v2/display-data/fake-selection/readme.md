# FakeSelection

Es un componente para mostrar un seleccionable, que solo contiene una función de callback


# Atributos

| **Nombre** | **Tipo** | **Default** | **Descripción**  |
|----------|----------|----------|----------|
| **cssClass**    | string - string[] | - | Una o mas clases de css para customizar el estilo |
| **height**    | string   | -   | Alto que corresponde al cuerpo del contenedor principal del componente, la medida pueden ser en px o %. |
| **width**    | string  | -   | Ancho que corresponde al cuerpo del contenedor principal del componente, la medida pueden ser en px o %. 
| **backgroundColor**    | string  | transparent   | Color de fondo del contenedor principal
| **imageContent**    | string  | -   | Ruta de la imagen del cuerpo del componente
| **imageSelected**    | string  | -   | Ruta de la imagen secundaria , accion ir
| **onClick**    | () => void | - |  Acción que genera un callback al presionar el elemento

# FakeSelection Ejemplo 

```
<FakeSelection
    cssClass={'selection-mall-kghb'}
    width='100%'
    height='100%'
    imageContent={`${process.env.REACT_APP_BUCKET_URL}/logo/${storeName}-light.png`}
    imageSelected={chevronDown}
    onClick={() => {
        console.log("Ejecutar una accioón");
    }}
/>
````