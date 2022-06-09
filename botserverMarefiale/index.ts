import express, { Request, Response, NextFunction} from 'express';
import { Telegram } from 'telegraf';
import {google, GoogleApis} from 'googleapis';
import fs from 'fs'
import url from 'url';
import https from 'https';

let  apiToken: string = "5490624450:AAFqYy1a6fDZsjUKX_TF548FrqWtyUcCvE4";

const telegram: Telegram = new Telegram(apiToken as string);

const data: { chat_id: string, text: string } = {
    chat_id: "306712421",
    text: "Hi hiwot"
  };

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
]

const CRED_PATH = 'credentials.json'

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

interface Message {
  name: String;
  address: String;
  phoneNumber: String;
}

app.get("/", async(req:Request, res:Response) => {
  res.send("Hello Marefiale")
});

app.post('/send', async (req: Request, res: Response, next: NextFunction) => {

  const message = await sendMessage(JSON.parse(fs.readFileSync(CRED_PATH, 'utf8')), req, res)

  return res.status(200).json({
      message: 'Sent successfully'
  });
});


app.listen(process.env.PORT || 3000, () => {
    console.log('The application is listening on port 3000!');
})


async function sendMessage (cred: any, req: any, res:any) {

  const auth = new google.auth.JWT({
    email: cred.client_email,
    key: cred.private_key,
    scopes: SCOPES
  })

  let name: string = req.body.name;
  let address: string = req.body.address;
  let phoneNumber: string = req.body.phoneNumber; 

  telegram.sendMessage(
    data.chat_id,
    name + ' ' + address + ' ' + phoneNumber
  )

  const sheet = google.sheets("v4")
  await sheet.spreadsheets.values.append({
    spreadsheetId: '117YdxCqzWs-4MEnmQ5hOrTFndj67F3FEEAszMWyl_c4',
    auth: auth,
    range: "Sheet1",
    valueInputOption: "RAW",
    requestBody: {
      values: [[name, address, phoneNumber]]
    }
  })
}

