const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { error } = await supabase.rpc('exec_sql', {
    sql_string: `
      ALTER TABLE public.games ADD COLUMN IF NOT EXISTS category_ids UUID[] DEFAULT '{}';
      UPDATE public.games SET category_ids = ARRAY[category_id] WHERE category_id IS NOT NULL AND category_ids = '{}';
      NOTIFY pgrst, "reload schema";
    `
  });
  console.log("Creation error:", error);
  
  await new Promise(r => setTimeout(r, 1000));
  
  const { data, error: selectError } = await supabase.from('games').select('id, category_ids').limit(1);
  console.log("Select error:", selectError);
}
run();
