Series
======

Draw a series of data.

    PixieCanvas = require "pixie-canvas"

    size = 10
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

      transformed = DFT(series.map (n) -> [n, 0])
      inverse = inverseDFT(transformed)

      valuesElement.text """
        #{JSON.stringify(series)}
        
        DFT
        #{format transformed}
        
        Inverse DFT
        #{format inverse}
      """

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

DFT

    {cos, sin, pow, E:e, sqrt} = Math
    τ = 2 * Math.PI

    DFT = (series) ->
      N = series.length
      rootN = sqrt(N)
      divRootN = (x) -> x / rootN

      [0...N].map (k) ->
        series.map ([x, y], n) ->
          theta = -τ * k * n / N
          [
            x *  cos(theta) + y *  sin(theta)
            x * -sin(theta) + y * -cos(theta)
          ]
        .reduce((a, b) ->
          [a[0] + b[0], a[1] + b[1]]
        , [0, 0])
        .map divRootN

    inverseDFT = (series) ->
      do (x = DFT(series)) ->
        x.push(x.shift())
        x.reverse()

Format for output

    format = (series) ->
      series.map (array) ->
        array.map (i) ->
          v = i.toFixed(3)
          "#{whitespace(10 - v.length)}#{v}"
        .join("")
      .join("\n")

    whitespace = (n) ->
      [0...n].map(-> " ").join("")
