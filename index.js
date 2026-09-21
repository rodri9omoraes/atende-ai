const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//Serve os da pasta "public" (onde vão ficar as páginas dos dois pcs)
app.use(express.static('public'));

//Guarda o status atual da Assistente Social
let status = 'sala'; //pode ser 'sala' ou 'fora'

io.on('connection', (Socket) => {
    console.log('Alguém conectou:', Socket.id);

    //Assim que conectar, manda o status atual pra quem entrou
    Socket.emit('status-atual', status);

    //Recepção avisa que tem alguém esperando
    Socket.on('chamar', (dados) => {
        io.emit('nova-chamada', dados);//Avisa a Assistente Social

    });

    //Assistente Social responde se pode atender
    Socket.on('resposta', (podeAtender) => {
        io.emit('resposta-recebida', podeAtender);
    });

    //Assistente Social muda o status (Se está na sala ou não)
    Socket.on('mudar-status', (novoStatus) => {
        status = novoStatus;
        io.emit('status-atual', status);
    });

    Socket.on('proximo-atendimento', () => {
        io.emit('atendimento-finalizado');
    })

    Socket.on('disconnect', () => {
        console.log('Desconectou:', Socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:${PORT}');
});