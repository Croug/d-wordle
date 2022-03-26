const { ThreadChannel, Channel } = require("discord.js");
const words = require("../words.json");
const CreateBoard = require("./wordle-board");

const letters = 'abcdefghijklmnopqrstuvwxyz';

String.prototype.replaceAt = function(i, char) {
  return this.substr(0, i) + char + this.substr(i + 1);
}

module.exports = class {
  /**
   * 
   * @param {Channel} channel 
   */
  constructor(channel) {
    this.channel = channel;
    this.word = words[Math.floor(Math.random() * words.length)];
    this.guesses = 6;
    this.exactLetters = [];
    this.closeLetters = [];
    this.wrongLetters = [];
    this.guessed = [];
    this.colors = [];

    this.updateBoard();
  }

  async updateBoard() {
    // let msg =  `Send message to guess!\n` +
    // `[X] = Correct letter in correct position\n` +
    // `(X) = Correct letter in wrong position\n` +
    // `Guesses remaining: ${this.guesses}\n` +
    // `Letters: `

    // for(let l of letters) {
    //   if(this.exactLetters.includes(l)) msg += `[${l}]`;
    //   else if(this.closeLetters.includes(l)) msg += `(${l})`;
    //   else if(this.wrongLetters.includes(l)) msg += `~~${l}~~`;
    //   else msg += l;
    // }

    const board = await CreateBoard(this.guessed, this.colors, this.closeLetters, this.exactLetters, this.wrongLetters)

    if(this.statusMessage) await this.statusMessage.edit(board)
    else this.statusMessage = await this.channel.send(board)
  }

  /**
   * 
   * @param {Message} msg 
   */
  async onGuess(msg) {
    await msg.delete()
    let txt = msg.content.toLowerCase();
    if(txt.length != 5) return this.handleInvalid(txt)
    if(!words.includes(txt)) return this.handleInvalid(txt)
    return this.handleGuess(txt)
  }

  getAllIndices(arr, val) {
    var indices = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indices.push(i);
    }
    return indices;
}

  async handleGuess(txt) {
    const exacts = [];
    const nears = [];
    let color = "XXXXX"
    for (let i = 0; i < 5; i++) {
      if(this.word[i] == txt[i]){
        exacts.push(i);
        color = color.replaceAt(i, `#`)
        if(this.exactLetters.indexOf(this.word[i]) < 0) this.exactLetters.push(this.word[i]);
      }
    }
    for(let i = 0; i < 5; i++) {
      if(exacts.includes(i)) continue;
      let t = this.getAllIndices(this.word, txt[i]).length;
      let c = this.getAllIndices(nears, txt[i]).length;
      exacts.forEach(x=>{
        if(this.word[x] == txt[i])c++
      })
      if(c < t) {
        nears.push(txt[i]);
        if(this.closeLetters.indexOf(txt[i]) < 0) this.closeLetters.push(txt[i]);
        color = color.replaceAt(i, `O`)
        continue
      }
      if(this.wrongLetters.indexOf(txt[i]) < 0) this.wrongLetters.push(txt[i]);
    }
    this.guessed.push(txt)
    this.colors.push(color)
    this.guesses--;
    await this.updateBoard()
    if(txt == this.word) {
      await this.channel.send(`You won! The word was ${this.word}`);
      await this.channel.setArchived();
      return true;
    }
    if(!this.guesses) {
      await this.channel.send("You lost!\nThe word was: " + this.word);
      if(this.channel.isThread()) await this.channel.setArchived();
      return true;
    }
  }

  async handleInvalid(txt) {
    let msg = await this.channel.send(`${txt} is not a valid word`)
    setTimeout(()=> msg.delete(), 2000)
  }
}