# 📚 DATABASE SCHEMA DUMP COMMANDS (KHO THƯ VIỆN LỆNH TÁI SỬ DỤNG)

Tài liệu này lưu trữ các câu lệnh và công cụ để trích xuất cấu trúc cơ sở dữ liệu (Database Schema Only) từ Supabase Cloud về máy local phục vụ việc lưu trữ, kiểm tra và so sánh.

---

## 1. Sử dụng lệnh `pg_dump` tiêu chuẩn (Khi phiên bản local khớp với Cloud)

Sử dụng lệnh này khi máy local của bạn đã cài đặt phiên bản PostgreSQL tương ứng hoặc mới hơn phiên bản PostgreSQL trên Supabase Cloud (ví dụ: Postgres 17).

### Câu lệnh:
```bash
# Lấy DATABASE_URL từ Supabase Dashboard → Settings → Database → Connection string
# Thay thế [PASSWORD] và [PROJECT_REF] bằng thông tin dự án của bạn
pg_dump \
  "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-acl \
  -f schema_cloud.sql
```

---

## 2. Giải pháp thay thế nâng cao: Node.js Custom Schema Dumper (Bypass Version Mismatch)

Khi gặp lỗi không khớp phiên bản giữa máy khách và máy chủ (`pg_dump: error: aborting because of server version mismatch`), sử dụng đoạn mã Node.js để kết nối trực tiếp và trích xuất schema sạch đẹp mà không cần cài đặt nhị phân `pg_dump`.

### Tập tin lưu trữ:
👉 [dump_schema.js](file:///c:/Users/Dell/Desktop/GITHUB%20CODE/1SPA/scratch/dump_schema.js)

### Cách chạy:
```bash
node scratch/dump_schema.js
```

### Mã nguồn script `scratch/dump_schema.js`:
```javascript
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DIRECT_URL or DATABASE_URL is missing in .env.local!');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Successfully connected!');

    let sqlOutput = `-- =========================================================\n`;
    sqlOutput += `-- Supabase Cloud Database Schema (Extracted dynamically)\n`;
    sqlOutput += `-- Date: \${new Date().toISOString()}\n`;
    sqlOutput += `-- =========================================================\n\n`;

    // 1. Fetch all custom enums / types
    const typesRes = await client.query(\`
      SELECT t.typname AS type_name, 
             string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname;
    \`);

    if (typesRes.rows.length > 0) {
      sqlOutput += \`-- CUSTOM ENUMS/TYPES\n\`;
      for (const row of typesRes.rows) {
        sqlOutput += \`CREATE TYPE \${row.type_name} AS ENUM (\${row.enum_values.split(', ').map(v => \`'\${v}'\`).join(', ')});\n\`;
      }
      sqlOutput += \`\n\`;
    }

    // 2. Fetch all public tables
    const tablesRes = await client.query(\`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    \`);

    for (const tableRow of tablesRes.rows) {
      const tableName = tableRow.table_name;
      sqlOutput += \`-- TABLE: \${tableName}\n\`;
      sqlOutput += \`CREATE TABLE public.\${tableName} (\n\`;

      // Fetch columns
      const colsRes = await client.query(\`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = \$1
        ORDER BY ordinal_position;
      \`, [tableName]);

      const colDefs = [];
      for (const col of colsRes.rows) {
        let def = \`    \${col.column_name} \${col.data_type}\`;
        if (col.character_maximum_length) {
          def += \`(\${col.character_maximum_length})\`;
        }
        if (col.is_nullable === 'NO') {
          def += \` NOT NULL\`;
        }
        if (col.column_default) {
          def += \` DEFAULT \${col.column_default}\`;
        }
        colDefs.push(def);
      }

      // Fetch constraints
      const consRes = await client.query(\`
        SELECT tc.constraint_name, tc.constraint_type, 
               kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public' AND tc.table_name = \$1;
      \`, [tableName]);

      const constraintDefs = [];
      const processedConstraints = new Set();

      for (const con of consRes.rows) {
        if (processedConstraints.has(con.constraint_name)) continue;
        processedConstraints.add(con.constraint_name);

        if (con.constraint_type === 'PRIMARY KEY') {
          constraintDefs.push(\`    CONSTRAINT \${con.constraint_name} PRIMARY KEY (\${con.column_name})\`);
        } else if (con.constraint_type === 'FOREIGN KEY') {
          constraintDefs.push(\`    CONSTRAINT \${con.constraint_name} FOREIGN KEY (\${con.column_name}) REFERENCES public.\${con.foreign_table}(\${con.foreign_column})\`);
        } else if (con.constraint_type === 'UNIQUE') {
          constraintDefs.push(\`    CONSTRAINT \${con.constraint_name} UNIQUE (\${con.column_name})\`);
        }
      }

      // Fetch Check Constraints
      const checkRes = await client.query(\`
        SELECT cc.constraint_name, cc.check_clause
        FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_schema = 'public' AND tc.table_name = \$1;
      \`, [tableName]);

      for (const check of checkRes.rows) {
        constraintDefs.push(\`    CONSTRAINT \${check.constraint_name} CHECK (\${check.check_clause})\`);
      }

      const allDefs = colDefs.concat(constraintDefs);
      sqlOutput += allDefs.join(',\\n') + '\\n);\\n\\n';
    }

    // 3. Fetch Views
    const viewsRes = await client.query(\`
      SELECT viewname, definition 
      FROM pg_views 
      WHERE schemaname = 'public'
      ORDER BY viewname;
    \`);

    for (const view of viewsRes.rows) {
      sqlOutput += \`-- VIEW: \${view.viewname}\n\`;
      sqlOutput += \`CREATE OR REPLACE VIEW public.\${view.viewname} AS\\n\${view.definition.trim()};\\n\\n\`;
    }

    // 4. Fetch Indexes
    const indexesRes = await client.query(\`
      SELECT indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname;
    \`);

    if (indexesRes.rows.length > 0) {
      sqlOutput += \`-- INDEXES\n\`;
      for (const idx of indexesRes.rows) {
        sqlOutput += \`\${idx.indexdef};\n\`;
      }
      sqlOutput += \`\n\`;
    }

    const outputPath = path.join(__dirname, '../schema_cloud.sql');
    fs.writeFileSync(outputPath, sqlOutput, 'utf8');
    console.log(\`✓ Database schema successfully dumped to \${outputPath}!\`);

  } catch (err) {
    console.error('Error generating schema:', err);
  } finally {
    await client.end();
  }
}

main();
```
