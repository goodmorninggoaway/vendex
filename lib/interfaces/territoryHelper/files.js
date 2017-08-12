const convertExcel = require('excel-as-json').processFile;
const XLSX = require('xlsx');

module.exports = {
    load({ input }) {
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
            const workbook = {
                Sheets: { Import: XLSX.utils.json_to_sheet(json) },
                SheetNames: ['Import'],
            };

            const file = `${process.env.TEMP_DIR}/th_output_${new Date().valueOf()}.xlsx`;

            XLSX.writeFileAsync(file, workbook, (e) => {
                if (e) {
                    return reject(e);
                }

                return resolve();
            });
        });
    },
};