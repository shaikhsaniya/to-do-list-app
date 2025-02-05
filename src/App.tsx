import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, githubProvider } from './config/firebase'
import { setUser, logoutUser } from './redux/authSlice'
import { AppDispatch, RootState } from './redux/store'
import './App.css'
import TodoList from './components/Todolist'
import AuthForm from './components/AuthForm'

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch(setUser(firebaseUser))
    })

    return () => unsubscribe()
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      dispatch(setUser(result.user))
    } catch (error: any) {
      console.error('Google sign in failed:', error.message)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider)
      dispatch(setUser(result.user))
    } catch (error: any) {
      console.error('GitHub sign in failed:', error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
    } catch (error: any) {
      console.error('Sign out failed:', error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {!user ? (
          <AuthForm
            onGoogleSignIn={handleGoogleSignIn}
            onGithubSignIn={handleGithubSignIn}
          />
        ) : (
          <>
            <div className="flex flex-col justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {user?.photoURL && (
                  <img
                    src={user?.photoURL}
                    alt={user?.name}
                    className="w-15 h-20 rounded-full"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Todo List</h1>
            </div>
            <TodoList />
          </>
        )}
      </div>
    </div>
  )
}

export default App
