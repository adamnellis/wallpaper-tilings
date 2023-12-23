
// Standard Normal variate using Box-Muller transform.
// From https://stackoverflow.com/a/36481059
function gaussianRandom(mean=0, stdev=1) {
  let u = 1 - Math.random(); //Converting [0,1) to (0,1)
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// Random integer between two numbers, inclusive
// Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
function integerRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 1].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r, g, b];
}

/*
function makeCurve(steps, dimensions, decay) {
  // Calculate coefficients for curve
  const magnitude_coefficients = []
  const angle_coefficients = []
  for (let i=-steps; i<steps; i++) {
    magnitude_coefficients.push(gaussianRandom() / (Math.abs(steps*dimensions + 1) + 0.5)**decay)
    angle_coefficients.push(i*dimensions + 1)
  }
  return {magnitude_coefficients, angle_coefficients}
}
*/

/**
 * All inputs & outputs in range [0, 1]
 */
function getColour1(x, y) {
  const red = x
  const green = y
  const blue = x*y
  const alpha = 1
  
  return [red, green, blue, alpha]
}

function getColour2(x, y) {
  const h = x
  const s = y
  const v = 1
  
  return [...hsvToRgb(h, s, v), 1]
}

function getColour(x, y) {
  const newX = 10*(x - 0.5)
  const newY = 10*(y - 0.5)
  
  const r = Math.sqrt(newX*newX + newY*newY)
  let theta = Math.atan2(newY, newX)
  if (theta < 0) {
    theta = theta + 2*Math.PI
  }
  
  const h = theta / (2*Math.PI)
  const s = r
  const v = 2/r
  
  return [...hsvToRgb(h, s, v), 1]
}

function main() {
  // Initialise canvas
  const canvas = document.querySelector(".myCanvas");
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  
  // Move canvas origin to the centre
  ctx.translate(width / 2, height / 2);

  // TODO: Set any initial params
  
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  for (let pixelX=0; pixelX<width; pixelX++) {
    for (let pixelY=0; pixelY<height; pixelY++) {
      const x = pixelX / width
      const y = (height - pixelY) / height
      //console.log({x, y})
      
      const [red, green, blue, alpha] = getColour(x, y)
      
      const index = (pixelY * width + pixelX) * 4
      data[index] = red * 255
      data[index+1] = green * 255
      data[index+2] = blue * 255
      data[index+3] = alpha * 255
    }
  }
  
  // TODO: Maybe double buffer, if performance is an issue?
  ctx.putImageData(imageData, 0, 0)

}

main()
