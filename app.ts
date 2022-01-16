
import { NextFunction, Request, Response } from "express";
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const express = require('express')
const cache = require('memory-cache');
const { JSDOM } = jsdom;
import * as Joi from 'joi';
import { createValidator } from "express-joi-validation";
import { errorHandler } from "./errorHandlermw";

let memCache = new cache.Cache();
// const Joi = require('joi')
const PORT = 3000;
const TTL = 180 * 1000;
const chessUrl = 'https://www.chessgames.com/chessecohelp.html';

const app = express();

const data = fs.readFileSync("chessmoves.json");
const chessJson = JSON.parse(data);


const codechema = Joi.object({
    code: Joi.string().required(),
})


const moveschema = Joi.object({
    code: Joi.string().required(),
    moves: Joi.string().required(),
})

const validator = createValidator({ passError: true });


/**
 * @description path for providing all json as output
 */
app.get('/', async (req: Request, res: Response) => {



    console.log('Received Request in Get All Endpoint');

    // const response = await got(chessUrl);

    // To get Data in Json form
    res.send(chessJson);
    // To render it as html
    // res.send(response.body);
}, errorHandler);

/**
 * @description path for providing name and moves when given a chesscode
 */
app.get('/:code', validator.params(codechema), async (req: Request, res: Response, next: NextFunction) => {


    // memCache is used to response for given chessCode
try{
    
    console.log('Received Request in Get move by code Endpoint');
    const code = req.params.code;
    let cacheContent = memCache.get(code);
    if (cacheContent) {
        console.log("Entry found in Cache");
        res.send(cacheContent);

    } else {
        console.log("Entry not  found in Cache. Using JSON data to send response");
        const chesCodeMove = chessJson.filter(ele => ele.code === code);

        if (!!chesCodeMove.length) {

            // To get Data in Json form
            // res.send(respMove[0]);
            const filteredResponse = chesCodeMove.map(({ name, moves }) => ({ name, moves }))

            // Save it in in memory cache for 3 minutes
            memCache.put(chesCodeMove[0].code, filteredResponse[0], TTL);
            res.status(200).send(filteredResponse[0]);

        } else {
            // Throwing error when no chess Code is found
            throw new Error("Invalid Chess Code");

        }
    }
}catch(error){
    next(error);
}
    



}, errorHandler);




/**
 * @description path for predicting next move of AI chess computer
 */
app.get('/:code/*', async (req: Request, res: Response, next: NextFunction) => {

    // Mem Cache is used to store the array of moves for a particular chesscode and first url param
    try {
        console.log('Received Request in Generating by code Endpoint');
        const code = req.params.code;
        const inputmoves = req.params['0'].split('/');
        const key = code + inputmoves[0];
        let cacheContent = memCache.get(key);

        
        if (cacheContent) {
            
            console.log("Entry found in Cache");
            if (inputmoves.length >= cacheContent.length) {
                throw new Error("Invalid Input move pattern");
            }
            inputmoves.forEach((element,index) => {
                if (element !== cacheContent[index]) {
                    throw new Error("Invalid Input move pattern");
                }
            });

            const nextMove = cacheContent[inputmoves.length - 1];
            res.status(200).send({ nextMove });

        } else {
            const chesCodeMove = chessJson.filter(ele => ele.code === code);

            if (!!chesCodeMove.length) {
                
                const validMoves = chesCodeMove[0].moves.split(' ').filter((item) => {
                    return !(parseInt(item) == item);
                });
                if (inputmoves.length >= validMoves.length) {
                    throw new Error("Invalid Input move pattern");
                }
                inputmoves.forEach((element,index) => {
                    if (element !== validMoves[index]) {
                        throw new Error("Invalid Input move pattern");
                    }
                });

                const nextMove = validMoves[inputmoves.length - 1];
                memCache.put(key, validMoves,TTL );
                res.status(200).send({ nextMove });

            } else {
                // Throwing error when no chess Code is found
                throw new Error("Invalid Chess Code");

            }
        console.log("Entry not  found in Cache. Using JSON data to send response");
        }
    } catch (error) {
        next(error);
    }




}, errorHandler);
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started at port ${process.env.PORT || 3000}`);
});
