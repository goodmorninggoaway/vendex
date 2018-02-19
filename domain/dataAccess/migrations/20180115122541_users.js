exports.up = async function(knex) {
  await knex.schema.createTable('user', table => {
    table.increments('userId');
    table.boolean('isActive');
    table.string('username', 64).notNullable();
    table.string('password', 64);
    table.string('name', 64);
    table.string('salt', 64);
    table.string('email', 128);
    table.integer('congregationId').references('congregation.congregationId');
    table.timestamp('createTimestamp');
    table.timestamp('passwordResetTimestamp');
    table.timestamp('loginTimestamp');
    table.jsonb('roles');
    table.string('authenticationCode', 64);
    table.timestamp('authenticationCreationTimestamp');

    table.unique('username');
    table.unique('email');
  });

  await knex('user').insert([
    {
      userId: 1,
      isActive: false,
      username: 'sample',
      email: 'vendex@gmail.com',
    },
  ]);

  await knex.schema.createTable('invitation', table => {
    table.increments('invitationId');

    table.string('email', 128).notNullable();
    table.timestamp('createTimestamp').notNullable();
    table.string('code', 128).notNullable();
    table.string('name', 128).notNullable();
    table.jsonb('roles');
    table
      .integer('congregationId')
      .notNullable()
      .references('congregation.congregationId');

    table.unique(['email', 'code']);
  });
};

exports.down = async knex => {
  await knex.schema.dropTable('invitation');
  await knex.schema.dropTable('user');
};
