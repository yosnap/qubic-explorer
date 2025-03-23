#!/bin/bash
# Script definitivo para arreglar el problema de Tailwind 4 con PostCSS en CRA
echo "Iniciando solución definitiva para Tailwind..."

# Paso 1: Eliminar node_modules para empezar fresco
echo "Eliminando node_modules..."
rm -rf node_modules

# Paso 2: Limpiar caché npm
echo "Limpiando caché npm..."
npm cache clean --force

# Paso 3: Actualizar configuración de tailwind para que use formato compatible con CRA
echo "Actualizando configuración de Tailwind..."
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#4A56E2',
          light: '#6E78E8',
          dark: '#3A45B3',
        },
        secondary: {
          main: '#34D399',
          light: '#6EE7B7',
          dark: '#059669',
        },
      },
    },
  },
  plugins: [],
}
EOL

# Paso 4: Cambiar a una configuración de postcss compatible con CRA
echo "Creando configuración de PostCSS correcta..."
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-flexbugs-fixes'),
    require('autoprefixer'),
  ]
}
EOL

# Paso 5: Modificar package.json para usar versiones correctas y compatibles
echo "Actualizando package.json..."
# Crear un archivo temporal
jq '.devDependencies."tailwindcss" = "^3.3.0" | 
    .devDependencies."postcss" = "^8.4.31" | 
    .devDependencies."autoprefixer" = "^10.4.16" | 
    del(.devDependencies."@tailwindcss/postcss")' package.json > package.json.tmp

# Si jq no está disponible, usar esta alternativa
if [ $? -ne 0 ]; then
  echo "Actualizando package.json manualmente..."
  cat > package.json << 'EOL'
{
  "name": "qubic-explorer",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://66.248.205.32",
  "dependencies": {
    "@qubic-lib/qubic-ts-library": "file:../qubic-ts-library",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.31",
    "@types/react": "^18.2.6",
    "@types/react-dom": "^18.2.4",
    "axios": "^1.4.0",
    "buffer": "^6.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.1",
    "react-scripts": "5.0.1",
    "recharts": "^2.6.2",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "link-qubic": "npm link @qubic-lib/qubic-ts-library"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@craco/craco": "^7.1.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "postcss-flexbugs-fixes": "^5.0.2",
    "tailwindcss": "^3.3.0"
  }
}
EOL
else
  mv package.json.tmp package.json
fi

# Paso 6: Eliminar el paquete incorrecto/conflictivo
echo "Eliminando package-lock.json para evitar conflictos..."
rm -f package-lock.json

# Paso 7: Reinstalar dependencias desde cero
echo "Reinstalando dependencias desde cero..."
npm install

echo "Instalación completada. Si hay errores adicionales, pueden ser necesarios más ajustes."
echo "Intente ejecutar 'npm start' ahora." 