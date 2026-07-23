const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.rpc('exec_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS public.game_categories (
          game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
          category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
          PRIMARY KEY (game_id, category_id)
      );
      
      INSERT INTO public.game_categories (game_id, category_id)
      SELECT id, category_id FROM public.games WHERE category_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    `
  });
}
run();
