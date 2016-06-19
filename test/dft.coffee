{discreteHartleyTransform:dht, discreteFourierTransform:dft} = require "../dft"

equalEnough = (a, b, places=6) ->
  assert.equal a.toFixed(places), b.toFixed(places)

complexEqual = (a, b) ->
  equalEnough(a[0], b[0])
  equalEnough(a[1], b[1])

add = (a, b) ->
  a + b

multiply = (a, b) ->
  a * b

pairwise = (seriesA, seriesB, operation) ->
  seriesA.map (a, i) ->
    b = seriesB[i]
    operation(a, b)

pairwiseAdd = (seriesA, seriesB) ->
  pairwise(seriesA, seriesB, add)

pairwiseMultiply = (seriesA, seriesB) ->
  pairwise(seriesA, seriesB, multiply)

# TODO: Polynomial Convolution

describe "Hartley", ->
  it "should convolute in the time domain as pairwise multiplication in the frequency domain", ->
    seriesA = [13, 1, 2, 3, -3, -2, -1, 0]
    seriesB = [11, 0, 1, 0, -1,  0, -1, 0]

    sum = pairwiseAdd(seriesA, seriesB)
    sum2 = pairwiseAdd(dht(seriesA), dht(seriesB))
    mult2 = pairwiseMultiply(dht(seriesA), dht(seriesB))

    console.log sum, dht(sum2), dht(mult2)

describe "Fourier", ->
  it "should match the results from Wolfram Alpha", ->
    series = [
      [7, 3]
      [0, 0]
      [7, 0]
      [0, 2]
      [7, 0]
      [0, -1]
      [0, -4]
      [7, 0]
    ]
    result = dft(series)
    
    computed = [[9.899494936611665,0],[-0.4142135623730951,1.535533905932737],[3.535533905932737,-6.2803698347351e-16],[-1.085786437626905,-2.9142135623730945],[4.949747468305831,-0.7071067811865472],[-2.4142135623730896,5.535533905932745],[1.4142135623730954,4.949747468305833],[3.914213562373101,0.08578643762690011]]

    result.map (a, n) ->
      complexEqual(a, computed[n])
