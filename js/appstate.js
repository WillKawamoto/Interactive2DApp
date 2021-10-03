'use strict'

import
{

    Point,
    Triangle,
    Square,
    HLine,
    VLine

}
from "./drawables.js"
import Input from "./input.js"
import { hex2rgb } from "./utils.js"

class AppState
{

    constructor( app )
    {

        this.app = app

        // get list of UI indicators
        this.ui_categories = {
            "object_to_draw":
            {

                "point": document.getElementById( "pointToDraw" ),
                "triangle": document.getElementById( "triangleToDraw" ),
                "square": document.getElementById( "squareToDraw" ),
                "hLine": document.getElementById( "hLineToDraw" ),
                "vLine": document.getElementById( "vLineToDraw" ),

            },
            "color_mode":
            {

                "blue": document.getElementById( "blueColorMode" ),
                "gold": document.getElementById( "goldColorMode" )

            },
            "draw_mode":
            {

                "filled": document.getElementById( "filledDrawMode" ),
                "outline": document.getElementById( "outlineDrawMode" )

            }
        }

        // Update UI with default values
        this.updateUI( "object_to_draw", "point" )
        this.updateUI( "color_mode", "blue" )
        this.updateUI( "draw_mode", "filled" )

        //Saves the current state of the program
        this.object_to_draw = "point";
        this.color_mode = "#022851"; //Starts as Aggie Blue
        this.draw_mode = "filled";
    }

    /**
     * Updates the app state by checking the input module for changes in user input
     */
    update( )
    {
        //Checks for keyboard presses, updating the UI
        //and internal state for valid key presses
        if(Input.isKeyPressed('p'))
        {
            this.updateUI("object_to_draw","point");
            this.object_to_draw = "point";
        }
        else if(Input.isKeyPressed('t'))
        {
            this.updateUI("object_to_draw","triangle");
            this.object_to_draw = "triangle";
        }
        else if(Input.isKeyPressed('s'))
        {
            this.updateUI("object_to_draw","square");
            this.object_to_draw = "square";
        }
        else if(Input.isKeyPressed('h'))
        {
            this.updateUI("object_to_draw","hLine");
            this.object_to_draw = "hLine";
        }
        else if(Input.isKeyPressed('v'))
        {
            this.updateUI("object_to_draw","vLine");
            this.object_to_draw = "vLine";
        }
        else if(Input.isKeyPressed('b'))
        {
            this.updateUI("color_mode","blue");
            this.color_mode = "#022851";
        }
        else if(Input.isKeyPressed('g'))
        {
            this.updateUI("color_mode","gold");
            this.color_mode = "#FFBF00";
        }
        else if(Input.isKeyPressed('f'))
        {
            this.updateUI("draw_mode","filled");
            this.draw_mode = "filled";
        }
        else if(Input.isKeyPressed('o'))
        {
            this.updateUI("draw_mode","outline");
            this.draw_mode = "outline";
        }
        else if(Input.isKeyPressed('c'))
        {
            this.app.clearCanvas();
        }
        
        //When the mouse is clicked
        if(Input.isMouseClicked(0))
        {
            //Check for valid click location
            if(Math.abs(Input.mouseX) != Infinity && Math.abs(Input.mousey) != Infinity)
            {
                //Creates the appropriate object and adds it to the app to be rendered.
                switch(this.object_to_draw)
                {
                    case "point":
                        this.app.addObject(new Point([Input.mousex, Input.mousey], hex2rgb(this.color_mode)));
                        break;
                    case "hLine":
                        this.app.addObject(new HLine([Input.mousex, Input.mousey], hex2rgb(this.color_mode)));
                        break;
                    case "vLine":
                        this.app.addObject(new VLine([Input.mousex, Input.mousey], hex2rgb(this.color_mode)));
                        break;
                    case "triangle":
                        this.app.addObject(new Triangle([Input.mousex, Input.mousey], hex2rgb(this.color_mode), this.draw_mode));
                        break;
                    case "square":
                        this.app.addObject(new Square([Input.mousex, Input.mousey], hex2rgb(this.color_mode), this.draw_mode));
                        
                }
            }
            else
                console.log("click out of bounds")
            ;
        }
    }

    /**
     * Updates the ui to represent the current interaction
     * @param { String } category The ui category to use; see this.ui_categories for reference
     * @param { String } name The name of the item within the category
     * @param { String | null } value The value to use if the ui element is not a toggle; sets the element to given string 
     */
    updateUI( category, name, value = null )
    {

        for ( let key in this.ui_categories[ category ] )
        {

            this.updateUIElement( this.ui_categories[ category ][ key ], key == name, value )

        }

    }

    /**
     * Updates a single ui element with given state and value
     * @param { Element } el The dom element to update
     * @param { Boolean } state The state (active / inactive) to update it to
     * @param { String | null } value The value to use if the ui element is not a toggle; sets the element to given string 
     */
    updateUIElement( el, state, value )
    {

        el.classList.remove( state ? "inactive" : "active" )
        el.classList.add( state ? "active" : "inactive" )

        if ( state && value != null )
            el.innerHTML = value

    }

}

export default AppState
