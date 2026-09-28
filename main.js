const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const AutoLaunch = require('auto-launch');

let tray = null;
let janela;
let janelaWidget = null;

// O config agora mora na pasta de dados do usuário do Windows,
// não mais dentro da pasta do projeto (assim cada PC guarda a própria escolha)
const configPath = path.join(app.getPath('userData'), 'config.json');

function lerConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return null; // ainda não configurado
  }
}

function salvarConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function abrirTelaSelecaoPapel() {
  janela = new BrowserWindow({
    width: 380,
    height: 420,
    title: 'Atende Aí - Configuração',
    autoHideMenuBar: true,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'icone.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  janela.loadFile(path.join(__dirname, 'public', 'selecionar-papel.html'));
}

function abrirApp(config) {
  const { x: telaX, y: telaY, width: larguraTela, height: alturaTela } = screen.getPrimaryDisplay().workArea;
  const larguraJanela = 500;
  const alturaJanela = 800;

  const opcoesJanela = {
    width: larguraJanela,
    height: alturaJanela,
    title: config.papel === 'recepcao' ? 'Atende Aí - Recepção' : 'Atende Aí - Painel da Assistente',
    autoHideMenuBar: true,
    resizable: true,
    icon: path.join(__dirname, 'assets', 'icone.ico'),
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  };

  //só a assistente abre fixada no canto
  if (config.papel === 'assistente') {
    opcoesJanela.x = telaX + larguraTela - larguraJanela - 15;
    opcoesJanela.y = telaY + alturaTela - alturaJanela - 80;
  }
  
  janela = new BrowserWindow(opcoesJanela);

  if (config.papel === 'recepcao') {
    require('./index.js'); // liga o servidor automaticamente
    janela.loadURL('http://localhost:3000/recepcao.html');
  } else {
    janela.loadURL(`${config.servidorURL}/assistente.html`);
    configurarBandeja(config);
    abrirWidget(config);

    //Em vez de fechar, esconde a janela
    janela.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        janela.hide();
      }
    });
  }
}

function configurarBandeja(config) {
  tray = new Tray(path.join(__dirname, 'assets', 'icone.ico'));
  tray.setToolTip('Atende Aí - Assistente Social');

  const menu = Menu.buildFromTemplate([
    { label: 'Abrir Atende Aí', click: () => janela.show() },
    { label: 'Sair', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(menu);

  //Duplo clique no ícone também abre
  tray.on('double-click', () => janela.show());
}

function abrirWidget(config) {
  const { x: telaX, y: telaY, width: larguraTela, height: alturaTela } = screen.getPrimaryDisplay().workArea;
  const larguraWidget = 155;
  const alturaWidget = 30;

  janelaWidget = new BrowserWindow({
    width: larguraWidget,
    height: alturaWidget,
    x: telaX + larguraTela - larguraWidget - 8,
    y: telaY + alturaTela - alturaWidget - 20,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  janelaWidget.loadURL(`${config.servidorURL}/widget-status.html`);
}

ipcMain.on('trazer-para-frente', () => {
  if (janela) {
    janela.show();
    janela.focus();
    //setTimeout(() => janela.setAlwaysOnTop(false), 3000); //fica "por cima" só por 3s
  }
});

ipcMain.on('papel-selecionado', (event, dados) => {
  salvarConfig(dados);

  const autoLauncher = new AutoLaunch({ name: 'Atende Aí' });
  autoLauncher.isEnabled().then((habilitado) => {
    if (!habilitado) autoLauncher.enable();
  });

  janela.close();
  abrirApp(dados);
});

app.whenReady().then(() => {
  const config = lerConfig();
  if (config && config.papel) {
    abrirApp(config);
  } else {
    abrirTelaSelecaoPapel();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});