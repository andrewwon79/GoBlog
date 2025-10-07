 import BlogURL from "@/apis/BlogURL";
import { Button, Container, Flex, Input,Spinner } from "@chakra-ui/react";
 import { useContext, useState } from "react";
 import { IoMdAdd } from "react-icons/io";
import { BlogContext } from "./context/BlogContext";

 const TodoForm = () => {
 	const [isPending, setIsPending] = useState<boolean>(false);
    const {addTodos} = useContext(BlogContext);
    const [body,setBody] = useState<string>("");


    const createTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            const response = await BlogURL.post("/",{
                /** the name,location, and price_range is what our backend expects data to be coming in, if we want to send in 4, its going to be price_range=4 */
                /** javascript short hand is that, if what state we're passing in matches what  */
                body
            });
            addTodos(response.data);
            setBody(""); // ✅ Clear the input field
        }catch(err){
            console.error("Error creating todo:", err);
        }
    }

/*  	const createTodo = async (e: React.FormEvent) => {
 		e.preventDefault();
 		alert("Todo added!");
 	}; */

    
 	return (
        <Container maxW={"600px"}>
            <form onSubmit={createTodo}>
                <Flex gap={2} alignItems={"center"} justifyContent={"space-between"}>
                    <Input
                        type='text'
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        ref={(input) => {
                            if (input) input.focus(); // ✅ no return value
                        }}
                        borderWidth={"2px"} 
                    />
                    <Button
                        mx={2}
                        type='submit'
                        _active={{
                            transform: "scale(.97)",
                        }}
                    >
                        {isPending ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
                    </Button>
                </Flex>
            </form>
        </Container>
 		
 	);
 };
 export default TodoForm;