Sythesis
========

Draw sythesis on a canvas.

    {cos, sin, sqrt, min, max} = Math
    τ = 2 * Math.PI

    # TODO: Smarter scaling
    module.exports = (canvas, series, actual, scale=1/20) ->
      n = 100

      points = [0..n].map (i) ->
        x = i * τ / n

        y = series.map ([r, i], k) ->
          r * cos(k * x) + i * sin(k * x)
        .sum()

        [x, y]

      # Normalize y

      yValues = points.map ([x, y]) -> y

      minimum = yValues.minimum()
      maximum = yValues.maximum()
      spread = maximum - minimum

      specialInvert(points.map ([x, y]) ->
        # Normalize to be between 0 and 1
        [x / τ, y * scale]
      ).map ([x, y]) ->
        canvas.drawCircle
          x: x
          y: y
          radius: 0.01
          color: "rgb(100, 100, 100)"

      # NOTE: y's are all zero because we're getting real values only
      actual.map ([x, y], i) ->
        [i / actual.length, x * sqrt(actual.length) * scale]
      .map ([x, y]) ->
        canvas.drawCircle
          x: x
          y: y
          radius: 0.01
          color: "rgb(0, 0, 255)"

Helpers
-------

    specialInvert = (series) ->
      do (x = series.copy()) ->
        x.push(x.shift())
        x.reverse()
