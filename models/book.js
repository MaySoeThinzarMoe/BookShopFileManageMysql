const Moment = require("moment");
const AbstractModel = require("./abstract");
const UserModel = require("./user");
const connection = require('./database');
const fs = require('fs');
const FormData = require('form-data');
const Axios = require('axios').default;
//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
class BookModel extends AbstractModel {
    constructor(params = {}) {
        super();
        this.id = params.id;
        this.name = params.name;
        this.price = params.price;
        this.author_id = params.author_id;
        this.genre_id = params.genre_id;
        this.image = params.image;
        this.sample_pdf = params.sample_pdf;
        this.published_date = params.published_date;
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
     * create book
     */
    static async create(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.Authorization);

        const id = super.generateId();
        const name = params.name;
        const price = params.price;
        const author_id = params.author_id;
        const genre_id = params.genre_id;
        const published_date = params.published_date;
        const description = params.description;
        const created_user_id = loginUser.id;
        const updated_user_id = loginUser.id;
        const created_at = Moment().format();
        const updated_at = Moment().format();
        var pdfFilePath;

        var bodyData = new FormData();
        bodyData.append('image', params.image);
        const imageUrl = await Axios({
                                method  : 'post',
                                url     : 'https://api.imgbb.com/1/upload?key=429c9a059f07e33a0520e1d0179f35e2',
                                headers : bodyData.getHeaders(),
                                data    : bodyData
                                })
                                .then((resolve) => {
                                    console.log("Data>>>>>>>>>",resolve.data);     
                                    return resolve.data.data.image.url;
                                })
                                .catch((error) => console.log(error.response.data));

        const base64StringForPDF = params.sample_pdf;
        if( base64StringForPDF != null && base64StringForPDF != undefined) {
            pdfFilePath = "./public/books/pdfs/"+id+"_sample.pdf";

            fs.writeFile(pdfFilePath, base64StringForPDF,{encoding: 'base64'}, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Pdf file was saved!");
            });
        } else {
            pdfFilePath = "";
        }

        const image = imageUrl;
        const sample_pdf = pdfFilePath;
        const itemParams = {
            id: id,
            name: name,
            price: price,
            author_id: author_id,
            genre_id: genre_id,
            image: image,
            sample_pdf: sample_pdf,
            published_date: published_date,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        const query_str = `INSERT INTO books(id, name, price, author_id, genre_id, image, sample_pdf, published_date, description, created_user_id, updated_user_id, created_at, updated_at)
                         VALUES ('${id}', '${name}', '${price}','${author_id}', '${genre_id}', '${image}', '${sample_pdf}', '${published_date}', '${description}', '${created_user_id}','${updated_user_id}','${created_at}','${updated_at}')`;
        const result = connection.query(query_str);
        if (result) {
            console.log("INSERT SUCCESSFULY");
        } else {
            console.log("INSERTING FAIL");
        }

        return this.toModel(itemParams);
    }

    /**
     * Get book with ID.
     */
    static async getById(bookId) {
        const item = await this._getById(bookId);
        const items = item.map(model => {       
            if ( model.sample_pdf != "" && model.sample_pdf != null ) {
                const pdf = fs.readFileSync(model.sample_pdf, 'base64');
                model.sample_pdf = pdf;
            }

            return this.toModel(model);
        })

        return items[0];
    }

    /**
     * Acquire book with ID.
     * @param {string} bookId
     * @return {Object|null}
     */
    static async _getById(bookId) {
        var result = await connection.query(`SELECT *
        FROM books
        WHERE id ='${bookId}'`);
        
        return result;
    }

    /**
    * Get pdf.
    */
    static async getPdf(bookId) {
        const item = await this._getPdf(bookId);
        if ( item[0].sample_pdf != "" && item[0].sample_pdf != null ) {
            const pdf = fs.readFileSync(item[0].sample_pdf, 'base64');
            item[0].sample_pdf = pdf;
        }
        
        return item[0].sample_pdf;
    }

    /**
     * Acquire book with ID.
     * @param {string} bookId
     * @return {Object|null}
     */
    static async _getPdf(bookId) {
        var result = await connection.query(`SELECT sample_pdf
        FROM books
        WHERE id ='${bookId}'`);
        
        return result;
    }

    /**
     * Acquire book with Name
     */
    static async getByName(params) {
        const item = await this._getByName(params);
        const items = item.map(model => {
            if ( model.sample_pdf != "" && model.sample_pdf != null ) {
                const pdf = fs.readFileSync(model.sample_pdf, 'base64');
                model.sample_pdf = pdf;
            }

            return this.toModel(model)
        })

        return items;
    }

    /**
     * Acquire book with Name.
     * @param {string} bookName
     * @return {Object|null}
     */
    static async _getByName(bookName) {
        var result = await connection.query(`SELECT *
        FROM books
        WHERE name ='${bookName}'`);

        return result;
    }

    /**
     * get all books
     * @return {Array.<Object>}
     */
    static async getAll() {
        const item = await BookModel._getAll();
        const items = item.map(model => { 
            return this.toModel(model);
        });
        
        return items;
    }

    /**
     * get all books
     */
    static async _getAll() {
        const result = await connection.query(`select * from books`);

        return result;
    }

