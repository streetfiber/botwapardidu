const { Router, Response} = require("pepesan");
const BotController = require("./controller/BotController");
const f = require("./utils/Formatter");

const router = new Router();

router.menu(f("menu.booking"), [BotController, "booking"]);
router.menu(f("menu.rincian"), [BotController, "rincian"]);
router.menu(f("menu.chatadmin"), [BotController, "chatadmin"]);
router.menu(f("menu.feedback"), [BotController, "feedback"]);
router.menu(f("menu.helper"), [BotController, "helper"]);
router.keyword("*", [BotController, "introduction"]);

module.exports = router;