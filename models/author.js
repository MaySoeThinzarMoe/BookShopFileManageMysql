const Moment = require("moment");
const AbstractModel = require("./abstract");
const UserModel = require("./user");
const connection = require('./database');

class AuthorModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.name = params.name;
        this.history = params.history;
        this.description = params.description;
        this.created_user_id = params.created_user_id;
        this.updated_user_id = params.updated_user_id;
        this.deleted_user_id = params.deleted_user_id;
        this.created_at = params.created_at;
        this.updated_at = params.updated_at;
        this.deleted_at = params.deleted_at;
    }

    /**
     * convert to JSON
     */
    toJSON() {
        const clone = { ...this };

        return clone;
    }

    /**
     * create author
     */
    static async create(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.Authorization);
        const id = super.generateId();
        const name = params.name;
        const history = params.history;
        const description = params.description;
        const created_user_id = loginUser.id;
        const updated_user_id = loginUser.id;
        const created_at = Moment().format();
        const updated_at = Moment().format();

        const itemParams = {
            id: id,
            name: name,
            history: history,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        const query_str = `INSERT INTO authors(id, name, history, description, created_user_id, updated_user_id, created_at, updated_at)
                         VALUES ('${id}', '${name}', '${history}', '${description}', '${created_user_id}','${updated_user_id}','${created_at}','${updated_at}')`;
        const result = connection.query(query_str);
        if (result) {
            console.log("INSERT SUCCESSFULY");
        } else {
            console.log("INSERTING FAIL");
        }

        return this.toModel(itemParams);
    }

    /**
     * Acquire author with Id
     */
    static async getById(authorId) {
        const item = await this._getById(authorId);
        const items = item.map(model => {

            return this.toModel(model)
        })

        return items[0];
    }

    /**
     * Acquire author with Id.
     * @param {string} authorId
     * @return {Object|null}
     */
    static async _getById(authorId) {
        const result = await connection.query(`SELECT * FROM authors WHERE id ='${authorId}'`);

        return result;
    }

    /**
     * Acquire author with Name
     */
    static async getByName(params) {
        const item = await this._getByName(params);
        const items = item.map(model => {

            return this.toModel(model)
        })

        return items[0];
    }

    /**
     * Acquire author with Name.
     * @param {string} authorName
     * @return {Object|null}
     */
    static async _getByName(authorName) {
        var result = await connection.query(`SELECT *
        FROM authors
        WHERE name ='${authorName}'`);

        return result;
    }

    /**
     * get all authors
     * @return {Array.<Object>}
     */
    static async getAll() {
        const item = await AuthorModel._getAll();
        const items = item.map(model => {

            return this.toModel(model);
        });

        return items;
    }

    /**
     * get all authors
     */
    static async _getAll() {
        const result = await connection.query(`select * from authors`);

        return result;
    }

    /**
     * update author
     * @param {Object}
     * @return {Object}
     */
    static async update(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.token);
        const author = await this.getById(params.authorId);

        const id = params.authorId;
        const name = params.name;
        const history = params.history;
        const description = params.description;
        const created_user_id = author.created_user_id;
        const updated_user_id = loginUser.id;
        const created_at = author.created_at;
        const updated_at = Moment().format();

        const itemParams = {
            id: id,
            name: name,
            history: history,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        const queyr_str = `UPDATE authors 
        SET name='${name}', 
        history='${history}',
        description='${description}',      
        updated_user_id='${updated_user_id}',
        updated_at='${updated_at}'
        WHERE id = '${id}'`;

        const result = connection.query(queyr_str);

        if (result) {
            console.log("UPDATE SUCCESSFULY");
        } else {
            console.log("UPDATING FAIL");
        }

        return this.toModel(itemParams);
    }

    /**
     *delete author
     * @return {AuthorModel}
     */
    static async delete(authorId) {
        var result = await connection.query(`DELETE from authors WHERE id='${authorId}'`);

        return new AuthorModel(result);
    }

    /**
     *  Create instances
     * @param {Object} item
     * @return {AuthorModel|null}
     */
    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.id !== undefined ? item.id : null,
            name: item.name !== undefined ? item.name : null,
            history: item.history !== undefined ? item.history : null,
            description: item.description !== undefined ? item.description : null,
            created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
            updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
            deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };

        return new AuthorModel(params);
    }
}

module.exports = AuthorModel;
