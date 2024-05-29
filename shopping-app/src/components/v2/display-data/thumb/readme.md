# Thumb

Es un component para generar Thumbs en React ya sea de  **Imagen** o **Video**.


# Atributos

| **Nombre** | **Tipo** | **Default** | **Descripción**  |
|----------|----------|----------|----------|
| **height**    | string   | -   | Alto que corresponde al cuerpo del contenedor principal del componente, la medida pueden ser en px o %. |
| **width**    | string  | -   | Ancho que corresponde al cuerpo del contenedor principal del componente, la medida pueden ser en px o %. 
| **borderRadius**    | string  | 50%   | Corresponde al porcentaje de redondeo de esquinas
| **gradient**    | IBorderStyle - border  | -   | Indicar cantidad de px y estilo
| **gradient**    | IBorderStyle - background  | -   | Indicar estilo
| **resourceType**    | image - video  | -   | Indicar tipo imagen o video
| **resourceUrl**    | string  | -   | Indicar url del recurso (foto, video)
| **text**    | IText - value  | -   | Valor del texto que aparece bajo la imagen
| **text**    | IText - size  | 14px   | Tamaño de la letra
| **text**    | IText - color  | #000000  | Color de la letra
| **text**    | IText - shortText  | - |  Permite cortar texto segun x caracteres y agregar ... 
| **active**    | boolean | - |  Permite agregar un estilo opaco en caso de estar desactivado 
| **video**    | IVideo - autoplay | - |  Acción al cargar el video
| **video**    | IVideo - preload | - |  La propiedad de precarga establece o devuelve si el video debe comenzar a cargarse tan pronto como se cargue la página.
| **video**    | IVideo - heigth | - |  Alto del elemento en especifico
| **video**    | IVideo - width | - |  Ancho del elemento en especifico
| **onClick**    | () => void | - |  Acción que genera un callback al presionar el elemento

# Video Ejemplo 

```
<Thumb
   height="100px" 
   width="100px"
   gradient={{
       background: 'linear-gradient(to right top, #FF55AA, #B850C9, #6572D6, #4EAEB8) border-box',
       border: '3px solid transparent',
   }}
   resourceType="video"
   resourceUrl="https://d21ozv67drxbfu.cloudfront.net/appietoday.test/media/2017/09/04/asset-1175875-1504515710530864.mp4#t=1,14"
   text={{
       value: 'Texto de Prueba',
       shortText: 12,
       color: '#757474'
   }}
   video={{
       autoplay: false,
       preload: "auto",
       heigth: "75px",
       width: "75px"
   }}
   onClick={() => {
     console.log('Click en el Thumb Video');
   }}
   active={false}
/>
````


# Imagen Ejemplo 

````

<Thumb
  height="100px" 
  width="100px"
  gradient={{
      background: 'linear-gradient(to right top, #FF55AA, #B850C9, #6572D6, #4EAEB8) border-box',
      border: '3px solid transparent',
  }}
  resourceType="image"
  resourceUrl="https://static.vecteezy.com/system/resources/previews/020/336/735/original/tesla-logo-tesla-icon-transparent-png-free-vector.jpg"
  text={{
      value: 'Texto de Prueba',
      shortText: 12,
      color: '#757474'
  }}
  onClick={() => {
    console.log('Click en el Thumb Image');
  }}
  active={true}
/>


