const { BrowserWindow } = require('electron')
const { app } = require('electron')

app.on('ready', () => {
    let win = new BrowserWindow({ width: 800, height: 600 })
    win.on('closed', () => {
        win = null
    })

    win.loadURL('https://www.gimkit.com/play')
})