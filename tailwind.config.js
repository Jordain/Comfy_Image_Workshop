module.exports = {
  content: ['./app/**/*.html', './app/**/*.js'],
  theme: {
    extend: {},
    daisyui: {
      themes: ["light", "dark"],
    },
  },
  plugins: [
    require('@tailwindcss/typography'), require('daisyui'),
  ],
}
