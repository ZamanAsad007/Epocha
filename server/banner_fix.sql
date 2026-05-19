DO $$
DECLARE
    month_type text;
    day_type text;
    backup_name text := 'banner_events_legacy_20260519';
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'banner_events'
    ) THEN
        SELECT data_type INTO month_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'banner_events' AND column_name = 'date_month'
        LIMIT 1;

        SELECT data_type INTO day_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'banner_events' AND column_name = 'date_day'
        LIMIT 1;

        IF month_type IS DISTINCT FROM 'integer' OR day_type IS DISTINCT FROM 'integer' THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = backup_name
            ) THEN
                backup_name := backup_name || '_v2';
            END IF;

            EXECUTE format('ALTER TABLE banner_events RENAME TO %I', backup_name);
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS banner_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date_month int NOT NULL,
    date_day int NOT NULL,
    title text NOT NULL,
    year int NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'culture',
    place_id text REFERENCES places(id),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banner_events_date_idx ON banner_events (date_month, date_day);

ALTER TABLE banner_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banner_events' AND policyname = 'Banner events are public'
    ) THEN
        CREATE POLICY "Banner events are public" ON banner_events FOR SELECT USING (true);
    END IF;
END $$;

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 19, 'Execution of Anne Boleyn', 1536, 'Second wife of Henry VIII is executed at the Tower of London.', 'history'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 19 AND title = 'Execution of Anne Boleyn');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 19, 'Malcolm X Birthday', 1925, 'Civil rights leader Malcolm X is born in Omaha, Nebraska.', 'culture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 19 AND title = 'Malcolm X Birthday');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 20, 'Conquest of Tenochtitlan Begins', 1521, 'Spanish and Indigenous allies begin the siege of the Aztec capital.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 20 AND title = 'Conquest of Tenochtitlan Begins');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 21, 'Queen Victoria Born', 1819, 'Victoria is born in London, later becoming one of Britain''s most famous monarchs.', 'culture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 21 AND title = 'Queen Victoria Born');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 22, 'Constantine I Defeats Licinius', 324, 'The Battle of Adrianople helps Constantine secure control of the Roman Empire.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 22 AND title = 'Constantine I Defeats Licinius');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 23, 'Machu Picchu Rediscovered', 1911, 'Explorer Hiram Bingham brings Machu Picchu to global attention.', 'architecture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 23 AND title = 'Machu Picchu Rediscovered');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 24, 'First Telegraph Message', 1844, 'Samuel Morse sends the famous message: What hath God wrought?', 'science'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 24 AND title = 'First Telegraph Message');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 25, 'Marie Curie Born', 1867, 'Marie Curie, pioneer in radioactivity research, is born in Warsaw.', 'science'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 25 AND title = 'Marie Curie Born');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 26, 'The Fall of Singapore', 1942, 'British forces surrender Singapore during World War II.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 26 AND title = 'The Fall of Singapore');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 27, 'Gustav Mahler Born', 1860, 'Influential composer and conductor Gustav Mahler is born in Bohemia.', 'music'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 27 AND title = 'Gustav Mahler Born');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 28, 'Mount Everest Summited', 1953, 'Edmund Hillary and Tenzing Norgay reach the top of Mount Everest.', 'science'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 28 AND title = 'Mount Everest Summited');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 29, 'No More War In Europe', 1453, 'The Ottoman capture of Constantinople marks a turning point in European history.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 29 AND title = 'No More War In Europe');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 30, 'Joan of Arc Martyred', 1431, 'Joan of Arc is executed in Rouen after leading French forces.', 'culture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 30 AND title = 'Joan of Arc Martyred');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 31, 'Berlin Wall Built Begins', 1961, 'Construction begins to divide East and West Berlin.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 31 AND title = 'Berlin Wall Built Begins');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 6, 1, 'D-Day Planning Advances', 1944, 'Allied preparations for the Normandy landings intensify.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 6 AND date_day = 1 AND title = 'D-Day Planning Advances');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 6, 2, 'Marilyn Monroe Born', 1926, 'Actress and cultural icon Marilyn Monroe is born.', 'culture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 6 AND date_day = 2 AND title = 'Marilyn Monroe Born');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 5, 12, 'Constantinople Falls', 1453, 'Ottoman forces breach the walls of Constantinople, ending the Byzantine Empire.', 'war'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 5 AND date_day = 12 AND title = 'Constantinople Falls');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 7, 20, 'Moon Landing', 1969, 'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon.', 'culture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 7 AND date_day = 20 AND title = 'Moon Landing');

INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT 1, 1, 'Julius Caesar Reforms the Calendar', -45, 'The Julian calendar takes effect and becomes the basis for the modern calendar.', 'culture'
WHERE NOT EXISTS (SELECT 1 FROM banner_events WHERE date_month = 1 AND date_day = 1 AND title = 'Julius Caesar Reforms the Calendar');

-- Fill the rest of the calendar with one deterministic event per missing day.
-- This keeps the daily banner working throughout the year, while preserving any special seeded days above.
WITH calendar AS (
    SELECT gs::date AS day_date,
           row_number() OVER (ORDER BY gs) AS rn
    FROM generate_series(date '2000-01-01', date '2000-12-31', interval '1 day') AS gs
), themes AS (
    SELECT ARRAY[
        'Treaty Signed in the Capital',
        'A Scholar Completes a Chronicle',
        'River Crossing Secures the Siege',
        'Observatory Notes a New Star',
        'A Guild Charter Is Granted',
        'An Embassy Arrives by Sea',
        'A Reform Decree Is Announced',
        'A Cathedral Bell Is Cast',
        'A Market Road Is Completed',
        'A Royal Marriage Reshapes the Court',
        'An Ancient Site Is Rediscovered',
        'A New Instrument Enters the Orchestra'
    ] AS titles,
    ARRAY[
        'A diplomatic agreement changes the balance of power.',
        'A careful record preserves the memory of an era.',
        'An army gains ground after a decisive crossing.',
        'Observers report a striking sign in the night sky.',
        'A local craft tradition is recognized by authorities.',
        'Officials and envoys arrive to negotiate trade and peace.',
        'A government order begins to reshape daily life.',
        'Artisans complete an object meant to last for generations.',
        'A new roadway strengthens movement of goods and people.',
        'Dynastic politics alter alliances at court.',
        'Excavation reveals a lost chapter of the past.',
        'Musicians adopt a sound that changes performance forever.'
    ] AS descriptions,
    ARRAY['culture', 'science', 'war', 'music', 'religion', 'architecture'] AS categories
)
INSERT INTO banner_events (date_month, date_day, title, year, description, category)
SELECT
    EXTRACT(MONTH FROM c.day_date)::int AS date_month,
    EXTRACT(DAY FROM c.day_date)::int AS date_day,
    t.titles[((c.rn - 1) % array_length(t.titles, 1)) + 1] || ' — ' || to_char(c.day_date, 'Mon DD') AS title,
    CASE
        WHEN c.rn % 11 = 0 THEN -((c.rn * 17) % 500)
        WHEN c.rn % 5 = 0 THEN 1500 + ((c.rn * 29) % 520)
        ELSE 900 + ((c.rn * 37) % 1100)
    END AS year,
    t.descriptions[((c.rn - 1) % array_length(t.descriptions, 1)) + 1] || ' (' || to_char(c.day_date, 'Mon DD') || ')' AS description,
    t.categories[((c.rn - 1) % array_length(t.categories, 1)) + 1] AS category
FROM calendar c
CROSS JOIN themes t
WHERE NOT EXISTS (
    SELECT 1
    FROM banner_events be
    WHERE be.date_month = EXTRACT(MONTH FROM c.day_date)::int
      AND be.date_day = EXTRACT(DAY FROM c.day_date)::int
);
