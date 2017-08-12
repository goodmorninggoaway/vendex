const csv = require('csvtojson');

module.exports = {
    load({ input }) {
        return new Promise((resolve, reject) => {
            const rows = [];

            csv({ delimiter: '\t' })
                .fromFile(input)
                .on('json', (jsonObj) => {
                    rows.push(jsonObj);
                })
                .on('done', (error) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(rows);
                });
        });
    },
};