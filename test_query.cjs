const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('games').select('id, game_categories(category_id, categories(id, name, slug))').limit(1);
  console.log(error);
  console.log(JSON.stringify(data, null, 2));
}
run();
