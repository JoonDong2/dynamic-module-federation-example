type HOC = (Component: React.ReactElement) => React.ReactElement;

const hocPipe = (hocs: HOC[]) => {
  return (Component: React.ReactElement) => () => {
    return hocs.reduceRight((acc, cur) => {
      return cur(acc);
    }, Component);
  };
};

export default hocPipe;
