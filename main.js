document.addEventListener("DOMContentLoaded", function() {
    // Select the splash screen element
    var splashScreen = document.getElementById("splash-screen");
    var amHome = document.getElementById("articulated-model-home");

    // Hide the splash screen after a delay (e.g., 2000 milliseconds or 2 seconds)
    setTimeout(function() {
        splashScreen.style.display = "none";
        // Additional logic or code can be added here for what should happen after the splash screen disappears
        amHome.style.display = "block";
    }, 1000);

})

// We use figure.js from textbook to modify file.

var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var GLOBAL_ANGLE_ID = 10;
var GLOBAL_X_COORDINATE = 11;
var GLOBAL_Y_COORDINATE = 12;

var torsoHeight = 6.0;
var torsoWidth = 2.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.4;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.4;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 2.0;
var headWidth = 1.0;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

// TorsoId, head1, left upper arm, left lower arm, right upper arm, right lower arm, left upper leg, left lower leg, 
// right upper leg, right lower leg, head2
var theta = [60, 0, -160, 60, 160, -60, -180, 10, 180, -10, 0]; 

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    
    switch(Id) {
    
    case torsoId:

    m = rotate(theta[GLOBAL_ANGLE_ID], 0, 0, 1);
    m = mult(m, rotate(theta[torsoId + 1], 1, 0, 0));
    m = mult(m, rotate(theta[torsoId], 0, 1, 0 ));

    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId: 
    case head1Id: 
    case head2Id:
    

    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;
    
    
    case leftUpperArmId:
    
    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:
    
    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;
    
    case leftUpperLegId:
    
    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
    
    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;
    
    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;
    
    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;
    
    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;
    
    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;
    
    }

}

