#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Script para corregir errores en Qubic Explorer ===${NC}"
echo -e "${BLUE}Este script arreglará la estructura y problemas comunes${NC}"
echo ""

# Verificar si el directorio actual es el correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}No se encontró package.json en el directorio actual.${NC}"
    echo -e "${RED}Asegúrate de ejecutar este script desde la raíz del proyecto.${NC}"
    exit 1
fi

# Actualizar package.json para añadir el script link-qubic
echo -e "${BLUE}Actualizando package.json...${NC}"
if grep -q "link-qubic" package.json; then
    echo -e "${GREEN}✓ El script link-qubic ya está definido en package.json${NC}"
else
    # Usar sed para añadir el script antes de la llave de cierre de scripts
    sed -i.bak '/\"scripts\":/,/\}/ s/\}$/,\n    \"link-qubic\": \"npm link @qubic-lib\/qubic-ts-library\"\n  \}/' package.json
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error al actualizar package.json${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Script link-qubic añadido a package.json${NC}"
fi

# Crear estructura de directorios si no existe
echo -e "${BLUE}Verificando estructura de directorios...${NC}"
mkdir -p src/components
mkdir -p src/context
mkdir -p src/pages
mkdir -p src/services

echo -e "${GREEN}✓ Estructura de directorios verificada${NC}"

# Mover App.tsx a src/ si está en src/pages/
if [ -f "src/pages/App.tsx" ] && [ ! -f "src/App.tsx" ]; then
    echo -e "${BLUE}Moviendo App.tsx a src/...${NC}"
    mv src/pages/App.tsx src/
    echo -e "${GREEN}✓ App.tsx movido a src/${NC}"
elif [ -f "src/App.tsx" ]; then
    echo -e "${GREEN}✓ App.tsx ya está en src/${NC}"
else
    echo -e "${RED}No se encontró App.tsx ni en src/ ni en src/pages/${NC}"
    echo -e "${RED}Debes crear manualmente el archivo App.tsx en src/${NC}"
fi

# Actualizar las dependencias
echo -e "${BLUE}Instalando dependencias necesarias...${NC}"
npm install --save @mui/material @mui/icons-material @emotion/react @emotion/styled react-router-dom axios buffer

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al instalar dependencias${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencias instaladas correctamente${NC}"

# Enlazar con la biblioteca Qubic TS
echo -e "${BLUE}Verificando si la biblioteca Qubic TS está enlazada...${NC}"
npm run link-qubic

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al enlazar con Qubic TS Library${NC}"
    echo -e "${BLUE}Asegúrate de que la biblioteca Qubic TS esté preparada:${NC}"
    echo -e "cd ../qubic-ts-library"
    echo -e "npm install"
    echo -e "npm run build"
    echo -e "npm link"
    echo -e "cd ../qubic-explorer"
    echo -e "npm run link-qubic"
    exit 1
fi

echo -e "${GREEN}✓ Biblioteca Qubic TS enlazada correctamente${NC}"

echo -e "${BLUE}=== Correcciones aplicadas correctamente ===${NC}"
echo -e "${BLUE}Ahora ejecuta 'npm start' para iniciar la aplicación${NC}"
echo ""
