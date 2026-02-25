// Script to add missing columns to the Player table
import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
console.log(`Opening database at: ${dbPath}`);

try {
  const db = new Database(dbPath);
  
  // Check if columns exist
  const tableInfo = db.prepare("PRAGMA table_info(Player)").all();
  const columnNames = tableInfo.map(col => col.name);
  
  console.log('Current Player table columns:', columnNames);
  
  // Add authSalt column if it doesn't exist
  if (!columnNames.includes('authSalt')) {
    console.log('Adding authSalt column...');
    db.exec('ALTER TABLE Player ADD COLUMN authSalt TEXT');
    console.log('✓ authSalt column added');
  } else {
    console.log('✓ authSalt column already exists');
  }
  
  // Add authHash column if it doesn't exist
  if (!columnNames.includes('authHash')) {
    console.log('Adding authHash column...');
    db.exec('ALTER TABLE Player ADD COLUMN authHash TEXT');
    console.log('✓ authHash column added');
  } else {
    console.log('✓ authHash column already exists');
  }
  
  // Verify the columns were added
  const updatedTableInfo = db.prepare("PRAGMA table_info(Player)").all();
  const updatedColumnNames = updatedTableInfo.map(col => col.name);
  console.log('\nUpdated Player table columns:', updatedColumnNames);
  
  db.close();
  console.log('\n✓ Database update complete!');
} catch (error) {
  console.error('Error updating database:', error);
  process.exit(1);
}
