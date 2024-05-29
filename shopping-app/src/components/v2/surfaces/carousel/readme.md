# Carousel

Es un component que soporte elementos html en su cuerpo


# Atributos

| **Nombre** | **Tipo** | **Default** | **Descripción**  |
|----------|----------|----------|----------|
| **height**    | string   | 100%   | Alto del cuerpo del componente 
| **marginLeft**    | string   | 0px   | Espaciado izquierdo exterior
| **marginRight**    | string   | 0px   | Espaciado derecho exterior
| **marginTop**    | string   | 0px   | Espaciado superior exterior
| **marginBottom**    | string   | 0px   | Espaciado inferior exterior
| **backgroundColor**    | string   | #fff   | Color de fondo
| **scrollXVisible**    | boolean   | scroll   | Scroll Inferior
| **paddingLeft**    | string   | 0px   | Espaciado interior izquierdo
| **paddingRight**    | string   | 0px   | Espaciado interior derecho
| **paddingTop**    | string   | 0px   | Espaciado interior superior
| **paddingBottom**    | string   | 0px   | Espaciado interior inferior
| **content**    | ComponentElement<string, any>   | 0px   | Recibe uno o N componentes de contenido
| **gapContent**    | string   | 0px   | Espacio entre elementos del cuerpo

# Ejemplo de Carousel con Thumb

````
<Carousel
    height={'120px'}
    marginLeft={'10px'}
    marginRight={'10px'}
    marginTop={'10px'}
    marginBottom={'10px'}
    backgroundColor={'#fff'}
    scrollXVisible={true}
    paddingLeft={'0px'}
    paddingRight={'0px'}
    paddingTop={'10px'}
    paddingBottom={'0px'}
    content={
    <>
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
    </>
    }
    gapContent={'5px'}
/>