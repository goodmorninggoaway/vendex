exports.up = function(knex) {
  return knex.schema
    .createTable('language', function(table) {
      table.increments('languageId');
      table.string('language', 64).unique();
      table.specificType('synonyms', 'varchar(64)[]');
    })
    .then(() =>
      knex.table('language').insert([
        { languageId: -1, language: 'Unknown' },
        { language: 'Arabic', synonyms: ['Arabic'] },
        { language: 'Bengali', synonyms: ['Bengali'] },
        { language: 'Burmese', synonyms: ['Burmese'] },
        { language: 'Chinese', synonyms: ['Chinese'] },
        {
          language: 'Chinese Cantonese',
          synonyms: ['Chinese Cantonese', 'Cantonese', 'Cantonese Chinese'],
        },
        {
          language: 'Chinese Mandarin',
          synonyms: ['Chinese Mandarin', 'Mandarin', 'Mandarin Chinese`'],
        },
        { language: 'English', synonyms: ['English'] },
        { language: 'Gujarati', synonyms: ['Gujarati'] },
        { language: 'Hindi', synonyms: ['Hindi'] },
        { language: 'Italian', synonyms: ['Italian'] },
        { language: 'Kannada', synonyms: ['Kannada'] },
        { language: 'Korean', synonyms: ['Korean'] },
        { language: 'Malayalam', synonyms: ['Malayalam'] },
        { language: 'Marathi', synonyms: ['Marathi'] },
        { language: 'Nepali', synonyms: ['Nepali'] },
        { language: 'Punjabi', synonyms: ['Punjabi'] },
        { language: 'Russian', synonyms: ['Russian'] },
        { language: 'Tagalog', synonyms: ['Tagalog'] },
        { language: 'Tamil', synonyms: ['Tamil'] },
        { language: 'Telugu', synonyms: ['Telugu'] },
        { language: 'Urdu', synonyms: ['Urdu'] },
      ]),
    );
};

exports.down = function(knex) {
  return knex.schema.dropTable('language');
};
