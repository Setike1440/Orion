const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.rpc('exec_sql', { sql_string: 'NOTIFY pgrst, "reload schema";' });
  await new Promise(r => setTimeout(r, 1000));
  const { data, error } = await supabase.from('games').select('id, category_ids').limit(1);
  console.log(error);
}
run();
