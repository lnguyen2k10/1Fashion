import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })

const SHOP_COUNT = 500
const ITERATIONS = 12
const prefix = `loadtest-${Date.now()}-`
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

function percentile(samples, ratio) {
  const ordered = [...samples].sort((a, b) => a - b)
  return ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * ratio) - 1)]
}

async function measure(query, params = []) {
  const values = []
  for (let i = 0; i < ITERATIONS; i += 1) {
    const startedAt = performance.now()
    const result = await client.query(query, params)
    values.push(performance.now() - startedAt)
    void result
  }
  return { p50Ms: Number(percentile(values, 0.5).toFixed(2)), p95Ms: Number(percentile(values, 0.95).toFixed(2)), maxMs: Number(Math.max(...values).toFixed(2)) }
}

await client.connect()
await client.query('begin')
try {
  await client.query(`
    insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    select gen_random_uuid(), 'authenticated', 'authenticated', $1 || series || '@benchmark.invalid', '{}'::jsonb, '{}'::jsonb, now(), now()
    from generate_series(1, $2) as series
  `, [prefix, SHOP_COUNT])
  await client.query(`
    insert into public.profiles (id, email, role, subscription_status, expiry_date)
    select id, email, 'shop', 'trial', now() + interval '30 days'
    from auth.users where email like $1
  `, [`${prefix}%`])
  await client.query(`
    insert into public.business_profiles (account_id, business_name, slug, category, location_city, location_district, is_verified)
    select profile.id, 'Benchmark Shop ' || row_number() over (), $1 || row_number() over (),
      case when row_number() over () % 3 = 0 then 'Đầm nữ' when row_number() over () % 3 = 1 then 'Thời trang nam' else 'Phụ kiện' end,
      'TP. Hồ Chí Minh', 'Quận ' || ((row_number() over () - 1) % 12 + 1), true
    from public.profiles profile where profile.email like $2
  `, [prefix, `${prefix}%`])
  await client.query(`
    insert into public.landing_pages (business_id, template_id, status, is_published, content_json, updated_at)
    select id, 'market-v1', 'Published', true, '{}'::jsonb, now() - (random() * interval '30 days')
    from public.business_profiles where slug like $1
  `, [`${prefix}%`])

  const base = `from public.directory_shops where business_slug like '${prefix}%'`
  const results = {
    insertedBusinesses: Number((await client.query(`select count(*)::int as count from public.business_profiles where slug like '${prefix}%'`)).rows[0].count),
    insertedPages: Number((await client.query(`select count(*)::int as count from public.landing_pages where business_id in (select id from public.business_profiles where slug like '${prefix}%')`)).rows[0].count),
    totalShops: Number((await client.query(`select count(*)::int as count ${base}`)).rows[0].count),
    firstPage: await measure(`select business_slug, business_name, category, location_district ${base} order by updated_at desc limit 24`),
    deepPage: await measure(`select business_slug, business_name, category, location_district ${base} order by updated_at desc limit 24 offset 456`),
    districtFilter: await measure(`select business_slug, business_name ${base} and location_district ilike '%Quận 1%' order by updated_at desc limit 24`),
    textSearch: await measure(`select business_slug, business_name ${base} and (business_name ilike '%042%' or category ilike '%042%' or location_district ilike '%042%') order by updated_at desc limit 24`),
    count: await measure(`select count(*) ${base}`),
  }
  console.log(JSON.stringify({ mode: 'transactional_rollback', shops: SHOP_COUNT, iterations: ITERATIONS, results }))
} finally {
  await client.query('rollback')
  await client.end()
}
