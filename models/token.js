"use strict";

var connection = require('./database');

class TokenModel {

  /**
   * Get a token string
   * @param {string} tokenString
   * @return {TokenModel|null}
   */
  static async getByTokenString(tokenString) {
    const items = await this._getByTokenString(tokenString);

    return items;
  }

  /**
   * get user with a token string in session_table。
   * @param {string} tokenString
   * @return {Object|null}
   */
  static async _getByTokenString(tokenString) {
    const query_str = `SELECT * FROM session_table WHERE token = '${tokenString}'`;
    const result = await connection.query(query_str);

    return result[0];
  }

  /**
   * delete user with token in session_table
   * @param {string} tokenString
   * @returns {object}
   */
  static async delete(tokenString) {
    const query_str = `DELETE FROM session_table WHERE token = '${tokenString}'`;
    const result = await connection.query(query_str);
    return result.rows;
  }
}

module.exports = TokenModel;
