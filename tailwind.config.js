/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          950: '#0A1628', // fondo principal, azul pista nocturna
          900: '#0F2038',
          800: '#16304F',
          700: '#1E3F66',
          line: '#EAF2FF', // líneas de pista / texto principal
        },
        ball: {
          DEFAULT: '#CFEA3F', // verde-lima pelota de pádel
          dim: '#A7C22E',
        },
        clay: '#FF6B4A', // acento cálido secundario, solo para alertas/energía puntual
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