function traverse(Id) {
   
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
   
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     pointsArray.push(vertices[b]); 
     pointsArray.push(vertices[c]);     
     pointsArray.push(vertices[d]);    
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0, 0, 0, 0);
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program);

    // Set the light source position (modify according to your scene)
    var lightPos = vec3(1.0, 1.0, -1.0);
    var lightPosLoc = gl.getUniformLocation(program, "lightPos");
    gl.uniform3fv(lightPosLoc, flatten(lightPos));

    // Set initial values for the light properties
    var Ka = 1.0;
    var Kd = 1.0;
    var Ks = 1.0;
    var shininessVal = 80.0;
    var ambientColor = vec3(0.0, 0.6, 1.0);  // Example ambient color (modify according to your scene)
    var diffuseColor = vec3(0.0, 0.0, 0.0);  // Example diffuse color (modify according to your scene)
    var specularColor = vec3(1.0, 1.0, 1.0); // Example specular color (modify according to your scene)
    var mode = 1; // Example rendering mode (modify according to your needs)

    // Set the initial values for the uniforms in the shader
    gl.uniform1f(gl.getUniformLocation(program, "Ka"), Ka);
    gl.uniform1f(gl.getUniformLocation(program, "Kd"), Kd);
    gl.uniform1f(gl.getUniformLocation(program, "Ks"), Ks);
    gl.uniform1f(gl.getUniformLocation(program, "shininessVal"), shininessVal);
    gl.uniform3fv(gl.getUniformLocation(program, "ambientColor"), flatten(ambientColor));
    gl.uniform3fv(gl.getUniformLocation(program, "diffuseColor"), flatten(diffuseColor));
    gl.uniform3fv(gl.getUniformLocation(program, "specularColor"), flatten(specularColor));
    gl.uniform1i(gl.getUniformLocation(program, "mode"), mode);


    instanceMatrix = mat4();
    

    projectionMatrix = ortho(-40.0, 40.0, -30.0, 30.0, -40.0, 40.0);
    modelViewMatrix = mat4();
        
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    
    cube();
        
    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    // Initial State for each of the output value 
    document.getElementById("torsoX_output").textContent = 0;
    document.getElementById("torsoY_output").textContent = 60;
    document.getElementById("head1_output").textContent = 0;
    document.getElementById("head2_output").textContent = 0;
    document.getElementById("leftupperarm_output").textContent = -160;
    document.getElementById("leftlowerarm_output").textContent = 60;
    document.getElementById("rightupperarm_output").textContent = 160;
    document.getElementById("rightlowerarm_output").textContent = -60;
    document.getElementById("leftupperleg_output").textContent = 180;
    document.getElementById("leftlowerleg_output").textContent = 10;
    document.getElementById("rightupperleg_output").textContent = 180;
    document.getElementById("rightlowerleg_output").textContent = -10;
    document.getElementById("global_rotation_output").textContent = 0;
    document.getElementById("positionX_output").textContent = 0;
    document.getElementById("positionY_output").textContent = 0;
    document.getElementById("ambientReflectionValue").textContent = 1.0;
    document.getElementById("diffuseReflectionValue").textContent = 1.0;
    document.getElementById("specularReflectionValue").textContent = 1.0;
    document.getElementById("shininessValue").textContent = 80;
    document.getElementById("lightxValue").textContent = 1;
    document.getElementById("lightyValue").textContent = 1;
    document.getElementById("lightzValue").textContent = -1;
    

    // On change function for each of the hierarchical model
    document.getElementById("slider0").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[torsoId] = SliderValue;
        document.getElementById("torsoY_output").textContent = SliderValue;
        initNodes(torsoId);
    };

    document.getElementById("slider1").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[head1Id] = SliderValue;
        document.getElementById("head1_output").textContent = SliderValue;
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[leftUpperArmId] = SliderValue;
        document.getElementById("leftupperarm_output").textContent = SliderValue;
        initNodes(leftUpperArmId);
    };

    document.getElementById("slider3").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[leftLowerArmId] =  SliderValue;
        document.getElementById("leftlowerarm_output").textContent = SliderValue;
        initNodes(leftLowerArmId);
    };
     
    document.getElementById("slider4").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[rightUpperArmId] = SliderValue;
        document.getElementById("rightupperarm_output").textContent = SliderValue;
        initNodes(rightUpperArmId);
    };

    document.getElementById("slider5").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[rightLowerArmId] =  SliderValue;
        document.getElementById("rightlowerarm_output").textContent = SliderValue;
        initNodes(rightLowerArmId);
    };

    document.getElementById("slider6").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[leftUpperLegId] = SliderValue;
        document.getElementById("leftupperleg_output").textContent = SliderValue;
        initNodes(leftUpperLegId);
    };

    document.getElementById("slider7").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[leftLowerLegId] = SliderValue;
        document.getElementById("leftlowerleg_output").textContent = SliderValue;
        initNodes(leftLowerLegId);
    };

    document.getElementById("slider8").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[rightUpperLegId] =  SliderValue;
        document.getElementById("rightupperleg_output").textContent = SliderValue;
        initNodes(rightUpperLegId);
    };

    document.getElementById("slider9").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[rightLowerLegId] = SliderValue;
        document.getElementById("rightlowerleg_output").textContent = SliderValue;
        initNodes(rightLowerLegId);
    };

    document.getElementById("slider10").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[head2Id] = SliderValue;
        document.getElementById("head2_output").textContent = SliderValue;
        initNodes(head2Id);
    };

    document.getElementById("slider11").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[GLOBAL_ANGLE_ID] = SliderValue;
        document.getElementById("global_rotation_output").textContent = SliderValue;
        initNodes(torsoId);
      };
    
      document.getElementById("slider12").onchange = function() {
        SliderValue = event.srcElement.value - 400;
        theta[GLOBAL_X_COORDINATE] = SliderValue;
        gl.viewport(0 + theta[GLOBAL_X_COORDINATE], 0 + theta[GLOBAL_Y_COORDINATE], canvas.width, canvas.height);
        document.getElementById("positionX_output").textContent = SliderValue;
        initNodes(torsoId);
      };
    
      document.getElementById("slider13").onchange = function() {
        SliderValue = event.srcElement.value - 400;
        theta[GLOBAL_Y_COORDINATE] = SliderValue;
        gl.viewport(0 + theta[GLOBAL_X_COORDINATE], 0 + theta[GLOBAL_Y_COORDINATE], canvas.width, canvas.height);
        document.getElementById("positionY_output").textContent = SliderValue;
        initNodes(torsoId);
      };

      document.getElementById("slider14").onchange = function() {
        SliderValue = event.srcElement.value;
        theta[torsoId + 1] = SliderValue;
        document.getElementById("torsoX_output").textContent = SliderValue;
        initNodes(torsoId);
      };

      document.getElementById("ambientReflectionSlider").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("ambientReflectionValue").textContent = sliderValue;

        // Update Ka with the slider value
        Ka = sliderValue;

        // Use the updated Ka value in your rendering logic
        gl.uniform1f(gl.getUniformLocation(program, "Ka"), Ka);
    });

      document.getElementById("diffuseReflectionSlider").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("diffuseReflectionValue").textContent = sliderValue;

        // Update Ka with the slider value
        Kd = sliderValue;

        // Use the updated Ka value in your rendering logic
        gl.uniform1f(gl.getUniformLocation(program, "Kd"), Kd);
    });

      document.getElementById("specularReflectionSlider").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("specularReflectionValue").textContent = sliderValue;

        // Update Ka with the slider value
        Ks = sliderValue;

        // Use the updated Ka value in your rendering logic
        gl.uniform1f(gl.getUniformLocation(program, "Ks"), Ks);
    });

    // ----------- Material Properties Control --------
    
    // Ambient color input
    document.getElementById("colorSelectorAmbient").addEventListener("input", function() {
        // Get the current value of the color input
        var colorValue = this.value;

        // Extract RGB components from the color input
        var rgb = hexToRgb(colorValue);

        // Update ambientColor with the new RGB values
        ambientColor = vec3(rgb.r / 255, rgb.g / 255, rgb.b / 255);

        // Use the updated ambientColor value in your rendering logic
        gl.uniform3fv(gl.getUniformLocation(program, "ambientColor"), flatten(ambientColor));
    });

    document.getElementById("colorSelectorDiffuse").addEventListener("input", function() {
        // Get the current value of the color input
        var colorValue = this.value;

        // Extract RGB components from the color input
        var rgb = hexToRgb(colorValue);

        // Update diffuseColor with the new RGB values
        diffuseColor = vec3(rgb.r / 255, rgb.g / 255, rgb.b / 255);

        // Use the updated diffuseColor value in your rendering logic
        gl.uniform3fv(gl.getUniformLocation(program, "diffuseColor"), flatten(diffuseColor));
    });

    document.getElementById("colorSelectorSpecular").addEventListener("input", function() {
        // Get the current value of the color input
        var colorValue = this.value;

        // Extract RGB components from the color input
        var rgb = hexToRgb(colorValue);

        // Update specularColor with the new RGB values
        specularColor = vec3(rgb.r / 255, rgb.g / 255, rgb.b / 255);

        // Use the updated specularColor value in your rendering logic
        gl.uniform3fv(gl.getUniformLocation(program, "specularColor"), flatten(specularColor));
    });

    

    document.getElementById("shininessSlider").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("shininessValue").textContent = sliderValue;
    });

    document.getElementById("lightX").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("lightxValue").textContent = sliderValue;
    });

    document.getElementById("lightY").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("lightyValue").textContent = sliderValue;
    });

    document.getElementById("lightZ").addEventListener("input", function() {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("lightzValue").textContent = sliderValue;
    });

      

    for(i=0; i<numNodes; i++) initNodes(i);
    
    render();
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove the hash sign if present
    hex = hex.replace(/^#/, '');

    // Parse the hex value into RGB components
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return { r, g, b };
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    traverse(torsoId);
    requestAnimFrame(render);
}