import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Event } from '../src/models/Event.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { Report } from '../src/models/Report.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
  console.error('ABORTED: Seeding is blocked in production environment to prevent data loss.');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing seed data safely
    console.log('[Seed] Cleaning previous records...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Event.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Campus@123', salt);

    const adminUser = await User.create({
      name: 'Campus Dean Office (Admin)',
      email: 'admin@campus.edu',
      passwordHash: defaultPasswordHash,
      department: 'Dean of Student Affairs',
      year: 'Faculty/Staff',
      bio: 'Official campus administrative office. Handling official announcements, university events, and student welfare.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    });

    const studentArjun = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun@campus.edu',
      passwordHash: defaultPasswordHash,
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      bio: 'Tech enthusiast, competitive coder, and guitar player. Hostel 4 resident.',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      role: 'STUDENT',
      isEmailVerified: true,
      isActive: true,
    });

    // Scaler domain alias accounts
    await User.create({
      name: 'Campus Dean Office (Admin)',
      email: 'admin@scaler.com',
      passwordHash: defaultPasswordHash,
      department: 'Dean of Student Affairs',
      year: 'Faculty/Staff',
      bio: 'Official Scaler School of Technology administrative office.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    });

    await User.create({
      name: 'Arjun Sharma',
      email: 'arjun@scaler.com',
      passwordHash: defaultPasswordHash,
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      bio: 'Tech enthusiast, competitive coder, and guitar player.',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      role: 'STUDENT',
      isEmailVerified: true,
      isActive: true,
    });

    const studentPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@campus.edu',
      passwordHash: defaultPasswordHash,
      department: 'Electronics & Communication',
      year: '2nd Year',
      bio: 'Robotics club member, avid book reader, and design hobbyist.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'STUDENT',
      isEmailVerified: true,
      isActive: true,
    });

    const studentRohan = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@campus.edu',
      passwordHash: defaultPasswordHash,
      department: 'Mechanical Engineering',
      year: '4th Year',
      bio: 'Formula student team chassis lead. Passionate about automotive design and badminton.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'STUDENT',
      isEmailVerified: true,
      isActive: true,
    });

    console.log('[Seed] Creating demo listings...');
    const postCalculator = await Post.create({
      author: studentArjun._id,
      type: 'LOST_FOUND',
      title: 'Lost Casio FX-991EX Classwiz Calculator near Library 2nd Floor',
      description: 'Misplaced my calculator on Sunday afternoon during study session at table 14 near the computer section. It has a small blue sticker on the back cover with initials AS.',
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800'],
      tags: ['calculator', 'casio', 'library', 'lost'],
      location: 'Central Library, 2nd Floor',
      status: 'ACTIVE',
      details: {
        itemState: 'LOST',
        dateOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    const postKeys = await Post.create({
      author: studentPriya._id,
      type: 'LOST_FOUND',
      title: 'Found Ring with 2 Keys & Silver Honda Keychain',
      description: 'Found a bunch of keys on the bench near the main cafeteria around 1:30 PM today. Currently kept safely with me. Contact me to verify and collect.',
      category: 'Keys & ID',
      images: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800'],
      tags: ['keys', 'cafeteria', 'found'],
      location: 'Main Student Center Cafeteria',
      status: 'ACTIVE',
      details: {
        itemState: 'FOUND',
        dateOccurred: new Date(),
      },
    });

    const postBooks = await Post.create({
      author: studentRohan._id,
      type: 'MARKETPLACE',
      title: 'Erwin Kreyszig Advanced Engineering Mathematics (10th Ed)',
      description: 'Selling 10th edition in pristine condition. No pen marks or torn pages. Essential for 1st & 2nd year engineering mathematics courses.',
      category: 'Books & Notes',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'],
      tags: ['maths', 'kreyszig', 'textbook', 'engineering'],
      location: 'Hostel 2, Room 304',
      status: 'ACTIVE',
      details: {
        price: 450,
        condition: 'LIKE_NEW',
        itemType: 'Book',
      },
    });

    const postDesk = await Post.create({
      author: studentArjun._id,
      type: 'MARKETPLACE',
      title: 'Foldable Bed Study Table with Cup Holder',
      description: 'Lightweight wooden portable study table with tablet/book groove and cup holder. Used for 1 semester, selling because shifting to a new hostel room with built-in desk.',
      category: 'Hostel & Room',
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
      tags: ['furniture', 'table', 'hostel'],
      location: 'Hostel 4, Block B',
      status: 'ACTIVE',
      details: {
        price: 350,
        condition: 'GOOD',
        itemType: 'Furniture',
      },
    });

    const postHackathon = await Post.create({
      author: studentArjun._id,
      type: 'COLLABORATION',
      title: 'Need Frontend & UI Designer for Smart Campus Hackathon',
      description: 'Forming a 4-member team for HackApex 2026. We are building an IoT-based energy conservation dashboard for campus hostels. Backend in Node.js/Python already underway. Need someone strong in React and Figma.',
      category: 'Hackathons',
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'],
      tags: ['hackathon', 'react', 'figma', 'ui-ux'],
      location: 'Tech Park Lab 3',
      status: 'ACTIVE',
      details: {
        subject: 'Smart Campus IoT & Web Portal',
        skills: ['React', 'CSS', 'Figma', 'REST APIs'],
        availability: 'Weekends & Evenings',
        collaborationType: 'HACKATHON_TEAM',
      },
    });

    const postStudy = await Post.create({
      author: studentPriya._id,
      type: 'COLLABORATION',
      title: 'Daily Study Group for Operating Systems & Computer Networks',
      description: 'Looking for 2-3 dedicated batchmates to solve previous year questions and prepare for mid-terms. Planning to meet in library discussion room Mon/Wed/Fri 6-8 PM.',
      category: 'Study Groups',
      images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'],
      tags: ['os', 'networks', 'study-group', 'exams'],
      location: 'Library Discussion Room B',
      status: 'ACTIVE',
      details: {
        subject: 'CSE/ECE Core Subjects',
        skills: ['Operating Systems', 'Networking', 'C/C++'],
        availability: 'Mon/Wed/Fri 6-8 PM',
        collaborationType: 'STUDY_PARTNER',
      },
    });

    console.log('[Seed] Creating official campus events...');
    const now = new Date();
    await Event.create([
      {
        author: adminUser._id,
        title: 'HackScaler 2026: Annual Inter-College 36hr Hackathon',
        description: 'The flagship hackathon of Scaler School of Technology is back! Compete in AI, Web3, Smart Cities, and Healthcare tracks with prizes over ₹1,50,000. Mentorship from top tech leaders and hiring opportunities for top performers.',
        category: 'Hackathon',
        venue: 'Campus Innovation Center, Auditorium',
        startsAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // in 4 days
        endsAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        registrationUrl: 'https://hackscaler.example.org',
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        status: 'PUBLISHED',
      },
      {
        author: adminUser._id,
        title: 'Hands-on Workshop: Building Full-Stack LLM Apps',
        description: 'Learn modern Generative AI engineering, embeddings, and vector databases with hands-on live code exercises. Open to all branches. Bring your laptops.',
        category: 'Workshop',
        venue: 'Seminar Hall 2, Dept of CSE',
        startsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000),
        registrationUrl: 'https://forms.example.org/llm-workshop',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
        status: 'PUBLISHED',
      },
      {
        author: adminUser._id,
        title: 'Annual Inter-Hostel Badminton & Table Tennis Tournament',
        description: 'Register your hostel teams for the annual sports trophy. Trophies, medals, and refreshments provided. Registration closes Thursday evening.',
        category: 'Sports',
        venue: 'Campus Indoor Sports Complex',
        startsAt: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        endsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800',
        status: 'PUBLISHED',
      },
    ]);

    console.log('[Seed] Creating demo conversation and messages...');
    const conversation = await Conversation.create({
      participants: [studentArjun._id, studentPriya._id],
      post: postCalculator._id,
      lastMessageAt: new Date(),
    });

    const msg1 = await Message.create({
      conversation: conversation._id,
      sender: studentPriya._id,
      text: 'Hey Arjun! Saw your post about the Casio FX-991EX. Is it the black edition with carbon finish?',
      readBy: [studentPriya._id, studentArjun._id],
    });

    const msg2 = await Message.create({
      conversation: conversation._id,
      sender: studentArjun._id,
      text: 'Yes exactly! And it has a blue sticker on the back with "AS" written on it. Did you spot it anywhere?',
      readBy: [studentArjun._id],
    });

    conversation.lastMessage = msg2._id;
    await conversation.save();

    console.log('========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log(' Demo Accounts Created:');
    console.log(' 1) Admin:   admin@campus.edu  |  Password: Campus@123');
    console.log(' 2) Student: arjun@campus.edu  |  Password: Campus@123');
    console.log(' 3) Student: priya@campus.edu  |  Password: Campus@123');
    console.log(' 4) Student: rohan@campus.edu  |  Password: Campus@123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
