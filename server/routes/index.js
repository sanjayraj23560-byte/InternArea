import dotenv from "dotenv";
dotenv.config();
import express from "express";
import admin from "./adminRouter.js";
import internship from "./internshipRouter.js";
import job from "./jobRouter.js";
import applications from "./applicationsRouter.js";
import jobApplications from "./jobApplicationRouter.js";
import communityPost from './communityPostsRouter.js';
import engageRequestes from './engageRouter.js';
import profile from './profileRouter.js';
import paymentRouter from './paymentRouter.js';  // one import for all payment routes
import postResponse from './postResponse.js'
import OTP from './resumeRouter.js'
import resPayment from './resumePaymentRouter.js'
import paymentVer from './resumePaymentRouter.js';
import aiResume from './aiResumeRouter.js'
import getResume from './aiResumeRouter.js'
import languageOtpRoute from './languageOtpRoute.js'
import llogginn from './loginRouter.js';

const router = express.Router();

router.use('/login', llogginn);
router.use('/language-otp', languageOtpRoute);
router.use("/admin", admin);
router.use('/airesume', aiResume)
router.use('/resume', getResume)
router.use('/communitypost', communityPost);
router.use('/engagerequest', engageRequestes);
router.use('/postres', postResponse);
router.use("/internship", internship);
router.use("/getintern", internship);
router.use('/paymentReq', resPayment)
router.use("/job", job);
router.use("/jobs", job);
router.use('/otp', OTP);
router.use('/payment', paymentVer);
router.use('/verify-otp', OTP)
router.use("/application", applications);
router.use("/job-applications", jobApplications);
router.use("/profile", profile);
router.use("/paymentreq", paymentRouter);
router.use("/verify", paymentRouter);
router.use("/plan", paymentRouter);

export default router;