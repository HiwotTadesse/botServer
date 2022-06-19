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
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
let apiToken = '5528543679:AAFuzfjkDHXbuF6w9iQ2xTHaNpK8xHJnH1k';
const telegram = new telegraf_1.Telegram(apiToken);
/*const data: { chat_id: string, text: string } = {
    chat_id: "-1001733159550",
    text: "Hi hiwot"
  };*/
//306712421
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/spreadsheets.readonly'
];
const CRED_PATH = 'credentials.json';
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Welcome to Marefiale");
}));
app.post('/send', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield sendMessage(JSON.parse(fs_1.default.readFileSync(CRED_PATH, 'utf8')), req, res);
    return res.send(message);
}));
app.post('/sendGift', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield sendGift(JSON.parse(fs_1.default.readFileSync(CRED_PATH, 'utf8')), req, res);
    return res.send(message);
}));
app.post('/sendBooking', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield sendBookingDetail(JSON.parse(fs_1.default.readFileSync(CRED_PATH, 'utf8')), req, res);
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
        let phoneNumber = req.body.phoneNumber;
        let name = req.body.name;
        let language = req.body.language;
        let question = req.body.question;
        telegram.sendMessage('-1001733159550', '*Marefiale\'s Customer Questions* ' + '\n \n' +
            '*Name* : ' + name + '\n \n' +
            '*Phone Number* : ' + phoneNumber + '\n \n' +
            '*language* : ' + language + '\n \n' +
            '*Question* : ' + question, { parse_mode: 'Markdown' });
        const response = yield axios_1.default.post('https://www.marefiale.com/api/postQuestion', { name: name, phoneNumber: phoneNumber, language: language, question: question }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        }).then(response => {
            const sheet = googleapis_1.google.sheets("v4");
            sheet.spreadsheets.values.append({
                spreadsheetId: '1gt2rey__VGNHAMAIkBFEJiHPIj8r6MyEwX2OwnSgptE',
                auth: auth,
                range: "Sheet1",
                valueInputOption: "RAW",
                requestBody: {
                    values: [[name, phoneNumber, language, question]]
                }
            });
            return response.data;
        }).catch(error => {
            return error.message;
        });
        return response;
    });
}
function sendGift(cred, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new googleapis_1.google.auth.JWT({
            email: cred.client_email,
            key: cred.private_key,
            scopes: SCOPES
        });
        let phoneNumber = req.body.phoneNumber;
        let name = req.body.name;
        let address = req.body.address;
        let deviceId = req.body.deviceId;
        let deviceType = req.body.deviceType;
        //let phoneNumberValidationResponse = phoneNumber.match('/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im');
        /* if(phoneNumberValidationResponse){
           return data:any = {
             'status':{
               'status' : "Phone Number is not correct"
             }
           }
         }*/
        const response = yield axios_1.default.post('https://www.marefiale.com/api/sendGift', { name: name, phoneNumber: phoneNumber, address: address, deviceId: deviceId, deviceType: deviceType }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        }).then(response => {
            if (response.data.status.status != "Aleady Registered") {
                const sheet = googleapis_1.google.sheets("v4");
                sheet.spreadsheets.values.append({
                    spreadsheetId: '1gt2rey__VGNHAMAIkBFEJiHPIj8r6MyEwX2OwnSgptE',
                    auth: auth,
                    range: "Sheet2",
                    valueInputOption: "RAW",
                    requestBody: {
                        values: [[name, phoneNumber, address, deviceId, deviceType]]
                    }
                });
                return response.data;
            }
            else {
                return response.data;
            }
        }).catch(error => {
            return error.message;
        });
        return response;
    });
}
function sendBookingDetail(cred, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new googleapis_1.google.auth.JWT({
            email: cred.client_email,
            key: cred.private_key,
            scopes: SCOPES
        });
        let propertyName = req.body.propertyName;
        let location = req.body.location;
        let phoneNumber = req.body.phoneNumber;
        let address = req.body.address;
        let name = req.body.name;
        telegram.sendMessage(process.env.CALLCENTER_CHAT_ID, '*Marefiale new Booking details* ' + '\n \n' +
            '*Property Name* : ' + propertyName + '\n \n' +
            '*Location* : ' + location + '\n \n' +
            '*Customer Name* : ' + name + '\n \n' +
            '*Customer Address*: ' + address + '\n \n' +
            '*Customer Phone Number* : ' + phoneNumber, { parse_mode: 'Markdown' });
        const sheet = googleapis_1.google.sheets("v4");
        yield sheet.spreadsheets.values.append({
            spreadsheetId: '1gt2rey__VGNHAMAIkBFEJiHPIj8r6MyEwX2OwnSgptE',
            auth: auth,
            range: "Sheet3",
            valueInputOption: "RAW",
            requestBody: {
                values: [[propertyName, address, name, address, phoneNumber]]
            }
        });
    });
}
