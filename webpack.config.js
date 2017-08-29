var webpack = require("webpack");
var path = require("path");

module.exports = {
  devtool: "inline-source-map",
  entry: path.resolve(__dirname, "examples/src/index"),
  resolve: {
    alias: {
      "saga-duck": path.resolve(__dirname, "src/index")
    },
    extensions: ['.jsx', '.js', '.tsx', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: ["node_modules"],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "env",
                  {
                    targets: {
                      chrome: 58
                    }
                  }
                ],
                "react",
                "stage-2"
              ]
            }
          },
          "ts-loader"
        ]
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: ["node_modules"],
        options: {
          presets: [
            [
              "env",
              {
                targets: {
                  chrome: 58
                }
              }
            ],
            "react",
            "stage-2"
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
       debug: true
     }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"development"'
    })
  ],
  output: {
    path: path.resolve(__dirname, "examples"),
    filename: "bundle.js"
  }
};
