const XLSX = require('xlsx');

exports.requires = ['externalLocations'];
exports.returns = 'buffer';
exports.handler = async function createExcelFile({ externalLocations: { inserts, updates, deletes } }) {
  const workbook = {
    Sheets: {
      'New': XLSX.utils.json_to_sheet(inserts),
      'Updates': XLSX.utils.json_to_sheet(updates),
      'Deletions': XLSX.utils.json_to_sheet(deletes),
    },
    SheetNames: ['New', 'Updates', 'Deletions'],
  };

  return await XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', compression: true });
};
