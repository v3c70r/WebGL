"use strict";

var gl;
var points;
function twist(vertices, coef, theta, numVertices)
{
  var i=0;
  for (i=0; i<numVertices; i++)
  {
    var x = vertices[2*i];
    var y = vertices[2*i+1];
    var d = coef* Math.sqrt(x*x+y*y);
    var newX = x * Math.cos(d*theta) - y * Math.sin(d*theta);
    var newY = x * Math.sin(d*theta) + y * Math.cos(d*theta);
    vertices[2*i] = newX;
    vertices[2*i+1] = newY;
  }
  return vertices;
}
function tesllation(vertices, iter, gasket)
{

  if (iter == 0)
    return vertices;

  var p0=[vertices[0], vertices[1]];
  var p1=[vertices[2], vertices[3]];
  var p2=[vertices[4], vertices[5]];
  var p3 = [ (p0[0]+p1[0])/2.0,(p0[1]+p1[1])/2.0 ];
  var p4 = [ (p1[0]+p2[0])/2.0,(p1[1]+p2[1])/2.0 ];
  var p5 = [ (p2[0]+p0[0])/2.0,(p2[1]+p0[1])/2.0 ];
  var subTr0 = p0.concat(p3, p5);
  var subTr1 = p3.concat(p1, p4);
  var subTr2 = p5.concat(p3, p4);
  var subTr3 = p5.concat(p4, p2);
  if (gasket)
      return tesllation(subTr0, iter-1, gasket).concat(tesllation(subTr1, iter-1, gasket),  tesllation(subTr3, iter-1, gasket));
  else
      return tesllation(subTr0, iter-1, gasket).concat(tesllation(subTr1, iter-1, gasket), tesllation(subTr2, iter-1, gasket), tesllation(subTr3, iter-1, gasket));
}

var bufferId;
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    var vertices = [-1/2, -1/2, 0, 1/2, 1/2, -1/2];
    var iter = 0;
    vertices = tesllation(vertices, iter);
    var numVertices = Math.pow(4,iter)*3;

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render(numVertices);
};

function changeIter(iter, coef, theta, gasket, shape)
{
  var vertices;
  if (shape == "triangle")
    vertices = [-1/2, -1/2, 0, 1/2, 1/2, -1/2];
  else if  (shape == "square")
    vertices = [ -1/2, -1/2, 1/2, -1/2, -1/2, 1/2
      ,1/2, -1/2, 1/2, 1/2, -1/2, 1/2];
  else if (shape == "cat")
    vertices = [-1/2, 1/4, -1/2, 0, 1/2, 0,
                1/2, 0, 1/2, 1/4, -1/2, 1/4,
                -1/2, 0, -1/2, -1/4, -1/4, -1/4,
                -1/4, -1/4, 1/4, -1/4, 0,0,
                1/4, -1/4, 1/2, -1/4, 1/2, 0,
                //ears
                -2/5, 1/4, -1/4, 1/2, 0, 1/4,
                2/5, 1/4, 1/4, 1/2, 0, 1/4
                ]

    //do the tesllation of multiple triangles
    var numTriangle = vertices.length/6;
    var resVertices = [];
    var numVertices=0;
    for (var i=0; i< numTriangle; i++)
    {
      resVertices = resVertices.concat(tesllation(vertices.slice(i*6, i*6+6), iter, gasket));
      numVertices += Math.pow(4,iter)*3;
    }
    vertices = twist(resVertices, coef, theta, numVertices);
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(resVertices), gl.STATIC_DRAW );
    render(numVertices);
}

function render(numVertices) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    //gl.drawArrays( gl.LINE_LOOP, 0, numVertices);
}
