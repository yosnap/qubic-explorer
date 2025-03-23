#!/bin/bash
# Script para configurar correctamente Tailwind 4 con PostCSS
echo "Iniciando script de reparación de Tailwind..."

# Desinstalar paquetes existentes
echo "Desinstalando paquetes existentes..."
npm uninstall tailwindcss postcss autoprefixer postcss-flexbugs-fixes @tailwindcss/postcss

# Limpiar caché
echo "Limpiando caché de npm..."
npm cache clean --force

# Instalar las versiones correctas
echo "Instalando paquetes necesarios..."
npm install tailwindcss@latest @tailwindcss/postcss@latest postcss@latest autoprefixer@latest postcss-flexbugs-fixes@latest --save-dev

# Crear archivos de configuración correctos
echo "Creando configuración de PostCSS..."
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('postcss-flexbugs-fixes'),
    require('autoprefixer')
  ]
}
EOL

echo "Verificando configuración de Tailwind..."
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
};
EOL

echo "Script completado. Intente iniciar su aplicación ahora." 