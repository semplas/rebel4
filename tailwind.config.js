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
        'background-color': 'var(--background-color)',
      },
    },
  },
  plugins: [],
}
