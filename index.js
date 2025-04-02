const express=require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 9876;
const WINDOW_SIZE=10;
const numberStore=[];

const API_URLS= {
    p: process.env.API_PRIME,
    f: process.env.API_FIBO,
    e: process.env.API_EVEN,
    r: process.env.API_RANDOM
}

app.get("/numbers/:numberid", async(req, res)=>{
    const {numberid}=req.params;
    if(!API_URLS[numberid]){
        return res.status(400).json({error:"Invalid number ID"})
    }
    try{
        const response = await axios.get(API_URLS[numberid],{timeout:500});
        const numbers=response.data.numbers;

        const uniqueNumbers=[...new Set(numbers)];
        numberStore.push(...uniqueNumbers);

        while(numberStore.length>WINDOW_SIZE){
            numberStore.shift();
        }

        const avg= numberStore.reduce((sum,num)=>sum+num,0)/numberStore.length;
    }catch(error){
        res.status(500).json({error:"Failed to fetch numbers"});
    }
});