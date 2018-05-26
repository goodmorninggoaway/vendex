const { Model, snakeCaseMappers, transaction } = require('objection');

class AlbaLocationImportLocation extends Model {
  static get tableName() {
    return 'alba_location_import_by_location';
  }

  static get idColumn() {
    return 'id';
  }

  static get columnNameMappers() {
    return snakeCaseMappers();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['albaId', 'payload'],
      properties: {
        albaLocationImportId: { type: 'integer' },
        albaId: { type: 'string' },
        payload: { type: 'object' },
        congregationIntegration: { type: 'object' },
        translatedLocation: { type: 'object' },
        translatedCongregationLocation: { type: 'object' },
        operation: { type: 'object' },
        geocoding: { type: 'object' },
        isDone: { type: 'boolean' },
      },
    };
  }

  static get relationMappings() {
    const AlbaLocationImport = require('./AlbaLocationImport');

    return {
      session: {
        relation: Model.BelongsToOneRelation,
        modelClass: AlbaLocationImport,
        join: {
          from: 'alba_location_import_by_location.alba_location_import_id',
          to: 'alba_location_import.id',
        },
      },
    };
  }

  static async findLocation(congregationId, id) {
    const location = await AlbaLocationImportLocation.query()
      .where({ id })
      .eager('session')
      .first();
    return location;
  }

  async importLocation() {
    const { handler: translateToLocation } = require('../../domain/alba/import/translateToLocation');
    const { handler: translateToCongregationLocation } = require('../../domain/alba/import/translateToCongregationLocation');
    const Congregation = require('./Congregation');
    const { source } = this.session;

    // Translate and store location
    const externalLocation = this.payload;
    const translatedLocation = await translateToLocation({ externalLocation, source });
    await this.patch({ translatedLocation: { locationId: translatedLocation.location.locationId, isNew: translatedLocation.isNew } });

    // Add congregationLocation if it passes tests
    const congregation = await Congregation.getCongregation(this.session.congregationId);
    const translatedCongregationLocation = await translateToCongregationLocation({
      externalLocation,
      congregation,
      source,
      location: translatedLocation.location,
      albaLocationImportId: this.albaLocationImportId,
    });
    await this.patch({ translatedCongregationLocation: { isValid: !!translatedCongregationLocation }, is_done: true });

    return await AlbaLocationImportLocation.query().findById(this.$id());
  }

  async patch(patch, trx) {
    return AlbaLocationImportLocation.query(trx).where({ id: this.$id() }).patch(patch);
  }
}

module.exports = AlbaLocationImportLocation;
