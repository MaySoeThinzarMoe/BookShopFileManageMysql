const Moment = require("moment");
const AbstractModel = require("./abstract");
const UserModel = require("./user");
const connection = require('./database');

class GenreModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.name = params.name;
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
     * create genre
     */
    static async create(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.Authorization);
        const id = super.generateId();
        const name = params.name;
        const description = params.description;
        const created_user_id = loginUser.id;
        const updated_user_id = loginUser.id;
        const created_at = Moment().format();
        const updated_at = Moment().format();

        const itemParams = {
            id: id,
            name: name,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        const query_str = `INSERT INTO genres(id, name, description, created_user_id, updated_user_id, created_at, updated_at)
                         VALUES ('${id}', '${name}', '${description}', '${created_user_id}','${updated_user_id}','${created_at}','${updated_at}')`;
        const result = connection.query(query_str);
        if (result) {
            console.log("INSERT SUCCESSFULY", result);
        } else {
            console.log("INSERTING FAIL");
        }

        return this.toModel(itemParams);
    }

    /**
     * Acquire one genre with Name
     */
    static async getById(genreId) {
        const item = await this._getById(genreId);
        const items = item.map(model => {
            return this.toModel(model)
        })

        return items[0];
    }

    /**
     * Acquire genre with name.
     * @param {string} genreId
     * @return {Object|null}
     */
    static async _getById(genreId) {
        var result = await connection.query(`SELECT *
        FROM genres
        WHERE id ='${genreId}'`);

        return result;
    }

    /**
     * Acquire genre with Name
     */
    static async getByName(params) {
        const item = await this._getByName(params);
        const items = item.map(model => {
            return this.toModel(model)
        })

        return items;
    }

    /**
     * Acquire genre with Name.
     * @param {string} genreName
     * @return {Object|null}
     */
    static async _getByName(genreName) {
        var result = await connection.query(`SELECT *
        FROM genres
        WHERE name ='${genreName}'`);

        return result;
    }

    /**
     * get all genres
     * @return {Array.<Object>}
     */
    static async getAll() {
        const item = await GenreModel._getAll();
        const items = item.map(model => {

            return this.toModel(model);
        });

        return items;
    }

    /**
     * get all genre
     */
    static async _getAll() {
        const result = await connection.query(`select * from genres`);

        return result;
    }


    /**
     * update genre
     * @param {Object}
     * @return {Object}
     */
    static async update(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.token);
        const genre = await this.getById(params.genreId);

        const id = params.genreId;
        const name = params.name;
        const description = params.description;
        const created_user_id = genre.created_user_id;
        const updated_user_id = loginUser.id;
        const created_at = genre.created_at;
        const updated_at = Moment().format();

        const itemParams = {
            id: id,
            name: name,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        const queyr_str = `UPDATE genres SET 
        name='${name}',
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
     *delete genre
     * @return {GenreModel}
     */
    static async delete(genreId) {
        var res = await connection.query(`DELETE from genres WHERE id='${genreId}'`);

        return new GenreModel(res);
    }

    /**
     *  Create instances
     * @param {Object} item
     * @return {GenreModel|null}
     */
    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.id !== undefined ? item.id : null,
            name: item.name !== undefined ? item.name : null,
            description: item.description !== undefined ? item.description : null,
            created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
            updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
            deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };

        return new GenreModel(params);
    }
}


module.exports = GenreModel;
