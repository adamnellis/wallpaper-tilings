
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
  const newX = x
  const newY = y
  
  const r = Math.sqrt(newX*newX + newY*newY)
  let theta = Math.atan2(newY, newX)
  if (theta < 0) {
    theta = theta + 2*Math.PI
  }
  
  const h = theta / (2*Math.PI)
  const s = r
  const v = 1/Math.sqrt(Math.sqrt(r))
  
  return [...hsvToRgb(h, s, v), 1]
}

function mul2([re1, im1], [re2, im2]) {
  return [re1*re2 - im1*im2, re1*im2 + re2*im1]
}

function add2([re1, im1], [re2, im2]) {
  return [re1 + re2, im1 + im2]
}

function mul(...zs) {
  return zs.reduce(mul2, [1, 1])
}

function add(...zs) {
  return zs.reduce(add2, [0, 0])
}

function smul(scalar, [re, im]) {
  return [scalar*re, scalar*im]
}

function cart_to_polar(re, im) {
  return [Math.sqrt(re*re + im*im), Math.atan2(im, re)]
}

function polar_to_cart(r, theta) {
  return [r*Math.cos(theta), r*Math.sin(theta)]
}

function rosette1_simplify(re, im) {
  // TODO Currently incorrect maths!

  const [r, theta] = cart_to_polar(re, im)
  
  // f(z) = z^5z_^0 + z^0z_^5 + a(z^6z_^1 + z^1z_^6) + b(z^4z_^-6 + z^-6z_^4)
  const a = 0.5
  const b = 0.25
  
  // (r^5, 5 theta) + (r^5, -5 theta) + a(r^7, 5 theta) + a(r^7, -5 theta) + b(r^10, -2 theta) + b(r^10, -10 theta)
  
  const [re1, im1] = polar_to_cart(r**5, 5*theta)
  const [re2, im2] = polar_to_cart(r**5, -5*theta)
  const [re3, im3] = polar_to_cart(r**7, 5*theta)
  const [re4, im4] = polar_to_cart(r**7, -5*theta)
  const [re5, im5] = polar_to_cart(r**10, 10*theta)
  const [re6, im6] = polar_to_cart(r**10, -10*theta)
  
  re_new = re1 + re2 + a*(re3 + re4) + b*(re5 + re6)
  im_new = im1 + im2 + a*(im3 + im4) + b*(im5 + im6)
  
  return [re_new, im_new]
}

function c_sqrt([re, im]) {
  const r = Math.sqrt(re*re + im*im)
  const theta = Math.atan2(im, re)
  const new_r = Math.sqrt(r)
  const new_theta = theta/2
  return [new_r*Math.cos(new_theta), new_r*Math.sin(new_theta)]
}

function c_one_over([re, im]) {
  const r = Math.sqrt(re*re + im*im)
  const theta = Math.atan2(im, re)
  const new_r = r
  const new_theta = -theta
  return [new_r*Math.cos(new_theta), new_r*Math.sin(new_theta)]
}

function identity(re, im) {
  return [re, im]
}

function square(re, im) {
  newRe = re*re - im*im
  newIm = 2*re*im
  return [newRe, newIm]
}

function rosette1(re, im) {
  // f(z) = z^5z_^0 + z^0z_^5 + a(z^6z_^1 + z^1z_^6) + b(z^4z_^-6 + z^-6z_^4)
  const a = 0.5
  const b = 0.25

  z = [re, im]
  z_2 = mul(z, z)
  z_4 = mul(z_2, z_2)
  z_5 = mul(z, z_4)
  z_6 = mul(z_2, z_4)
  z_m1 = c_one_over(z)
  z_m2 = mul(z_m1, z_m1)
  z_m4 = mul(z_m2, z_m2)
  z_m6 = mul(z_m4, z_m2)
  y = [re, -im]
  y_2 = mul(y, y)
  y_4 = mul(y_2, y_2)
  y_5 = mul(y, y_4)
  y_6 = mul(y_2, y_4)
  y_m1 = c_one_over(y)
  y_m2 = mul(y_m1, y_m1)
  y_m4 = mul(y_m2, y_m2)
  y_m6 = mul(y_m4, y_m2)

  return add(z_5, y_5, smul(a, add(mul(z_6, y), mul(z, y_6))), smul(b, add(mul(z_4, y_m6), mul(z_m6, y_4))))
}

function applyFunction(re, im) {
  //return identity(re, im)
  //return square(re, im)
  //return rosette1(re, im)
  return rosette1_simplify(re, im)
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
      
      const newX = 10*(x - 0.5)
      const newY = 10*(y - 0.5)
      
      const [red, green, blue, alpha] = getColour(...applyFunction(newX, newY))
      
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
