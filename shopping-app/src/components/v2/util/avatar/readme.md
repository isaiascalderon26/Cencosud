# Avatar

Es un componente para visualizar un cuadro con avatar, titulo y subtitulo.

# Atributos

| **Nombre** | **Tipo** | **Default** | **Descripción**  |
|----------|----------|----------|----------|
| **cssClass**    | string - string[] | - | Una o mas clases de css para customizar el estilo |
| **icon**    | string   | icon  | insertar imagen o se muestra un icono por defecto
| **marginLeft**    | string   | 0px   | Espaciado izquierdo exterior
| **marginRight**    | string   | 0px   | Espaciado derecho exterior
| **marginTop**    | string   | 0px   | Espaciado superior exterior
| **marginBottom**    | string   | 0px   | Espaciado inferior exterior
| **title**    | string   | 0px   | Texto de titulo
| **subtitle**    | string   | 0px   | Texto de subtitulo



# Ejemplo 

```
<Avatar
    cssClass={'class-example'}
    icon='https://www.w3schools.com/howto/img_avatar.png'
    marginTop='20px'
    marginBottom='10px'
    marginLeft='20px'
    marginRight='20px'
    title='!Hola Juan¡'
    subtitle='juanperez888@gmail.com'
/>
````