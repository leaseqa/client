// Tailwind used to be listed here, but no stylesheet in this app ever carried
// an `@tailwind` or `@apply` directive, so it emitted nothing. Autoprefixer is
// the only plugin doing real work on globals.css and the CSS modules.
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
