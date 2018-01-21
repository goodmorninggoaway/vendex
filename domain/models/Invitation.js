const { Model, transaction } = require('objection');
const Bcrypt = require('bcrypt');
const Moment = require('moment');
const User = require('./User');

const MAX_CODE_AGE_MINUTES = process.env.INVITATION_MAX_CODE_AGE || 60 * 24 * 3;

class Invitation extends Model {
  static get tableName() {
    return 'invitation';
  }

  static get idColumn() {
    return 'invitationId';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'createTimestamp', 'congregationId', 'code'],
      properties: {
        userId: { type: 'integer' },
        email: { type: 'string', minLength: 3, maxLength: 128 },
        createTimestamp: { type: 'date-time' },
        congregationId: { type: 'string', minLength: 3, maxLength: 64 },
        code: { type: 'string', maxLength: 64 },
        roles: { type: 'array', items: { type: 'string' } },
      },
    };
  }

  static async addInvitation({ email, congregationId, roles }) {
    const code = await Bcrypt.genSalt();
    const invitation = await Invitation.insert({
      email,
      congregationId,
      code,
      createTimestamp: new Date(),
      roles,
    });

    // TODO send email
    return invitation;
  }

  static async createUserFromInvitation({
    email,
    code,
    congregationId,
    password,
  }) {
    const invitation = await Invitation.findOne({
      email,
      congregationId,
      code,
    }).andWhere(
      'createTimestamp',
      '>=',
      Moment().subtract(MAX_CODE_AGE_MINUTES, 'minutes'),
    );

    if (!invitation) {
      return false;
    }

    let trx;
    let user;
    try {
      trx = await transaction.start(Invitation.knex());

      user = await User.query(trx)
        .insert({
          isActive: true,
          createTimestamp: new Date(),
          username: invitation.email,
          congregationId: invitation.congregationId,
          roles: invitation.roles,
        })
        .returning('*');

      user = await user.resetPassword(password, trx);

      await Invitation.query(trx).deleteById(invitation.$id());

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      console.log(err);
    }

    return user;
  }
}

module.exports = Invitation;
