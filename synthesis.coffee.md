Sythesis
========

Draw sythesis on a canvas.

    {cos, sin, sqrt, min, max} = Math
    τ = 2 * Math.PI

    module.exports = (canvas, series, actual) ->
      n = 100

      points = [0..n].map (i) ->
        x = i * τ / (2 * n)

        y = series.map ([real, imaginary], k) ->
          real * cos(k * x) + imaginary * sin(k * x)
        .sum()

        x = (x * 2 / τ)

        [x, y]

      
      # Normalize y
      
      yValues = points.map ([x, y]) -> y
      
      minimum = yValues.minimum()
      maximum = yValues.maximum()
      spread = maximum - minimum

      points.map ([x, y]) ->
        [x, (y - minimum) / spread]
      .map ([x, y]) ->
        canvas.drawCircle
          x: x
          y: y
          radius: 0.01
          color: "rgb(100, 100, 100)"

      # TODO: Figure out how to get the correct scaling here
      # NOTE: y's are all zero because we're getting real values only
      actual.map ([x, y], i) ->
        [i / actual.length, (x * sqrt(actual.length) - minimum) / spread ]
      .map ([x, y]) ->
        canvas.drawCircle
          x: x
          y: y
          radius: 0.01
          color: "rgb(0, 0, 255)"
