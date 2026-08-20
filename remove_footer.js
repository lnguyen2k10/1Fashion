const fs = require('fs');
const path = require('path');

const files = [
  'src/components/legal/LegalPage.tsx',
  'src/app/(public)/page.tsx',
  'src/app/(public)/offers/page.tsx',
  'src/app/(public)/directory/page.tsx',
  'src/app/(public)/demo/page.tsx',
  'src/app/(public)/blog/page.tsx',
  'src/app/(public)/blog/[slug]/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/import \{ Footer \} from '@\/components\/home\/Footer'[\r\n]*/g, '');
    content = content.replace(/<Footer \/>/g, '');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Processed ' + file);
  }
});
