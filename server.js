"use strict"
require('dotenv/config')
const express=require('express');
const app=express();
const https=require('https');
const bodyparser=require('body-parser');
const path=require('path');
const mongoapi=require('./queries');
const subscriptionKey=process.env.APIKEY;
app.use(bodyparser.json());
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','index.html'));
});
app.get('/public/:resource',(req,res)=>{
    res.sendFile(path.join(__dirname,'public',req.params.resource));
});
app.get('/api/imagesearch/:q',(req,res)=>{
    let host = 'api.cognitive.microsoft.com';
    let path = '/bing/v7.0/images/search';
    let term = req.params.q;
    let offset=10;
    if(req.query.offset){
        offset=req.query.offset;
    }
    let response_handler = function (response) {
        let body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            console.log('\nRelevant Headers:\n');
            for (var header in response.headers)
                // header keys are lower-cased by Node.js
                if (header.startsWith("bingapis-") || header.startsWith("x-msedge-"))
                     console.log(header + ": " + response.headers[header]);
            body=JSON.parse(body.replace(/\n/g,'').replace(/\"/g,"\""),null,'')
            body=body.value.splice(0,offset);
            let result=[];
            body.forEach(element => {
                let resElem={
                    "url":element["contentUrl"],
                    "alt_text":element["name"],
                    "page_url":element["hostPageUrl"]
                };
                result.push(resElem);
            });
            mongoapi.store(term);
            res.send(result);
        });
        response.on('error', function (e) {
            console.log('Error: ' + e.message);
        });
    };
    
    let bing_web_search = function (search) {
      console.log('Searching the Web for: ' + term);
      let request_params = {
            method : 'GET',
            hostname : host,
            path : path + '?q=' + encodeURIComponent(search),
            headers : {
                'Ocp-Apim-Subscription-Key' : subscriptionKey,
            }
        };
    
        let req = https.request(request_params, response_handler);
        req.end();
    }
    
    if (subscriptionKey.length === 32) {
        bing_web_search(term);
    } else {
        console.log('Invalid Bing Search API subscription key!');
        console.log('Please paste yours into the source code.');
    }
});
app.get('/api/latest/imagesearch/',(req,res)=>{
    let result=mongoapi.resultFn(res);
});
app.listen(3000,(err)=>{
    console.log("Server started");
});