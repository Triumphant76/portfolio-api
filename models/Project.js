/* eslint-disable max-len */
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Please add an image of the project'],
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true, // Prevent duplicate titles
    trim: true, // Trim whitespace
    maxlength: [50, 'Title cannot be more than 50 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
