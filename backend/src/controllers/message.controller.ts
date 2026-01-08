import Message from '../models/Message.ts';
import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User from '../models/User.ts';
import cloudinary from '../lib/cloudinary.ts';

export const getAlLContacts = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log('Error fetching getAlLContacts:', error);
  }
};

export const getMessagesByUserId = async (req: Request, res: Response) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error fetching messages by user ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const sentMessage = async (req: Request, res: Response) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = (req.user as { _id: Types.ObjectId })._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ error: 'Message must contain text or an image' });
    }

    if (senderId.equals(receiverId)) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary and get url
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: send message in real time if user is online using socketIO
    res.status(201).json(newMessage);
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error in sendMEssage controller: ', error.message);
    } else {
      console.log('Error in sendMessage controller: ', error);
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getChatPartners = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = (req.user as { _id: string })._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select('-password');

    res.status(200).json(chatPartners);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getChatPartners: ', error.message);
    } else {
      console.log('Error in sendMessage controller: ', error);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
