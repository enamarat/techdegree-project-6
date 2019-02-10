const fs = require('fs');
const http = require('http');
const $ = require('cheerio');
// const stringify = require('csv-stringify');
// const generate = require('csv-generate');
// const assert = require('assert');

/* Making a request to the URL we're interested in */
const mainURL = 'http://shirts4mike.com';
const entryURL = '/shirts.php';

const dataToStore = [];

const request = http.get(`${mainURL}${entryURL}`, response => {
  /* Reading data from the response */
  console.log(response.statusCode);
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
    /* Getting the current date. Code is taken from
    https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript */
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    date = `${year}-${month}-${day}`;

    /* Creating a CSV file where our data will be stored */
    fs.appendFile(`./data/${date}.csv`, '', function (err) {
      if (err) throw err;
    });


    /***********************************************/


    const gatherInformation = (generalURL, tshirtURL) => {
    ////  for (let j = 0; j < tshirtsURL.length; j += 1) {

        http.get(`${generalURL}/${tshirtURL}`, response => {
          let bodyTshirt = "";
          response.on('data', data => {
          bodyTshirt += data.toString();
          });
          response.on('end', () => {
              const title = $('.shirt-details h1', bodyTshirt).contents()[0].next.data; // title
              const price = $('.price', bodyTshirt).text(); // price
              const imgURL = $('.shirt-picture span img', bodyTshirt).attr('src'); //img URL
              const gURL =`${generalURL}/${tshirtURL}`; //URL
              let tshirtInfo = [];
              tshirtInfo.push(title, price, imgURL, generalURL);
              dataToStore.push(tshirtInfo);
              console.log(dataToStore);
          }); // on.end
          //response.error(); // handling errors for T-shirts URLs
        }) //http.get
    //////  } // gathering data about T-shirts - for loop
    } // gatherInformation

    /**********************************************/

    // Gathering links from every t-shirt url
    const tshirtsLinks = $('.products li > a', body);
    for (let i = 0; i < tshirtsLinks.length; i += 1) {
      gatherInformation(mainURL, tshirtsLinks[i].attribs.href);
    }
    /* Converting strings to CSV and writing them into a file */
  //  const strings = stringify(dataToStore);
    fs.writeFile(`./data/${date}.csv`, 'Greetings!', function(err) {
    if(err) {
        return console.log(err);
    }
    // console.log("The file was saved!");

    });

}); // entryURL response "end"
}); // end of request
