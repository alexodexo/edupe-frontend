// src/lib/supabase-config.js
// Supabase Authentication Configuration

export const AUTH_CONFIG = {
  // Email confirmation settings
  emailConfirmation: {
    enabled: true,
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
  },

  // Password requirements
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // Session settings
  session: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },

  // Security settings
  security: {
    enableMFA: false, // Can be enabled later
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // User roles
  roles: {
    admin: 'admin',
    helper: 'helper',
    jugendamt: 'jugendamt'
  },

  // Email templates (for Supabase dashboard configuration)
  emailTemplates: {
    confirmation: {
      subject: 'Bestätigen Sie Ihre E-Mail-Adresse - Edupe Digital',
      template: 'confirm-signup'
    },
    resetPassword: {
      subject: 'Passwort zurücksetzen - Edupe Digital',
      template: 'reset-password'
    },
    invite: {
      subject: 'Einladung zu Edupe Digital',
      template: 'invite-user'
    }
  }
}

// Password validation function
export const validatePassword = (password) => {
  const { passwordRequirements } = AUTH_CONFIG
  
  const minLength = password.length >= passwordRequirements.minLength
  const hasUpperCase = passwordRequirements.requireUppercase ? /[A-Z]/.test(password) : true
  const hasLowerCase = passwordRequirements.requireLowercase ? /[a-z]/.test(password) : true
  const hasNumbers = passwordRequirements.requireNumbers ? /\d/.test(password) : true
  const hasSpecialChars = passwordRequirements.requireSpecialChars ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true

  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChars
  }
}

// Role-based permissions
export const PERMISSIONS = {
  admin: [
    'all',
    'manage_users',
    'manage_system',
    'view_all_data',
    'create_reports'
  ],
  helper: [
    'view_own_cases',
    'create_services',
    'view_own_services',
    'edit_own_profile',
    'view_own_reports'
  ],
  jugendamt: [
    'view_own_cases',
    'view_reports',
    'view_invoices',
    'approve_services',
    'edit_own_profile'
  ]
}

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  const userPermissions = PERMISSIONS[userRole] || []
  return userPermissions.includes('all') || userPermissions.includes(permission)
}

// Get user role from auth user
export const getUserRole = async (user) => {
  if (!user) return null

  // Check user metadata first
  if (user.user_metadata?.role) {
    return user.user_metadata.role
  }

  // Fallback to database lookup
  const { supabase } = await import('./supabase')
  
  // Check if user is in helfer table
  const { data: helfer } = await supabase
    .from('helfer')
    .select('helfer_id')
    .eq('email', user.email)
    .single()

  if (helfer) return 'helper'

  // Check if user is in jugendamt_ansprechpartner table  
  const { data: jugendamt } = await supabase
    .from('jugendamt_ansprechpartner')
    .select('ansprechpartner_id')
    .eq('mail', user.email)
    .single()

  if (jugendamt) return 'jugendamt'

  // Default to admin if no specific role found
  return 'admin'
} 