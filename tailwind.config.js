/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.ejs",
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': '#1DB954', // Replace with your hex color
        'custom-blue': '#3490dc',
        'custom-yellow':'#8a913f'
      },
    },
  },
  plugins: [],
}

