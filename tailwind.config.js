module.exports = {
  content: ['./app/templates/**/*.html', './app/static/js/*.js'],
  theme: {
    extend: {},
    daisyui: {
      themes: ["light", "dark"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"), require('daisyui'),
  ],
}
