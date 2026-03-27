/* Tell TypeScript that CSS files are valid side-effect imports.
   Next.js handles the actual bundling; this declaration silences
   the TS language-server warning for `import "./globals.css"`. */
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
