import express from "express";
import { authenticate } from "../middleware/jwtAuth.js";
import handlerLogin from "../controller/handlerLogin.js";
import handlerRegister from "../controller/handlerRegister.js";
import handlerDeleteUser from "../controller/handlerDeleteUser.js";
import handlerSaveDoc from "../controller/handlerSaveDoc.js";
import handlerListDocs from "../controller/handlerListDocs.js";
import handlerDeleteDoc from "../controller/handlerDeleteDoc.js";

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  return res.send("Hello from user route");
});

//redirect to login in frontend when register is succcessful
router.post("/register", handlerRegister);

router.post("/login", handlerLogin);

router.delete("/deleteUser", authenticate, handlerDeleteUser);

router.put("/saveDoc", authenticate, handlerSaveDoc);

router.get("/listDocs", authenticate, handlerListDocs);

router.delete("/deleteDoc/:id", handlerDeleteDoc);

export default router;
