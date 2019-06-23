const map = require('lodash/map');
const { DAL } = require('../../dataAccess');
const MESSAGE_LEVEL = require('../../models/enums/exportMessageLevel');

exports.requires = ['congregationId', 'location', 'nextCongregationLocation'];
exports.optional = ['destinationCongregationLocation'];
exports.returns = ['assignedTerritory', 'containingTerritories', '$messageLevel', '$message'];
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
        assignedTerritory: originalTerritory,
        containingTerritories,
        $message: 'Could not find a matching territory, but this location is assigned to a territory. You may need to import the latest territories.',
        $messageLevel: MESSAGE_LEVEL.CONFLICT,
      };
    } else {
      return {
        assignedTerritory: originalTerritory,
        containingTerritories,
        $message: 'Could not find a matching territory. You may need to import the latest territories.',
        $messageLevel: MESSAGE_LEVEL.INFO,
      };
    }
  }

  if (containingTerritories.length === 1) {
    const { territoryId, externalTerritoryName } = containingTerritories[0];

    // No change or no original territory
    if (!originalTerritoryId || territoryId === originalTerritoryId) {
      return { assignedTerritory: containingTerritories[0], containingTerritories };
    } else {
      const otherTerrName = (originalTerritory && originalTerritory.externalTerritoryName) || originalTerritoryId;
      containingTerritories.push(originalTerritory);
      return {
        assignedTerritory: null,
        containingTerritories,
        $message: `This location is within the boundaries of territory ${externalTerritoryName}, but is currently set to a different territory ${otherTerrName}.`,
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
        return { assignedTerritory: originalTerritory, containingTerritories };
      }
    }

    const nameList = map(containingTerritories, 'externalTerritoryName').join(', ');
    return {
      assignedTerritory: originalTerritory,
      containingTerritories,
      $message: `This location falls within the boundaries of ${containingTerritories.length} territories: ${nameList}`,
      $messageLevel: MESSAGE_LEVEL.CONFLICT,
    };
  }
};
