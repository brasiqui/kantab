// Default: https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js

module.exports = {
	important: "#app",
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		fontFamily: {
			sans: [
				"Open Sans",
				"ui-sans-serif",
				"system-ui",
				"-apple-system",
				"BlinkMacSystemFont",
				'"Segoe UI"',
				"Roboto",
				'"Helvetica Neue"',
				"Arial"
			]
		},
		extend: {
			colors: {
				// https://www.tailwindshades.com/#color=74.70967741935483%2C63.78600823045269%2C47.647058823529406&step-up=8&step-down=11&hue-shift=0&name=atlantis&overrides=e30%3D
				primary: {
					DEFAULT: "#8CAD26",
					50: "#D8EAA0",
					100: "#D1E790",
					200: "#C4DF6E",
					300: "#B6D84D",
					400: "#A7CE2D",
					500: "#8CAD26",
					600: "#677F1C",
					700: "#425112",
					800: "#1C2308",
					900: "#000000"
				},
				secondary: {
					DEFAULT: "#C96B2C",
					50: "#F0D1BC",
					100: "#EDC6AB",
					200: "#E5AF8A",
					300: "#DE9869",
					400: "#D78147",
					500: "#C96B2C",
					600: "#9B5222",
					700: "#6D3A18",
					800: "#3F210E",
					900: "#110904"
				},
				panel: "#2e353a",
				card: "#22272b",
				muted: "#929292",
				text: "#dedede"
			},

			fontFamily: {
				title: [
					"Roboto Condensed",
					"Open Sans",
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial"
				]
			},

			boxShadow: {
				panel: "2px 5px 5px 0 rgb(0 0 0 / 25%)"
			},

			width: {
				list: "280px"
			},

			minWidth: {
				list: "280px"
			}
		}
	},
	plugins: []
};
