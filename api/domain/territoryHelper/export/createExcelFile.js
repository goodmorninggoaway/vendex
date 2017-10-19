const groupBy = require('lodash/groupBy');
const XLSX = require('xlsx');
const OPERATION = require('../../models/enums/activityOperations');

exports.requires = ['externalLocations'];
exports.returns = 'excel';
exports.handler = async function createExcelFile({ externalLocations }) {
  const {
    [OPERATION.INSERT]: inserts,
    [OPERATION.UPDATE]: updates,
    [OPERATION.DELETE]: deletes,
  } = groupBy(externalLocations, 'operation');

  const workbook = {
    Sheets: {
      'New': XLSX.utils.json_to_sheet(inserts),
      'Updates': XLSX.utils.json_to_sheet(updates),
      'Deletions': XLSX.utils.json_to_sheet(deletes)
    },
    SheetNames: ['New', 'Updates', 'Deletions'],
  };

  return await XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', compression: true });
};
