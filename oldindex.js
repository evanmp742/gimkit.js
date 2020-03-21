const fetch = require("node-fetch")
const WebSocket = require("ws")
const readline = require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question("What is the game code? ", code => {
  fetch("https://www.gimkit.com/matchmaker/find-room", {
    method: "POST",
    headers: {"Content-Type": "application/json;charset=UTF-8"},
    body: JSON.stringify({code})
  })
  .then(res => res.json())
  .then(sendName)
})

function stringToBytes(name) {
  let buffer = new ArrayBuffer(name.length*2)
  let view = new Uint16Array(buffer)

  for (let i = 0; i < name.length ; i += 1) {
    view[i] = name.charCodeAt(i)
  }
  return view
}

function sendName({serverUrl, roomId}) {
  const url = serverUrl.replace("https", "wss")
  const ws = new WebSocket(url + "/blueboat/?id=Xvz3J1H-gC-rI2Eej-kNI&EIO=3&transport=websocket")
  const bytes = Uint16Array.of(0x0484, 0xa474, 0x7970, 0x6502, 0xa464, 0x6174, 0x6192, 0xb562, 0x6c75, 0x6562, 0x6f61, 0x745f, 0x5345, 0x4e44, 0x5f4d, 0x4553, 0x5341, 0x4745, 0x83a4, 0x726f, 0x6f6d, 0xae00, ...[...stringToBytes(roomId)], 0x00a3, 0x6b65, 0x79b3, 0x504c, 0x4159, 0x4552, 0x5f55, 0x5345, 0x525f, 0x4445, 0x5441, 0x494c, 0x53a4, 0x6461, 0x7461, 0x83a4, 0x6e61, 0x6d65, 0xa400, ...[...stringToBytes("gimkit.js")], 0x00a7, 0x6772, 0x6f75, 0x7049, 0x64c0, 0xad67, 0x726f, 0x7570, 0x4d65, 0x6d62, 0x6572, 0x4964, 0xc0a7, 0x6f70, 0x7469, 0x6f6e, 0x7381, 0xa863, 0x6f6d, 0x7072, 0x6573, 0x73c3, 0xa36e, 0x7370, 0xa12f)
  console.log();
}