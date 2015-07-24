var bufferId=0;
var index = 0;
var startIdx = [];
var curCount = 0;
var count = [];
var canvas;
var mouse = 0;
function mouseD(){startIdx.push(index); mouse++;}
function mouseU(){count.push(curCount);curCount = 0;mouse--;}
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.onmousedown = mouseD;
    canvas.onmouseup = mouseU;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //Init 1000 empty points
    var vertices = [];
    vertices.length = 1000;
    for (var i=0; i<1000; i++)
      vertices[i]=1.0;


    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function doMouseMove(event){
  if (mouse == 1)
  {
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    var t = [-1+2*event.clientX/canvas.width, -1+2*(canvas.height-event.clientY)/canvas.height];
    gl.bufferSubData(gl.ARRAY_BUFFER, 4*2*index,flatten(t));
    index++;
    curCount++;
    render();
  }
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.lineWidth(4.0);
    for (var i=0; i<count.length; i++)
      gl.drawArrays(gl.LINE_STRIP, startIdx[i], count[i]);
    gl.drawArrays(gl.LINE_STRIP, startIdx[startIdx.length-1], curCount);
    window.requestAnimFrame(render);
    //gl.drawArrays( gl.LINE_LOOP, 0, numVertices);
}
