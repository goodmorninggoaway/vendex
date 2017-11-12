const map = require('lodash/map');
const XLSX = require('xlsx');

exports.requires = ['externalLocations'];
exports.returns = 'buffer';
exports.handler = async function createExcelFile({ externalLocations: { inserts, updates, deletes } }) {
  const workbook = {
    Sheets: {
      'New': XLSX.utils.json_to_sheet(map(inserts, 'externalLocation')),
      'Updates': XLSX.utils.json_to_sheet(map(updates, 'externalLocation')),
      'Deletions': XLSX.utils.json_to_sheet(map(deletes, 'externalLocation'))
    },
    SheetNames: ['New', 'Updates', 'Deletions'],
  };

  return await XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', compression: true });
};
