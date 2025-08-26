#!/usr/bin/env node

/**
 * Database backup utility with timestamp
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
  
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    console.log('🔄 Creating database backup...');
    
    // Read DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    // Create backup using pg_dump
    execSync(`pg_dump "${databaseUrl}" > "${backupFile}"`, {
      stdio: 'inherit'
    });
    
    console.log(`✅ Backup created successfully: ${backupFile}`);
    console.log(`📊 File size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
    
    // Keep only last 10 backups
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup_') && file.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️  Deleted old backup: ${file}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function restoreBackup(backupFile) {
  if (!backupFile) {
    console.error('❌ Please provide a backup file');
    console.log('Usage: npm run db:restore backup_file.sql');
    process.exit(1);
  }
  
  if (!fs.existsSync(backupFile)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    process.exit(1);
  }
  
  try {
    console.log(`🔄 Restoring database from: ${backupFile}`);
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }
    
    // Restore using psql
    execSync(`psql "${databaseUrl}" < "${backupFile}"`, {
      stdio: 'inherit'
    });
    
    console.log('✅ Database restored successfully');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'backup':
    createBackup();
    break;
  case 'restore':
    restoreBackup(arg);
    break;
  default:
    console.log('Usage:');
    console.log('  npm run db:backup           - Create a backup');
    console.log('  npm run db:restore <file>   - Restore from backup');
}
