import Message from '../models/Message.ts';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '../models/User.ts';
import cloudinary from '../lib/cloudinary.ts';
import { getReceiverSocketIds, io } from '../lib/socket.ts';

const MESSAGES_PER_PAGE = 50;

export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log('Error fetching getAllContacts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMessagesByUserId = async (req: Request, res: Response) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    if (typeof userToChatId !== 'string' || !Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const skip = (page - 1) * MESSAGES_PER_PAGE;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(MESSAGES_PER_PAGE);

    const total = await Message.countDocuments({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json({
      messages: messages.reverse(),
      hasMore: skip + MESSAGES_PER_PAGE < total,
      page,
      total,
    });
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
    const normalizedText = typeof text === 'string' ? text.trim() : '';

    if (!normalizedText && !image) {
      return res
        .status(400)
        .json({ error: 'Message must contain text or an image' });
    }

    if (typeof receiverId !== 'string' || !Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: 'Invalid receiver id' });
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
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: normalizedText,
      image: imageUrl,
    });

    await newMessage.save();

    getReceiverSocketIds(receiverId).forEach((socketId) => {
      io.to(socketId).emit('newMessage', newMessage);
    });

    res.status(201).json(newMessage);
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error in sendMessage controller: ', error.message);
    } else {
      console.log('Error in sendMessage controller: ', error);
    }

    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getChatPartners = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user._id;

    // Use MongoDB aggregation to efficiently get distinct chat partners
    const partnerIds = await Message.distinct('senderId', {
      receiverId: loggedInUserId,
    });
    const sentToIds = await Message.distinct('receiverId', {
      senderId: loggedInUserId,
    });

    const allPartnerIds = [...new Set([...partnerIds, ...sentToIds])];

    const chatPartners = await User.find({
      _id: { $in: allPartnerIds },
    }).select('-password');

    res.status(200).json(chatPartners);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in getChatPartners: ', error.message);
    } else {
      console.log('Error in getChatPartners: ', error);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
