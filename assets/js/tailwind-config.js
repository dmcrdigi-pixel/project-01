tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"Noto Sans"', 'system-ui', 'sans-serif']
      },
      colors: {
        ocean: {
          50: '#eef7f9',
          100: '#d3ecf1',
          200: '#a7d9e3',
          300: '#71bfd0',
          400: '#3f9fb8',
          500: '#26839f',
          600: '#1c7293',
          700: '#155a74',
          800: '#0b4f6c',
          900: '#062c43'
        },
        sand: {
          50: '#fdf8ef',
          100: '#faedd3',
          200: '#f4d9a3',
          300: '#f4a261',
          400: '#ef8b3d'
        },
        coral: {
          400: '#ec8b74',
          500: '#e76f51',
          600: '#d1553a'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(6, 44, 67, 0.06), 0 4px 16px rgba(6, 44, 67, 0.06)'
      }
    }
  }
};
