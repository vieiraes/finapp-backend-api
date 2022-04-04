
// middleware
exports.verifyIfExistAccountCPF =  function verifyIfExistAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find(customer => customer.cpf === cpf);




    if (!customer) {
        return response.status(400).json({ error: "Customer CPF not found" });

    }

    request.customer = customer;


    return next();


}


exports.verifyExistsWallet =  function verifyExistsWallet(request, response, next) {

    const { wallet } = request.params;
    const customer = customers.find(customer => customer.wallet === wallet);


    return next();
}
