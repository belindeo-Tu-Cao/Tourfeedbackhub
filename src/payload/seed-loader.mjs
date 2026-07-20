// Dev-only loader shim for `npm run seed`.
// Forces tsx to use its async module.register() path instead of the synchronous
// registerHooks path, which has a module-linking bug on Node 22 + tsx 4.23.
// This lets Payload's ESM config (top-level await, extensionless imports) load cleanly.
import 'dotenv/config'
import nodeModule from 'node:module'
if (typeof nodeModule.registerHooks === 'function') {
  nodeModule.registerHooks = undefined
}
await import('tsx/esm')
