import { createContext, useState } from "react";
//the reason why having a context is good, all children can have access to our list of restaurants
//and they can also update it as well



export interface TodoItemProps {
    id: number;
    body: string;
    completed: boolean;
}



// Define the context type
//so this will tell our context what kind of information it will hold
//we're creating a "context" class or struct to pass in
interface BlogContextType {
  todos: TodoItemProps[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItemProps[]>>;
  addTodos: (newTodo: TodoItemProps) => void;
}

//create the context with the struct/class we passed in, we are initializing the default values here
export const BlogContext = createContext<BlogContextType>({
  todos: [],
  setTodos: () => {},
  addTodos: () => {}
});

export const BlogContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //
  const [todos, setTodos] = useState<TodoItemProps[]>([]);

  const addTodos = (newTodo: TodoItemProps) => {
    setTodos(prev => Array.isArray(prev) ? [...prev, newTodo] : [newTodo]);
  };

  return (
    <BlogContext.Provider value={{todos,setTodos,addTodos,}}>
      {children}
    </BlogContext.Provider>
  );
};