const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.rpc('exec_sql', {
    sql_string: `
      ALTER TABLE public.games ADD COLUMN IF NOT EXISTS highlight_text TEXT DEFAULT 'Garantia Vitalícia';
    `
  });
}
run();
