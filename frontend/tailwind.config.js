// @flow
type TailwindConfig = {
  content: Array<string>,
  theme: {
    extend: Object,
  },
  plugins: Array<any>,
};

const config: TailwindConfig = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // your theme extensions
    },
  },
  plugins: [],
};

module.exports = config;