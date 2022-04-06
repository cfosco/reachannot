import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { Link } from "react-router-dom";
// import video from "./subtitled_instruction_vid_exp2_cut.mp4";
import ImgEx1 from './annotationIllustration_interactability.png';
import ImgAnnTool1 from './panes.png';
import ImgAnnTool2 from './allControls.png';
import ImgGuidelines1 from './guidelines.png';

const useStyles = makeStyles({
  root: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "0px",
  },
  topContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "left",
    marginBottom: 16,
    width: "80%"
  },
  demoVideoContainer: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  bottomContainer: {

  },
  startButton: {
    borderRadius: 16,
    fontSize: 36,
    width: 570,
    paddingLeft: 32,
    paddingRight: 32,
  },
  gifContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
});


export default function Landing(props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.topContainer}>
        <Typography variant="h4" style={{marginBottom: 16}}>
          Interacting in Reachable Spaces
        </Typography>

        {/* ////// Task Intro */}
        <Typography variant="subtitle1" align="left">
          <h3>Instructions</h3>
                In this experiment, you will be asked to annotate the interactable objects in pictures of reachable environments. Specifically, you will use a paintbrush tool to indicate <strong> any object, button, switch, or item that you can use or manipulate when performing an action.</strong>
                < br/>< br/>

                There are two different annotations to use:                 
                <ul>
                <li> Use the first color to indicate the subset of objects you are MOST LIKELY to interact with. This could be one object or many, but it should be the subset of objects that you would probably be using if you were experiencing the view in the picture.
                </li>
                <li> Use the second color to indicate ALL of the remaining objects or components that it is possible to interact with.
                </li>
                </ul>

                After using both annotations, you should have painted over every object or component that a person could interact with. Sometimes it might be hard to choose which annotations to use, or you may not be familiar with the environment in the photo, but just make your best guess.
                < br/>
                < br/>
                < br/>

          <b>Here is an Example:</b>
        </Typography>

        <div className={classes.gifContainer}>
          <img src={ImgEx1} width="80%" style={{marginRight: 16}} />
        </div>

        {/* ////// Interface Intro */}
        <Typography variant="subtitle1" align="left">
				<h3> This is the annotator tool you will use: </h3>
        </Typography>
        <br/>
        <div className={classes.gifContainer}>
          <img src={ImgAnnTool1} width="80%" style={{marginRight: 16}} />
        </div>
        <div className={classes.gifContainer}>
          <img src={ImgAnnTool2} width="80%" style={{marginRight: 16}} />
        </div>


        {/* ////// General guidelines*/}
        <Typography variant="subtitle1" align="left">
          <h3>General Guidelines</h3>
          Here are some things to keep in mind: 

          <ul>
          <li>Try to reduce the overlap in the two annotations.
          </li>
          <li>
          When adding the annotations, make sure to consider any element that could be relevant to the activity you would perform in the space, including buttons or knobs, not just objects.
          </li>
          <li>
          There is no time limit per image.
          </li>
          <li>
          If there are watermarks on the image, please ignore them while making your annotation.
          </li>
          </ul>
        </Typography>
        <br/>
        <div className={classes.gifContainer}>
          <img src={ImgGuidelines1} width="80%" style={{marginRight: 16}} />
        </div>


        {/* ////// Admin*/}
        <Typography variant="subtitle1" align="left">
          <br/><br/>
          <h3> Ready to start? </h3>
          <p>There will be 20 images per HIT, and you can perform as many HITs as you want. If this is your first time completing the HIT, please fill out the demographics survey at the end.</p>
          <b>Be advised that we check the quality of responses. If your annotations are inaccurate, you will be blocked from further experiments. </b>

          <p><i>Disclaimer: This HIT is part of a MIT scientific research project. Your decision to complete this HIT is voluntary. There is no way for us to identify you. The only information we will have, in addition to your responses and Worker ID, is the time at which you completed the survey. The results of the research may be presented at scientific meetings or published in scientific journals. Clicking on the 'START' button on the bottom of this page indicates that you are at least 18 years of age and agree to complete this HIT voluntarily. </i></p>

        </Typography>
        
      </div>

        {/* ////// VideoContainer */}

        {/* <div className={classes.demoVideoContainer}>
          <Typography variant="h5" gutterBottom>
            Demo Video: How to Complete this Task
          </Typography>
          <video src={video} width={360} height={360} controls />
        </div> */}


        {/* ////// START BUTTON */}
        <div className={classes.bottomContainer}>
          <Link to={{pathname:"/interface", search: props.location.search}}>
            <Button variant="contained" size="large" className={classes.startButton} style={{ marginBottom: 32}}>
              Start
            </Button>
          </Link>
        </div>
    </div>
  );
}
