const express = require("express");
const doctorController = require("../controllers/doctorController");
const auth = require("../middleware/auth");

const doctorRouter = express.Router();

doctorRouter.get("/getdoctor/:id", doctorController.getdoctor);

doctorRouter.get("/getstats/:id", doctorController.getDoctorStats);

doctorRouter.get("/getDoctorSchedule/:id", doctorController.getDoctorSchedule);

doctorRouter.get("/getalldoctors", doctorController.getalldoctors);

doctorRouter.get("/getnotdoctors", auth, doctorController.getnotdoctors);

doctorRouter.get("/search", auth, doctorController.searchDoctors);

doctorRouter.post("/applyfordoctor", auth, doctorController.applyfordoctor);

doctorRouter.put("/deletedoctor", auth, doctorController.deletedoctor);

doctorRouter.put("/acceptdoctor", auth, doctorController.acceptdoctor);

doctorRouter.put("/rejectdoctor", auth, doctorController.rejectdoctor);

doctorRouter.get("/top-doctors", doctorController.getTopDoctors);

module.exports = doctorRouter;
