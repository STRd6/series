Series
======

Draw a series of data.

    PixieCanvas = require "pixie-canvas"

    size = 100
    width = 400
    height = 400
    series = [0...size].map -> 0

    chunkX = (width/size).floor()
    chunkY = (height/size).floor()

    backgroundColor = "white"
    foregroundColor = "black"

    # TODO Dynamic width and height ?
    canvas = PixieCanvas
      width: width
      height: height

    element = canvas.element()

    $("body").append element
    
    valuesElement = $ "<pre>",
      text: JSON.stringify(series)

    $("body").append valuesElement

    active = false
    lastPosition = null

When we click within the canvas set the value for the position we clicked at.

    $(element).on "mousedown", (e) ->
      active = true

      position = getPosition(e)
      setValue(position)
      lastPosition = position

When the mouse moves apply a change for each x value in the intervening positions.

    $(element).on "mousemove", (e) ->
      if active
        position = getPosition(e)

        deltaX = position.x - lastPosition.x
        deltaY = position.y - lastPosition.y
        signX = deltaX.sign()

        [lastPosition.x..position.x].map (x) ->
          if delta = position.x - x
            y = -((delta * deltaY) / deltaX).floor()
          else
            y = 0

          setValue
            x: x
            y: position.y + y

        lastPosition = position

Whenever the mouse button is released, deactivate.

    $(document).on "mouseup", (e) ->
      active = false

Get the local position from a mouse event within the canvas.

    getPosition = (e) ->
      localPosition(e)
      {localX:x, localY:y} = e

      x: (x/chunkX).floor()
      y: (y/chunkY).floor()

Set an x,y value of the series.

    setValue = ({x, y}) ->
      series[x] = y

      # TODO: Make this an observer?
      redraw(x)
      valuesElement.text JSON.stringify(series)

Redraw a specific x value.

    redraw = (x) ->
      y = series[x]

      canvas.drawRect
        color: backgroundColor
        x: x * chunkX
        y: 0
        width: chunkX
        height: height

      canvas.drawRect
        color: foregroundColor
        x: x * chunkX
        y: y * chunkY
        width: chunkX
        height: height - y * chunkY

Draw the initial values.

    series.map (y, x) ->
      redraw(x)

Helpers
-------

Local event position.

    localPosition = (e) ->
      parentOffset = $(e.currentTarget).parent().offset()

      e.localX = e.pageX - parentOffset.left
      e.localY = e.pageY - parentOffset.top

      return e
