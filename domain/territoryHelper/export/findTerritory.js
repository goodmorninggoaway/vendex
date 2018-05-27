const map = require('lodash/map');
const { DAL } = require('../../dataAccess');
const MESSAGE_LEVEL = require('../../models/enums/exportMessageLevel');

exports.requires = ['congregationId', 'location', 'nextCongregationLocation'];
exports.optional = ['destinationCongregationLocation'];
exports.returns = ['territory', '$messageLevel', '$message'];
exports.handler = async function findTerritory({
  location,
  congregationId,
  destinationCongregationLocation,
}) {
  const containingTerritories = await DAL.findTerritoryContainingPoint(congregationId, location);
  const originalTerritoryId = destinationCongregationLocation ? destinationCongregationLocation.territoryId : null;
  let originalTerritory;
  if (originalTerritoryId) {
    originalTerritory = await DAL.findTerritory({ territoryId: originalTerritoryId });
  }

  if (!containingTerritories.length) {
    if (originalTerritoryId) {
      return {
        territory: originalTerritory,
        $message: 'Could not find a matching territory, but this location is assigned to a territory. You may need to import the latest territories.',
        $messageLevel: MESSAGE_LEVEL.CONFLICT,
      };
    } else {
      return {
        territory: originalTerritory,
        $message: 'Could not find a matching territory. You may need to import the latest territories.',
        $messageLevel: MESSAGE_LEVEL.INFO,
      };
    }
  }

  if (containingTerritories.length === 1) {
    const { territoryId, externalTerritoryId } = containingTerritories[0];

    // No change or no original territory
    if (!originalTerritoryId || territoryId === originalTerritoryId) {
      return { territory: containingTerritories[0] };
    } else {
      return {
        territory: originalTerritory,
        $message: `This location is within the boundaries of territory ${externalTerritoryId}, but is currently set to a different territory.`,
        $messageLevel: MESSAGE_LEVEL.CONFLICT,
      };
    }
  }

  if (containingTerritories.length > 1) {
    if (originalTerritoryId) {
      const matchesExistingTerritory = containingTerritories.some(
        x => x.territoryId === originalTerritoryId,
      );

      // Assume the existing system is already correct and do nothing
      if (matchesExistingTerritory) {
        return { territory: originalTerritory };
      }
    }

    const idList = map(containingTerritories, 'externalTerritoryId').join(', ');
    return {
      territory: originalTerritory,
      $message: `This location falls within the boundaries of ${containingTerritories.length} territories: ${idList}`,
      $messageLevel: MESSAGE_LEVEL.CONFLICT,
    };
  }
};
