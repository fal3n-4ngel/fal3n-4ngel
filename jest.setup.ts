import "@testing-library/jest-dom";
const React = require("react");

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => React.createElement("img", props),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }) => React.createElement("a", { href }, children),
}));

jest.mock("next/navigation", () => ({
  useRouter() {
    return { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() };
  },
  usePathname() {
    return "";
  },
}));

jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  const React = require("react");
  return {
    ...actual,
    motion: {
      div: React.forwardRef((props, ref) => React.createElement("div", { ref, ...props })),
      span: React.forwardRef((props, ref) => React.createElement("span", { ref, ...props })),
      h1: React.forwardRef((props, ref) => React.createElement("h1", { ref, ...props })),
      h2: React.forwardRef((props, ref) => React.createElement("h2", { ref, ...props })),
      h3: React.forwardRef((props, ref) => React.createElement("h3", { ref, ...props })),
      p: React.forwardRef((props, ref) => React.createElement("p", { ref, ...props })),
      a: React.forwardRef((props, ref) => React.createElement("a", { ref, ...props })),
      button: React.forwardRef((props, ref) => React.createElement("button", { ref, ...props })),
      img: React.forwardRef((props, ref) => React.createElement("img", { ref, ...props })),
      nav: React.forwardRef((props, ref) => React.createElement("nav", { ref, ...props })),
      ul: React.forwardRef((props, ref) => React.createElement("ul", { ref, ...props })),
      li: React.forwardRef((props, ref) => React.createElement("li", { ref, ...props })),
      section: React.forwardRef((props, ref) => React.createElement("section", { ref, ...props })),
      main: React.forwardRef((props, ref) => React.createElement("main", { ref, ...props })),
      form: React.forwardRef((props, ref) => React.createElement("form", { ref, ...props })),
      create: () => React.forwardRef((props, ref) => React.createElement("div", { ref, ...props })),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}));

window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

const { TextEncoder, TextDecoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });

jest.mock("lenis", () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    raf: jest.fn(),
    destroy: jest.fn(),
    scrollTo: jest.fn(),
  }));
});

global.Request =
  global.Request ||
  class Request {
    constructor(input, init) {
      Object.assign(this, init);
    }
  };
global.Response =
  global.Response ||
  class Response {
    constructor(body, init) {
      Object.assign(this, init);
    }
  };
global.fetch = global.fetch || jest.fn(() => Promise.resolve(new Response("{}")));
global.Headers = global.Headers || class Headers {};
