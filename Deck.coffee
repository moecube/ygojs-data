`'use strict'`

fs = require 'fs'
Card = require './Card'

class Deck
  constructor: ->
    @main = []
    @side = []
    @ex = []
    @classifiedMain = {}
    @classifiedSide = {}
    @classifiedEx = {}
    @form = 'id'

  classify: ->
    @classifyPack @main, @classifiedMain
    @classifyPack @side, @classifiedSide
    @classifyPack @ex, @classifiedEx
    this

  classifyPack: (from, to) ->
    for obj in from
      obj = obj.id if @form == 'card'
      if to[obj]
        to[obj] += 1
      else
        to[obj] = 1

  separateExFromMain: (environment) ->
    @transformToCards environment if @form != 'card'
    newMain = []
    for card in @main
      continue unless card
      if card.isEx
        @ex.push card
      else
        newMain.push card
    @main = newMain
    this

  transformToCards: (environment) ->
    return if @form == 'card'
    @main = @transformPackToCards environment, @main
    @side = @transformPackToCards environment, @side
    @ex = @transformPackToCards environment, @ex
    @form = 'card'
    this

  transformPackToCards: (environment, pack) ->
    answer = []
    answer.push environment[id] for id in pack
    answer

  transformToId: ->
    return if @form == 'id'
    @main = @transformPackToIds @main
    @side = @transformPackToIds @side
    @ex = @transformPackToIds @ex
    @form = 'id'
    this

  transformPackToIds: (pack) ->
    answer = []
    answer.push card.id for card in pack
    answer

  sort: (environment) ->
    @transformToCards environment if @form != 'card'
    @main.sort Card.deckSortLevel
    @side.sort Card.deckSortLevel
    @ex.sort Card.deckSortLevel
    this

  @fromString: (str) ->
    deck = new Deck()
    focus = deck.main
    lines = str.split "\n"
    for line in lines
      line = line.trim()
      if line.endsWith 'main'
        focus = deck.main
      else if line.endsWith 'side'
        focus = deck.side
      else if line.endsWith('ex') or line.endsWith('extra')
        focus = deck.ex
      else
        continue if line.startsWith '#'
        id = parseInt line
        focus.push id if id and id > 0
    deck

  toString: ->
    getId = (card) -> if typeof card == 'number' then card else card.id
    lines = ['# generated by ygojs-data.', '#main']
    lines = lines.concat @main.map getId
    lines.push '#extra'
    lines = lines.concat @ex.map getId
    lines.push '!side'
    lines = lines.concat @side.map getId
    lines = lines.map (id) -> if id then id else 0
    lines.join "\n"

  @fromFile: (filePath, callback) ->
    fs.readFile filePath, (buffer) ->
      callback @fromString buffer.toStirng()

  @fromFileSync: (filePath) ->
    @fromString fs.readFileSync(filePath).toString()

module.exports = Deck