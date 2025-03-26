/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent-color': 'var(--accent-color)',
        'primary-color': 'var(--primary-color)',
        'secondary-color': 'var(--secondary-color)',
        'background-color': 'var(--background-color)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'danger-color': 'var(--danger-color)',
        'link-color': 'var(--link-color)',
        'amazon': {
          orange: '#FF9900',
          dark: '#131921',
          navy: '#232F3E',
          light: '#EAEDED',
          green: '#007600',
          amber: '#C60',
          red: '#B12704',
          teal: '#007185',
        },
      },
      boxShadow: {
        'amazon': '0 2px 5px 0 rgba(213,217,217,.5)',
        'amazon-hover': '0 2px 5px 0 rgba(213,217,217,.8)',
      },
    },
  },
  plugins: [],
}
