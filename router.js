const { Router, Response} = require("pepesan");
const BotController = require("./controller/BotController");
const f = require("./utils/Formatter");

const router = new Router();

router.menu(f("menu.booking"), [BotController, "booking"]);
router.menu(f("menu.rincian"), [BotController, "rincian"]);
router.menu(f("menu.livechat"), [BotController, "livechat"]);
router.menu(f("menu.feedback"), [BotController, "feedback"]);
router.keyword("*", [BotController, "introduction"]);


router.processMessage = async (socket, from, text) => {
    // Mengalihkan pesan ke BotController sesuai teks
    const controller = new BotController();
    // Anda dapat menyesuaikan pemrosesan pesan di sini
    await controller.handleIncomingMessage(socket, from, text);
};

module.exports = router;