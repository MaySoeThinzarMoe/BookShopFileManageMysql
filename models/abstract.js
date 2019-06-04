const Util = require("../utils/util");
const CustomErrors = require("../utils/customErrors");
const CustomError = CustomErrors.CustomError;

class AbstractModel {

  /**
   * ID generate
   * @param {number} length
   * @return {string}
   */
  static generateId(length = 16) {
    return Util.randomString(length);
  }

  /**
   *
   * @param {CustomError|Error} error
   * @param {string} message
   * @param {number} statusCode
   * @param {Array.<Object>} errors
   * @throws {CustomError} CustomError
   */
  static throwCustomError(error, message, statusCode = 500, errors) {
    if (error instanceof CustomError) {
      throw error;
    } else {
      console.log(error);
      throw new CustomError(message, statusCode, errors);
    }
  }
}

module.exports = AbstractModel;
