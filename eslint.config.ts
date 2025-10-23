import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
	{
		ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**", "*.config.js", ".husky/**"],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: "./tsconfig.json",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			prettier,
		},
		rules: {
			// Prettier integration
			"prettier/prettier": "error",

			// TypeScript-specific rules
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-non-null-assertion": "warn",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					fixStyle: "separate-type-imports",
				},
			],
			"@typescript-eslint/consistent-type-exports": "error",
			"@typescript-eslint/no-unnecessary-condition": "warn",

			// General ESLint rules
			"no-console": ["warn", { allow: ["warn", "error", "info"] }],
			"no-debugger": "error",
			"no-duplicate-imports": "error",
			"no-unused-expressions": "error",
			"prefer-const": "error",
			"no-var": "error",
			"object-shorthand": "error",
			"prefer-arrow-callback": "error",
			"prefer-template": "error",
			eqeqeq: ["error", "always"],
		},
	},
	{
		files: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
];
