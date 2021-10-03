'use strict'

import Input from "./input.js"
import Shader from "./shader.js"
import AppState from "./appstate.js"

class App
{

    constructor( )
    {

        console.log( "Initializing App" )

        // canvas & gl
        this.canvas = document.getElementById( "canvas" )
        this.canvas.addEventListener( "contextmenu", event => event.preventDefault( ) );
        this.gl = this.initGl( )

        // shaders
        console.log( "Loading Shaders" )
        this.shader = new Shader( this.gl, "../shaders/vertex.glsl", "../shaders/fragment.glsl" )

        // objects
        // create a structure to store your objects (points, triangles, etc.)
        this.objs = [];
        

        // resize handling
        this.resizeToDisplay( )
        window.onresize = this.resizeToDisplay.bind( this )

        // app state
        this.app_state = new AppState( this )

    }

    /** 
     * Resizes canvas to pixel-size-corrected display size
     */
    resizeToDisplay( )
    {
        //Resize the canvas
        this.gl.canvas.width = this.canvas.getBoundingClientRect().width;
        this.gl.canvas.height = this.canvas.getBoundingClientRect().height;
        //canvas.getBoundingClientRect() so generously provided by:
        //https://stackoverflow.com/questions/4032179/how-do-i-get-the-width-and-height-of-a-html5-canvas
        
        //reset the locations of objects on the new canvas
        for(let obj of this.objs)
        {
            obj.resize();
        }

    }

    /**
     * Adds objects to internal data structure
     * @param { Drawable } object The object to add to your data structure
     */
    addObject( object )
    {
        this.objs.push(object);
    }

    /**
     * Clears scene and canvas
     */
    clearCanvas( )
    {
        this.objs = [];
        console.log( "Cleared scene and canvas." )

    }

    /**
     * Initializes webgl2 with settings
     * @returns { WebGL2RenderingContext | null }
     */
    initGl( )
    {
        //brought in from observable notebook
        let gl;
        gl = canvas.getContext("webgl2");
  
        if (!gl) {
            throw "Could not get WebGL context!";
        }

        return gl;
    }

    /**
     * Starts render loop
     */
    start( )
    {

        requestAnimationFrame( ( ) =>
        {

            this.update( )

        } )

    }

    /**
     * Called every frame, triggers input and app state update and renders a frame
     */
    update( )
    {

        this.app_state.update( )
        Input.update( )
        this.render( )
        requestAnimationFrame( ( ) =>
        {

            this.update( )

        } )

    }

    /**
     * Main render loop
     */
    render( )
    {

        // clear the screen
        this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height )
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT )

        // activate the shader
        this.shader.use( )

        // renders each object
        for(let obj of this.objs){
            obj.render(this.gl, this.shader, [this.gl.canvas.width, this.gl.canvas.height]);
        }
    }
}

export default App
