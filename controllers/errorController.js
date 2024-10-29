exports.triggerError = (req, res, next) => {
    const error = new Error('This error is for testing purposes.');
    error.status = 500;
    next(error);
  };