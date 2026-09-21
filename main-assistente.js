const { app, BrowserWindow } = require('electron');

function criarJanela() {
    const janela = new BrowserWindow({
        width: 480,
        height: 750,
        title: 'Atende Aí - Assistente Social',
        autoHideMenuBar: true,
        resizable: true
    });

    janela.loadURL('http://localhost:3000/assistente.html');
}

app.whenReady().then(() => {
    criarJanela();

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0) {
            criarJanela();
        }
    });
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
})