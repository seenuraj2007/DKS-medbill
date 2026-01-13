import db from './db'

export function migrateMultiUserSupport() {
  try {
    console.log('Starting multi-user authentication migration...')

    // 1. Add organization/team support
    addColumnIfNotExists('users', 'organization_id', 'INTEGER')
    addColumnIfNotExists('users', 'role', "TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer'))")
    addColumnIfNotExists('users', 'status', "TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive'))")
    addColumnIfNotExists('users', 'invited_by', 'INTEGER')
    addColumnIfNotExists('users', 'invitation_token', 'TEXT')
    addColumnIfNotExists('users', 'invited_at', 'DATETIME')

    // 2. Create organizations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        owner_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `)

    // 3. Create team_invitations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS team_invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
        invited_by INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `)

    // 4. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
      CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
      CREATE INDEX IF NOT EXISTS idx_users_invitation_token ON users(invitation_token);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
    `)

    // 5. Create default organization for existing users
    const existingUsers = db.prepare(`
      SELECT id, full_name
      FROM users
      WHERE organization_id IS NULL
    `).all() as { id: number, full_name: string }[]

    existingUsers.forEach(user => {
      const orgName = user.full_name ? `${user.full_name}'s Organization` : 'My Organization'
      
      // Create organization
      const orgResult = db.prepare(`
        INSERT INTO organizations (name, owner_id)
        VALUES (?, ?)
      `).run(orgName, user.id)

      const orgId = orgResult.lastInsertRowid as number

      // Update user with organization and owner role
      db.prepare(`
        UPDATE users
        SET organization_id = ?, role = 'owner'
        WHERE id = ?
      `).run(orgId, user.id)

      console.log(`Created organization for user ${user.id}`)
    })

    // 6. Add foreign key constraint for users.organization_id
    try {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        
        -- Recreate users table with proper foreign key
        CREATE TABLE IF NOT EXISTS users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          full_name TEXT,
          organization_id INTEGER,
          role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
          status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
          invited_by INTEGER,
          invitation_token TEXT,
          invited_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
          FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL
        );

        -- Copy data
        INSERT INTO users_new (id, email, password, full_name, organization_id, role, status, invited_by, invitation_token, invited_at, created_at)
        SELECT id, email, password, full_name, organization_id, 
               COALESCE(role, 'owner'), COALESCE(status, 'active'),
               invited_by, invitation_token, invited_at, created_at
        FROM users;

        -- Drop old table
        DROP TABLE users;

        -- Rename new table
        ALTER TABLE users_new RENAME TO users;

        -- Recreate indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

        PRAGMA foreign_keys = ON;
      `)
      console.log('Updated users table with proper foreign keys')
    } catch (error) {
      console.log('Users table may already be updated:', error)
    }

    console.log('Multi-user authentication migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

function addColumnIfNotExists(tableName: string, columnName: string, columnDefinition: string) {
  try {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[]
    const columnExists = result.some(col => col.name === columnName)
    
    if (!columnExists) {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`).run()
      console.log(`Added column ${columnName} to table ${tableName}`)
    }
  } catch (error) {
    console.log(`Column ${columnName} may already exist in table ${tableName}`)
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateMultiUserSupport()
}