    /**
     * update book
     * @param {Object}
     * @return {Object}
     */
    static async update(params, user) {
        const loginUser = await UserModel.getUserIdByToken(user.token);
        const book = await this.getById(params.bookId);
        
        const id = params.bookId;
        const name = params.name;
        const price = params.price;
        const author_id = params.author_id;
        const genre_id = params.genre_id;
        const published_date = params.published_date;
        const description = params.description;
        const created_user_id = book.created_user_id;
        const updated_user_id = loginUser.id;
        const created_at = book.created_at;
        const updated_at = Moment().format();
        const imageFilePath = book.image;
        const pdfFilePath = "./public/books/pdfs/"+id+"_sample.pdf";
        var image;
        var sample_pdf;
        var imageUrl;
        if( params.image != "" && params.image != null && params.image != undefined ) {
            if( params.image != imageFilePath ) {
                var bodyData = new FormData();
                bodyData.append('image', params.image);
                imageUrl = await Axios({
                            method  : 'post',
                            url     : 'https://api.imgbb.com/1/upload?key=429c9a059f07e33a0520e1d0179f35e2',
                            headers : bodyData.getHeaders(),
                            data    : bodyData
                            })
                            .then((resolve) => {
                                return resolve.data.data.image.url;
                            })
                            .catch((error) => console.log(error.response.data));
                image = imageUrl;
            } else {
                image = imageUrl;
            }
            
        } else {
            image = "";
        }

        if( params.sample_pdf != "" && params.sample_pdf != null && params.sample_pdf != undefined) {
            if( params.sample_pdf != pdfFilePath ) {
                const base64ForPdf = params.sample_pdf;
                fs.writeFile(pdfFilePath, base64ForPdf,{encoding: 'base64'}, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("Pdf file was saved!");
                });            
            }
            sample_pdf = pdfFilePath;
        } else {
            sample_pdf = "";
        }

        const itemParams = {
            id: id,
            name: name,
            price: price,
            author_id: author_id,
            genre_id: genre_id,
            image: image,
            sample_pdf: sample_pdf,
            published_date: published_date,
            description: description,
            created_user_id: created_user_id,
            updated_user_id: updated_user_id,
            created_at: created_at,
            updated_at: updated_at,
        }
        const queyr_str = `UPDATE books SET 
        name='${name}',
        price='${price}', 
        author_id='${author_id}', 
        genre_id='${genre_id}', 
        image='${image}',
        sample_pdf='${sample_pdf}', 
        published_date='${published_date}',
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
     *delete book
     * @return {BookModel}
     */
    static async delete(bookId) {
        const deleteBook = await this.getById(bookId);
        const imageToDelete = await Axios ({
            method : `get`,
            url    : deleteBook.image ,
        });

        const buff = new Buffer(imageToDelete.data);  
        const base64 = buff.toString('base64');
        var bodyData = new FormData();
        bodyData.append('image', base64);

        await Axios ({
           method: `delete`,
           url   : `https://ibb.co/GtDW7JP/4fd2258c4ae5fe9c159a4d18b6c47efd` 
        })
        .then((resolve) => {
            console.log("Successfully deleted!",resolve.data);
        })
        .catch((error) => console.log("Error",error));;

        if( deleteBook.sample_pdf != "" && deleteBook.sample_pdf != null) {
            const deletePdfPath = "./public/books/pdfs/"+deleteBook.id+"_sample.pdf";
            fs.unlink(deletePdfPath, (err) => {
                if (err) throw err;
                console.log('successfully deleted pdf');
            });
        }
        const result = await connection.query(`DELETE from books WHERE id='${bookId}'`);

        return new BookModel(result);
    }

    /**
     *  Create instances 
     * @param {Object} item
     * @return {BookModel|null}
     */
    static toModel(item) {
        if (!item) return null;
        const params = {
            id: item.id !== undefined ? item.id : null,
            name: item.name !== undefined ? item.name : null,
            price: item.price !== undefined ? item.price : null,
            author_id: item.author_id !== undefined ? item.author_id : null,
            genre_id: item.genre_id !== undefined ? item.genre_id : null,
            image: item.image !== undefined ? item.image : null,
            sample_pdf: item.sample_pdf !== undefined ? item.sample_pdf : null,
            published_date: item.published_date !== undefined ? item.published_date : null,
            history: item.history !== undefined ? item.history : null,
            description: item.description !== undefined ? item.description : null,
            created_user_id: item.created_user_id !== undefined ? item.created_user_id : null,
            updated_user_id: item.updated_user_id !== undefined ? item.updated_user_id : null,
            deleted_user_id: item.deleted_user_id !== undefined ? item.deleted_user_id : null,
            created_at: item.created_at !== undefined ? item.created_at : null,
            updated_at: item.updated_at !== undefined ? item.updated_at : null,
            deleted_at: item.deleted_at !== undefined ? item.deleted_at : null
        };

        return new BookModel(params);
    }
}

module.exports = BookModel;




// const invocation = new XMLHttpRequest();
        // const url = 'https://api.imgbb.com/1/upload?key=429c9a059f07e33a0520e1d0179f35e2';
        // if(invocation) {
        //     invocation.open('DELETE', url, true);
        //     invocation.withCredentials = true;
        //     invocation.onreadystatechange = function () {
        //           console.log("Http method opened!",invocation.responseText);
        //     };
        //     invocation.send(); 
        // } 