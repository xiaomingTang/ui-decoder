module.exports = {
  presets: [
    ["@babel/preset-env", {
      "useBuiltIns": "usage",
      "corejs": 3,
    }],
    "@babel/preset-react",
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", {
      "corejs": 3,
    }],
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "lib",
      "style": "css",
    }],
    "react-hot-loader/babel",
  ]
}
