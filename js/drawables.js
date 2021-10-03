'use strict'

import Shader from "./shader.js"

/**
 * Base class for all drawable objects
 */
class Drawable
{

    constructor( vertices, color, primitive_type, point_size )
    {

        this.vertices = vertices
        this.vertices_buffer = null

        this.color = color

        this.primitive_type = primitive_type

        this.point_size = point_size

        //represents the click location as a percent of canvas width/height
        //Makes resizing a simple multiplication of this by the new canvas dimensions.
        this.locRatio = [-1];

    }

    /**
     * Creates buffer for vertex data
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     */
    createBuffer( gl )
    {
        //set locRatio if this is the first time the object is being created
        if(this.locRatio.length == 1)
        {
            //locRatio is the click point's location on the screen when normalized to be in the range [0, 1]
            //so the click would have occured at: (locRatio[0]*screenWidth, locRatio[1]*screenHeight)
            this.locRatio = [this.vertices[0][0]/gl.canvas.width, this.vertices[0][1]/gl.canvas.height];
        }
        console.log("creating buffer");

        // create a vertex buffer and save it to this.vertices_buffer
        this.vertices_buffer = gl.createBuffer();

        // fill the vertex buffer with your vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices_buffer);
        
        this.vertices_buffer.itemSize = 2;
        this.vertices_buffer.numItems = 1;
        //this.vertices_buffer.numItems = this.vertices.length - 1;

        let vertices = this.CollapseVariables(gl.canvas.width, gl.canvas.height);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    }

    /**
     * Render loop for an individual drawable
     * @param { WebGL2RenderingContext } gl The webgl2 rendering context
     * @param { Shader } shader The shader to use for rendering
     * @param { Array<Number> } resolution The current size of the canvas
     */
    render( gl, shader, resolution )
    {
        if ( this.vertices_buffer == null )
        {
            this.createBuffer( gl );
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices_buffer);

        // bind the vertex buffer to the shader
        shader.setArrayBuffer("a_position", this.vertices_buffer, this.vertices_buffer.numItems, 0, 0);
        gl.vertexAttribPointer(shader, this.vertices_buffer.itemSize, gl.FLOAT, false, 0, 0);

        // set uniform values 'u_color', 'u_pointSize', and 'u_resolution') in the shader using the shader.setUniform methods 
        shader.setUniform3f("u_color", this.color);
        shader.setUniform1f("u_pointSize", resolution[1]/100);
        shader.setUniform2f("u_resolution", resolution);

        //Determine the type of object to draw
        let primType = gl.LINE_LOOP;
        switch (this.primitive_type)
        {
            case "p":
                    primType = gl.POINTS;
                    break;
            case "s":
                    primType = gl.TRIANGLE_STRIP;
                    break;
            case "t":
                    primType = gl.TRIANGLES;
                    break;
        }

        // call gl.drawArrays to draw your geometry
        gl.drawArrays(primType, 0, this.vertices.length - 1);
    }

    /**
     * Calculates and returns the point locations on the canvas given standardized points
     * this.vertices is of the form [[click_location], [point1], [point2], ...]
     * where each point1, point2, etc. is multiplied by the canvas height to produce
     * the offset from the click_location to the vertex.
     * 
     * i.e. given point1_X being the x coord of one of our standardized points:
     * vertex1_X = click_location_X + (canvas.height * point1_X)
     * 
     * @param { Number } width The canvas width
     * @param { Number } height The canvas height
     * @returns { Array<Number> }
     */
    CollapseVariables(width, height)
    {
        let vertices = []
        let newPointx, newPointy;
        for(let i = 1; i < this.vertices.length; i++)
        {
            //mouseclick_X + horizontal_Displacement
            newPointx = this.locRatio[0]*width + this.vertices[i][0]*height;
            //mouseClick_Y + vertical_Displacement
            newPointy = this.locRatio[1]*height + this.vertices[i][1]*height;
            vertices.push(...[newPointx, newPointy]);
        }
        return vertices;

    }

    /**
     * Clears the buffer so that it will be recalculated with the new
     * canvas dimensions in mind
     */
    resize()
    {
        this.vertices_buffer = null;
    }
}

/**
 * Point extension for drawable; calls super and then adds child specific properties
 */
class Point extends Drawable
{
    constructor( vertices, color)
    {
        super([vertices, [0, 0]], color, "p", 0);
    }
}

/**
 * Triangle extension for drawable; calls super and then adds child specific properties
 * see Drawable.collapseVariable(width, height) for details on how vertices are determined
 */
class Triangle extends Drawable
{
    constructor(centerCoords, color, drawType)
    {
        let vertices = [centerCoords];
        let outline = "";
        if(drawType == "outline")
        {
            vertices.push([-1/16, Math.sqrt(3)/32]); //bottom-left
            vertices.push([0, -Math.sqrt(3)/32]); //top
            vertices.push([1/16, Math.sqrt(3)/32]); //bottom-right
            vertices.push([-1/16, Math.sqrt(3)/32]);//bottom-left
            outline = "o";
        }
        else
        {
            vertices.push([-1/16, Math.sqrt(3)/32]); //bottom-left
            vertices.push([0, -Math.sqrt(3)/32]); //top
            vertices.push([1/16, Math.sqrt(3)/32]); //bottom-right
        }
        super(vertices, color, "t" + outline, 0);
    } 

}

/**
 * Square extension for Drawable; calls super and then adds child specific properties
 */
class Square extends Drawable
{

    constructor(centerCoords, color, drawType)
    {
        let vertices = [centerCoords];
        let outline = "";
        if(drawType == "outline")
        {
            console.log("outline");
            vertices.push([-.05, +.05]); //bottom-left
            vertices.push([-.05, -.05]); //top-left
            vertices.push([.05, -.05]); //top-right
            vertices.push([.05, .05]); //bottom-right
            vertices.push([-.05, +.05]); //bottom-left
            outline = "o";
        }
        else
        {
            console.log("filled");
            vertices.push([-.05, +.05]); //bottom-left
            vertices.push([-.05, -.05]); //top-left
    
            vertices.push([+.05, +.05]); //bottom-right
            vertices.push([.05, -.05]); //top-right
        }
        
        super(vertices, color, "s" + outline, 0);
    }


}

/**
 * Line extension for Drawable; calls super and then adds child specific properties
 */
class Line extends Drawable
{
    constructor(clickCoords, endCoords, color)
    {
        super([clickCoords, [0, 0], endCoords], color, "l", 0);
    }

}

/**
 * Horizontal line extension for Line; calls super and then adds child specific properties
 */
class HLine extends Line
{
    constructor(startCoords, color)
    {
        let endCoords = [.25, 0];
        super(startCoords, endCoords, color);
    }

}

/**
 * Vertical line extension for Line; calls super and then adds child specific properties
 */
class VLine extends Line
{
    constructor(startCoords, color)
    {
        let endCoords = [0, .25];
        super(startCoords, endCoords, color);
    }

}

export
{

    Point,
    Triangle,
    Square,
    HLine,
    VLine

}
