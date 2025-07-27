// src/lib/init-storage.js
import { initializeStorage } from './storage'

// Initialize storage bucket on app startup
export const initStorage = async () => {
  try {
    await initializeStorage()
    console.log('Storage bucket initialized successfully')
  } catch (error) {
    console.error('Failed to initialize storage bucket:', error)
  }
}

// Call initialization when this module is imported
if (typeof window !== 'undefined') {
  // Only run on client side
  initStorage()
} 