const { MessageAttachment, DiscordAPIError, MessageEmbed } = require('discord.js')
const { svg2png } = require('svg-png-converter')

const fs = require('fs')

const rectSize = 25
const rectPadding = 5

const keyWidth = 15
const keyHeight = 25
const keyPadding = 5
const keyRounding = 5
const keyOffset = (rectSize + rectPadding) * 5

const font = "Arial"

const colorKey = {
  'X': '#787c7e',
  'O': '#c9b458',
  '#': '#6aaa64'
}

/**
 * 
 * @param {Number} row 
 * @param {String} guess 
 * @param {String} colors 
 */
function getRow(row, guess, colors) {
  let ret = ""
  let mapped = Array.from(colors).map(c=>colorKey[c])
  Array.from(guess).forEach((letter, i) => {
    ret+= `<rect x="${i*(rectSize+rectPadding)}" y="${row*(rectSize+rectPadding)}" width="${rectSize}" height="${rectSize}" fill="${mapped[i]}" />`
    ret+= `<text x="${i*(rectSize+rectPadding) + rectSize/2}" y="${row*(rectSize+rectPadding) + rectSize/2}" text-anchor="middle" font-size="${rectSize/2}" fill="white" font-family="${font}">${letter}</text>`
  })

  return ret
}

function getEmptyRow(row) {
  let ret = ""

  for(let i = 0; i < 5; i++) {
    ret+= `<rect x="${i*(rectSize+rectPadding)}" y="${row*(rectSize+rectPadding)}" width="${rectSize}" height="${rectSize}" stroke="#d3d6da" fill="none" />`
  }

  return ret
}

function getKeyboard(closes, exacts, wrongs) {
  let ret = ''
  const maxWidth = (10 * keyWidth) + (9 * keyPadding)
  const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]

  const it = [
    letters.slice(0, 10),
    letters.slice(10, 19),
    letters.slice(19)
  ].forEach((row, rowIndex) => {
    let offset = (maxWidth - ((row.length * keyWidth) + ((row.length-1)*keyPadding))) / 2
    offset += keyOffset
    row.forEach((letter, letterIndex) => {
      let [color, fill] = getColor(letter.toLowerCase(), closes, exacts, wrongs)
      ret += `<rect x="${offset + (letterIndex * (keyWidth + keyPadding))}" y="${rowIndex * (keyHeight + keyPadding)}" width="${keyWidth}" height="${keyHeight}" rx="${keyRounding}" fill="${fill}" />`
      ret += `<text x="${offset + (letterIndex * (keyWidth + keyPadding)) + keyWidth/2}" y="${rowIndex * (keyHeight + keyPadding) + keyHeight/2}" text-anchor="middle" font-size="${keyHeight/2}" font-family="${font}" fill="${color}">${letter}</text>`
    })
  })

  return ret
}

function getColor(letter, closes, exacts, wrongs) {
  if(exacts.includes(letter)) return ['white', colorKey['#']]
  if(closes.includes(letter)) return ['white', colorKey['O']]
  if(wrongs.includes(letter)) return ['white', colorKey['X']]
  return ["black", "#d3d6da"]
}

module.exports = async function(guesses, colors, closes, exacts, wrongs) {
  let ret = `<svg width="400" height="180" xmlns="http://www.w3.org/2000/svg">`
  ret += getKeyboard(closes, exacts, wrongs)
  guesses.forEach((guess, row) => {
    ret += getRow(row, guess.toUpperCase(), colors[row])
  })
  
  for(let i = guesses.length; i < 6; i++) {
    ret += getEmptyRow(i)
  }
  ret += '</svg>'

  const buf = await svg2png({
    input: ret,
    encoding: 'buffer',
    format: 'png',
    quality: 1
  })

  return {
    embed: [new MessageEmbed().setTitle('Wordle').setImage('attachment://wordle.png')],
    files: [{
      attachment: buf,
      name: 'wordle.png'
    }]
  }
}