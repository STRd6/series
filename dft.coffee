
{atan2, cos, sin, sqrt} = Math
τ = 2 * Math.PI

module.exports = DFT =
  # Transform a series of complex values
  discreteFourierTransform: (series) ->
    N = series.length
    rootN = sqrt(N)
    divRootN = (x) -> x / rootN

    [0...N].map (k) ->
      series.map ([x, y], n) ->
        θ = -τ * k * n / N
        [
          x *  cos(θ) + y * sin(θ)
          x * -sin(θ) + y * cos(θ)
        ]
      .reduce((a, b) ->
        [a[0] + b[0], a[1] + b[1]]
      , [0, 0])
      .map divRootN

  inverseDiscreteFourierTransform: (series) ->
    x = DFT.discreteFourierTransform(series)
    x.push(x.shift())
    x.reverse()

    return x

  # Transform a series of real values
  # https://en.wikipedia.org/wiki/Discrete_Hartley_transform
  discreteHartleyTransform: (series) ->
    N = series.length

    [0...N].map (k) ->
      series.map (x, n) ->
        θ = -τ * k * n / N
        x * (cos(θ) + sin(θ))
      .reduce((a, b) ->
        a + b
      , 0) / sqrt(N)

  polar: (series) ->
    series.map ([r, i]) ->
      [
        sqrt(r * r + i * i)
        atan2(i, r) / τ
      ]
