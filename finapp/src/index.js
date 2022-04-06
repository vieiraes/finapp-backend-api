const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');



const app = express();
// Create a new express application instance


app.use(express.json())
//middleware do express para aceitar json





const customersDB = [];
// {
//     accountId: accountId,
//     wallet: walletCode,
//     name,
//     cpf,
//     created_at: new Date(),
//     balance: getBalance(statementsDB)
//     statements: []
// }

const walletsDB = [];
// {    
//     accountId: accountId,





const statementsDB = [];
// {
//     amount,
//     description,
//     created_at: new Date(),
//     transactionType: [],
// }

function verifyIfExistsAccountCPFInParams(request, response, next) {
    const { cpf } = request.params;
    const customer = customersDB.find(customer => customer.cpf === cpf);



    if (!customer) {
        return response.status(400).json({
            error: "Customer CPF not found"
        });
    }

    request.customer = customer;
    // esta linha garante que o customer será acessível em todas as funções que estiverem dentro do middleware
    return next();
};








app.post("/account", (request, response) => {


    const { cpf, name } = request.body;

    const accountCode = uuidv4();
    const walletCode = crypto.randomBytes(8).toString('HEX');



    const costumerCPFAlreadyExists = customersDB.some((customerCPF) => customerCPF.cpf === cpf);
    // o some retorna true ou false
    if (costumerCPFAlreadyExists === true) {
        return response.status(400).json({
            cpf: cpf,
            message: "Error. Customer CPF already exists"
        });

    }


    const objetoResponse = {
        accountId: accountCode,
        name: name,
        cpf: cpf,
        wallet: walletCode,
        created_at: new Date(),
        balance: 0
        
    };


    // gravar no array
    customersDB.push(
        {
            accountId: objetoResponse.accountId,
            name: objetoResponse.name,
            cpf: objetoResponse.cpf,
            wallet: objetoResponse.wallet,
            balance: objetoResponse.balance,
            created_at: objetoResponse.created_at,
            statements: []
        }
    );



    return response.status(200).send({
        message: "Account created",
        accountId: objetoResponse.accountId,
        wallet: objetoResponse.wallet,
        name: objetoResponse.name,
        cpf: objetoResponse.cpf,
        created_at: objetoResponse.created_at,
    });


});



// app.get("/wallets", (request, response) => {



//     return response.status(200).json({
//         message: "all wallets listed",
//         walleta: [{

//             walletId: customersDB.wallet,
//             created_at: customersDB.created_at,
//             balance: customersDB.balance,
//             statements: [{
//                 statementId: customersDB.statements,
//                 transactionType: customersDB.transactionType,
//                 description: customersDB.description,
//                 created_at: customersDB.created_at,
//             }]
//         }]



//     })
// });



//LISTANDO TODAS AS CONTAS
app.get("/accounts", (request, response) => {
    const { customer } = request;


    const accounts = customersDB.map(customer => {


        // o que faz o map?
        // ele vai percorrer o array e vai retornar um novo array com os dados que queremos
        return {
            name: customer.name,
            cpf: customer.cpf,
            wallet: customer.wallet,
            accountId: customer.accountId,
            created_at: customer.created_at,
            balance: getBalance(customer.statements)
        };
    });


    return response.status(200).json({

        resume: {
            length: customersDB.length,
            accounts: (accounts.sort((a, b) => b.created_at - a.created_at))

        },
    });
});










//LISTANDO STATEMENTS DE UMA CONTA
app.get("/statements/:cpf", verifyIfExistsAccountCPFInParams, (request, response) => {


    const { customer } = request;
    // esta linha esta recuperando o customer que está dentro do middleware declarado


    return response.status(200).json({
        balance: getBalance(customer.statements),
        statements: customer.statements.sort((a, b) => b.created_at - a.created_at)
    });
});









function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {

        if (operation.transactionType === 'deposit') {
            return acc + operation.amount;
        } else if (operation.transactionType === 'withdraw') {
            return acc - operation.amount;
        } else {
            return acc;
        }

    }, 0);
    // o 0 significa que o valor inicial é 0

    return balance;
};







//CRIANDO UMA TRANSAÇÃO DE TIPO DEPOSIT
app.post("/deposit/:cpf", verifyIfExistsAccountCPFInParams, (request, response) => {

    const { customer } = request;// esta linha esta recuperando o customer que está dentro do middleware declarado
    const { amount, description } = request.body;



    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        transactionType: 'deposit'
    };

    customer.statements.push(statementOperation);

    return response.status(200).json({
        message: "Deposit success",
        type: statementOperation.transactionType,
        amount: statementOperation.amount,
        balance: getBalance(customer.statements),
        created_at: statementOperation.created_at
    });
});









//LISTANDO O SALDO DA CONTA
app.get("/balance/:cpf", verifyIfExistsAccountCPFInParams, (request, response) => {
    const { customer } = request;


    return response.status(200).json({
        message: "Net balance",
        balance: getBalance(customer.statements)
    });

});




//CRIANDO UMA TRANSAÇÃO DE TIPO WITHDRAW
app.post("/withdraw/:cpf", verifyIfExistsAccountCPFInParams, (request, response) => {

    const { amount, description } = request.body;
    const { customer } = request;





    const balance = getBalance(customer.statements);



    if (balance < amount) {
        return response.status(400).json({ error: "Insufficient balance" });
    }



    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        transactionType: 'withdraw'

    };





    customer.statements.push(statementOperation);

    return response.status(200).json({
        message: "Withdraw success",
        transactionType: statementOperation.transactionType,
        amount: statementOperation.amount,
        balance: getBalance(customer.statements),
        created_at: statementOperation.created_at,
    });
});








//#################### MIDDLEWARE





function verifyExistsWallet(request, response, next) {

    const customerCPF = customersDB.find(customer => customer.cpf === request.params.cpf);

    const customerWallet = customersDB.find(customer => customer.wallet === request.body.customerCPF)

    if (!customerWallet) {
        return response.status(400).json({
            message: "Error. Wallet not found"
        })
    }



    return next();
}



function verifyValidRoute(request, response, next) {


    const routeUrl = request.url;
    const statusCode = request.statusCode;

    if (statusCode === 404 || routeUrl !== '/') {

        return response.status(404).json({ error: "Route not found" });
    }
    return next();
};






// PORTA DO APP
app.listen(3000);