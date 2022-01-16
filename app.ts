
import { Request , Response } from "express";
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const express = require('express')
const cache = require('memory-cache');
const { JSDOM } = jsdom;
import * as Joi  from 'joi';
import { createValidator  } from "express-joi-validation";

let memCache = new cache.Cache();
// const Joi = require('joi')
const validator = createValidator({passError:true});
const PORT =3000;
const TTL =180*1000;
const chessUrl= 'https://www.chessgames.com/chessecohelp.html';
const codechema = Joi.object({
  code: Joi.string().required()
})
const app = express();
const data = fs.readFileSync("chessmoves.json");
const chessJson = JSON.parse(data);


app.get('/', async (req : Request, res :Response) => {


    // To get Data in Json form
    // res.send(chessJson);
    const response = await got(chessUrl);
    // To render it as html
    res.send(response.body);
});


app.get('/:code', async (req : Request, res :Response) => {
    
    const code = req.params.code;
    // const response = dataset.filter((data))
    // const response = await got(chessUrl);
    // const dom = new JSDOM(response.body);
    // const table = dom.window.document.querySelectorAll('table');
    // const 
    // To get Data in Json form
    // res.send(respMove[0]);

    let cacheContent = memCache.get(code);
    if(cacheContent){
        console.log("Entry found in Cache");
        res.send( cacheContent );

    }else{

        console.log("Entry not  found in Cache. Using JSON data to send response");
        const chesCodeMove  = chessJson.filter(ele=>ele.code === code);
 
        if( !!chesCodeMove.length){

            // To get Data in Json form
            // res.send(respMove[0]);
            const filteredResponse = chesCodeMove.map(({name,moves})=>({name,moves}))    

            // Save it in in memory cache for 3 minutes
            memCache.put(chesCodeMove[0].code,filteredResponse[0],TTL );
            res.status(200).send(filteredResponse);
        
        }else{
            // empty Response
            res.status(200).send({});
        
        }
    }
    
   

});

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
});
