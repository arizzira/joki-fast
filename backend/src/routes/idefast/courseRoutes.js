import express from 'express';
import {
    createCourse,
    createClass,
    createBranchClass,
    createSmallBranch,
    generateQuizAI,
    createManualQuiz,
    getAllCoursesAdmin,
    getSmallBranchById,
    updateSmallBranch,
    // UPDATE functions
    updateCourse,
    updateClass,
    updateBranchClass,
    updateQuiz,
    // DELETE functions
    deleteCourse,
    deleteClass,
    deleteBranchClass,
    deleteSmallBranch,
    deleteQuiz,
    // WORKSPACE functions
    getCourseWorkspaceById,
    generateClassQuizAI,
    generateCourseQuizAI,
    getPublishedCourses,
    getCourseDetailPublic
} from '../../controllers/ideafast/courseController.js';

import { enrollCourse } from '../../controllers/ideafast/enrollmentController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { getLearningCourseData, markProgressDone } from '../../controllers/ideafast/learningController.js';

const router = express.Router();

// CREATE
router.post('/create', createCourse);
router.post('/class/create', createClass);
router.post('/branch/create', createBranchClass);
router.post('/smallbranch/create', createSmallBranch);
router.post('/branch/generate-quiz', generateQuizAI);
router.post('/quiz/create', createManualQuiz);
router.post('/class/generate-quiz', generateClassQuizAI);
router.post('/course/generate-quiz', generateCourseQuizAI);

// READ
router.get('/all-tree', getAllCoursesAdmin);
router.get('/smallbranch/:id', getSmallBranchById);
router.get('/workspace/:id', getCourseWorkspaceById);

// UPDATE
router.put('/smallbranch/:id', updateSmallBranch);
router.put('/course/:id', updateCourse);
router.put('/class/:id', updateClass);
router.put('/branch/:id', updateBranchClass);
router.put('/quiz/:id', updateQuiz);

// DELETE
router.delete('/course/:id', deleteCourse);
router.delete('/class/:id', deleteClass);
router.delete('/branch/:id', deleteBranchClass);
router.delete('/smallbranch/:id', deleteSmallBranch);
router.delete('/quiz/:id', deleteQuiz);

// PUBLIC ROUTE (Buat halaman Landing Page)
router.get('/public/catalog', getPublishedCourses);
router.get('/public/course/:id', getCourseDetailPublic);
router.post('/enroll', verifyToken, enrollCourse);
router.get('/learn/:courseId', verifyToken, getLearningCourseData);
router.post('/learn/progress', verifyToken, markProgressDone);

export default router;