import express, { Request, Response, NextFunction} from 'express';
import { Telegram, Telegraf } from 'telegraf';
import {google, GoogleApis} from 'googleapis';
import fs from 'fs'
import url from 'url';
import https from 'https';

let  apiToken: string = process.env.TELEGRAM_TOKEN as string;

const telegram: Telegram = new Telegram(apiToken as string);

const data: { chat_id: string, text: string } = {
    chat_id: "-1001497229772",
    text: "Hi hiwot"
  };
//306712421
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
]


const CRED_PATH = 'credentials.json'

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", async(req:Request, res:Response) => {
  telegram.sendMessage(
    data.chat_id,
    'hi'
  )
  res.send("Welcome to Marefiale")
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

  let propertyName: string = req.body.propertyName;
  let location: string = req.body.location;
  let phoneNumber: string = req.body.phoneNumber; 
  let address: string = req.body.address; 
  let name: string = req.body.name; 

  telegram.sendMessage(
    data.chat_id,
    '<h1>Marefiale new Booking details<h1> ' + '\n \n'+
    '<h1>Property Name<h1> : ' + propertyName +'\n \n'+
    '<h1>Location<h1> : ' + location + '\n \n'+
    '<h1>Customer Name<h1> : ' + name +'\n \n'+
    '<h1>Customer Address<h1> : '  + address + '\n \n' +
    '<h1>Customer Phone Number<h1> : ' + phoneNumber ,{parse_mode:'Markdown'},
  )

  const sheet = google.sheets("v4")
  await sheet.spreadsheets.values.append({
    spreadsheetId: '117YdxCqzWs-4MEnmQ5hOrTFndj67F3FEEAszMWyl_c4',
    auth: auth,
    range: "Sheet1",
    valueInputOption: "RAW",
    requestBody: {
      values: [[propertyName, address, name, address, phoneNumber]]
    }
  })
}

