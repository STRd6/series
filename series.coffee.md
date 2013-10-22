Series
======

Draw a series of data.

    drawSynthesis = require "./synthesis"
    TouchCanvas = require "./touch_canvas"

    size = 8
    width = 200
    height = 200
    series = [0...size].map -> 0

    chunkX = (width/size).floor()
    chunkY = (height/size).floor()

    backgroundColor = "white"
    foregroundColor = "black"

    # TODO Dynamic width and height ?
    canvas = TouchCanvas
      width: width
      height: height

    element = canvas.element()

    $("body").append element

    synthesisCanvas = TouchCanvas
      width: width
      height: height
    $("body").append synthesisCanvas.element()

    valuesElement = $ "<pre>",
      text: JSON.stringify(series)

    $("body").append valuesElement

    $("body").append $ "<style>",
      text: require "./style"

When we click within the canvas set the value for the position we clicked at.

    canvas.on "touch", (position) ->
      setValue(position.scale(size).floor())

When the mouse moves apply a change for each x value in the intervening positions.

    canvas.on "move", (position, lastPosition) ->
      position = position.scale(size).floor()
      lastPosition = lastPosition.scale(size).floor()

      delta = position.subtract(lastPosition)

      delta.x.abs().times (x) ->
        # Starting from the last position, moving to the current position
        p = Point.interpolate(lastPosition, position, x / delta.x).floor()

        setValue p

      setValue(position)

Set an x,y value of the series.

    setValue = ({x, y}) ->
      series[x] = y

      # TODO: Make this an observer?
      redraw(x)

      input = series.map (n) -> [n, 0]
      transformed = DFT(input)
      inverse = inverseDFT(transformed)

      valuesElement.text """
        #{JSON.stringify(series)}

        DFT
        #{format transformed}

        Inverse DFT
        #{format inverse}

        Polar
        #{format polar(transformed)}
      """

      synthesisCanvas.clear()
      synthesisCanvas.withTransform Matrix.scale(width, height), (canvas) ->
        drawSynthesis(canvas, transformed, input)

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

DFT

    {atan2, cos, sin, sqrt} = Math
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

    polar = (series) ->
      series.map ([r, i]) ->
        [
          sqrt(r * r + i * i)
          atan2(i, r) / τ
        ]

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
