const XLSX = require('xlsx');
const compact = require('lodash/compact');
const flatten = require('lodash/flatten');

exports.requires = ['externalLocations'];
exports.returns = 'buffer';
exports.handler = async function createExcelFile({
  inserts,
  updates,
  deletes,
}) {
  const workbook = {
    Sheets: {
      Updated: XLSX.utils.json_to_sheet(compact(flatten([inserts, updates]))),
      Deleted: XLSX.utils.json_to_sheet(compact(deletes)),
    },
    SheetNames: ['Updated', 'Deleted'],
  };

  return await XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer',
    compression: true,
  });
};
