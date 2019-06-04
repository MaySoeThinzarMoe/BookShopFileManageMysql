"use strict";

const Crypto = require("crypto");
const Moment = require("moment");
const AbstractModel = require('./abstract');
const connection = require('./database');
const FormData = require('form-data');
const Axios = require('axios').default;

class UserModel extends AbstractModel {
  
  constructor(params = {}) {
    super();
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.password = params.password;
    this.type = params.type;
    this.phone = params.phone;
    this.dob = params.dob;
    this.profile = params.profile;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  /**
   * Save logined user in session table
   * @param {Integer} id
   * @param {String} email
   * @param {String} token
   */
  static async saveLoginedId(id, email, token) {
    const query_str = `INSERT INTO session_table(id, email, token) VALUES('${id}', '${email}', '${token}')`;
    await connection.query(query_str);
  }

  /**
   * get logined user in session table
   * @param {integer} logined_id
   * @returns {Object}
   */
  static async getLoginedId(logined_id) {
    const query_str = `SELECT * FROM session_table WHERE id = '${logined_id}'`;
    const result = await connection.query(query_str);

    return result[0];
  }
  
  /**
	 * get logined user in session table
	 * @param {string} userId 
	 * @return {Object|null}
	 */
	static async getAdminDetailById(userId) {
    var result = await connection.query(`SELECT * FROM session_table WHERE id='${userId}' `);

    return result[0];
  }

  /**
	 * get user by token in session table
	 * @param {string} tokenString 
	 * @return {Object}
	 */
  static async getUserIdByToken(tokenString) {
    var result = await connection.query(`SELECT * FROM session_table WHERE token='${tokenString}' `);
   
    return result[0];
  }

  /**
   * delete logined user in session table
   * @param {integer} logined_id
   * @returns {object}
   */
  static async deleteLoginedId(logined_id) {
    const query_str = `DELETE FROM session_table WHERE id = '${logined_id}'`;
    const result = await connection.query(query_str);

    return result.rows;
  }

  /**
   * user create
   * @param {Object} params
   * @return {UserModel}
   */
  static async create(params) {
    const userCount = await this.getAllUser();
    const id =super.generateId();
    const name = params.name;
    const email = params.email;
    const password = this.hashPassword(params.password);
    const type = userCount.length == 0 ? this.type.admin : this.type.user;
    const phone = params.phone;
    const dob = params.dob;
    const created_at = Moment().format();
    const updated_at = Moment().format();
    var bodyData = new FormData();
    bodyData.append('image', params.profile);
    const imageUrl = await Axios({
                            method  : 'post',
                            url     : 'https://api.imgbb.com/1/upload?key=429c9a059f07e33a0520e1d0179f35e2',
                            headers : bodyData.getHeaders(),
                            data    : bodyData
                            })
                            .then((resolve) => {
                                return resolve.data.data.image.url;
                            })
                            .catch((error) => console.log(error.response.data));

    const profile = imageUrl;
    const itemParams = {
      id: id,
      name: name,
      email: email,
      password: password,
      type: type, 
      phone: phone,
      dob: dob,
      profile: profile,
      created_at: created_at,
      updated_at: updated_at,
    };
    const query_str = `INSERT INTO user(id, name, email, password, type, phone, dob, profile, created_at, updated_at) 
                            VALUES('${id}','${name}','${email}', '${password}', '${type}','${phone}','${dob}', '${profile}', '${created_at}','${updated_at}')`;
    await connection.query(query_str);
    
    return this.toModel(itemParams);
  }
 
  /**
    *get one user by email address。
    * @param {string} email
    * @return {Object|null}
    */
  static async getByEmail(email) {
    const result = await connection.query(`SELECT * FROM user WHERE email='${email}'`);

    return result[0];
  }

  /**
   *Acquire one user with login information。
   * @param {string} email
   * @param {password} password
   * @return {UserModel}
   */
  static async getByLogin(email, password) {
    const item = await this._getByLogin(email, password);
    const items = item.map(model => {
      return this.toModel(model);
    });

    return items[0];
  }

  /**
   * Acquire one user with login information。
   * @param {string} email
   * @param {password} password
   * @return {Object}
   */
  static async _getByLogin(email, password) {
    const passwordHash = this.hashPassword(password);
    var result = await connection.query(`SELECT * FROM user WHERE email='${email}' AND password='${passwordHash}'`);
    
    return result;
  }

  /**
   * Acquire all user
   * @return {Object}
   */
  static async getAllUser() {
    var result = await connection.query(`SELECT * FROM user`);
    
    return result;
  }

  /**
   * HashedPassword
   * @param {number} password
   * @return {string} hashedPassword
   */
  static hashPassword(password) {
    let passwordHash = process.env.SALT_KEY + password;
    for (var i = 0; i < 3; i++) {
      passwordHash = Crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
    }

    return passwordHash;
  }

  /**
   * Create instance
   * @param {Object} item
   * @return {UserModel|null}
   */
  static toModel(item) {
    if (!item) return null;
    const params = {
      id: item.id !== undefined ? item.id : null,
      name: item.name !== undefined ? item.name : null,
      email: item.email !== undefined ? item.email : null,
      password: item.password !== undefined ? item.password : null,
      type: item.type !== undefined ? item.type : null,
      phone: item.phone !== undefined ? item.phone : null,
      dob: item.dob !== undefined ? item.dob : null,
      profile: item.profile !== undefined ? item.profile : null,
      created_at: item.created_at !== undefined ? item.created_at : null,
      updated_at: item.updated_at !== undefined ? item.updated_at : null,
      deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
    };
    
    return new UserModel(params);
  }
}

/**
 * Define user types
 */
UserModel.type = {
  admin: "0",
  user: "1"
};


module.exports = UserModel;
