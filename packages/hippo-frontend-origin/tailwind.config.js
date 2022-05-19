module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/**/*.module.scss', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#2D2D2D'
      }
    },
    background: {
      primary: '#F5F8FA'
    },
    backgroundColor: {
      primary: '#F5F8FA',
      secondary: '#FFFFFF'
    },
    boxShadow: {
      md: '0px 4px 8px rgba(0, 0, 0, 0.02)'
    },
    fontFamily: {
      Urbanist: 'Urbanist, sans-serif'
    },
    fontSize: {
      sm: [
        '13px',
        {
          lineHeight: '16px'
        }
      ],
      base: [
        '16px',
        {
          lineHeight: '19px'
        }
      ],
      lg: [
        '18px',
        {
          lineHeight: '22px'
        }
      ],
      xl: [
        '20px',
        {
          lineHeight: '24px'
        }
      ],
      '2xl': [
        '24px',
        {
          lineHeight: '29px'
        }
      ]
    }
  },
  plugins: []
};
