const convertExcel = require('excel-as-json').processFile;


module.exports = {
    load() {
        return new Promise((resolve, reject) => {
            convertExcel(input, null, {}, (error, data) => {
                if (error) {
                    return reject(error);
                }

                resolve(data);
            });
        });
    },
    write(json) {
        return new Promise((resolve, reject) => {
            convertExcel(input, null, {}, (error, data) => {
                if (error) {
                    return reject(error);
                }

                resolve(data);
            });
        });
    }
};