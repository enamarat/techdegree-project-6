const fs = require('fs');
const http = require('http');
const $ = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


/* Getting the current date. Code is taken from
https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript */
let dateObject = new Date();
let day = dateObject.getDate();
let month = dateObject.getMonth() + 1;
let year = dateObject.getFullYear();
let hour = dateObject.getHours();
let minute = dateObject.getMinutes();
let second = dateObject.getSeconds();

if (day < 10) {
  day = `0${day}`;
}
if (month < 10) {
  month = `0${month}`;
}
if (hour < 10) {
  hour = `0${hour}`;
}
if (minute < 10) {
  minute = `0${minute}`;
}
if (second < 10) {
  second = `0${second}`;
}

let date = `${year}-${month}-${day}`;
let time = `${hour}:${minute}:${second}`;

/* Creating headers for a CSV file with the help of
 CSV-writer package */
const csvWriter = createCsvWriter({
    path: `./data/${date}.csv`,
    header: [
        {id: 'title', title: 'TITLE'},
        {id: 'price', title: 'PRICE'},
        {id: 'imgURL', title: 'IMGURL'},
        {id: 'tshirtURL', title: 'TSHIRTURL'},
        {id: 'time', title: 'TIME'}
    ]
});


/* Making a request to the URL we're interested in */
const mainURL = 'http://shirts4mike.com';
const entryURL = '/shirts.php';
const dataToStore = [];

/***********************************************/
const gatherInformation = (generalURL, urlOfTshirt) => {
    http.get(`${generalURL}/${urlOfTshirt}`, response => {
      let bodyTshirt = "";
      response.on('data', data => {
      bodyTshirt += data.toString();
      });
      response.on('end', () => {
          const title = $('.shirt-details h1', bodyTshirt).contents()[0].next.data; // title
          const price = $('.price', bodyTshirt).text(); // price
          const imgURL = $('.shirt-picture span img', bodyTshirt).attr('src'); //img URL
          const tshirtURL =`${generalURL}/${urlOfTshirt}`; //URL
          time = `${time}`;
          let tshirtInfo = {
            title: title,
            price: price,
            imgURL: imgURL,
            tshirtURL: tshirtURL,
            time: time
          };
          dataToStore.push(tshirtInfo);

          if (dataToStore.length === 8) {
            csvWriter.writeRecords(dataToStore)
                .then(() => {
                    console.log('...Done');
                });
          }
      }); // on.end
    }) //http.get
} // gatherInformation
/*******************************************/


const connectToEntryURL = (url, additionalUrl) => {
  const request = http.get(`${url}${additionalUrl}`, response => {
      /* Reading data from the response */
      let body = "";
      response.on('data', data => {
      body += data.toString();
      });
      response.on('end', ()=> {
          /* Checking whether a "data" folder exists.
          If not, create it.*/
          if (!fs.existsSync('./data')) {
              fs.mkdirSync('./data');
            }
          // Gathering links from every t-shirt url
          const tshirtsLinks = $('.products li > a', body);
          for (let i = 0; i < tshirtsLinks.length; i += 1) {
            gatherInformation(url, tshirtsLinks[i].attribs.href);
          }
   }); //end
  }); // end of request

 request.on('error', error =>  {
   if (error.code == "ENOTFOUND") {
     console.error(`There has been a 404 error. Cannot connect to ${mainURL}`);
   }
 });
} //connectToEnryURL


connectToEntryURL(mainURL, entryURL);
