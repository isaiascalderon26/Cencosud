# SavingMoney

Es un componente para mostrar los descuentos, es muy especifico para esta tarea.

# Atributos

| **Nombre** | **Tipo** | **Default** | **Descripción**  |
|----------|----------|----------|----------|
| **cssClass**    | string - string[] | - | Una o mas clases de css para customizar el estilo |
| **height**    | string   | -   | Alto que corresponde al cuerpo del contenedor principal del componente, la medida pueden ser en px o %. |
| **marginLeft**    | string   | 0px   | Espaciado izquierdo exterior
| **marginRight**    | string   | 0px   | Espaciado derecho exterior
| **marginTop**    | string   | 0px   | Espaciado superior exterior
| **marginBottom**    | string   | 0px   | Espaciado inferior exterior
| **title**    | string   | 0px   | Texto de titulo
| **subtitle**    | string   | 0px   | Texto de subtitulo
| **money**    | string   | 0px   | cantidad en $


# Ejemplo 

```
<SavingMoney 
    marginLeft='10px'
    marginRight='10px'
    title='!Has ahorrado'
    subtitle='hasta el día de hoy!'
    money='$100.124'
/>
````