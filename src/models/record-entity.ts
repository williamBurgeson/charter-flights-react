/* eslint-disable @typescript-eslint/no-empty-object-type */

// The makeGenericAccessorHook utility requires that entities extend Record<string, string | number | boolean | symbol>,
// so we define a base interface here for that purpose, which makes the rest of the model definitions cleaner.
// All entity interfaces will probably explicitly extend this to make the intent clear.
export interface RecordEntity extends Record<string, string | number | boolean | symbol | undefined | unknown> {}