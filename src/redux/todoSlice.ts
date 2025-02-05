import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// interfaces for Todo
interface Todo {
  id: string;
  todo: string;
  completed: boolean
  isEditing: boolean
}

interface TodoState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

const BASE_URL = 'https://dummyjson.com/todos';

// Fetch all items
export const fetchTodos = createAsyncThunk<Todo[]>("todos", async () => {
  const response = await fetch(`${BASE_URL}`);
  const data = await response.json();
  return data.todos; // Extract the array
});

//  Create a new todo
export const createTodo = createAsyncThunk<Todo, { todo: string }>(
  "todos/add",
  async (todoData) => {
    const response = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...todoData,
        completed: false, // Default value
        userId: 1, // Default value
      }),
    });
    const data = await response.json();

  return data.todos; // Extract the array
  }
);

// Update a todo
export const updateTodo = createAsyncThunk<
  Todo,
  { id: string; newData: { todo: string; completed?: boolean } }
>("todos/updateTodo", async ({ id, newData }) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });
  return response.json();
});

// Delete a todo
export const deleteTodo = createAsyncThunk<string, string>("todos/deleteTodo", async (id) => {
  await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return id; // Return ID to remove from frontend state
});

// Define initial state
const initialState: TodoState = {
  items: [],
  loading: false,
  error: null,
};

// Create Redux slice
const todoSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setEditing: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.isEditing = true;
      }
    },
    clearEditing: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.isEditing = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch items";
      })
      .addCase(createTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create todo";
      })
      .addCase(createTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.items.findIndex((todo) => todo.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        state.loading = false;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create todo";
      })
      .addCase(updateTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter((todo) => todo.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create todo";
      })
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
  },
});

export const { setEditing, clearEditing } = todoSlice.actions;
export default todoSlice.reducer;
