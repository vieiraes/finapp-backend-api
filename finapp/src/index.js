const express = require('express');
const { v4: uuidv4 } = require('uuid');



const app = express();
// Create a new express application instance


//middleware of express
app.use(express.json());


// middleware
function verifyIfExistAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find(customer => customer.cpf === cpf);




    if (!customer) {
        return response.status(400).json({ error: "Customer CPF not found" });

    }

    request.customer = customer;


    return next();


}


function verifyExistsWallet(request, response, next) {

    const { wallet } = request.params;

    const customer = customers.find(customer => customer.wallet === wallet);

    return next();
};





const customers = [];




app.post("/account", (request, response) => {


    const { cpf, name, wallet } = request.body;
    const costumerAlreadyExists = customers.some((customer) => customer.cpf === cpf);
    // o some retorna true ou false


    if (costumerAlreadyExists === true) {
        return response.status(400).json({ error: "Customer already exists" });

    }


    customers.push(
        {
            id: uuidv4(),
            name,
            cpf,
            wallet,
            statement: [] 
            //statement.sort((a, b) => a.date - b.date)
            
        }



    );

    return response.status(200).send({ message: "Customer created" });


});

app.post("/deposit", verifyIfExistAccountCPF, (request, response) => {


    const { amount, description, created_at } = request.body;
    // os dados que EU QUERO pegar do corpo da requisição

    //how to convert amount to a positive value

    const { customer } = request;

    // os dados que eu quero pegar do request



    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        type: "deposit",

    };
    //os dados que eu que seja adicionado no statement



    customer.statement.push(statementOperation);
    //ler assim: empurra uma statementOperation no statement do customer
    // push adiciona um elemento no array na posição especificada



    return response.status(200).json({
        message: "Deposit success",
        type: statementOperation.type,
        amount: statementOperation.amount,
        balance: getBalance(customer.statement),
        created_at: statementOperation.created_at
    });


});


app.post("/withdraw", verifyIfExistAccountCPF, (request, response) => {

    const { amount, description, created_at } = request.body;
    //informacao que vem do body

    const { customer } = request;
    //informacao que vem do request

    const balance = getBalance(customer.statement);


    if (balance < amount) {
        return response.status(400).json({ error: "Insufficient balance" });
    }


    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        type: "withdraw"

    };


    customer.statement.push(statementOperation);

    return response.status(200).json({
        message: "Withdraw success",
        type: statementOperation.type,
        amount: statementOperation.amount,
        balance: getBalance(customer.statement),
        created_at: statementOperation.created_at,
    });
});


function getBalance(statement) {
    var balance = statement.reduce((acc, operation) => {
        if (operation.type === 'deposit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);
    // o 0 significa que o valor inicial é 0

    return balance;
};




//app.user(verifyIfExistAccountCPF);
// insere um middleware em todas as rotas, usaro somente para isso


app.get("/balance", verifyIfExistAccountCPF, (request, response) => {

    const { customer } = request;
    //informacao que vem do body

    return response.status(200).json({
        message: "Net balance",
        balance: getBalance(customer.statement)
    });

});


app.get("/account-statements", verifyIfExistAccountCPF, (request, response) => {

    
    
    const { customer } = request;

    return response.status(200).json({
        statements: customer.statement.sort((a, b) => b.created_at - a.created_at)
       
    });
    

    



})










app.listen(3000);