const express = require('express');
const Joi = require('joi');

const approveKYCSatus = require('./app/approveKYCStatus');
const checkBalance = require('./app/checkBalance');
const checkKYCStatus = require('./app/checkKYCStatus');
const getBalanceOrgUsers = require('./app/getBalanceOrgUsers');
const getUserAccountStatement = require('./app/getUserAccountStatement');
const readUserPrivateDetails = require('./app/readUserPrivateDetails');
const registerHDFCUser = require('./app/registerHDFCUser');
const registerUserOnApp = require('./app/registerUserOnApp');
const registerUserAccount = require('./app/registerUserAccount');
const transferAmount = require('./app/transferAmount');
const enrollHDFCAdmin = require('./app/enrollHDFCAdmin');
const invokeTransaction = require('./app/invokeTransaction');

const app = express();
app.use(express.json());

app.post('/api/:org/enroll/admin', async (req,res)=>{

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    let response = await enrollHDFCAdmin();

    if(response && response.success){

        console.log(`Enroll was Success: ${response.message}`);
        res.status(200).json(response);

    }else{
        console.log(`Enroll was Failure: ${response.message}`);
        res.status(401).json(response);
        return;
    }
});

app.post('/api/:org/:user', async (req,res)=>{

    const schema = Joi.object({
        userAffiliation: Joi.string().min(3).required(),
        userAddress: Joi.string().min(10).required(),
    });
    
    const result = schema.validate(req.body);
    
    console.log(result);
    
    if (result.error) {
        return res.status(400).send(result.error);
    }

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    if(!req.params.user && req.params.user.length >3 ){
        return res.status(400).send("Input validation error w.r.t user");
    }

    let response = await registerHDFCUser(req.params.user,req.body.userAffiliation,req.params.org);

    if(response && response.success){

        console.log(`Enroll was Success: ${response.message}`);
        res.status(200).json(response);

    }else{
        console.log(`Enroll was Failure: ${response.message}`);
        res.status(401).json(response);
        return;
    }

    if(req.body.userAffiliation == 'hdfc.user'){
        
        response = await registerUserOnApp(req.params.user, req.body.userAddress);
        
        if(response && response.success){
            
            console.log(`User Registration on App was Success: ${response.message}`);
            
            res.status(200).json(response);
        }else{
            console.log(`User Registration on App was Failure: ${response.message}`);
            res.status(401).json(response);
        }
    }
});

app.get('/api/:org/:user', async (req,res)=>{

    if(!req.params.user && req.params.user.length >3 ){
        return res.status(400).send("Input validation error w.r.t user");
    }

    let response = await readUserPrivateDetails(req.params.user);

    if(response && response.success){

        console.log(`Read User Private Details was Success: ${response.message}`);

        res.status(200).json(response);
    }else{
        console.log(`Read User Private Details was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.post('/api/:org/account/:user', async (req,res)=>{

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    if(!req.params.user && req.params.user.length >3 ){
        return res.status(400).send("Input validation error w.r.t user");
    }

    let bank = req.params.org;

    let response = await registerUserAccount(req.params.user,bank.toUpperCase());

    if(response && response.success){

        console.log(`Register User Account was Success: ${response.message}`);

        res.status(200).json(response);
    }else{
        console.log(`Register User Account was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.post('/api/:org/account/kyc/:accountId', async (req,res)=>{

    const schema = Joi.object({
        user: Joi.string().min(3).required(),
    });
    
    const result = schema.validate(req.body);
    
    console.log(result);
    
    if (result.error) {
        return res.status(400).send(result.error);
    }

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    if(!req.params.accountId && req.params.accountId.length >3 ){
        return res.status(400).send("Input validation error w.r.t accountID");
    }

    let response = await approveKYCSatus(req.body.user,req.params.accountId);

    if(response && response.success){

        console.log(`Approval Of KYC was Success: ${response.message}`);

        res.status(200).json(response);
    }else{
        console.log(`Approval Of KYC was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.get('/api/:org/account/kyc/:accountId', async (req,res)=>{

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    if(!req.params.accountId && req.params.accountId.length >3 ){
        return res.status(400).send("Input validation error w.r.t accountID");
    }

    let response = await checkKYCStatus(req.params.accountId);

    if(response && response.success){

        console.log(`KYC check was Success: ${response.message}`);
        res.status(200).json(response);
        
    }else{
        console.log(`KYC check was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.get('/api/:org/account/balance/:accountId', async (req,res)=>{

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    if(!req.params.accountId && req.params.accountId.length >3 ){
        return res.status(400).send("Input validation error w.r.t accountID");
    }

    let user = req.params.accountId.split("@")[0];

    let response = await checkBalance(user,req.params.accountId);

    if(response && response.success){

        console.log(`Balance check was Success: ${response.message}`);
        res.status(200).json(response);
        
    }else{
        console.log(`Balance check was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.get('/api/:org/account/statement/:accountId', async (req,res)=>{

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    if(!req.params.accountId && req.params.accountId.length >3 ){
        return res.status(400).send("Input validation error w.r.t accountID");
    }

    let user = req.params.accountId.split("@")[0];

    let response = await getUserAccountStatement(user,req.params.accountId);

    if(response && response.success){

        console.log(`Get Account Statement was Success: ${response.message}`);
        res.status(200).json(response);
        
    }else{
        console.log(`Get Account Statement was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.get('/api/:org/account/balances', async (req,res)=>{
    
    const schema = Joi.object({
        user: Joi.string().min(3).required(),
    });
    
    const result = schema.validate(req.body);
    
    console.log(result);

    if (result.error) {
        return res.status(400).send(result.error);
    }

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    let bank = req.params.org;
    console.log(bank);
    let response = await getBalanceOrgUsers(req.body.user,bank.toUpperCase());

    if(response && response.success){

        console.log(`Get Balance for Org Users was Success: ${response.message}`);
        res.status(200).json(response);
        
    }else{
        console.log(`Get Balance for Org Users was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.put('/api/:org/amount/transfer', async (req,res)=>{
    
    const schema = Joi.object({
        user: Joi.string().min(3).required(),
        beneficiary: Joi.string().min(3).required(),
        remitter: Joi.string().min(3).required(),
        amount: Joi.number().integer().min(1)
    });
    
    const result = schema.validate(req.body);
    
    console.log(result);

    if (result.error) {
        return res.status(400).send(result.error);
    }

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    let response = await transferAmount(req.body.user,req.body.remitter,req.body.beneficiary,req.body.amount);

    if(response && response.success){
        console.log(`Transfer was Success: ${response.message}`);
        res.status(200).json(response);
        
    }else{
        console.log(`Transfer was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

app.post('/api1/:org/invoke', async (req,res)=>{

    if(req.params.org != 'hdfc'){
        return res.status(400).send("This request was meant for hdfc organization");
    }

    let response = await invokeTransaction(req.body.fcn, req.body.args, req.body.userId);

    if(response && response.success){

        console.log(`Invoke was Success: ${response.message}`);
        res.status(200).json(response);

    }else{
        console.log(`Invoke was Failure: ${response.message}`);
        res.status(401).json(response);
    }
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`HDFC server listening on port ${port}....`));