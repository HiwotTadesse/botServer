"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const telegraf_1 = require("telegraf");
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
let apiToken = "5490624450:AAFqYy1a6fDZsjUKX_TF548FrqWtyUcCvE4";
const telegram = new telegraf_1.Telegram(apiToken);
const data = {
    chat_id: "306712421",
    text: "Hi hiwot"
};
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
];
const CRED_PATH = 'credentials.json';
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hello Marefiale");
}));
app.post('/send', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield sendMessage(JSON.parse(fs_1.default.readFileSync(CRED_PATH, 'utf8')), req, res);
    return res.status(200).json({
        message: 'Sent successfully'
    });
}));
app.listen(process.env.PORT || 3000, () => {
    console.log('The application is listening on port 3000!');
});
function sendMessage(cred, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new googleapis_1.google.auth.JWT({
            email: cred.client_email,
            key: cred.private_key,
            scopes: SCOPES
        });
        let name = req.body.name;
        let address = req.body.address;
        let phoneNumber = req.body.phoneNumber;
        telegram.sendMessage(data.chat_id, name + ' ' + address + ' ' + phoneNumber);
        const sheet = googleapis_1.google.sheets("v4");
        yield sheet.spreadsheets.values.append({
            spreadsheetId: '117YdxCqzWs-4MEnmQ5hOrTFndj67F3FEEAszMWyl_c4',
            auth: auth,
            range: "Sheet1",
            valueInputOption: "RAW",
            requestBody: {
                values: [[name, address, phoneNumber]]
            }
        });
    });
}
