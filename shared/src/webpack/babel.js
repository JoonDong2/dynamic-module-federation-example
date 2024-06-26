const babelTargets = [
  /node_modules(.*[/\\])+react-native/,
  /node_modules(.*[/\\])+@react-native/,
  /node_modules(.*[/\\])+react-freeze/,
  /node_modules(.*[/\\])+@react-navigation/,
  /node_modules(.*[/\\])+@react-native-community/,
  /node_modules(.*[/\\])+expo/,
  /node_modules(.*[/\\])+pretty-format/,
  /node_modules(.*[/\\])+metro/,
  /node_modules(.*[/\\])+abort-controller/,
  /node_modules(.*[/\\])+@callstack[/\\]repack/,
  /node_modules(.*[/\\])+react-error-boundary/,
  /node_modules(.*[/\\])+@tanstack[/\\]query-core/,
  /node_modules(.*[/\\])+@tanstack[/\\]react-query/,
];

module.exports = {
  babelTargets,
};
