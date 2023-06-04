const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const CryptoJS = require('crypto-js');


const allMessages = asyncHandler(async (req, res) => {
    try {
        
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");

        // const { content } = req.body
        // var decrypted = CryptoJS.AES.decrypt(content, '123');
        // content = decrypted
        res.json(messages);
        
            console.log(messages.sender._id)
       
        // console.log(messages)
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// const allMessages = asyncHandler(async (req, res) => {
//     try {
//         const {from, to} = req.body
//         const messages = await Message.find({ chat: req.params.chatId })
//             .populate("sender", "name pic email")
//             .populate("chat");

//         // Accessing the content field in each message
//         const messagesWithContent = messages.map((message) => {
//             const algorithm = 'aes-256-cbc';
//             const password = 'a password';
//             const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
//             const iv = Buffer.from(msg.message.iv, 'hex');
//             const decipher = crypto.createDecipheriv(algorithm, key, iv);

//             let encrypted = message.content;
//             let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//             decrypted += decipher.final('utf8');

//             return {
//                 fromSelf: msg.sender.toString() === from,
//                 message: decrypted,
//             };
    

//             // Assuming the content field is a property of each message object
//             // const { content } = message;

//             // Decrypt the content if needed
//         //     let enc = message.content
//         //     var decrypted = CryptoJS.AES.decrypt(enc, '123');
//         //     // const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8);

//         //     // Return an object with the original message and the content
//         //     // return {
//         //     //     message,
//         //     //     content: content, // or decryptedContent if decrypted
//         //     // };
//         //     return {
//         //         fromSelf: msg.sender.toString() === sender,
//         //         message: decrypted,
//         //     };

//         });

//         res.json(messagesWithContent);
//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message);
//     }
// });


const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, content } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    
    // var encrypted = CryptoJS.AES.encrypt(content, '123');
    // const algorithm = 'aes-256-cbc';
    // const password = 'a password';
    // const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32);
    // const iv = crypto.randomBytes(16);
    // const cipher = crypto.createCipheriv(algorithm, key, iv);
    // let encrypted = cipher.update(content, 'utf8', 'hex');
    // encrypted += cipher.final('hex');


    var newMessage = {
        sender: req.user._id,
        content: encrypted,
        chat: chatId,
    };
    

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage };