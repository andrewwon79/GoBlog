import { Badge, Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useColorModeValue } from "./ui/color-mode";
import { useContext, useState } from "react";
import BlogURL from "@/apis/BlogURL";
import type { AxiosResponse } from "axios";
import { BlogContext } from "./context/BlogContext";


//so if I want all the fields from the backend nicely in item
//I need to create a seperate props here AND if I want to include anything else(like index if I want a numbered list)
//I define that in here too
//but my CONTEXT WILL ONLY HAVE WHAT THE BACKEND BRINGS IN
export interface TodoItemProps {
  index: number;
  item: {
    id: number;
    body: string;
    completed: boolean;
  };
}


const TodoItem: React.FC<TodoItemProps> = ({ index,item }) => {
	const [isUpdating, setIsUpdating] = useState<boolean>(false);
	const {todos, setTodos} = useContext(BlogContext);
	const [isDeleting, setIsDeleting] = useState<boolean>(false); 

	const updateToDo = async (e: React.FormEvent,id: number) => {
		try {
			e.preventDefault();
			setIsUpdating(true);
			//in typescript we cannot just use const response
			//it requires a type defined, we can either make a struct if we know what data is being returned, or use axiosresponse
			const response: AxiosResponse = await BlogURL.patch(`/${id}`, {
				completed: true, // or toggle: !item.completed if you want to flip it
				
			});
			
			//updating the list again for our user
			console.log("Updated:", response.data);
			const response2: AxiosResponse = await BlogURL.get("/");
			setTodos(response2.data.data.todos);

			// Optionally update local state or refetch todos
		}
		catch (error) {
			console.error("Error updating todo:", error);
		}
		finally {
			setIsUpdating(false);
		}
    };

	const deleteToDo = async (e: React.FormEvent,id: number) => {
		try {
			e.preventDefault();
			setIsDeleting(true);
			//in typescript we cannot just use const response
			//it requires a type defined, we can either make a struct if we know what data is being returned, or use axiosresponse
			const response: AxiosResponse = await BlogURL.delete(`/${id}`);
			
			//updating the list again for our user
			console.log(response.data);
			const response2: AxiosResponse = await BlogURL.get("/");
			console.log(response2.data);
			setTodos(response2.data.data.todos);

			// Optionally update local state or refetch todos
		}
		catch (error) {
			console.error("Error deleting todo:", error);
		}
		finally {
			setIsDeleting(false);
		}
    };

	return (
		<Flex gap={2} alignItems={"center"}>
			<Flex
                bg={useColorModeValue("gray.400", "gray.700")}
				flex={1}
				alignItems={"center"}
				borderWidth={"3px"}
				borderColor={"gray.600"}
				p={2}
				borderRadius={"lg"}
				justifyContent={"space-between"}
			>
				<Text
					color={item.completed ? "green.200" : "yellow.100"}
					textDecoration={item.completed ? "line-through" : "none"}
				>
					{item.body}
				</Text>
				{item.completed && (
					<Badge ml='1' colorScheme='green'>
						Done
					</Badge>
				)}
				{!item.completed && (
					<Badge ml='1' colorScheme='yellow'>
						In Progress
					</Badge>
				)}
			</Flex>
			<Flex gap={2} alignItems={"center"}>
				<Box color={"green.500"} cursor={"pointer"} onClick={(e) => updateToDo(e,item.id)}>
					{!isUpdating && <FaCheckCircle size={20} />}
					{isUpdating &&  <Spinner size={"sm"}/>}
				</Box>
				<Box color={"red.500"} cursor={"pointer"} onClick={(e) => deleteToDo(e,item.id)}>
					{!isDeleting && <MdDelete size={25} />}
					{isDeleting && <Spinner size={"sm"}/>}
				</Box>
			</Flex>
		</Flex>
	);
};
export default TodoItem;