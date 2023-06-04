import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, Button, FormControl, IconButton, Input, InputGroup, InputRightElement, Spinner, Text, Toast, useToast, Image } from '@chakra-ui/react';
import { ArrowBackIcon, AttachmentIcon, LinkIcon } from '@chakra-ui/icons';
import ProfileModal from './miscellaneous/ProfileModal';
import { getSender, getSenderFull } from '../config/ChatLogics';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css'
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie, {  } from "react-lottie";
import animationData from "../animations/typing.json";
import styled from '@emotion/styled';
const CryptoJS = require('crypto-js');

const ENDPOINT = "http://localhost:5000"

var socket, selectedChatCompare;

function SingleChat({fetchAgain, setFetchAgain}) {
    const[messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const toast = useToast()

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            // var decrypted = CryptoJS.AES.decrypt(data.content, '123');
            // data.content = decrypted;
            // for (let content = 0; content < data.content.length; content++) {
            //     data.content[content] = CryptoJS.AES.decrypt(data.content[content], '123');
                
            // }
            // for (let content =0; in data.content) {
            //     content = CryptoJS.AES.decrypt(content, '123');   
            // }
            setMessages(data);
            
            console.log(data)
            
            
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };



    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    const shareFile = async (pics) => {
        
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                // const data = await axios.post(
                //     "/api/message",
                //     {
                //         content: newMessage,
                //         chatId: selectedChat,
                //     },
                //     config
                // )

                const data = new FormData()
                data.append("file", pics)
            data.append("upload_preset", "Snak-chat-app")
            data.append("upload_name", "Snak")
            fetch("https://api.cloudinary.com/v1_1/snak/image/upload", {
                method: 'post', body: data,
            }).then((res) => res.json())
                .then(data => {
                    setNewMessage(data.url)
                    console.log(data.url)
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err)
                    setLoading(false)
                });

                const mess = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                )
                socket.emit("new message", mess);
                setMessages([...messages, mess]);
            // const data = new FormData()
            // data.append("file", content)
            // data.append("upload_preset", "Snak-chat-app")
            // data.append("upload_name", "Snak")
            // fetch("https://api.cloudinary.com/v1_1/snak/image/upload", {
            //     method: 'post', body: data,
            // }).then((res) => res.json())
            //     .then(data => {
            //         setMessages(data.url.toString())
            //         console.log(data.url.toString())
            //         setLoading(false)
            //     })
            //     .catch((err) => {
            //         console.log(err)
            //         setLoading(false)
            //     })
                }
            catch (error) {
                
                setLoading(false)
            }
        // } else {
        //     setLoading(false)
        //     toast({
        //         title: 'Please Select an Image!',
        //         status: 'warning',
        //         duration: 5000,
        //         isClosable: true,
        //         position: 'bottom'
        //     })
        //     setLoading(false)
        //     return
        }
    }



    const typingHandler = (e) => {
        setNewMessage(e.target.value)
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 2000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
     };

     

  return <>{
    selectedChat?(
        <>
              <Text
                  fontSize={{ base: "28px", md: "30px" }}
                  pb={3}
                  px={2}
                  w={"100%"}
                  fontFamily={"Work sans"}
                  display={"flex"}
                  justifyContent={{ base: "space-between" }}
                  alignItems={"center"}
              >
                  <IconButton
                      d={{ base: "flex", md: "none" }}
                      icon={<ArrowBackIcon />}
                      onClick={() => setSelectedChat("")}
                  />
                  {/* {messages && */}
                      {!selectedChat.isGroupChat ? (
                          <>
                              {getSender(user, selectedChat.users)}
                              <ProfileModal
                                  user={getSenderFull(user, selectedChat.users)}
                              />
                          </>
                      ) : (
                          <>
                              {selectedChat.chatName.toUpperCase()}
                              <UpdateGroupChatModal
                                  fetchMessages={fetchMessages}
                                  fetchAgain={fetchAgain}
                                  setFetchAgain={setFetchAgain}

                              />
                          </>
                      )}
              </Text>

              <Box
                  display={"flex"}
                  flexDir={"column"}
                  justifyContent={"flex-end"}
                  p={3}
                  bg={"#E8E8E8"}
                  w={"100%"}
                  h={"100%"}
                  borderRadius={"lg"}
                  overflowY={"hidden"}
              >
                  {loading ? (
                      <Spinner
                          size={"xl"}
                          w={20}
                          h={20}
                          alignSelf={"center"}
                          margin={"auto"}
                      />
                  ) : (
                    
                      <div className="messages">
                      
                              <ScrollableChat messages={messages}>
                                  {/* {
                                      messages.type === 'file' ? <ImageMessage messages={messages.content} /> : <TextMessage messages={messages.content} />

                                  } */}

                                  {/* if (messages.slice(0,7) === 'http.//' ) {
                                    return(
                                  <Image src = {messages}/>
                                  )}
                             */}
                             
                              </ScrollableChat>
                             
                   
                        
                     
                          </div>
                  )}

                  <FormControl
                      onKeyDown={sendMessage}
                      id={"first-name"}
                      isRequired
                      mt={3}
                  >
                      {isTyping ? (
                          <div>
                              <Lottie
                                  options={defaultOptions}
                                  // height={50}
                                  width={70}
                                  style={{ marginBottom: 15, marginLeft: 0 }}
                              />
                          </div>
                      ) : (
                          <></>
                      )}
                      <InputGroup>
                      <Input
                          variant={"filled"}
                          bg={"#E0E0E0"}
                          placeholder={"Enter a message.."}
                          value={newMessage}
                          onChange={typingHandler}
                      />
                      <InputRightElement width='4.5rem'>
                      <label htmlFor='fileInput'>
                      <LinkIcon boxSize={5} cursor={'pointer'}  />
                              </label>
                              <Input
                              id='fileInput'
                                  type= "file"
                                  p={1.5}
                                  accept='image/*'
                                  onChange={(e) => shareFile(e.target.files[0])}
                                  style={{display: 'none'}}
                                  
                              />
                              
                              
                              {/* <IconButton
                                  icon={<AttachmentIcon />}
                                  
                                  onClick={shareFile}
                              /> */}
                      </InputRightElement>
                      </InputGroup>

                      
                  </FormControl>
              </Box>
        </>
    ) : (
              <Box display={"flex"} alignItems={"center"} justifyContent={"center"} h={"100%"}>
                  <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
                      Click on a user to start chatting
                  </Text>
              </Box>
    )
  }</>
}

const Own = styled(Box)`
    background: #dcf8c6;
    padding: 5px;
    max-width: 60%;
    width: fit-content;
    margin-left: auto;
    display: flex;
    border-radius: 10px;
    word-break: break-word;
`;

const ImageMessage = ({messages}) =>{
    return(
        <Box>
            {
                messages?.text?.includes('.png') ?
                <Box>

                </Box>

                :

                <img src={messages} alt={messages} />
            }
        </Box>
    )
}

const TextMessage = ({messages}) =>{
    return (
        <>
            <Text>{messages}</Text>

        </>
    )
}

export default SingleChat