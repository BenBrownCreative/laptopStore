// built in node modules
const fs = require('fs'); // module name same as variable name
const http = require('http');  // module name same as variable name
const url = require('url');

// __dirname is node talk for home directory
const json = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');  
const laptopData = JSON.parse(json);

// server setup, request and response arguments
const server = http.createServer((req, res) => {
    // call back function that runs when the server is hit

    const pathName = url.parse(req.url, true).pathname; // the 2nd argument of true means it will be returned as an object
    const id = url.parse(req.url, true).query.id;

    // product overview
    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, {'content-type': 'text/html'});
        
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;


            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
                
                const cardsOutput = laptopData.map(el => replaceTemplate(data, el)).join('');
                overviewOutput = overviewOutput.replace('{%CARDS', cardsOutput);

                res.end(overviewOutput);
            });

        });

    } 

    // product detail
    else if (pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, {'content-type': 'text/html'});

        // readFile is async - we dont want this blocking all users when called
        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => { // error and data arguments
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);

            res.end(output);
        });
    } 

    // images - images are just another request
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) {
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(404, {'content-type': 'img/jpg'});
            res.end(data);
        });
    }

    // error
    else {
        res.writeHead(404, {'content-type': 'text/html'});
        res.end('url was not found!');
    }

    
}); 

// 1337 common node port
// listen to this http address for incoming traffic
server.listen(1337, '127.0.0.1', () => {
    console.log('listening for request now'); // not necessary
});

function replaceTemplate(originalHtml, laptop) {
    let output = originalHtml.replace(/{%PRODUCTNAME}/g, laptop.productName); // regular expression used to get multiple cases at once
    output = output.replace(/{%IMAGE}/g, laptop.image);
    output = output.replace(/{%PRICE}/g, laptop.price);
    output = output.replace(/{%SCREEN}/g, laptop.screen);
    output = output.replace(/{%CPU}/g, laptop.cpu);
    output = output.replace(/{%STORAGE}/g, laptop.storage);
    output = output.replace(/{%RAM}/g, laptop.ram);
    output = output.replace(/{%DESCRIPTION}/g, laptop.description);
    output = output.replace(/{%ID}/g, laptop.id);
    return output;
}