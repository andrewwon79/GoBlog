import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import BlogURL from "@/apis/BlogURL";
import { BlogContext } from "./context/BlogContext";

const TodoList = () => {
	const [isLoading, setIsLoading] = useState(false);
	//const [todosList,setTodos] = useState([]);
	const {todos, setTodos} = useContext(BlogContext);

	const fetchData = async() => {
		try {
			setIsLoading(true);
			const response = await BlogURL.get("/");
			setTodos(response.data.data.todos)
			console.log(response.data.data.todos);
			//console.log(todos);
			//in the parentheses it'll jam the baseURL from RestaurantFinder and append this extra "/"
		}catch (err) {
			console.log(err);
		}finally {
			setIsLoading(false);
		}
	}   

    useEffect(() => {
        fetchData();
        //this use of fetchData will fix the useEffect must not return anything besides a function
        //useEffect complains if it returns something, but now we are calling fetchdData which returns something and this is ok
    },[]);
    //this ,[] here will only run when we mount the component
    //not having it here will have it run in a loop every time we render component
	return (
		<>
			<Text
				fontSize={"4xl"}
				textTransform={"uppercase"}
				fontWeight={"bold"}
				textAlign={"center"}
				my={2}
				bgGradient="to-l"
                bgClip={"text"} 
                gradientFrom="#07074bff" 
                gradientVia="#0b85f8"
                gradientTo="#0b85f8"
			>				
            Andrew's Tasks
			</Text>
			{isLoading && (
				<Flex justifyContent={"center"} my={4}>
					<Spinner size={"xl"} />
				</Flex>
			)}
			{!isLoading && todos?.length === 0 && (
				<Stack alignItems={"center"} gap='3'>
					<Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
						All tasks completed! 🤞
					</Text>
					<img src='/go.png' alt='Go logo' width={70} height={70} />
				</Stack>
			)}
			<Stack gap={3}>
				
				{todos?.map((todo,i) => (
					<TodoItem key={i} index={i} item={todo} />
				))}
			</Stack>
		</>
	);
};
export default TodoList;