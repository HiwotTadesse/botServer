import express, { Request, Response, NextFunction} from 'express';
import { Telegram, Telegraf } from 'telegraf';
import {google, GoogleApis} from 'googleapis';
import axios from 'axios';
import fs from 'fs'
import { type } from 'os';
import dotenv from 'dotenv';

let  apiToken: string ='5528543679:AAFuzfjkDHXbuF6w9iQ2xTHaNpK8xHJnH1k';

const telegram: Telegram = new Telegram(apiToken as string);


type Status = {
  status : string
}

type StatusResponse = {
  status : Status
}

/*const data: { chat_id: string, text: string } = {
    chat_id: "-1001733159550",
    text: "Hi hiwot"
  };*/
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

  res.send("Welcome to Marefiale")
});

app.post('/send', async (req: Request, res: Response, next: NextFunction) => {

  const message = await sendMessage(JSON.parse(fs.readFileSync(CRED_PATH, 'utf8')), req, res)
  return res.send(message);
});

app.post('/sendGift', async (req: Request, res: Response, next: NextFunction) => {

  const message = await sendGift(JSON.parse(fs.readFileSync(CRED_PATH, 'utf8')), req, res)
  return res.send(message);
});

app.post('/sendBooking', async (req: Request, res: Response, next: NextFunction) => {

  const message = await sendBookingDetail(JSON.parse(fs.readFileSync(CRED_PATH, 'utf8')), req, res)

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

  
  let phoneNumber: string = req.body.phoneNumber; 
  let name: string = req.body.name; 
  let language: string = req.body.language;
  let question: string = req.body.question;

  telegram.sendMessage(
    '-1001733159550',
    '*Marefiale\'s Customer Questions* ' + '\n \n'+
    '*Name* : ' + name +'\n \n'+
    '*Phone Number* : ' + phoneNumber + '\n \n' +
    '*language* : ' + language +'\n \n'+
    '*Question* : ' + question  ,{parse_mode:'Markdown'},
  )

  const response =  await axios.post<StatusResponse>(
    'https://www.marefiale.com/api/postQuestion',
    { name:name, phoneNumber: phoneNumber, language:language, question:question },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  ).then(response=>{

      const sheet = google.sheets("v4")
      sheet.spreadsheets.values.append({
        spreadsheetId: '1gt2rey__VGNHAMAIkBFEJiHPIj8r6MyEwX2OwnSgptE',
        auth: auth,
        range: "Sheet1",
        valueInputOption: "RAW",
        requestBody: {
          values: [[name, phoneNumber, language, question]]
        }
      })

        return response.data

  }).catch(error=>{
    return error.message
  })


  return response;
}

async function sendGift (cred: any, req: any, res:any) {

  const auth = new google.auth.JWT({
    email: cred.client_email,
    key: cred.private_key,
    scopes: SCOPES
  })

  let phoneNumber: string = req.body.phoneNumber;
  let name: string = req.body.name; 
  let address: string = req.body.address;
  let deviceId: string = req.body.deviceId;
  let deviceType: string = req.body.deviceType;
  //let phoneNumberValidationResponse = phoneNumber.match('/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im');
 /* if(phoneNumberValidationResponse){
    return data:any = {
      'status':{
        'status' : "Phone Number is not correct"
      }
    }
  }*/

 const response = await axios.post<StatusResponse>(
    'https://www.marefiale.com/api/sendGift',
    { name:name, phoneNumber:phoneNumber, address:address, deviceId:deviceId, deviceType:deviceType},
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  ).then(response=>{

    if(response.data.status.status != "Aleady Registered"){
      
      const sheet = google.sheets("v4")
         sheet.spreadsheets.values.append({
          spreadsheetId: '1gt2rey__VGNHAMAIkBFEJiHPIj8r6MyEwX2OwnSgptE',
          auth: auth,
          range: "Sheet2",
          valueInputOption: "RAW",
          requestBody: {
            values: [[name, phoneNumber, address, deviceId, deviceType]]
          }
        })

        return response.data
    }else{
      return response.data
    }
  }).catch(error=>{
    return error.message
  })


  return response
}

async function sendBookingDetail (cred: any, req: any, res:any) {

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
    '-1001497229772',
    '*Marefiale new Booking details* ' + '\n \n'+
    '*Property Name* : ' + propertyName +'\n \n'+
    '*Location* : ' + location + '\n \n'+
    '*Customer Name* : ' + name +'\n \n'+
    '*Customer Address*: '  + address + '\n \n' +
    '*Customer Phone Number* : ' + phoneNumber ,{parse_mode:'Markdown'},
  )

  const sheet = google.sheets("v4")
  await sheet.spreadsheets.values.append({
    spreadsheetId: '1gt2rey__VGNHAMAIkBFEJiHPIj8r6MyEwX2OwnSgptE',
    auth: auth,
    range: "Sheet3",
    valueInputOption: "RAW",
    requestBody: {
      values: [[propertyName, address, name, address, phoneNumber]]
    }
  })
}