import defineProvider from "@babel/helper-define-polyfill-provider";

const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";

type Options = {
  "#__secret_key__@babel/runtime__compatibility": void | {
    useBabelRuntime: string;
  };
};

export default defineProvider<Options>(({ debug, targets, babel }, options) => {
  if (!shallowEqual(targets, babel.targets())) {
    throw new Error(
      "This plugin does not use the targets option. Only preset-env's targets" +
        " or top-level targets need to be configured for this plugin to work." +
        " See https://github.com/babel/babel-polyfills/issues/36 for more" +
        " details.",
    );
  }

  const { [runtimeCompat]: { useBabelRuntime } = { useBabelRuntime: "" } } =
    options;

  const pureName = useBabelRuntime
    ? `${useBabelRuntime}/regenerator`
    : "regenerator-runtime";

  return {
    name: "regenerator",

    polyfills: ["regenerator-runtime"],

    usageGlobal(meta, utils) {
      if (isRegenerator(meta)) {
        debug("regenerator-runtime");
        utils.injectGlobalImport("regenerator-runtime/runtime.js");
      }
    },
    usagePure(meta, utils, path) {
      if (isRegenerator(meta)) {
        path.replaceWith(
          utils.injectDefaultImport(pureName, "regenerator-runtime"),
        );
      }
    },
  };
});

const isRegenerator = meta =>
  meta.kind === "global" && meta.name === "regeneratorRuntime";

function shallowEqual(obj1: any, obj2: any) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
