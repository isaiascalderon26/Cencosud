# Instalación

Para usar el proyecto es necesario node 16, si usas nvm
```
nvm use 16
```

Para agregar dependencias
```
make install
```
# Definir el ambiente

Es necesario crear un .env con la configuración de la app. Es necesario solicitar este archivo de configuración a otro miembro del equipo


# Compilación
Para la primera ves es necesario ejecutar el siguiente comando para crear la carpeta `build`
```
npm run build
```

Luego para compilar usar 
```
make device
```

# Ejecutar

# Probar en consola
Para ejecutar en web solo es necesario ejecutar
```
npm run start
```
OJO: este comando no requiere volver a compilar para probar modificaciones


# Android
Para ejecutar en android
```
make run-android
```

Existe problemas con las dependencias antiguas por lo que va a aparecer un problema de sync con gradle, para solucionarlo
- Abrir file en la parte superior de android studio
- Seleccionar `Project Structure``
- Seleccionar `Dependencies` en las opciones laterales
- Buscar en las dependencias `commons-io`y cambiar de `compile` a `implementation`
- Click en apply y ok

# iOS
Para ejecutar en iOS
```
make run-ios
```

# Generar app para pruebas desde local
1. Asegurase archivo `.env` para entorno deseado
2. Borrar node_modules y carpeta build
3. Ejecutar
```sh
make install
make build
make device
```

## Android o APK
4. Ejecutar
```sh
make run-android
```
5. En Android Studio -> Menú `Build` -> `Build Bundles / APK` -> `Build APK`

## IOS
4. Ejecutar
```sh
make run-ios
```
5. En XCode
   1. Seleccionar en `App > Any iOS Device (arm64)`
   2. En menú a la izquierda seleccionar `Show the project navigator` (Icono folder). Acá adentro doble click en `App`. Se abre las propiedades.
   3. En propiedades ir a `Signing & Capabilities`. Verificar que en `Team: Cenconsud S.A.`
   4. Menú `Product` -> `Archive`. Darle a todo `next`.
