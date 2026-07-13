import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dogsRouter from "./dogs";
import littersRouter from "./litters";
import statsRouter from "./stats";
import usersRouter from "./users";
import transfersRouter from "./transfers";
import notificationsRouter from "./notifications";
import mediaRouter from "./media";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dogsRouter);
router.use(littersRouter);
router.use(statsRouter);
router.use(usersRouter);
router.use(transfersRouter);
router.use(notificationsRouter);
router.use(mediaRouter);

export default router;
