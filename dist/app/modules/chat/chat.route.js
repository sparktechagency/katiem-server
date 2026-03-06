"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("./chat.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER, user_1.USER_ROLES.WORKER), chat_controller_1.ChatController.getAllChats);
// router.post(
//   '/:participant',
//   auth(
//     USER_ROLES.EMPLOYER,USER_ROLES.WORKER
//   ),
//   validateRequest(ChatValidations.create),
//   ChatController.createChat
// );
// router.delete(
//   '/:id',
//   auth(
//     USER_ROLES.ADMIN
//   ),
//   ChatController.deleteChat
// );
exports.ChatRoutes = router;
