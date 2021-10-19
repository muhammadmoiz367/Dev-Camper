class ErrorResponse extends Error {
  constructor(code, message) {
    super(message);
    this.statusCode = code;
  }
}

module.exports = ErrorResponse;
