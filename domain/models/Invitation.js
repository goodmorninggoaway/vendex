const { Model, transaction } = require('objection');
const Bcrypt = require('bcrypt');
const Moment = require('moment');
const User = require('./User');
const Congregation = require('./Congregation');
const Notification = require('../notifications');

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
        congregationId: { type: 'integer' },
        code: { type: 'string', maxLength: 64 },
        roles: { type: 'array', items: { type: 'string' } },
      },
    };
  }

  static async addInvitation({ email, congregationId, roles }) {
    const code = await Bcrypt.genSalt();
    let invitation = await Invitation.query().findOne({ email });

    invitation = await Invitation.query()
      [invitation ? 'update' : 'insert']({
        email,
        congregationId,
        code,
        createTimestamp: new Date(),
        roles,
      })
      .returning('*');

    const congregation = await Congregation.query().findById(congregationId);
    await new Notification(Notification.types.INVITE_NEW_USER)
      .asEmail()
      .to(email)
      .properties({
        congregation,
        activationLink: `${
          process.env.UI_BASE_URL
        }/rsvp?code=${code}&congregationId=${congregationId}&email=${email}`,
      })
      .send();

    return invitation;
  }

  static async createUserFromInvitation({ email, code, password, name }) {
    const invitation = await Invitation.query()
      .where({ email, code })
      .andWhere(
        'createTimestamp',
        '>=',
        Moment()
          .subtract(MAX_CODE_AGE_MINUTES, 'minutes')
          .toDate(),
      )
      .first();

    if (!invitation) {
      return false;
    }

    let trx;
    let user;
    try {
      trx = await transaction.start(Invitation.knex());

      user = await User.query(trx)
        .insert({
          name,
          isActive: true,
          createTimestamp: new Date(),
          username: invitation.email,
          congregationId: invitation.congregationId,
          roles: invitation.roles,
          email: invitation.email,
        })
        .returning('*');

      user = await user.resetPassword(password, trx);

      await Invitation.query(trx).deleteById(invitation.$id());

      await trx.commit();
      return user;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }
}

module.exports = Invitation;
