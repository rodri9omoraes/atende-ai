const { app, BroserWindow, BrowserWindow } = require('electron');

function criarJanela() {
    const janela = new BrowserWindow({
        width: 480,
        height: 700,
        title: 'Atende Aí - Recepção',
        autoHideMenuBar: true,
        resizable: true
    });

    //Aponta pro servidor local que já está rodando
    janela.loadURL('http://localhost:3000/recepcao.html');
}

app.whenReady().then(() => {
    criarJanela();

    app.on('activate', () => {
        if(BroserWindow.getAllWindows().length === 0) {
            criarJanela();
        }
    });
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});