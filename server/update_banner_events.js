const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const tableCheck = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'banner_events'");

    if (tableCheck.rows.length > 0) {
      const columns = tableCheck.rows.map(r => r.column_name);
      if (!columns.includes('date_month') || !columns.includes('date_day')) {
        let backupName = 'banner_events_legacy_20260519';
        const backupCheck = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = $1", [backupName]);
        if (backupCheck.rows.length > 0) backupName += '_v2';
        
        await client.query('ALTER TABLE banner_events RENAME TO ' + backupName);
        console.log('Renamed existing table to ' + backupName);
      } else {
        console.log('banner_events already has correct schema. Skipping recreation.');
      }
    }

    await client.query('CREATE TABLE IF NOT EXISTS banner_events (' +
        'id uuid PRIMARY KEY DEFAULT gen_random_uuid(),' +
        'date_month int NOT NULL,' +
        'date_day int NOT NULL,' +
        'title text NOT NULL,' +
        'year int,' +
        'description text,' +
        'category text DEFAULT \'culture\',' +
        'place_id text REFERENCES places(id),' +
        'created_at timestamptz DEFAULT now()' +
      ');');
    console.log('Ensured banner_events table exists.');

    await client.query('CREATE INDEX IF NOT EXISTS banner_events_date_idx ON banner_events (date_month, date_day);');
    await client.query('ALTER TABLE banner_events ENABLE ROW LEVEL SECURITY;');
    await client.query('DO $$ BEGIN ' +
        'IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = \'banner_events\' AND policyname = \'Public select\') THEN ' +
          'CREATE POLICY "Public select" ON banner_events FOR SELECT USING (true); ' +
        'END IF; END $$;');

    const events = [
      [5, 19, 'Execution of Anne Boleyn', 1536, 'Second wife of Henry VIII', 'history', null],
      [5, 19, 'Dark Day in New England', 1780, 'Unexplained darkness', 'history', null],
      [5, 19, 'Malcolm X Birthday', 1925, 'Civil rights leader born', 'culture', null],
      [5, 19, 'Ho Chi Minh Birthday', 1890, 'Vietnamese leader born', 'culture', null]
    ];

    for (const [m, d, t, y, desc, cat, p] of events) {
      await client.query('INSERT INTO banner_events (date_month, date_day, title, year, description, category, place_id) ' +
        'SELECT $1, $2, $3, $4, $5, $6, $7 ' +
        'WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE title = $3 AND date_month = $1 AND date_day = $2);', [m, d, t, y, desc, cat, p]);
    }
    console.log('Seeded sample events.');

  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
