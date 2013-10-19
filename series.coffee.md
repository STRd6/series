Series
======

Draw a series of data.

    PixieCanvas = require "pixie-canvas"

    size = 100
    width = 400
    height = 400
    series = []

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

    active = false
    lastPosition = null

    $(element).on "mousedown", (e) ->
      active = true

      position = getPosition(e)
      setValue(position)
      lastPosition = position

    $(document).on "mouseup", (e) ->
      active = false

    $(element).on "mousemove", (e) ->
      if active
        position = getPosition(e)
        setValue(position)

        deltaX = position.x - lastPosition.x
        deltaY = position.y - lastPosition.y
        signX = deltaX.sign()

        [lastPosition.x...position.x].map (x) ->
          delta = position.x - x
          y = -((delta * deltaY) / deltaX).floor()
          console.log x, y

          setValue
            x: x
            y: position.y + y
        
        lastPosition = position

    getPosition = (e) ->
      localPosition(e)
      {localX:x, localY:y} = e

      x: (x/chunkX).floor()
      y: (y/chunkY).floor()

    setValue = ({x, y}) ->
      series[x] = y

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

Helpers
-------

Local event position.

    localPosition = (e) ->
      parentOffset = $(e.currentTarget).parent().offset()

      e.localX = e.pageX - parentOffset.left
      e.localY = e.pageY - parentOffset.top

      return e
