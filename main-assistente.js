const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

function lerConfig() {
    const configPath = path.join(__dirname, 'config.json');
    const conteudo = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(conteudo);
}

function criarJanela() {
    const config = lerConfig();

    const janela = new BrowserWindow({
        width: 480,
        height: 750,
        title: 'Atende Aí - Assistente Social',
        autoHideMenuBar: true,
        resizable: true
    });

    janela.loadURL(`${config.servidorURL}/assistente.html`);
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