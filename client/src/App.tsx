import {Container, Stack } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { BlogContextProvider } from './components/context/BlogContext';

function App() {
  //const bg = useColorModeValue("gray.700", "gray.400");
  return (
    <BlogContextProvider>
      <Stack h="100vh">
        <Navbar />
        <Container>
          <TodoForm/>
          <TodoList/>
        </Container>
      </Stack>
    </BlogContextProvider>
  )
}

export default App
