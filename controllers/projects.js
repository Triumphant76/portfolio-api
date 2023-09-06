import { config } from 'dotenv';
import ErrorResponse from '../services/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Project from '../models/Project.js';
import uploader from '../services/cloudinary.js';
import { bufferToDataUri } from '../middleware/multer.js';

config({ path: './.env' });
// config({ path: './config/config.env' }); switch to this in dev mode

// @desc: Add a new project
// @route: POST /api/v1/projects
export const createProject = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image', 400));
  }
  // Convert the uploaded image to data uri using bufferToDataUri function
  const { mimetype, buffer } = req.file;
  const fileFormat = mimetype.split('/')[1];
  const fileData = bufferToDataUri(`.${fileFormat}`, buffer).content;

  // Upload the image to cloudinary using uploader function
  const imageUrl = await uploader(fileData);

  if (!imageUrl) {
    return next(new ErrorResponse('Image upload to cloudinary failed', 500));
  }

  // Create a new project instance using the Project model
  const newProject = {
    image: imageUrl,
    ...req.body,
  };

  // Create and save the project to the database using Project.create()
  const createdProject = await Project.create(newProject);
  res.status(201).json(createdProject);
});

// @desc Get all projects
// @route GET ap1/v1/projects
export const getProjects = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc Get a single project
// @route GET ap1/v1/projects/:id
export const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404),
    );
  }
  res.status(200).json({ success: true, data: project });
});

// @desc Update a project
// @route PUT ap1/v1/projects/:id
export const updateProject = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;

  // Find the project by its ID
  const project = await Project.findById(projectId);

  if (!project) {
    return new ErrorResponse(`Project not found with id of ${projectId}`, 404);
  }

  // Prepare the updated project data
  const updatedProjectData = {
    ...req.body,
  };

  // If an image is provided, upload it to Cloudinary and update the image URL
  if (req.file) {
    const { mimetype, buffer } = req.file;
    const fileFormat = mimetype.split('/')[1];
    const fileData = bufferToDataUri(`.${fileFormat}`, buffer).content;

    try {
      // Upload the image to Cloudinary using uploader function
      const imageUrl = await uploader(fileData);
      updatedProjectData.image = imageUrl;
    } catch (error) {
      console.log(error.message);
      // Handle the error if image upload to Cloudinary fails
      return next(new ErrorResponse('Image upload to cloudinary failed', 500));
    }
  }

  // Update the project and return the updated document
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    updatedProjectData,
    { new: true, runValidators: true },
  );

  res.status(200).json(updatedProject);
});

// @desc Delete a project
// @route DELETE ap1/v1/projects/:id
export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`, 404),
    );
  }
  res.status(200).json({ success: true, data: {} });
});
