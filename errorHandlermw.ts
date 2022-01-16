import { Request,Response,NextFunction } from "express"

export const errorHandler = (error:Error,req:Request,res:Response,next:NextFunction) => {
    res.status(500).send(error.message||'Something went Wrong');
}