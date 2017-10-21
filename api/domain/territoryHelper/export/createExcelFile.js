const groupBy = require('lodash/groupBy');
const map = require('lodash/map');
const XLSX = require('xlsx');
const OPERATION = require('../../models/enums/activityOperations');

exports.requires = ['externalLocations'];
exports.returns = 'buffer';
exports.handler = async function createExcelFile({ externalLocations }) {
  const {
    [OPERATION.INSERT]: inserts,
    [OPERATION.UPDATE]: updates,
    [OPERATION.DELETE]: deletes,
  } = groupBy(externalLocations, 'operation');

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
