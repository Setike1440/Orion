const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  await supabase.rpc('exec_sql', {
    sql_string: 'ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;'
  });
  
  // Update existing categories with some unsplash images based on their names
  const { data: categories } = await supabase.from('categories').select('*');
  if (categories) {
    for (const c of categories) {
      if (!c.image_url) {
        let img = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=400';
        if (c.slug.includes('action')) img = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400';
        if (c.slug.includes('rpg')) img = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400';
        if (c.slug.includes('indie')) img = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400';
        if (c.slug.includes('survival')) img = 'https://images.unsplash.com/photo-1504280387932-a56767664366?auto=format&fit=crop&q=80&w=400';
        if (c.slug.includes('sports')) img = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400';
        
        await supabase.from('categories').update({ image_url: img }).eq('id', c.id);
      }
    }
  }
}
run();
