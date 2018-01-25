exports.up = async function(knex) {
  await knex.schema.createTable('role', table => {
    table.string('roleId', 32).primary();
    table.string('name', 64);
  });

  await knex('role').insert([
    { roleId: 'root', name: 'Root Admin' },
    { roleId: 'admin', name: 'Admin' },
    { roleId: 'alba:importer', name: 'Alba Importer' },
    { roleId: 'alba:exporter', name: 'Alba Exporter' },
    { roleId: 'th:importer', name: 'Territory Helper Importer' },
    { roleId: 'th:exporter', name: 'Territory Helper Exporter' },
  ]);

  await knex.schema.createTable('resource', table => {
    table.string('resourceId', 64).primary();
  });

  await knex('resource').insert([
    { resourceId: 'congregation' },
    { resourceId: 'congregationIntegration' },
    { resourceId: 'language' },
    { resourceId: 'location' },
    { resourceId: 'territory' },
    { resourceId: 'user' },
    { resourceId: 'alba:import' },
    { resourceId: 'alba:export' },
    { resourceId: 'th:import' },
    { resourceId: 'th:export' },
  ]);

  await knex.schema.createTable('permission', table => {
    table.increments('permissionId');

    // Subject is a subset of resources than can "do something" to resource belonging to a "target"
    table.string('subjectType', 16).notNullable();
    table.string('subjectId', 17).notNullable(); // length of a bigint as string
    table.string('resourceId', 128).notNullable(); // Some noun
    table.string('action', 8).notNullable(); // create, read, update, delete, *
    table.string('targetType', 16);
    table.string('targetId', 17);
    table.text('attributeFilter');

    table.index(['subjectType', 'subjectId']);
  });

  await knex('permission').insert([
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'congregationIntegration',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'language',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'location',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'territory',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'user',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'alba:import',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'alba:export',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'th:import',
      action: '*',
    },
    {
      subjectType: 'role',
      subjectId: 'admin',
      resourceId: 'th:export',
      action: '*',
    },
  ]);

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
  await knex.schema.dropTable('permission');
  await knex.schema.dropTable('resource');
  await knex.schema.dropTable('role');
};
