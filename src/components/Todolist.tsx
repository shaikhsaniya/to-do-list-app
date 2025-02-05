import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  setEditing,
  clearEditing
} from '../redux/todoSlice'
import { RootState, AppDispatch } from '../redux/store'
import { motion, AnimatePresence } from 'framer-motion'

interface Todo {
  id: string
  todo: string
  completed: boolean
  isEditing: boolean
}

const TodoList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error } = useSelector(
    (state: RootState) => state.todos
  )
  const [newTodo, setNewTodo] = useState('')
  const [editText, setEditText] = useState('')

  useEffect(() => {
    dispatch(fetchTodos()) // Fetch todos on mount
  }, [dispatch])

  const handleStartEditing = (todo: Todo) => {
    setEditText(todo.todo)
    dispatch(setEditing(todo.id))
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim()) {
      const resultAction = await dispatch(createTodo({ todo: newTodo }))
      if (createTodo.fulfilled.match(resultAction)) {
        setNewTodo('')
        dispatch(fetchTodos())
      }
    }
  }

  const handleUpdateTodo = async (todo: Todo) => {
    if (editText.trim()) {
      const resultAction = await dispatch(
        updateTodo({ id: todo.id, newData: { todo: editText.trim() } })
      )
      if (updateTodo.fulfilled.match(resultAction)) {
        dispatch(clearEditing(todo.id))
        dispatch(fetchTodos())
      }
    }
  }

  const handleDeleteTodo = (id: string) => {
    dispatch(deleteTodo(id))
  }

  const handleToggleComplete = async (todo: Todo) => {
    const resultAction = await dispatch(
      updateTodo({
        id: todo.id,
        newData: { todo: todo.todo, completed: !todo.completed }
      })
    )
    if (updateTodo.fulfilled.match(resultAction)) {
      dispatch(fetchTodos())
    }
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Add a new todo..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <AnimatePresence>
        {items &&
          items?.map((todo) => (
            <motion.div
              key={todo?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-3 border-b py-3"
            >
              <input
                type="checkbox"
                checked={todo?.completed}
                onChange={() => handleToggleComplete(todo)}
                className="w-5 h-5 rounded border-gray-300 focus:ring-blue-500"
              />

              {todo?.isEditing ? (
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateTodo(todo)}
                    className="text-gray-500 hover:text-green-500 transition-colors"
                  >
                    💾
                  </button>
                </div>
              ) : (
                <span
                  className={`flex-1 ${
                    todo?.completed ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {todo?.todo}
                </span>
              )}

              <div className="flex gap-2">
                {!todo?.isEditing && (
                  <button
                    onClick={() => handleStartEditing(todo)}
                    className="text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTodo(todo?.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}

export default TodoList
