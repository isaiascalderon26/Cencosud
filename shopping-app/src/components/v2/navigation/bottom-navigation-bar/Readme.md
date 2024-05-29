# Bottom Navigation Bar
Show a navigation bar that allow navigate between items

### Properties
| Property | Type  | Default | Description |
| --- | --- | --- | --- |
| `items` | `Array<ButtonNavigationBarItem>`, | [] | List of all items |
| `indicatorPosition` | `top` or `bottom`|  `top` | Indicator position |
| `initialIndex` | `number`|  `0` | Default index selected |
| `className` | `string`|   | Custom classes |
| `onIndexChanged` | `void`|   | Callback triggered after navigation item index changed |

### Usage
```
<BottomNavigationBar
    initialIndex={2}
    items={[
        {
            icon: "home",
            text: "Inicio"
        },
        {
            icon: "discovery",
            text: "Tiendas"
        },
        {
            icon: "parking",
            text: "Parking"
        },
        {
            icon: "services",
            text: "Servicios"
        },
        {
            icon: "profile",
            text: "Perfil"
        }
    ]}
    onIndexChanged={(index) => console.log("changed", index)}
     /> 
```