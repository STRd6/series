{discreteHartleyTransform:dht} = require "../dft"

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
