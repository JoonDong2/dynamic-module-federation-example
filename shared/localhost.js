const getLocalhost = (os) => {
  if (os === "android") {
    return "10.0.2.2";
  }

  return "localhost";
};

module.exports = {
  getLocalhost,
};
