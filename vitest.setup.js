// jsdom doesn't implement IntersectionObserver, but src/utils.js uses it
// (scroll-reveal animation on the landing page) as a module-load side
// effect — any test that imports utils.js, directly or transitively,
// would otherwise crash before a single assertion runs. A minimal stub is
// enough since no test here actually exercises scroll-reveal behavior.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
