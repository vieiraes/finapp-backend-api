const express = require('express')


const app = express();

app.get("/users", (request, response) => {
    return response.json([
        'Diego',
        'Cleiton',
        'Robson',
        'Bruno'
    ]);
});

app.get("/", (request, response) => {
    return response.json({ "Message": "hello World" });

});



app.get("/cursos", (request, response) => {

    const query = request.query;
    console.log(query);
    return response.json([
        "curso 1",
        "curso 2",
        "curso 3",
        "curso 4"
    ]);

});




app.use(express.json());

app.post("/cursos", (request, response) => {
    const body = request.body;
    console.log(body);
    
    return response.json([
        "Curso 5"
    ]);
});



app.put("/cursos/:id", (request, response) => {
    const {id} = request.params;
    console.log(id);

    return response.json([
        "Curso PUT"
    ]);
});


app.patch("/cursos/:id", (request, response) => {
    return response.json([
        "Curso PATCH"
    ]);
});

app.delete("/cursos/:id", (request, response) => {
    return response.json([
        "Curso DELETE"
    ]);
});


app.listen(3000);