// Generates the /areas pages and sitemap.xml. Run: node build-areas.js
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.keystonepropertygroup.co.uk'; // replace with the real domain
const BUSINESS_ID = SITE + '/#business';
const today = new Date().toISOString().slice(0, 10);

const services = [
  { path: 'bathrooms', label: 'Bathroom installations', short: 'full bathroom installations including toilets, baths, basins, showers and tiling' },
  { path: 'kitchens', label: 'Kitchen installations', short: 'units, worktops, appliances and tiling' },
  { path: 'security', label: 'Alarm, sensor & CCTV installation', short: 'alarms, sensors and CCTV installation' },
  { path: 'maintenance', label: 'Property maintenance', short: 'furniture, plumbing repairs, decorating and mastic repairs' },
  { path: 'water', label: 'Plumbing & water leak detection', short: 'plumbing, water leak detection and damp surveys' },
  { path: 'roofing', label: 'Roofing repairs & replacements', short: 'roof repairs, replacements and maintenance' },
  { path: 'entertainment', label: 'Home cinema & entertainment systems', short: 'home cinema and multi-room entertainment systems' },
];

const places = [
  { slug: 'dorset', name: 'Dorset', kind: 'county', intro: 'Based in Bournemouth, Dorset is our home county. We cover the whole of it, from the coast at Swanage and Weymouth to inland towns like Blandford Forum, Sherborne and Shaftesbury.', nearby: ['bournemouth', 'poole', 'christchurch', 'dorchester', 'weymouth'], towns: ['Bournemouth', 'Poole', 'Christchurch', 'Wimborne Minster', 'Wareham', 'Swanage', 'Blandford Forum', 'Dorchester', 'Weymouth', 'Bridport', 'Sherborne', 'Shaftesbury'] },
  { slug: 'hampshire', name: 'Hampshire', kind: 'county', intro: 'Hampshire sits right on our doorstep. We regularly work across the New Forest, Southampton, Winchester and Portsmouth areas, and further north towards Basingstoke and Andover.', nearby: ['southampton', 'winchester', 'new-forest'], towns: ['Southampton', 'Winchester', 'Portsmouth', 'Lymington', 'Ringwood', 'Romsey', 'Eastleigh', 'Fareham', 'Andover', 'Basingstoke'] },
  { slug: 'wiltshire', name: 'Wiltshire', kind: 'county', intro: 'We serve southern Wiltshire, including Salisbury and the surrounding villages, as well as towns further north and west within our two-hour travel area.', nearby: ['salisbury'], towns: ['Salisbury', 'Amesbury', 'Warminster', 'Westbury', 'Trowbridge'] },
  { slug: 'somerset', name: 'Somerset', kind: 'county', intro: 'Our service area reaches into Somerset, covering Yeovil and the surrounding area, and extending towards Taunton and Bath.', nearby: ['dorset'], towns: ['Yeovil', 'Wells', 'Taunton', 'Bath'] },
  { slug: 'devon', name: 'East Devon', kind: 'county', intro: 'We take on projects in East Devon, including Axminster, Honiton and Exeter, at the edge of our two-hour radius from Bournemouth.', nearby: ['dorset'], towns: ['Axminster', 'Honiton', 'Sidmouth', 'Exeter'] },
  { slug: 'west-sussex', name: 'West Sussex', kind: 'county', intro: 'Along the south coast, we cover Chichester and the surrounding areas of West Sussex within our two-hour radius.', nearby: ['hampshire'], towns: ['Chichester', 'Bognor Regis', 'Midhurst', 'Petworth'] },
  { slug: 'bournemouth', name: 'Bournemouth', kind: 'town', county: 'Dorset', intro: 'Bournemouth is our home base, so we can usually respond quickly. We look after homes, rental properties and businesses across Bournemouth, including Westbourne, Boscombe, Southbourne, Winton and Kinson.', nearby: ['poole', 'christchurch', 'new-forest'] },
  { slug: 'poole', name: 'Poole', kind: 'town', county: 'Dorset', intro: 'We work across Poole and the surrounding areas including Broadstone, Parkstone, Canford Cliffs, Sandbanks and Hamworthy.', nearby: ['bournemouth', 'dorchester', 'dorset'] },
  { slug: 'christchurch', name: 'Christchurch', kind: 'town', county: 'Dorset', intro: 'Based close by, we serve Christchurch, Highcliffe, Mudeford, Bransgore and the nearby New Forest villages.', nearby: ['bournemouth', 'new-forest'] },
  { slug: 'dorchester', name: 'Dorchester', kind: 'town', county: 'Dorset', intro: 'We cover Dorchester and the surrounding towns and villages, including Puddletown, Charminster and Maiden Newton.', nearby: ['weymouth', 'poole', 'dorset'] },
  { slug: 'weymouth', name: 'Weymouth', kind: 'town', county: 'Dorset', intro: 'We work throughout Weymouth and Portland, including Preston, Wyke Regis and Chickerell.', nearby: ['dorchester', 'dorset'] },
  { slug: 'new-forest', name: 'the New Forest', kind: 'town', county: 'Hampshire', intro: 'We cover the New Forest, including Lyndhurst, Lymington, Ringwood, Brockenhurst and Fordingbridge, a short drive from our Bournemouth base.', nearby: ['christchurch', 'southampton', 'hampshire'] },
  { slug: 'southampton', name: 'Southampton', kind: 'town', county: 'Hampshire', intro: 'We serve Southampton and neighbouring Eastleigh, Totton, Hedge End and Romsey.', nearby: ['winchester', 'new-forest', 'hampshire'] },
  { slug: 'winchester', name: 'Winchester', kind: 'town', county: 'Hampshire', intro: 'We work in Winchester and the surrounding Hampshire villages, including Alresford, Kings Worthy and Twyford.', nearby: ['southampton', 'hampshire'] },
  { slug: 'salisbury', name: 'Salisbury', kind: 'town', county: 'Wiltshire', intro: 'We serve Salisbury, Wilton, Amesbury and the villages across the surrounding Wiltshire countryside.', nearby: ['wiltshire', 'new-forest'] },
];

