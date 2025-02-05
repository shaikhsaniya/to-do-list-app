import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

interface User {
  photoURL?: string
  _id?: string
  name: string
  email: string
  token?: string
  uid?: string // for Firebase users
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
}

const BASE_URL = 'https://todo-crud-apis-with-auth.onrender.com/api/v1/auth';

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }
    return data
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }
    return data
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await signOut(auth) // Sign out from Firebase if using OAuth
  } catch (error) {
    console.log('Not a Firebase user, continuing with normal logout')
  }
  localStorage.removeItem('token')
  localStorage.removeItem('userData')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload) {
        // Handle Firebase user
        if (action.payload.uid) {
          state.user = {
            uid: action.payload.uid,
            name: action.payload.displayName || 'User',
            email: action.payload.email || '',
            photoURL: action.payload.photoURL
          }
        } else {
          // Handle REST API user
          state.user = action.payload
        }
      } else {
        state.user = null
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Registration failed'
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false
        state.user = null
        localStorage.removeItem('token')
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Logout failed'
      })
  }
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer
