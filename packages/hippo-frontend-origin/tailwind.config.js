module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/**/*.module.scss', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#2D2D2D',
        primeBlack: 'rgba(45, 45, 45, 0.03)',
        primeBlack20: 'rgba(45, 45, 45, 0.2)',
        primeBlack50: 'rgba(45, 45, 45, 0.5)',
        primeBlack80: 'rgba(45, 45, 45, 0.8)'
      }
    },
    backgroundColor: {
      primary: '#F5F8FA',
      secondary: '#FFFFFF',
      prime: '#2D2D2D',
      primeBlack: 'rgba(45, 45, 45, 0.03)',
      primeBlack50: 'rgba(45, 45, 45, 0.5)',
      primeBlack20: 'rgba(45, 45, 45, 0.2)',
      primeBlack80: 'rgba(45, 45, 45, 0.8)',
      input: '#F8F8F8'
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