const bySlug = Object.fromEntries(places.map((p) => [p.slug, p]));
const rel = (depth, p = '') => '../'.repeat(depth) + p;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function header(depth) {
  const r = (p) => rel(depth, p);
  return `  <header class="site-header">
    <a class="logo" href="${r('')}">Keystone <span>Property Group</span></a>
    <nav aria-label="Main">
      <a href="${r('bathrooms/')}">Bathrooms</a>
      <a href="${r('kitchens/')}">Kitchens</a>
      <a href="${r('security/')}">Security</a>
      <a href="${r('maintenance/')}">Maintenance</a>
      <a href="${r('water/')}">Water</a>
      <a href="${r('roofing/')}">Roofing</a>
      <a href="${r('entertainment/')}">Entertainment</a>
      <a class="btn btn-small" href="${r('#contact')}">Get a quote</a>
    </nav>
  </header>`;
}

function footer(depth) {
  return `  <footer>
    <p>&copy; <span id="year"></span> Keystone Property Group. Property services across Bournemouth, Dorset, Hampshire and the south of England.</p>
  </footer>
  <script src="${rel(depth, 'script.js')}"></script>`;
}

function page({ title, desc, urlPath, depth, body, jsonld, theme = '' }) {
  const url = SITE + urlPath;
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="en_GB">
  <link rel="stylesheet" href="${rel(depth, 'styles.css')}">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body${theme ? ` class="${theme}"` : ''}>
${header(depth)}

  <main>
${body}
  </main>

${footer(depth)}
</body>
</html>
`;
}

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + p })),
  };
}

function areaLinks(slugs, depth) {
  return slugs
    .map((s) => bySlug[s])
    .filter(Boolean)
    .map((p) => `<a href="${rel(depth, `areas/${p.slug}/`)}">${esc(p.name)}</a>`)
    .join('');
}

function placePage(p) {
  const depth = 2;
  const where = p.kind === 'town' ? `${p.name}${p.county ? ', ' + p.county : ''}` : p.name;
  const title = `Plumber, Roofer & Home Improvements in ${p.name} | Keystone Property Group`;
  const desc = `Keystone Property Group provides plumbing, leak detection, roofing, security, home cinema and home improvements in ${where}. Free quotes from a Bournemouth-based team.`;
  const cards = services
    .map((s) => `        <li><h3><a href="${rel(depth, s.path + '/')}">${esc(s.label)} in ${esc(p.name)}</a></h3><p>Professional ${s.short} for homes and businesses in ${esc(p.name)}.</p></li>`)
    .join('\n');
  const townList = p.towns
    ? `    <section class="sub reveal">
      <div><h2>Towns we cover in ${esc(p.name)}</h2><p>We regularly travel to the following places and the villages around them.</p></div>
      <ul class="chips">${p.towns.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>
`
    : '';
  const body = `    <section class="page-hero theme-water">
      <p class="crumbs"><a href="${rel(depth, '')}">Home</a> / <a href="${rel(depth, 'areas/')}">Areas</a> / ${esc(p.name)}</p>
      <h1>Property services in ${esc(p.name)}</h1>
      <p class="lead">${esc(p.intro)}</p>
      <div class="actions"><a class="btn btn-light" href="${rel(depth, '#contact')}">Get a free quote in ${esc(p.name)}</a></div>
    </section>

    <section class="sub reveal">
      <div>
        <h2>What we do in ${esc(p.name)}</h2>
        <p>One local team for water, bathrooms, kitchens, security, home entertainment, roofing and property maintenance. Pick a service to see what we offer.</p>
      </div>
      <ul class="points">
${cards.replace(/<li><h3>/g, '<li><strong>').replace(/<\/h3><p>/g, '</strong><span>').replace(/<\/p><\/li>/g, '</span></li>')}
      </ul>
    </section>

${townList}    <section class="sub reveal">
      <div><h2>Also covering nearby areas</h2><p>Our service area reaches around two hours from Bournemouth.</p></div>
      <ul class="chips chips-links">${areaLinks(p.nearby, depth).replace(/<a /g, '<li><a ').replace(/<\/a>/g, '</a></li>')}<li><a href="${rel(depth, 'areas/')}">All areas</a></li></ul>
    </section>

    <section class="cta">
      <h2>Need a quote in ${esc(p.name)}?</h2>
      <p>Tell us what you need and we'll get back to you with a free, no-obligation quote.</p>
      <a class="btn btn-light" href="${rel(depth, '#contact')}">Request a free quote</a>
    </section>`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': BUSINESS_ID,
        name: 'Keystone Property Group',
        url: SITE + '/',
        areaServed: { '@type': p.kind === 'county' ? 'AdministrativeArea' : 'City', name: p.name },
      },
      breadcrumb([['Home', '/'], ['Areas', '/areas/'], [p.name, `/areas/${p.slug}/`]]),
    ],
  };
  return page({ title, desc, urlPath: `/areas/${p.slug}/`, depth, body, jsonld });
}

function hubPage() {
  const depth = 1;
  const counties = places.filter((p) => p.kind === 'county');
  const towns = places.filter((p) => p.kind === 'town');
  const body = `    <section class="page-hero theme-water">
      <p class="crumbs"><a href="../">Home</a> / Areas</p>
      <h1>Areas we cover across the south of England</h1>
      <p class="lead">Based in Bournemouth, we provide water, bathrooms, security, home entertainment, roofing and home improvement services within around two hours of Bournemouth.</p>
    </section>

    <section class="sub reveal">
      <div><h2>Counties</h2><p>Our main service areas across the south of England.</p></div>
      <ul class="chips chips-links">${counties.map((p) => `<li><a href="${p.slug}/">${esc(p.name)}</a></li>`).join('')}</ul>
    </section>

    <section class="sub reveal">
      <div><h2>Towns and local areas</h2><p>Where we work most often.</p></div>
      <ul class="chips chips-links">${towns.map((p) => `<li><a href="${p.slug}/">${esc(p.name.replace(/^the /, ''))}</a></li>`).join('')}</ul>
    </section>

    <section class="sub reveal">
      <div><h2>Not listed?</h2><p>If you're within roughly two hours of Bournemouth, we can probably help. Get in touch and we'll confirm.</p></div>
      <div><a class="btn" href="../#contact">Ask about your area</a></div>
    </section>`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': BUSINESS_ID,
        name: 'Keystone Property Group',
        url: SITE + '/',
        areaServed: counties.map((c) => ({ '@type': 'AdministrativeArea', name: c.name })),
      },
      breadcrumb([['Home', '/'], ['Areas', '/areas/']]),
    ],
  };
  return page({
    title: 'Areas We Cover: Bournemouth, Dorset, Hampshire & Southern England | Keystone',
    desc: 'Keystone Property Group serves Bournemouth, Dorset, Hampshire, Wiltshire, Somerset and West Sussex, covering a two-hour radius from Bournemouth.',
    urlPath: '/areas/',
    depth,
    body,
    jsonld,
  });
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

write(path.join(__dirname, 'areas', 'index.html'), hubPage());
places.forEach((p) => write(path.join(__dirname, 'areas', p.slug, 'index.html'), placePage(p)));

const urls = ['/', ...services.map((s) => `/${s.path}/`), '/security/bournemouth/', '/security/south-england/', '/areas/', ...places.map((p) => `/areas/${p.slug}/`)];
write(
  path.join(__dirname, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    '\n</urlset>\n'
);
write(path.join(__dirname, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Generated ${places.length + 1} area pages, sitemap.xml and robots.txt`);
