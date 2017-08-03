const convertExcel = require('excel-as-json').processFile;


module.exports = ({ input }) => {
    return new Promise((resolve, reject) => {
        convertExcel(input, null, {}, (error, data) => {
            if (error) {
                return reject(error);
            }

            resolve(data);
        });
    });
};