/**
 * Ambient module declaration for plain CSS side-effect imports
 * (`import "./globals.css"`). Next's bundler resolves these at build time
 * regardless, but tsconfig.json's `noUncheckedSideEffectImports: true`
 * makes the TypeScript compiler itself try to resolve the specifier too —
 * without this declaration, every `.css` import fails typecheck with
 * "Cannot find module" even though the file exists and the real build's
 * webpack/turbopack CSS loader handles it fine.
 */
declare module "*.css";
