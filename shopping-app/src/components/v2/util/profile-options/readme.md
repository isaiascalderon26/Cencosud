# Profile Options Component

Show a container of options about profile of user

| **Nombre** | **Tipo** | **Default** | **Descripción**  |
|----------|----------|----------|----------|
| **cssClass**    | string - string[] | - | Una o mas clases de css para customizar el estilo |
| **marginLeft**    | string   | 0px   | Espaciado izquierdo exterior
| **marginRight**    | string   | 0px   | Espaciado derecho exterior
| **marginTop**    | string   | 0px   | Espaciado superior exterior
| **marginBottom**    | string   | 0px   | Espaciado inferior exterior
| **width**    | string   | 327px   | Ancho del componente
| **height**    | string   | 106px   | Altura del componente
| **items**    | Items[]   | -   | Lista de opciones a mostrar en el componente, con su title, icon y una función para el evento onClick de cada item
| **subtitle**    | string   | 0px   | Texto de subtitulo

```javascript
<ProfileOptions 
    marginLeft='30px'
    items={[
        {
          icon: 'user',
          text: 'Información personal',
          onClick: () => this.props.history.push('/personal-profile'),
        },
        {
          icon: 'like-black',
          text: 'Mis intereses',
          onClick: () => this.props.history.push('/personal-interests'),
        },
        {
          icon: 'credit-card',
          text: 'Medios de pago',
          onClick: () => this.props.history.push('/cards'),
        },
        {
          icon: 'chatbubbles',
          text: 'Centro de ayuda',
          onClick: () => this.props.history.push('/help'),
        }
]}
    />
```
