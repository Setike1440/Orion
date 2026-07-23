const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.rpc('exec_sql', {
    sql_string: `
      ALTER TABLE public.games ADD COLUMN IF NOT EXISTS category_ids UUID[] DEFAULT '{}';
      UPDATE public.games SET category_ids = ARRAY[category_id] WHERE category_id IS NOT NULL AND category_ids = '{}';
    `
  });
}
run();
